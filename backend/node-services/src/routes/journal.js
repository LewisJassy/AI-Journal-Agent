import express from "express";
import JournalController from '../controllers/journalController.js';
import journalService from '../services/journalService.js';

const router = express.Router();

const journalController = new JournalController(journalService);

// Create a new journal entry
router.post('/', journalController.createEntry.bind(journalController));

// Get all journal entries
router.get('/', journalController.getEntries.bind(journalController));

// Get a specific journal entry by ID
if (typeof journalController.getEntryById === 'function') {
  router.get('/:id', journalController.getEntryById.bind(journalController));
}

// Update a journal entry by ID
router.put('/:id', journalController.updateEntry.bind(journalController));

// Delete a journal entry by ID
router.delete('/:id', journalController.deleteEntry.bind(journalController));

export default router;