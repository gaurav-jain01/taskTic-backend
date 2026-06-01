const express = require('express');
const Message = require('../models/message.model');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 });
    return res.json(messages);
  } catch (error) {
    console.error('GET /api/messages error:', error);
    return res.status(500).json({ error: 'Unable to fetch messages' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { content, senderId, teamId } = req.body;
    if (!content || !senderId || !teamId) {
      return res.status(400).json({ error: 'content, senderId and teamId are required' });
    }

    const message = new Message({ content, senderId, teamId });
    await message.save();
    return res.status(201).json(message);
  } catch (error) {
    console.error('POST /api/messages error:', error);
    return res.status(500).json({ error: 'Unable to create message' });
  }
});

module.exports = router;
