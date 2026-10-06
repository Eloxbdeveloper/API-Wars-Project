const express = require('express');
const router = express.Router();

const paymentsController = require('../controllers/paymentsController');

router.get('/', paymentsController.getPayments);
router.get('/:referenceCode', paymentsController.getPayment);
router.post('/', paymentsController.createPayment);

module.exports = router;
