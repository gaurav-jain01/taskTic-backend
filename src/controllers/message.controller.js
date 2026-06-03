import Message from '../models/message.model.js';
import { getIO } from '../socket/index.js';

export const getMessages = async (req, res) => {
  try {
    const filter = req.query.teamId ? { teamId: req.query.teamId } : {};
    const messages = await Message.find(filter)
      .populate('senderId', 'name role')
      .sort({ timestamp: 1 });
    return res.json(messages);
  } catch (error) {
    console.error('GET /api/messages error:', error);
    return res.status(500).json({ error: 'Unable to fetch messages' });
  }
};

export const createMessage = async (req, res) => {
  try {
    const { content, senderId, teamId } = req.body;

    if (!content || !senderId || !teamId) {
      return res.status(400).json({
        error: 'content, senderId and teamId are required'
      });
    }

    const message = new Message({
      content,
      senderId,
      teamId
    });

    await message.save();

    await message.populate('senderId', 'name role');

    console.log("Message Team:", teamId);


    // Real-time emit
    getIO()
      .to(teamId)
      .emit('newMessage', message);

    return res.status(201).json(message);

  } catch (error) {
    console.error('POST /api/messages error:', error);
    return res.status(500).json({
      error: 'Unable to create message'
    });
  }
};
