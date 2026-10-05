const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas base
const healthRoutes = require('./routes/health');
const invoicesRoutes = require('./routes/invoices');
// const customersRoutes = require('./routes/customers');
// const productsRoutes = require('./routes/products');

app.use('/api/health', healthRoutes);
app.use('/api/invoices', invoicesRoutes);
// app.use('/api/customers', customersRoutes);
// app.use('/api/products', productsRoutes);

module.exports = app;
