// src/routes/chatRoutes.js

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/chats
router.post('/', protect, chatController.createChatSession);

// GET /api/chats
router.get('/', protect, chatController.getUserChats);

// GET /api/chats/:chatId/messages
router.get('/:chatId/messages', protect, chatController.getChatMessages);

// POST /api/chats/:chatId/messages
router.post('/:chatId/messages', protect, chatController.postMessage);


module.exports = router;