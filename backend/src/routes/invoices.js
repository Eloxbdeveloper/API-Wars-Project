const express = require('express');
const router = express.Router();
const invoicesController = require('../controllers/invoicesController');

router.get('/', invoicesController.getInvoices);
router.post('/', invoicesController.createInvoice);

module.exports = router;
