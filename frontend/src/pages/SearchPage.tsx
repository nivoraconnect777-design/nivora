import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, UserPlus } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import FollowButton from '../components/social/FollowButton';

interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  profilePicUrl: string;
  bio: string;
  isVerified: boolean;
  stats: {
    followers: number;
    following: number;
    posts: number;
  };
}

export default function SearchPage() {
  const { isDark } = useThemeStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query (300ms as per requirements)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search users with TanStack Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['searchUsers', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { users: [], pagination: null };
      
      const response = await api.get(`/api/search/users?q=${encodeURIComponent(debouncedQuery)}`);
      return response.data.data;
    },
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 30000, // Cache for 30 seconds
  });

  const users: User[] = data?.users || [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Search
        </h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Find people by username, name, or email
        </p>
      </motion.div>

      {/* Search Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative">
          <Search
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for users..."
            className={`w-full pl-12 pr-4 py-4 rounded-2xl transition-all ${
              isDark
                ? 'bg-gray-800 text-white placeholder-gray-400 focus:ring-blue-500'
                : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500 shadow-lg'
            } focus:outline-none focus:ring-2`}
            autoFocus
          />
        </div>
      </motion.div>

      {/* Search Results */}
      <div className="space-y-4">
        {isLoading && debouncedQuery && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Failed to search users
            </p>
          </div>
        )}

        {!isLoading && !error && debouncedQuery && users.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <UserPlus className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No users found for "{debouncedQuery}"
            </p>
          </motion.div>
        )}

        {!debouncedQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Search className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Start typing to search for users
            </p>
          </motion.div>
        )}

        {users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <UserCard user={user} isDark={isDark} navigate={navigate} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function UserCard({ user, isDark, navigate }: { user: User; isDark: boolean; navigate: any }) {
  return (
    <div
      className={`p-4 rounded-2xl transition-all cursor-pointer ${
        isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50 shadow-lg'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Profile Picture */}
        <div
          onClick={() => navigate(`/profile/${user.username}`)}
          className="flex-shrink-0 cursor-pointer"
        >
          {user.profilePicUrl ? (
            <img
              src={user.profilePicUrl}
              alt={user.username}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user.username[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div
          onClick={() => navigate(`/profile/${user.username}`)}
          className="flex-1 min-w-0 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {user.displayName || user.username}
            </h3>
            {user.isVerified && (
              <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            )}
          </div>
          <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            @{user.username}
          </p>
          {user.bio && (
            <p className={`text-sm truncate mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {user.bio}
            </p>
          )}
          <div className={`flex gap-4 mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <span>
              <strong className={isDark ? 'text-white' : 'text-gray-900'}>
                {user.stats.followers}
              </strong>{' '}
              followers
            </span>
            <span>
              <strong className={isDark ? 'text-white' : 'text-gray-900'}>
                {user.stats.posts}
              </strong>{' '}
              posts
            </span>
          </div>
        </div>

        {/* Follow Button */}
        <div className="flex-shrink-0">
          <FollowButton userId={user.id} size="sm" />
        </div>
      </div>
    </div>
  );
}
