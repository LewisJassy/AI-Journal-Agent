import express from "express";
const auth_router = express.Router();
import authController from "../controllers/authController.js";
import rateLimiterMiddleware from "../middlewares/rate_limiter.js"

// OTP-only authentication
auth_router.post('/send-otp', rateLimiterMiddleware, authController.sendOTP);
auth_router.post('/verify-otp', authController.verifyOTP);


export default auth_router;