import { Server } from 'socket.io';
import Message from '../models/message.model.js';

export default (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('joinTeam', ({ teamId }) => {
      if (!teamId) {
        return;
      }
      const roomName = `team_${teamId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room ${roomName}`);
    });

    socket.on('sendMessage', async (payload, callback) => {
      try {
        const { content, senderId, teamId } = payload || {};
        if (!content || !senderId || !teamId) {
          const error = 'content, senderId, and teamId are required';
          if (typeof callback === 'function') callback({ error });
          return;
        }

        const message = new Message({ content, senderId, teamId });
        await message.save();

        const roomName = `team_${teamId}`;
        const eventPayload = {
          _id: message._id,
          content: message.content,
          senderId: message.senderId,
          teamId: message.teamId,
          timestamp: message.timestamp,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
        };

        socket.to(roomName).emit('receiveMessage', eventPayload);
        if (typeof callback === 'function') callback({ success: true, message: eventPayload });
      } catch (error) {
        console.error('Socket sendMessage error:', error);
        if (typeof callback === 'function') callback({ error: 'Unable to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
