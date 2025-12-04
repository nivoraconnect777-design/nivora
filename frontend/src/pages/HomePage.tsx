import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { Users, Loader2 } from 'lucide-react';
import StoryTray from '../components/stories/StoryTray';
import PostCard from '../components/common/PostCard';
import { Post } from '../types/post';
import api from '../lib/api';

export default function HomePage() {
  const { isDark } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const { feedRefreshTrigger } = useUIStore();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const fetchPosts = async () => {
    try {
      // Only set loading on initial fetch, not on refresh
      if (posts.length === 0) setIsLoading(true);
      const response = await api.get('/api/posts');
      if (response.data.success) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [feedRefreshTrigger]); // Refetch when trigger changes

  const handleLike = async (postId: string) => {
    // Optimistic update
    const previousPosts = [...posts];
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const currentPost = posts[postIndex];
    const newIsLiked = !currentPost.isLiked;

    // Update UI immediately
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: newIsLiked,
          likesCount: newIsLiked ? post.likesCount + 1 : post.likesCount - 1
        };
      }
      return post;
    }));

    try {
      const response = await api.post(`/api/posts/${postId}/like`);
      if (!response.data.success) {
        // Rollback on failure
        setPosts(previousPosts);
      }
    } catch (error) {
      console.error('Failed to like post:', error);
      // Rollback on error
      setPosts(previousPosts);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await api.delete(`/api/posts/${postId}`);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  return (
    <div className="max-w-full mx-auto px-4 py-20 md:py-8 md:max-w-2xl">
      {/* Mobile Story Tray */}
      <div className="md:hidden mb-6">
        <StoryTray isDark={isDark} />
      </div>

      {/* Posts Feed */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : posts.length > 0 ? (
        <div>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`text-center py-16 rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Users className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          </motion.div>
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Your feed is empty
          </h2>
          <p className={`text-lg mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Create your first post or follow users to see their posts here
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/explore')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            Explore Users
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
