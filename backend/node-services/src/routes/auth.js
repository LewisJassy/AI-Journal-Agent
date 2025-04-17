import express from "express";
const auth_router = express.Router();
import authController from "../controllers/authController.js";
import rateLimiterMiddleware from "../middlewares/rate_limiter.js"

// OTP-only authentication
auth_router.post('/send-otp', rateLimiterMiddleware, authController.sendOTP);
auth_router.post('/verify-otp', authController.verifyOTP);

auth_router.post('/logout', authController.logout);
auth_router.get('/profile', authController.getUserProfile);

export default auth_router;