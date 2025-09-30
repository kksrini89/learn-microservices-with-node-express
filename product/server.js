const express = require('express');
const config = require('./config');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
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
  console.log(`Server is running on port ${config.port}`);
});

module.exports = server;