import express from 'express';
import { body, validationResult } from 'express-validator';
import authenticateUser from '../middleware/authenticateUser.js';
import { insertChatMessage, getChatHistory, getUserChatSessions, deleteChatMessage, clearChatHistory } from '../controllers/ChatController.js';
import { generateAIResponse } from '../services/openaiService.js';

const router = express.Router();

// Validation middleware
const validateMessage = [
  body('content')
    .notEmpty()
    .withMessage('Message content is required')
    .isString()
    .withMessage('Content must be a string'),
];

// ✅ Authenticated route: send message + AI response
router.post('/send', validateMessage, authenticateUser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { content, sessionId } = req.body;
    const userId = req.user.id;

    const userMessage = await insertChatMessage(userId, sessionId, 'user', content);
    const aiResponseText = await generateAIResponse(content);
    const aiMessage = await insertChatMessage(userId, sessionId, 'ai', aiResponseText);

    res.json({ messages: [userMessage, aiMessage] });
  } catch (error) {
    console.error('Error in /send route:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Quick test route: unauthenticated message insert
router.post('/message', validateMessage, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { content, sessionId } = req.body;

    // Default userId for testing since no authentication
    const userId = "test-user";

    const userMessage = await insertChatMessage(userId, sessionId, 'user', content);
    const aiResponseText = await generateAIResponse(content);
    const aiMessage = await insertChatMessage(userId, sessionId, 'ai', aiResponseText);

    res.json({ messages: [userMessage, aiMessage] });
  } catch (error) {
    console.error('Error in /message route:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Get chat history
router.get('/history', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.query;
    const userId = req.user.id;
    const history = await getChatHistory(userId, sessionId);
    res.json(history);
  } catch (error) {
    console.error('Error fetching chat history:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Get chat sessions
router.get('/sessions', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await getUserChatSessions(userId);
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Delete a chat message
router.delete('/message/:id', authenticateUser, async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user.id;
    const result = await deleteChatMessage(userId, messageId);
    res.json(result);
  } catch (error) {
    console.error('Error deleting chat message:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Clear chat history
router.delete('/clear', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;
    const result = await clearChatHistory(userId, sessionId);
    res.json(result);
  } catch (error) {
    console.error('Error clearing chat history:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
