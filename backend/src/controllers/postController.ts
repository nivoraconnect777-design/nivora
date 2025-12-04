import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { redis, CACHE_TTL } from '../config/redisClient';

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

        // Invalidate feed caches if Redis is available
        if (redis) {
            try {
                const keys = await redis.keys('feed:*');
                if (keys.length > 0) {
                    await redis.del(...keys);
                }

                // Invalidate explore cache
                const exploreKeys = await redis.keys('explore:*');
                if (exploreKeys.length > 0) {
                    await redis.del(...exploreKeys);
                }
            } catch (redisError) {
                console.error('Redis error in createPost:', redisError);
                // Continue without caching
            }
        }

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

        // Try to get from cache if Redis is available
        if (redis) {
            try {
                const cacheKey = `feed:${page}:${limit}`;
                const cachedPosts = await redis.get(cacheKey);

                if (cachedPosts) {
                    return res.status(200).json({ success: true, posts: cachedPosts });
                }
            } catch (redisError) {
                console.error('Redis error in getPosts (read):', redisError);
                // Fallback to DB
            }
        }

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

        // Cache the result if Redis is available
        if (redis) {
            try {
                const cacheKey = `feed:${page}:${limit}`;
                await redis.set(cacheKey, JSON.stringify(transformedPosts), { ex: CACHE_TTL.FEED });
            } catch (redisError) {
                console.error('Redis error in getPosts (write):', redisError);
                // Continue without caching
            }
        }

        res.status(200).json({ success: true, posts: transformedPosts });
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ success: false, message: 'Error fetching posts' });
    }
};

export const getPostById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Try to get from cache if Redis is available
        if (redis) {
            try {
                const cacheKey = `post:${id}`;
                const cachedPost = await redis.get(cacheKey);

                if (cachedPost) {
                    return res.status(200).json({ success: true, post: cachedPost });
                }
            } catch (redisError) {
                console.error('Redis error in getPostById (read):', redisError);
                // Fallback to DB
            }
        }

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

        // Cache the result if Redis is available
        if (redis) {
            try {
                const cacheKey = `post:${id}`;
                await redis.set(cacheKey, JSON.stringify(transformedPost), { ex: CACHE_TTL.POST });
            } catch (redisError) {
                console.error('Redis error in getPostById (write):', redisError);
                // Continue without caching
            }
        }

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

        // Invalidate caches if Redis is available
        if (redis) {
            try {
                await redis.del(`post:${id}`);

                const keys = await redis.keys('feed:*');
                if (keys.length > 0) {
                    await redis.del(...keys);
                }

                const exploreKeys = await redis.keys('explore:*');
                if (exploreKeys.length > 0) {
                    await redis.del(...exploreKeys);
                }
            } catch (redisError) {
                console.error('Redis error in deletePost:', redisError);
                // Continue
            }
        }

        res.status(200).json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ success: false, message: 'Error deleting post' });
    }
};

export const toggleLike = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId: id,
                },
            },
        });

        if (existingLike) {
            await prisma.like.delete({
                where: {
                    id: existingLike.id,
                },
            });

            // Invalidate caches if Redis is available
            if (redis) {
                try {
                    await redis.del(`post:${id}`);

                    const keys = await redis.keys('feed:*');
                    if (keys.length > 0) {
                        await redis.del(...keys);
                    }

                    const exploreKeys = await redis.keys('explore:*');
                    if (exploreKeys.length > 0) {
                        await redis.del(...exploreKeys);
                    }
                } catch (redisError) {
                    console.error('Redis error in toggleLike (unlike):', redisError);
                    // Continue
                }
            }

            res.status(200).json({ success: true, isLiked: false });
        } else {
            await prisma.like.create({
                data: {
                    userId,
                    postId: id,
                },
            });

            // Create notification for post owner (if not liking own post)
            const post = await prisma.post.findUnique({ where: { id } });
            if (post && post.userId !== userId) {
                await prisma.notification.create({
                    data: {
                        recipientId: post.userId,
                        actorId: userId,
                        type: 'like',
                        postId: id,
                    },
                });
            }

            // Invalidate caches if Redis is available
            if (redis) {
                try {
                    await redis.del(`post:${id}`);

                    const keys = await redis.keys('feed:*');
                    if (keys.length > 0) {
                        await redis.del(...keys);
                    }

                    const exploreKeys = await redis.keys('explore:*');
                    if (exploreKeys.length > 0) {
                        await redis.del(...exploreKeys);
                    }
                } catch (redisError) {
                    console.error('Redis error in toggleLike (like):', redisError);
                    // Continue
                }
            }

            res.status(200).json({ success: true, isLiked: true });
        }
    } catch (error) {
        console.error('Toggle like error:', error);
        res.status(500).json({ success: false, message: 'Error toggling like' });
    }
};

export const addComment = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { text, parentCommentId } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Comment text is required' });
        }

        const comment = await prisma.comment.create({
            data: {
                userId,
                postId: id,
                text,
                parentCommentId: parentCommentId || null,
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
                        replies: true,
                    },
                },
            },
        });

        // Create notification for post owner (if not commenting on own post)
        const post = await prisma.post.findUnique({ where: { id } });
        if (post && post.userId !== userId) {
            await prisma.notification.create({
                data: {
                    recipientId: post.userId,
                    actorId: userId,
                    type: 'comment',
                    postId: id,
                    commentId: comment.id,
                },
            });
        }

        const transformedComment = {
            ...comment,
            likesCount: comment._count.likes,
            repliesCount: comment._count.replies,
            isLiked: false,
            _count: undefined,
        };

        // Invalidate caches if Redis is available
        if (redis) {
            try {
                await redis.del(`post:${id}`);

                const keys = await redis.keys('feed:*');
                if (keys.length > 0) {
                    await redis.del(...keys);
                }

                const exploreKeys = await redis.keys('explore:*');
                if (exploreKeys.length > 0) {
                    await redis.del(...exploreKeys);
                }
            } catch (redisError) {
                console.error('Redis error in addComment:', redisError);
                // Continue
            }
        }

        res.status(201).json({ success: true, comment: transformedComment });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ success: false, message: 'Error adding comment' });
    }
};

export const getComments = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        // Fetch top-level comments with nested replies
        const comments = await prisma.comment.findMany({
            where: {
                postId: id,
                parentCommentId: null, // Only top-level comments
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
                        replies: true,
                    },
                },
                likes: userId ? {
                    where: { userId },
                    select: { userId: true },
                } : false,
                replies: {
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
                                replies: true,
                            },
                        },
                        likes: userId ? {
                            where: { userId },
                            select: { userId: true },
                        } : false,
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Transform comments to include isLiked and counts
        const transformedComments = comments.map(comment => ({
            ...comment,
            likesCount: comment._count.likes,
            repliesCount: comment._count.replies,
            isLiked: Array.isArray(comment.likes) && comment.likes.length > 0,
            replies: comment.replies.map(reply => ({
                ...reply,
                likesCount: reply._count.likes,
                repliesCount: reply._count.replies,
                isLiked: Array.isArray(reply.likes) && reply.likes.length > 0,
                likes: undefined,
                _count: undefined,
            })),
            likes: undefined,
            _count: undefined,
        }));

        res.status(200).json({ success: true, comments: transformedComments });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({ success: false, message: 'Error fetching comments' });
    }
};
