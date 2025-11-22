import React from 'react';
import { Heart, MessageCircle, MoreHorizontal, Share2 } from 'lucide-react';
import { Post } from '../../types/post';
import { useAuthStore } from '../../stores/authStore';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
    post: Post;
    onLike?: (postId: string) => void;
    onComment?: (postId: string) => void;
    onDelete?: (postId: string) => void;
}

export default function PostCard({ post, onLike, onComment, onDelete }: PostCardProps) {
    const { user } = useAuthStore();
    const isOwner = user?.id === post.userId;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        {post.user.profilePicUrl ? (
                            <img
                                src={post.user.profilePicUrl}
                                alt={post.user.username}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                {post.user.username[0].toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {post.user.username}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>

                {isOwner && (
                    <button
                        onClick={() => onDelete?.(post.id)}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Media */}
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-900">
                {post.mediaType === 'video' ? (
                    <video
                        src={post.mediaUrl}
                        controls
                        className="w-full h-full object-cover"
                        poster={post.thumbnailUrl || undefined}
                    />
                ) : (
                    <img
                        src={post.mediaUrl}
                        alt={post.caption || 'Post content'}
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Actions */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => onLike?.(post.id)}
                            className={`flex items-center space-x-1 transition-colors ${post.isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-300 hover:text-red-500'
                                }`}
                        >
                            <Heart className={`w-6 h-6 ${post.isLiked ? 'fill-current' : ''}`} />
                            {post.likesCount > 0 && <span className="font-medium">{post.likesCount}</span>}
                        </button>

                        <button
                            onClick={() => onComment?.(post.id)}
                            className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors"
                        >
                            <MessageCircle className="w-6 h-6" />
                            {post.commentsCount > 0 && <span className="font-medium">{post.commentsCount}</span>}
                        </button>

                        <button className="text-gray-600 dark:text-gray-300 hover:text-green-500 transition-colors">
                            <Share2 className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Caption */}
                {post.caption && (
                    <div className="mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white mr-2">
                            {post.user.username}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">{post.caption}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
