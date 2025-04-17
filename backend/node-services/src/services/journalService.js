// Simple in-memory journal service for demonstration
const entries = [];
let idCounter = 1;

const journalService = {
  async createEntry(entryData) {
    const entry = { id: idCounter++, ...entryData };
    entries.push(entry);
    return entry;
  },
  async getEntries() {
    return entries;
  },
  async updateEntry(id, entryData) {
    const idx = entries.findIndex(e => e.id == id);
    if (idx === -1) throw new Error('Entry not found');
    entries[idx] = { ...entries[idx], ...entryData };
    return entries[idx];
  },
  async deleteEntry(id) {
    const idx = entries.findIndex(e => e.id == id);
    if (idx === -1) throw new Error('Entry not found');
    entries.splice(idx, 1);
    return;
  }
};

export default journalService;
