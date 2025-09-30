const productRepo = require('../repos/productRepo');

exports.listProducts = () => productRepo.findAll();
exports.getProduct = (id) => productRepo.findById(id);
