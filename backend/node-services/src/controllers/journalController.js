class JournalController {
    constructor(journalService) {
        this.journalService = journalService;
    }

    async createEntry(req, res) {
        try {
            const userId = req.user?.id || req.body.userId || req.headers['x-user-id'];
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const { content } = req.body;
            if (!content || typeof content !== 'string' || !content.trim()) {
                return res.status(400).json({ message: 'Journal content is required.' });
            }
            const entryData = { userId, content };
            const newEntry = await this.journalService.createEntry(entryData);
            res.status(201).json(newEntry);
        } catch (error) {
            res.status(500).json({ message: 'Error creating journal entry' });
        }
    }

    async getEntries(req, res) {
        try {
            const userId = req.user?.id || req.headers['x-user-id'];
            console.log('Resolved userId:', userId);
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const { page = 1, limit = 10 } = req.query;
            const entries = await this.journalService.getEntries(userId, parseInt(page), parseInt(limit));
            res.status(200).json(entries);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving journal entries' });
        }
    }

    async updateEntry(req, res) {
        try {
            const userId = req.user?.id || req.body.userId || req.headers['x-user-id'];
            console.log('Resolved userId:', userId);
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const { id } = req.params;
            const { content } = req.body;
            if (!content || typeof content !== 'string' || !content.trim()) {
                return res.status(400).json({ message: 'Journal content is required.' });
            }
            const updatedEntry = await this.journalService.updateEntry(id, userId, { content });
            if (!updatedEntry) {
                return res.status(404).json({ message: 'Journal entry not found or unauthorized.' });
            }
            res.status(200).json(updatedEntry);
        } catch (error) {
            res.status(500).json({ message: 'Error updating journal entry' });
        }
    }

    async deleteEntry(req, res) {
        try {
            const userId = req.user?.id || req.headers['x-user-id'];
            console.log('Resolved userId:', userId);
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            const { id } = req.params;
            const deleted = await this.journalService.deleteEntry(id, userId);
            if (!deleted) {
                return res.status(404).json({ message: 'Journal entry not found or unauthorized.' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Error deleting journal entry' });
        }
    }
}

export default JournalController;
