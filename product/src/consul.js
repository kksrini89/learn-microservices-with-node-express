const Consul = require('consul');
const cfg = require('./config');
const id = `product-${process.pid}`;

const consul = new Consul();

exports.register = () => consul.agent.service.register({
    id,
    name: 'product-catalog',
    port: cfg.port,
    check: { http: `http://product-catalog:${cfg.port}/health`, interval: '10s' }
});
exports.deregister = () => consul.agent.service.deregister(id);


// const consul = require('consul');
// const config = require('./config');

// const id = `product-${process.pid}`;

// exports.register = () =>
//     consul.agent.service.register({
//         id,
//         name: `product-catalog`,
//         port: config.port,
//         check: {
//             http: `http://product-catalog:${config.port}/health`,
//             interval: '10s'
//         }
//     });

// exports.deregister = () =>
//     consul.agent.service.deregister(id);
