class JournalController {
    constructor(journalService) {
        this.journalService = journalService;
    }

    async createEntry(req, res) {
        try {
            const entryData = req.body;
            const newEntry = await this.journalService.createEntry(entryData);
            res.status(201).json(newEntry);
        } catch (error) {
            res.status(500).json({ message: 'Error creating journal entry', error });
        }
    }

    async getEntries(req, res) {
        try {
            const entries = await this.journalService.getEntries();
            res.status(200).json(entries);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving journal entries', error });
        }
    }

    async updateEntry(req, res) {
        try {
            const { id } = req.params;
            const entryData = req.body;
            const updatedEntry = await this.journalService.updateEntry(id, entryData);
            res.status(200).json(updatedEntry);
        } catch (error) {
            res.status(500).json({ message: 'Error updating journal entry', error });
        }
    }

    async deleteEntry(req, res) {
        try {
            const { id } = req.params;
            await this.journalService.deleteEntry(id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Error deleting journal entry', error });
        }
    }
}

export default JournalController;