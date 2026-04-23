// @ts-nocheck
import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const sendConnectionRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { recipientId } = req.body;
    const requesterId = req.user?.id;

    if (!requesterId) return res.status(401).json({ message: "Unauthorized" });
    if (requesterId === recipientId) {
      return res.status(400).json({ message: "You cannot connect with yourself" });
    }

    // Check if a connection already exists
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { requester_id: requesterId, recipient_id: recipientId },
          { requester_id: recipientId, recipient_id: requesterId }
        ]
      }
    });

    if (existingConnection) {
      return res.status(400).json({ message: "Connection request already exists or you are already connected" });
    }

    const connection = await prisma.connection.create({
      data: {
        requester_id: requesterId,
        recipient_id: recipientId,
        status: 'PENDING'
      }
    });

    // Create Notification for recipient
    await prisma.notification.create({
      data: {
        user_id: recipientId,
        type: 'CONNECTION_REQUEST',
        content: `You have a new connection request from @${req.user?.username}`,
        reference_id: connection.id
      }
    });

    res.status(201).json({ message: "Connection request sent", connection });
  } catch (error) {
    console.error("Connection Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const respondToConnectionRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body; // ACCEPTED or DECLINED
    const userId = req.user?.id;

    if (!['ACCEPTED', 'DECLINED'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const connection = await prisma.connection.findUnique({
      where: { id }
    });

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    if (connection.recipient_id !== userId) {
      return res.status(403).json({ message: "Unauthorized to respond to this request" });
    }

    const updatedConnection = await prisma.connection.update({
      where: { id },
      data: { status }
    });

    // Notify requester if accepted
    if (status === 'ACCEPTED') {
      await prisma.notification.create({
        data: {
          user_id: updatedConnection.requester_id,
          type: 'CONNECTION_ACCEPTED',
          content: `@${req.user?.username} accepted your connection request!`,
          reference_id: updatedConnection.id
        }
      });
    }

    res.json({ message: `Connection ${status.toLowerCase()}`, connection: updatedConnection });
  } catch (error) {
    console.error("Connection Response Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyConnections = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { requester_id: userId },
          { recipient_id: userId }
        ]
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            role: true,
            influencer_profile: { select: { full_name: true, profile_photo_url: true } },
            brand_profile: { select: { company_name: true, logo_url: true } }
          }
        },
        recipient: {
          select: {
            id: true,
            username: true,
            role: true,
            influencer_profile: { select: { full_name: true, profile_photo_url: true } },
            brand_profile: { select: { company_name: true, logo_url: true } }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(connections);
  } catch (error) {
    console.error("Get Connections Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
