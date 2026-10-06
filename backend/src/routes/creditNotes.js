const express = require('express');
const router = express.Router();

const creditNoteController = require('../controllers/creditNotesController');

router.get('/concepts', creditNoteController.getCorrectionConcepts);
router.get('/', creditNoteController.getCreditNotes);
router.get('/:id', creditNoteController.getCreditNoteById);
router.post('/', creditNoteController.createCreditNote);

module.exports = router;
