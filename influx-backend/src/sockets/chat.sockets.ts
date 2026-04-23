// @ts-nocheck
import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma';

export const registerChatHandlers = (io: Server, socket: any) => {
  const userId = socket.user?.id;
  if (!userId) return;

  // Join private room
  socket.join(`user:${userId}`);
  console.log(`User ${userId} joined their private room`);

  // Join a specific conversation room for typing/read status
  socket.on('join_conversation', (conversationId: string) => {
    socket.join(`conv:${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId: string) => {
    socket.leave(`conv:${conversationId}`);
  });

  // Handle message sending
  socket.on('send_message', async (data: { conversationId: string, recipientId: string, content: string }) => {
    try {
      const { conversationId, recipientId, content } = data;

      // 1. Create message in DB
      const message = await prisma.message.create({
        data: {
          conversation_id: conversationId,
          sender_id: userId,
          content: content,
        },
        include: {
          sender: {
            select: { id: true, username: true }
          }
        }
      });

      // 2. Update conversation's last message and updatedAt
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          last_message_id: message.id,
          updated_at: new Date()
        }
      });

      // 3. Emit to recipient's private room
      io.to(`user:${recipientId}`).emit('new_message', message);
      
      // 4. Also emit to sender (to confirm delivery/persistence)
      socket.emit('message_sent', message);

    } catch (error) {
      console.error("Socket Send Message Error:", error);
      socket.emit('error', { message: "Failed to send message" });
    }
  });

  // Typing indicator
  socket.on('typing', (data: { conversationId: string, isTyping: boolean }) => {
    socket.to(`conv:${data.conversationId}`).emit('user_typing', {
      userId,
      isTyping: data.isTyping,
      conversationId: data.conversationId
    });
  });

  socket.on('disconnect', () => {
    console.log(`User ${userId} disconnected`);
  });
};
