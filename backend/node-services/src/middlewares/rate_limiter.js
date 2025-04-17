import { RateLimiterRedis } from 'rate-limiter-flexible';
import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config()

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  
  redisClient.on('error', (err) => {
    console.error('Redis error:', err.message);
  });
  
  redisClient.connect().catch(err => {
    console.error('Redis connection failed:', err.message);
  });

const otpRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: 3,
  duration: 60 * 15,
  keyPrefix: 'otp_limit',
});

const rateLimiterMiddleware = async (req, res, next) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
  
    const key = `${req.ip}_${email}`;
  
    try {
      await otpRateLimiter.consume(key);
      next();
    } catch (error) {
      if (error instanceof Error) {
        console.error('Rate limiter failed:', error.message);
        next();
      } else {
        res.status(429).json({ error: 'Too many OTP requests. Try again later.' });
      }
    }
  };
export default rateLimiterMiddleware;
