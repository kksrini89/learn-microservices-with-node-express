const amqp = require('amqplib');
const productService = require('../services/productService');

async function publishCreated(prod) {
    const conn = await amqp.connect('amqp://guest:guest@rabbitmq:5672');
    const ch = await conn.createChannel();
    await ch.assertExchange('events', 'fanout', { durable: false });
    ch.publish('events', '', Buffer.from(JSON.stringify({ type: 'Product.Created', data: prod })));
    await ch.close(); await conn.close();
}

exports.getAll = async (req, res, next) => {
    try { res.json(await productService.listProducts()); }
    catch (e) { next(e); }
};

exports.getById = async (req, res, next) => {
    if (!req.params.id) {
        res.status(404).send('Product not found');
    }
    try { res.json(await productService.getProduct(req.params.id)); }
    catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
    try {
        const created = await productService.createProduct(req.body);
        publishCreated(created).catch(console.error);
        res.status(201).json(created);
    } catch (e) { next(e); }
};
