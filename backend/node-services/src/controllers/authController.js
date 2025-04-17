import { Client, Databases, Users, Account, Query, ID } from 'node-appwrite';
import dotenv from "dotenv";
import { sendEmail } from '../utils/emailSender.js';


dotenv.config();

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const users = new Users(client);
const account = new Account(client);

class AuthController {
  constructor() {
    this.sendOTP = this.sendOTP.bind(this);
    this.verifyOTP = this.verifyOTP.bind(this);
    this.logout = this.logout.bind(this);
    this.getUserProfile = this.getUserProfile.bind(this);
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(req, res) {
    const { email } = req.body;
    try {
      const otp = this.generateOTP();
      const expirysAt = new Date(Date.now() + 5 * 60000).toISOString();

      await databases.createDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_OTP_COLLECTION_ID,
        ID.unique(),
        { email, otp, expirysAt }
      );

      await sendEmail(
        email,
        'Your OTP Code', `Your OTP is: ${otp}`
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error in sendOTP:', error); // Log the error
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  }

  async verifyOTP(req, res) {
    const { email, otp } = req.body;
    try {
      const otpDocs = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_OTP_COLLECTION_ID,
        [
          Query.equal('email', email),
          Query.equal('otp', otp),
          Query.greaterThan('expiresAt', new Date().toISOString())
        ]
      );

      if (otpDocs.documents.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      // Auto-register user if not exists (no password needed)
      let user;
      try {
        user = await users.getByEmail(email);
      } catch (err) {
        if (err.code === 404) {
          const tempPassword = this.generateOTP() + 'Aa!';
          user = await users.create(ID.unique(), email, tempPassword);
        } else throw err;
      }

      // Log the user in
      const session = await account.createEmailSession(email, tempPassword);
      
      // Delete used OTP
      await databases.deleteDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_OTP_COLLECTION_ID,
        otpDocs.documents[0].$id
      );

      res.json({ userId: user.$id, sessionId: session.$id });
    } catch (error) {
      res.status(500).json({ error: 'Authentication failed' });
    }
  }

  async logout(req, res) {
    try {
      await account.deleteSession('current');
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  async getUserProfile(req, res) {
    try {
      const user = await account.get();
      res.json(user);
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }
}

export default new AuthController();
