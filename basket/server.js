const express = require('express');
const axios = require('axios');
const amqp = require('amqplib');

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3002;

const PRODUCT_CATALOG_URL = 'http://product-catalog:3001'; // sync call

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
        const { data } = await axios.get(`${PRODUCT_CATALOG_URL}/api/products`);
        const item = data.find(p => p.id == productId);
        if (!item) return res.status(404).send('Product not found');
        if (item.stock <= 0) return res.status(409).send('Out of stock');
        res.json({ message: 'Added to basket', product: item });
    } catch (err) {
        res.status(500).send('Product Catalog API is unreachable');
    }
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Basket on ${PORT}`));