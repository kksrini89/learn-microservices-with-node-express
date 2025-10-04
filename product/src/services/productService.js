const productRepo = require('../repos/productRepo');

exports.listProducts = () => productRepo.findAll();
exports.getProduct = (id) => productRepo.findById(id);
exports.createProduct = (p) => productRepo.create(p);
