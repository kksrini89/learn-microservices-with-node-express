const express = require('express');
const Consul = require('consul');
const amqp = require('amqplib');

const app = express();
// app.use(express.json());

const PORT = process.env.PORT || 3003;
const CONSUL = process.env.CONSUL_HOST || 'localhost';
const RABBIT = 'amqp://guest:guest@rabbitmq:5672';

// ---- Consul ----
const consul = new Consul({ host: CONSUL, port: 8500 });
const id = `inventory-${process.pid}`;
// consul.agent.service.register({
//   id,
//   name: 'inventory-service',
//   port: PORT,
//   check: { http: `http://inventory-service:${PORT}/health`, interval: '10s' }
// }).catch(console.error);
// process.on('SIGTERM', () => consul.agent.service.deregister(id));

// ---- in-memory store ----
const stock = { 1: 42 }; // seed stock for existing product

// ---- async listener ----
// Receiving events from RabbitMQ, seeding initial stock
(async function connect(retries = 5) {
    try {
        const conn = await amqp.connect(RABBIT);
        const ch = await conn.createChannel();
        await ch.assertExchange('events', 'fanout', { durable: false });
        const { queue } = await ch.assertQueue('', { exclusive: true });
        await ch.bindQueue(queue, 'events', '');
        ch.consume(queue, (msg) => {
            if (!msg) return;
            const ev = JSON.parse(msg.content.toString());
            // Receiving an event from the Product Catalog Service
            if (ev.type === 'Product.Created') {
                stock[ev.data.id] = ev.data.stock;
                console.log('📦 Inventory seeded for product', ev.data.id);
            }
        });
        console.log('Inventory Rabbit listener ready');
    } catch (err) {
        console.log('Rabbit not ready, retrying…');
        if (retries) setTimeout(() => connect(retries - 1), 5000);
        else throw err;
    }
})();

// ---- sync routes ----
app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.get('/inventory/:productId', (req, res) => {
    const qty = stock[req.params.productId];
    if (qty === undefined) return res.status(404).send('Unknown product');
    res.json({ productId: req.params.productId, stock: qty });
});

app.listen(PORT, () => {
    console.log(`Inventory is listening on: ${PORT}`);
    consul.agent.service.register({
        id,
        name: 'inventory-service',
        port: Number(PORT),
        check: { http: `http://inventory-service:${PORT}/health`, interval: '10s' }
    }).then(() => console.log('[Consul] registered service')).catch(console.error);
    process.on('SIGTERM', () => consul.agent.service.deregister(id));
    process.on('SIGINT', () => consul.agent.service.deregister(id));
});
