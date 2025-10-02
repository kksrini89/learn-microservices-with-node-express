const Consul = require('consul');
const cfg = require('./config');
const id = `product-${process.pid}`;

const consul = new Consul({
    host: process.env.CONSUL_HOST || 'localhost',
    port: process.env.CONSUL_PORT || 8500,
});

exports.register = () => {
    console.log('[Consul] registering with host:', process.env.CONSUL_HOST || 'localhost');

    return consul.agent.service.register({
        id,
        name: 'product-catalog',
        port: cfg.port,
        // product-catalog name will be resolved to product-catalog.service.consul using dns_search from docker-compose.yml
        check: { http: `http://product-catalog:${cfg.port}/health`, interval: '10s' } // resolving host with service name
        // resolving host with container name
        // check: { http: `http://product:${cfg.port}/health`, interval: '10s' }
    })
    .then(() => console.log('[Consul] registered service'))
    .catch(err => console.error('[Consul] failed to register service', err.message));
}

exports.deregister = () => {
    console.log('[Consul] deregistering service');
    return consul.agent.service.deregister(id)
    .then(() => console.log('[Consul] deregistered service'))
    .catch(err => console.error('[Consul] failed to deregister service', err.message));
}
