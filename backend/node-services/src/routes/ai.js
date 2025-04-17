import express from 'express';
import aiController from '../controllers/aiController.js';

const router = express.Router();

// Route to trigger AI-related processes
router.post('/process', aiController.triggerAIProcess.bind(aiController));

// Route to schedule AI process
router.post('/schedule', aiController.scheduleAIProcess.bind(aiController));

export default router;