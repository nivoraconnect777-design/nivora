import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { Settings, Grid, Film, Bookmark, Camera, Loader2, MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import EditProfileModal from '../components/profile/EditProfileModal';
import FollowButton from '../components/social/FollowButton';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { isDark } = useThemeStore();
  const { user: currentUser } = useAuthStore();
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // If no username in URL, show current user's profile
  const profileUsername = username || currentUser?.username;
  const isOwnProfile = !username || username === currentUser?.username;

  // Handle message button click
  const handleMessage = async () => {
    try {
      // Create or get conversation with this user
      const response = await api.post('/api/messages', {
        receiverId: profileUser.id,
        text: '', // Empty initial message just to create conversation
      });

      // Navigate to messages page
      navigate('/messages');
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  // Fetch profile data
  const { data, isLoading, error } = useQuery({
    queryKey: ['profile', profileUsername],
    queryFn: async () => {
      const response = await api.get(`/api/users/${profileUsername}`);
      return response.data.data;
    },
    enabled: !!profileUsername,
  });

  const profileUser = data;

  const tabs = [
    { id: 'posts', label: 'Posts', icon: Grid },
    { id: 'reels', label: 'Reels', icon: Film },
    { id: 'saved', label: 'Saved', icon: Bookmark },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          User not found
        </h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          The user you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-8 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Profile Picture */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative group cursor-pointer"
          >
            <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
              {profileUser?.profilePicUrl ? (
                <img
                  src={profileUser.profilePicUrl}
                  alt={profileUser.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {profileUser?.username?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {isOwnProfile && (
              <motion.div
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 transition-opacity"
              >
                <Camera className="w-8 h-8 text-white" />
              </motion.div>
            )}
          </motion.div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {profileUser?.username}
              </h1>

              {isOwnProfile ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditModalOpen(true)}
                    className={`px-6 py-2 rounded-xl font-semibold transition-colors ${isDark
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                  >
                    Edit Profile
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-xl transition-colors ${isDark
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                  >
                    <Settings className="w-5 h-5" />
                  </motion.button>
                </>
              ) : (
                <div className="flex gap-2">
                  <FollowButton userId={profileUser.id} size="md" />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMessage}
                    className={`px-6 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2 ${isDark
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    Message
                  </motion.button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-8 mb-4 justify-center md:justify-start">
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {profileUser?.stats?.posts || 0}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Posts
                </div>
              </div>
              <div className="text-center cursor-pointer hover:opacity-80">
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {profileUser?.stats?.followers || 0}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Followers
                </div>
              </div>
              <div className="text-center cursor-pointer hover:opacity-80">
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {profileUser?.stats?.following || 0}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Following
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h2 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {profileUser?.displayName || profileUser?.username}
              </h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                {profileUser?.bio || 'No bio yet'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex justify-center gap-16 py-4">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 font-semibold transition-colors ${tab.id === 'posts'
                ? isDark
                  ? 'text-white border-t-2 border-white -mt-[1px]'
                  : 'text-gray-900 border-t-2 border-gray-900 -mt-[1px]'
                : isDark
                  ? 'text-gray-500 hover:text-gray-300'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="hidden md:inline">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center py-20"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Camera className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
        </motion.div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          No posts yet
        </h2>
        <p className={`text-lg mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {isOwnProfile ? 'Share your first photo or video' : `${profileUser?.username} hasn't posted yet`}
        </p>
        {isOwnProfile && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            Create Post
          </motion.button>
        )}
      </motion.div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
