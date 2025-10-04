const products = [
    { id: 1, sku: 'ECO-BOTTLE', name: 'Steel Bottle', stock: 42 }
];

exports.findAll = () => Promise.resolve(products);
exports.findById = (id) =>
    Promise.resolve(products.find(p => p.id === Number(id)));

let nextId = 2; // after seeded product id=1
exports.create = (p) => {
  const product = { id: nextId++, ...p };
  products.push(product);
  return Promise.resolve(product);
};