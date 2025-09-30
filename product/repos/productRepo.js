const products = [
    { id: 1, sku: 'ECO-BOTTLE', name: 'Steel Bottle', stock: 42 }
];

exports.findAll = () => Promise.resolve(products);
exports.findById = (id) =>
    Promise.resolve(products.find(p => p.id === Number(id)));