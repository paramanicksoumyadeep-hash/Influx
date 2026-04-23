// @ts-nocheck
import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getConversations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant_1: userId },
          { participant_2: userId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            influencer_profile: { select: { full_name: true, profile_photo_url: true } },
            brand_profile: { select: { company_name: true, logo_url: true } }
          }
        },
        user2: {
          select: {
            id: true,
            username: true,
            influencer_profile: { select: { full_name: true, profile_photo_url: true } },
            brand_profile: { select: { company_name: true, logo_url: true } }
          }
        },
        last_message: true
      },
      orderBy: { updated_at: 'desc' }
    });

    res.json(conversations);
  } catch (error) {
    console.error("Get Conversations Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: conversationId } = req.params;
    const userId = req.user?.id;

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    console.log(`[GetMessages Debug] User: ${userId}, Conv: ${conversationId}`);
    if (conversation) {
      console.log(`[GetMessages Debug] Participants: P1=${conversation.participant_1}, P2=${conversation.participant_2}`);
    }

    if (!conversation || (String(conversation.participant_1) !== String(userId) && String(conversation.participant_2) !== String(userId))) {
      return res.status(403).json({ message: "Unauthorized to view this conversation" });
    }

    const messages = await prisma.message.findMany({
      where: { conversation_id: conversationId },
      include: {
        sender: {
          select: { id: true, username: true }
        }
      },
      orderBy: { created_at: 'asc' }
    });

    res.json(messages);
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const startConversation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user?.id;

    if (userId === recipientId) return res.status(400).json({ message: "Cannot message yourself" });

    // Verify ACCEPTED connection exists
    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { requester_id: userId, recipient_id: recipientId, status: 'ACCEPTED' },
          { requester_id: recipientId, recipient_id: userId, status: 'ACCEPTED' }
        ]
      }
    });

    if (!connection) {
      return res.status(403).json({ message: "You can only message users you are connected with" });
    }

    // Ensure consistent participant ordering (p1 < p2) to prevent duplicates
    const [p1, p2] = [userId, recipientId].sort();

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        participant_1: p1,
        participant_2: p2
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant_1: p1,
          participant_2: p2
        },
        include: {
          user1: {
            select: {
              id: true,
              username: true,
              influencer_profile: { select: { full_name: true, profile_photo_url: true } },
              brand_profile: { select: { company_name: true, logo_url: true } }
            }
          },
          user2: {
            select: {
              id: true,
              username: true,
              influencer_profile: { select: { full_name: true, profile_photo_url: true } },
              brand_profile: { select: { company_name: true, logo_url: true } }
            }
          },
          last_message: true
        }
      });
    } else {
      // Re-fetch to include users even if it already existed (just in case)
      conversation = await prisma.conversation.findUnique({
        where: { id: conversation.id },
        include: {
          user1: {
            select: {
              id: true,
              username: true,
              influencer_profile: { select: { full_name: true, profile_photo_url: true } },
              brand_profile: { select: { company_name: true, logo_url: true } }
            }
          },
          user2: {
            select: {
              id: true,
              username: true,
              influencer_profile: { select: { full_name: true, profile_photo_url: true } },
              brand_profile: { select: { company_name: true, logo_url: true } }
            }
          },
          last_message: true
        }
      });
    }

    res.status(201).json(conversation);
  } catch (error) {
    console.error("Start Conversation Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
