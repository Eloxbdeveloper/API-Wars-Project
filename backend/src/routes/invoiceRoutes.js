const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');

/**
 * POST /api/invoices/:id/issue
 * Emite formalmente la factura ante Factus y la DIAN.
 */
router.post('/:id/issue', invoiceController.issueInvoice);

module.exports = router;