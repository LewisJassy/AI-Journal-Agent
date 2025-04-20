import express from "express";
import JournalController from '../controllers/journalController.js';
import journalService from '../services/journalService.js';

const router = express.Router();

const journalController = new JournalController(journalService);


router.post('/journal-entry', journalController.createEntry.bind(journalController));

router.get('/', journalController.getEntries.bind(journalController));

if (typeof journalController.getEntryById === 'function') {
  router.get('/:id', journalController.getEntryById.bind(journalController));
}


router.put('/:id', journalController.updateEntry.bind(journalController));

router.delete('/:id', journalController.deleteEntry.bind(journalController));

export default router;
