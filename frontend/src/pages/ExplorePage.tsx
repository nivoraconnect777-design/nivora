import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, Heart, MessageCircle, Image as ImageIcon } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import api from '../lib/api';

interface Post {
    id: string;
    content: string;
    mediaUrl?: string;
    mediaType?: 'IMAGE' | 'VIDEO';
    createdAt: string;
    user: {
        id: string;
        username: string;
        displayName: string;
        profilePicUrl: string;
    };
    _count: {
        likes: number;
        comments: number;
    };
    isLiked: boolean;
}

export default function ExplorePage() {
    const { isDark } = useThemeStore();
    const navigate = useNavigate();
    const { ref, inView } = useInView();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['explorePosts'],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await api.get(`/api/explore?page=${pageParam}&limit=20`);
            return response.data.data;
        },
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.hasMore ? allPages.length + 1 : undefined;
        },
        initialPageParam: 1,
    });

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, fetchNextPage, hasNextPage]);

    if (status === 'pending') {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">Error loading explore feed</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Explore
                </h1>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Discover new posts from across the community
                </p>
            </div>

            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {data.pages.map((page) =>
                    page.posts.map((post: Post, index: number) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`break-inside-avoid rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer group relative ${isDark ? 'bg-gray-800' : 'bg-white'
                                }`}
                        >
                            {post.mediaUrl ? (
                                <div className="relative aspect-[4/5]">
                                    <img
                                        src={post.mediaUrl}
                                        alt="Post content"
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
                                        <div className="flex items-center gap-2">
                                            <Heart className="w-6 h-6 fill-white" />
                                            <span className="font-bold">{post._count.likes}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MessageCircle className="w-6 h-6 fill-white" />
                                            <span className="font-bold">{post._count.comments}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 aspect-square flex flex-col justify-between">
                                    <p className={`text-lg line-clamp-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {post.content}
                                    </p>
                                    <div className="flex items-center gap-4 text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Heart className="w-4 h-4" />
                                            <span className="text-sm">{post._count.likes}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MessageCircle className="w-4 h-4" />
                                            <span className="text-sm">{post._count.comments}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* User Info (Bottom) */}
                            <div className={`p-3 flex items-center gap-3 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                                <img
                                    src={post.user.profilePicUrl || `https://ui-avatars.com/api/?name=${post.user.username}&background=random`}
                                    alt={post.user.username}
                                    className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/profile/${post.user.username}`);
                                    }}
                                />
                                <span
                                    className={`text-sm font-medium truncate cursor-pointer hover:underline ${isDark ? 'text-white' : 'text-gray-900'}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/profile/${post.user.username}`);
                                    }}
                                >
                                    {post.user.username}
                                </span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Loading Indicator */}
            <div ref={ref} className="py-8 flex justify-center">
                {isFetchingNextPage && <Loader2 className="w-8 h-8 animate-spin text-blue-500" />}
            </div>
        </div>
    );
}
