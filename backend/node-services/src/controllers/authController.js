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
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(req, res) {
    const { email } = req.body;
    try {
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60000).toISOString();

      await databases.createDocument(
        process.env.APPWRITE_DATABASE_ID,
        process.env.APPWRITE_OTP_COLLECTION_ID,
        ID.unique(),
        { email, otp, expiresAt }
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
      //Verify OTP
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
        return res.status(400).json({ error: 'Invalid OTP or expired OTP' });
      }

      // Check if user exists using Users API (server-side proper)
      let user;
      let isNewUser = false;
      let tempPassword = '';
      
      try {
        const usersList = await users.list([Query.equal('email', email)]);
        if (usersList.users.length > 0) {
          user = usersList.users[0];
        } else {
          isNewUser = true;
          tempPassword = this.generateTempPassword();
          user = await users.create(
            ID.unique(), 
            email,
            undefined, 
            tempPassword,
            email
          );
        }

        // Create session token (server-side approach)
        const session = await this.createSession(email, isNewUser ? tempPassword : undefined);

        await databases.updateDocument(
          process.env.APPWRITE_DATABASE_ID,
          process.env.APPWRITE_OTP_COLLECTION_ID,
          otpDocs.documents[0].$id,
          { used: true }
        );

        res.json({ 
          userId: user.$id,
          sessionId: session.$id,
          isNewUser
        });

      } catch (error) {
        console.error('User creation/session error:', error);
        throw error;
      }
    } catch (error) {
      console.error('OTP Verification Error:', error);
      res.status(500).json({ 
        error: 'Authentication failed',
        details: error.message,
        type: error.type || 'unknown_error'
      });
    }
}


async createSession(email, password) {
  if (password) {
    return account.createEmailPasswordSession(email, password);
  } else {
    throw new Error('Password required for existing users');
  }
}

generateTempPassword() {
  const random = Math.random().toString(36).slice(-8);
  return `${random}@A1`;
}

}

export default new AuthController();
