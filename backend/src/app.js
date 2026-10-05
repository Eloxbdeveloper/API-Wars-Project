const express = require('express');
const cors = require('cors');

// 1. Importación de Rutas
const healthRoutes = require('./routes/health');
const customerRoutes = require('./routes/customers');
const productRoutes = require('./routes/products'); // <-- AGREGADO
const invoiceRoutes = require('./routes/invoiceRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middlewares base
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Montaje de Rutas de la API
app.use('/api/health', healthRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes); // <-- AGREGADO
app.use('/api/invoices', invoiceRoutes);

// Manejo de ruta no encontrada (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Middleware global de manejo de errores
app.use(errorHandler);

module.exports = app;