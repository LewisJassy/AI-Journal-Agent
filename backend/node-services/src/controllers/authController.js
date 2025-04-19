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
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    try {
      // 1. Verify OTP exists and is valid
      const otpDocs = await databases.listDocuments(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_OTP_COLLECTION_ID,
        [
          Query.equal('email', email),
          Query.equal('otp', otp),
          Query.greaterThan('expirysAt', new Date().toISOString())
        ]
      );

      if (otpDocs.documents.length === 0) {
        return res.status(400).json({ error: 'Invalid OTP or expired OTP' });
      }

      // 2. Check if user exists using Users service (server-side)
      let userExists = true;
      let userId = null;
      let tempPassword = '';
      let user;
      try {
        // Try to find the user by email
        const usersList = await users.list([Query.equal('email', email)]);
        if (usersList.total === 0) {
          userExists = false;
        } else {
          user = usersList.users[0];
          userId = user.$id;
        }
      } catch (err) {
        userExists = false;
      }

      // 3. Create user if doesn't exist
      if (!userExists) {
        const newUserId = ID.unique();
        console.log(`Creating user with ID: ${newUserId}, email: ${email}`);
        const newUser = await users.create(newUserId, email);
        userId = newUser.$id;
      }

      // 4. Respond with userId and isNewUser (session creation is client-side)
      await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_OTP_COLLECTION_ID,
        otpDocs.documents[0].$id,
        { used: true }
      );

      res.json({ 
        userId,
        isNewUser: !userExists,
        tempPassword: !userExists ? tempPassword : undefined
      });
    } catch (error) {
      console.error('OTP Verification Error:', error);
      res.status(500).json({ 
        error: 'Authentication failed',
        details: error.message 
      });
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
