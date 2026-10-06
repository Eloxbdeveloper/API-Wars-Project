const express = require('express');
const router = express.Router();

// Importamos el archivo correcto: invoicesController.js
const invoiceController = require('../controllers/invoicesController');

router.get('/', invoiceController.getInvoices);
router.get('/:id', invoiceController.getInvoiceById);

// Soporte para crear factura / borrador
router.post('/', invoiceController.createInvoice);
router.post('/draft', invoiceController.createInvoice);

router.put('/:id', invoiceController.updateInvoice);
router.post('/:id/issue', invoiceController.issueInvoice);

module.exports = router;