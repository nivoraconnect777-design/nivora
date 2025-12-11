import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader2 } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import FollowButton from '../social/FollowButton';

interface FollowingModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    username: string;
}

interface User {
    id: string;
    username: string;
    displayName: string;
    profilePicUrl: string;
    bio: string;
    isVerified: boolean;
}

export default function FollowingModal({ isOpen, onClose, userId, username }: FollowingModalProps) {
    const { isDark } = useThemeStore();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch following
    const { data, isLoading } = useQuery({
        queryKey: ['following', userId],
        queryFn: async () => {
            const response = await api.get(`/api/users/${userId}/following`);
            return response.data.data.following;
        },
        enabled: isOpen,
    });

    const following: User[] = data || [];

    // Filter following based on search query
    const filteredFollowing = following.filter(
        (user) =>
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className={`relative w-full max-w-md max-h-[600px] rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'
                        }`}
                >
                    {/* Header */}
                    <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Following
                        </h2>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                                }`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="relative">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search following..."
                                className={`w-full pl-10 pr-4 py-2.5 rounded-xl transition-all ${isDark
                                        ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500'
                                        : 'bg-gray-100 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                                    } focus:outline-none focus:ring-2`}
                            />
                        </div>
                    </div>

                    {/* Following List */}
                    <div className="overflow-y-auto max-h-[400px] custom-scrollbar">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        ) : filteredFollowing.length === 0 ? (
                            <div className="text-center py-12">
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {searchQuery ? 'No users found' : 'Not following anyone yet'}
                                </p>
                            </div>
                        ) : (
                            <div className="p-2">
                                {filteredFollowing.map((user) => (
                                    <div
                                        key={user.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        {/* Avatar */}
                                        <div
                                            onClick={() => {
                                                navigate(`/profile/${user.username}`);
                                                onClose();
                                            }}
                                            className="cursor-pointer"
                                        >
                                            {user.profilePicUrl ? (
                                                <img
                                                    src={user.profilePicUrl}
                                                    alt={user.username}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                                    <span className="text-lg font-bold text-white">
                                                        {user.username[0].toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* User Info */}
                                        <div
                                            onClick={() => {
                                                navigate(`/profile/${user.username}`);
                                                onClose();
                                            }}
                                            className="flex-1 min-w-0 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-1">
                                                <p className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {user.displayName || user.username}
                                                </p>
                                                {user.isVerified && (
                                                    <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                @{user.username}
                                            </p>
                                            {user.bio && (
                                                <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                    {user.bio}
                                                </p>
                                            )}
                                        </div>

                                        {/* Follow Button */}
                                        <div className="flex-shrink-0">
                                            <FollowButton userId={user.id} size="sm" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
