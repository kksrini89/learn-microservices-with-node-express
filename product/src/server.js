const express = require('express');
const config = require('./config');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const consulClient = require('./consul');
// const errorHandler = require('./middleware/errorHandler');
const productRoutes = require('./routes/products');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// health check endpoint for Consul
app.get('/health', (req, res) => {
  res.json({ status: 'ok' }).status(200);
});

app.use('/api/products', productRoutes);

// app.use(errorHandler);

const server = app.listen(config.port, () => {
  consulClient.register().catch(console.error);
  process.on('SIGTERM', () => consulClient.deregister().then(() => process.exit(0)));
  process.on('SIGINT', () => consulClient.deregister().then(() => process.exit(0)));
  console.log(`Server is running on port ${config.port}`);
});

module.exports = server;