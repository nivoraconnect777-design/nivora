import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createPost = async (req: AuthRequest, res: Response) => {
    try {
        const { caption, mediaUrl, mediaType } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (!mediaUrl) {
            return res.status(400).json({ success: false, message: 'Media is required' });
        }

        const post = await prisma.post.create({
            data: {
                userId,
                caption,
                mediaUrl,
                mediaType: mediaType || 'image',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        profilePicUrl: true,
                    },
                },
            },
        });

        res.status(201).json({ success: true, post });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ success: false, message: 'Error creating post' });
    }
};

export const getPosts = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const posts = await prisma.post.findMany({
            take: limit,
            skip: skip,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        profilePicUrl: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
                likes: {
                    where: {
                        userId: req.user?.id,
                    },
                    select: {
                        userId: true,
                    },
                },
            },
        });

        // Transform data to include isLiked boolean
        const transformedPosts = posts.map((post) => ({
            ...post,
            isLiked: post.likes.length > 0,
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
            likes: undefined, // Remove the likes array from response
            _count: undefined, // Remove _count from response
        }));

        res.status(200).json({ success: true, posts: transformedPosts });
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ success: false, message: 'Error fetching posts' });
    }
};

export const getPostById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        profilePicUrl: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
                likes: {
                    where: {
                        userId: req.user?.id,
                    },
                    select: {
                        userId: true,
                    },
                },
            },
        });

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const transformedPost = {
            ...post,
            isLiked: post.likes.length > 0,
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
            likes: undefined,
            _count: undefined,
        };

        res.status(200).json({ success: true, post: transformedPost });
    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({ success: false, message: 'Error fetching post' });
    }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const post = await prisma.post.findUnique({
            where: { id },
        });

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        if (post.userId !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        await prisma.post.delete({
            where: { id },
        });

        res.status(200).json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ success: false, message: 'Error deleting post' });
    }
};
