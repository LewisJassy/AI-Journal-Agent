import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',  // Explicit SMTP server
    port: 587,               
    secure: false,           
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,  // Bypass SSL validation (for local testing only)
    },
  });


export const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"AI Journal" <${process.env.EMAIL_USER}>`,
      to,
      subject: "AI Journal OTP",
      text,
      
    });
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email');
  }
};