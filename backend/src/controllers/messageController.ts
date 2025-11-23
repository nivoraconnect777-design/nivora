import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getConversations = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any).userId;

        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId: userId,
                    },
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                profilePicUrl: true,
                                displayName: true,
                            },
                        },
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        // Format conversations
        const formattedConversations = conversations.map((conv) => {
            const otherParticipant = conv.participants.find((p) => p.userId !== userId)?.user;
            const lastMessage = conv.messages[0];

            return {
                id: conv.id,
                otherUser: otherParticipant,
                lastMessage: lastMessage
                    ? {
                        text: lastMessage.text,
                        createdAt: lastMessage.createdAt,
                        isOwn: lastMessage.senderId === userId,
                    }
                    : null,
                updatedAt: conv.updatedAt,
            };
        });

        return res.json({
            status: 'success',
            data: formattedConversations,
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error fetching conversations',
        });
    }
};

export const getMessages = async (req: Request, res: Response) => {
    try {
        const { conversationId } = req.params;
        const userId = (req.user as any).userId;

        // Verify participation
        const participant = await prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId,
                },
            },
        });

        if (!participant) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to view this conversation',
            });
        }

        const messages = await prisma.message.findMany({
            where: {
                conversationId,
            },
            orderBy: {
                createdAt: 'asc',
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        profilePicUrl: true,
                    },
                },
            },
        });

        return res.json({
            status: 'success',
            data: messages,
        });
    } catch (error) {
        console.error('Get messages error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error fetching messages',
            const participant = await prisma.conversationParticipant.findFirst({
                where: {
                    conversationId,
                    userId: { not: senderId },
                },
            });
            return participant?.userId || '';
        }
