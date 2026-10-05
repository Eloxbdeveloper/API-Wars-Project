const invoiceService = require('../services/invoiceService');

exports.getInvoices = async (req, res) => {
  try {
    const invoices = await invoiceService.getAllInvoices();
    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const newInvoice = await invoiceService.createInvoice(req.body);
    res.status(201).json({ success: true, data: newInvoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
