import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import FollowButton from './FollowButton';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
}

interface User {
  id: string;
  username: string;
  displayName: string;
  profilePicUrl: string;
  bio: string;
}

export default function FollowersModal({ isOpen, onClose, userId, type }: FollowersModalProps) {
  const { isDark } = useThemeStore();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: [type, userId, page],
    queryFn: async () => {
      const endpoint = type === 'followers' ? 'followers' : 'following';
      const response = await api.get(`/api/users/${userId}/${endpoint}?page=${page}&limit=20`);
      return response.data.data;
    },
    enabled: isOpen && !!userId,
  });

  const users: User[] = data?.[type] || [];
  const pagination = data?.pagination;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`w-full max-w-md rounded-2xl shadow-2xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } max-h-[80vh] flex flex-col`}
            >
              {/* Header */}
              <div
                className={`flex items-center justify-between p-6 border-b ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {type === 'followers' ? 'Followers' : 'Following'}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className={`p-2 rounded-xl transition-colors ${
                    isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Failed to load {type}
                    </p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12">
                    <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      No {type} yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <UserItem key={user.id} user={user} isDark={isDark} />
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div
                  className={`flex items-center justify-between p-4 border-t ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Previous
                  </button>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Page {page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className={`px-4 py-2 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function UserItem({ user, isDark }: { user: User; isDark: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
        isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
      }`}
    >
      {/* Profile Picture */}
      <div className="flex-shrink-0">
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
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {user.displayName || user.username}
        </h3>
        <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          @{user.username}
        </p>
        {user.bio && (
          <p className={`text-sm truncate mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {user.bio}
          </p>
        )}
      </div>

      {/* Follow Button */}
      <FollowButton userId={user.id} size="sm" showIcon={false} />
    </motion.div>
  );
}
