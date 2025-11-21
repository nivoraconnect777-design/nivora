import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import api from '../../lib/api';

interface FollowButtonProps {
  userId: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function FollowButton({
  userId,
  initialIsFollowing = false,
  onFollowChange,
  size = 'md',
  showIcon = true,
}: FollowButtonProps) {
  const { isDark } = useThemeStore();
  const { user } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Fetch initial follow status
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user || user.id === userId) {
        setIsCheckingStatus(false);
        return;
      }

      try {
        const response = await api.get(`/api/users/${userId}/follow-status`);
        setIsFollowing(response.data.data.isFollowing);
      } catch (error) {
        console.error('Failed to check follow status:', error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkFollowStatus();
  }, [userId, user]);

  // Don't show follow button for own profile
  if (user?.id === userId) {
    return null;
  }

  const handleFollowToggle = async () => {
    if (!user) {
      toast.error('Please log in to follow users');
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        await api.delete(`/api/users/${userId}/follow`);
        setIsFollowing(false);
        toast.success('Unfollowed successfully');
        onFollowChange?.(false);
      } else {
        // Follow
        await api.post(`/api/users/${userId}/follow`);
        setIsFollowing(true);
        toast.success('Followed successfully');
        onFollowChange?.(true);
      }
    } catch (error: any) {
      console.error('Follow toggle error:', error);
      
      // If 401, redirect to login
      if (error.response?.status === 401) {
        toast.error('Please log in to follow users');
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.error?.message || 'Failed to update follow status');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Show loading while checking status
  if (isCheckingStatus) {
    return (
      <div
        className={`
          ${sizeClasses[size]}
          rounded-xl
          flex items-center justify-center gap-2
          ${isDark ? 'bg-gray-700' : 'bg-gray-200'}
        `}
      >
        <Loader2 className={`${iconSizes[size]} animate-spin text-gray-400`} />
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        rounded-xl font-semibold transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${
          isFollowing
            ? isDark
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
        }
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
          <span>{isFollowing ? 'Unfollowing...' : 'Following...'}</span>
        </>
      ) : (
        <>
          {showIcon && (
            isFollowing ? (
              <UserMinus className={iconSizes[size]} />
            ) : (
              <UserPlus className={iconSizes[size]} />
            )
          )}
          <span>{isFollowing ? 'Following' : 'Follow'}</span>
        </>
      )}
    </motion.button>
  );
}
