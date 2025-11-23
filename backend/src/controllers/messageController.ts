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
        });
    }
};

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { conversationId, text, imageUrl, receiverId } = req.body;

        // Get userId from auth middleware (it sets req.user with userId field)
        const senderId = (req.user as any).userId;

        console.log('[sendMessage] Request:', {
            senderId,
            conversationId,
            receiverId,
            hasText: !!text,
            hasImage: !!imageUrl
        });

        // Validation: Must have either conversationId or receiverId
        if (!conversationId && !receiverId) {
            console.error('[sendMessage] Validation failed: Missing conversationId and receiverId');
            return res.status(400).json({
                status: 'error',
                message: 'Either conversationId or receiverId is required',
            });
        }

        // Validation: Cannot message yourself
        if (receiverId && receiverId === senderId) {
            console.error('[sendMessage] Validation failed: Cannot message yourself');
            return res.status(400).json({
                status: 'error',
                message: 'Cannot send message to yourself',
            });
        }

        let targetConversationId = conversationId;

        // If no conversationId provided, find or create conversation
        if (!targetConversationId && receiverId) {
            console.log('[sendMessage] Finding or creating conversation with receiverId:', receiverId);

            // Check if conversation already exists between these two users
            const existingConv = await prisma.conversation.findFirst({
                where: {
                    AND: [
                        { participants: { some: { userId: senderId } } },
                        { participants: { some: { userId: receiverId } } },
                    ],
                },
            });

            if (existingConv) {
                console.log('[sendMessage] Found existing conversation:', existingConv.id);
                targetConversationId = existingConv.id;
            } else {
                console.log('[sendMessage] Creating new conversation');
                // Create new conversation
                const newConv = await prisma.conversation.create({
                    data: {
                        participants: {
                            create: [
                                { userId: senderId },
                                { userId: receiverId },
                            ],
                        },
                    },
                });
                console.log('[sendMessage] Created new conversation:', newConv.id);
                targetConversationId = newConv.id;
            }
        }

        // If text and imageUrl are both empty, just return the conversation info
        // This is useful for creating a conversation without sending a message
        if (!text && !imageUrl) {
            console.log('[sendMessage] No message content, returning conversation info');
            return res.json({
                status: 'success',
                data: {
                    conversationId: targetConversationId,
                },
            });
        }

        console.log('[sendMessage] Creating message in conversation:', targetConversationId);

        // Create the message
        const message = await prisma.message.create({
            data: {
                conversationId: targetConversationId,
                senderId,
                receiverId: receiverId || (await getReceiverId(targetConversationId, senderId)),
                text: text || null,
                imageUrl: imageUrl || null,
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

        console.log('[sendMessage] Message created:', message.id);

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: targetConversationId },
            data: { updatedAt: new Date() },
        });

        // Emit socket event for real-time delivery
        const io = req.app.get('io');
        if (io) {
            console.log('[sendMessage] Emitting socket event to room:', targetConversationId);
            io.to(targetConversationId).emit('new_message', message);
        } else {
            console.warn('[sendMessage] Socket.io instance not found');
        }

        return res.json({
            status: 'success',
            data: message,
        });
    } catch (error: any) {
        console.error('[sendMessage] Error:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
        });
        return res.status(500).json({
            status: 'error',
            message: 'Error sending message',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// Helper to find the other participant in a conversation
async function getReceiverId(conversationId: string, senderId: string): Promise<string> {
    const participant = await prisma.conversationParticipant.findFirst({
        where: {
            conversationId,
            userId: { not: senderId },
        },
    });
    return participant?.userId || '';
}
