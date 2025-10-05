const express = require('express');
const axios = require('axios');
const amqp = require('amqplib');
const morgan = require('morgan');
const Consul = require('consul');

const app = express();
const consul = new Consul({ host: process.env.CONSUL_HOST || 'localhost', port: 8500 });
const id = `basket-${process.pid}`;

app.use(express.json());
app.use(morgan('combined'));

const PORT = process.env.PORT || 3002;

const PRODUCT_CATALOG_URL = 'http://product-catalog:3001'; // sync call
const INVENTORY_URL = 'http://inventory-service:3003';

const RABBIT = 'amqp://guest:guest@rabbitmq:5672';

// ---- async listener ----
(async function connect(retries = 5) {
  try {
    const conn = await amqp.connect(RABBIT);
    const ch = await conn.createChannel();
    await ch.assertExchange('events', 'fanout', { durable: false });
    const { queue } = await ch.assertQueue('', { exclusive: true });
    await ch.bindQueue(queue, 'events', '');
    ch.consume(queue, (msg) => {
      if (msg) console.log('📦 Event received:', msg.content.toString());
    });
    console.log(' Rabbit listener ready');
  } catch (err) {
    console.log('Rabbit not ready, retrying…');
    if (retries) setTimeout(() => connect(retries - 1), 5000);
    else throw err;
  }
})();

// ---- sync route ----
app.post('/basket/items', async (req, res) => {
  const { productId } = req.body;
  try {
    // 1. fetch product details
    const { data: products } = await axios.get(`${PRODUCT_CATALOG_URL}/api/products`);
    const item = products.find(p => p.id == productId);
    if (!item) return res.status(404).send('Product not found');
    // 2. fetch live stock
    const { data: inventory } = await axios.get(`${INVENTORY_URL}/inventory/${productId}`);
    if (inventory.stock <= 0) return res.status(409).send('Out of stock');
    // 3. add to basket
    res.json({ message: 'Added to basket', product: item, stock: inventory.stock });
  } catch (err) {
    res.status(500).send('Product Catalog API is unreachable');
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Basket on ${PORT}`);
  consul.agent.service.register({
    id,
    name: 'basket-service',
    port: Number(PORT),
    check: { http: `http://basket-service:${PORT}/health`, interval: '10s' }
  }).then(() => console.log('[Consul] registered service')).catch(console.error);
  process.on('SIGTERM', () => consul.agent.service.deregister(id));
  process.on('SIGINT', () => consul.agent.service.deregister(id));
});