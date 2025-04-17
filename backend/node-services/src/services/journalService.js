import { Client, Databases, ID, Query } from 'node-appwrite';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const databaseId = process.env.APPWRITE_DATABASE_ID;
const collectionId = process.env.APPWRITE_JOURNAL_COLLECTION_ID;

/**
 * Appwrite-based Journal Service
 * Handles CRUD operations for journal entries, associating them with users.
 */
const journalService = {
  async createEntry(entryData) {
    const now = new Date().toISOString();
    const doc = await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(),
      {
        userId: entryData.userId,
        content: entryData.content,
        createdAt: now,
        updatedAt: now
      }
    );
    return doc;
  },

  async getEntries(userId, page = 1, limit = 10) {
    const queries = [
      Query.equal('userId', userId),
      Query.limit(limit),
      Query.offset((page - 1) * limit),
      Query.orderDesc('createdAt')
    ];
    const result = await databases.listDocuments(databaseId, collectionId, queries);
    return {
      entries: result.documents,
      total: result.total,
      page,
      limit
    };
  },

  async updateEntry(id, userId, entryData) {
    // Fetch the entry to check ownership
    try {
      const doc = await databases.getDocument(databaseId, collectionId, id);
      if (doc.userId !== userId) return null;
      const updated = await databases.updateDocument(databaseId, collectionId, id, {
        content: entryData.content,
        updatedAt: new Date().toISOString()
      });
      return updated;
    } catch (err) {
      return null;
    }
  },


  async deleteEntry(id, userId) {
    try {
      const doc = await databases.getDocument(databaseId, collectionId, id);
      if (doc.userId !== userId) return null;
      await databases.deleteDocument(databaseId, collectionId, id);
      return true;
    } catch (err) {
      return null;
    }
  }
};

export default journalService;
