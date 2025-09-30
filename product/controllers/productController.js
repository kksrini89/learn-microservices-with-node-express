const productService = require('../services/productService');

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
