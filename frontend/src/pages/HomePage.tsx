import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
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
  const { ref, inView } = useInView();
  const queryClient = useQueryClient();

  // Optimistic update state (optional, can also use queryClient.setQueryData)
  // We'll rely on React Query cache mostly, but for immediate feedback might need local state if complex

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch
  } = useInfiniteQuery({
    queryKey: ['feedPosts'],
    queryFn: async ({ pageParam = 1 }) => {
      // Limit is now defaulted to 5 on backend, but we can be explicit
      const response = await api.get(`/api/posts?page=${pageParam}&limit=5`);
      return {
        posts: response.data.posts as Post[],
        // We need to know if there are more. 
        // Backend doesn't return total count in this simple endpoint usually, 
        // so we guess based on if we got full limit.
        // Or backend needs to return hasMore. 
        // Assuming if (posts.length < 5) then no more.
        hasMore: response.data.posts.length === 5
      };
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

  // Handle refresh trigger
  useEffect(() => {
    if (feedRefreshTrigger > 0) {
      refetch();
    }
  }, [feedRefreshTrigger, refetch]);


  // Mutations for interactions
  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      return api.post(`/api/posts/${postId}/like`);
    },
    onMutate: async (postId) => {
      // Cancel refetches
      await queryClient.cancelQueries({ queryKey: ['feedPosts'] });

      // Snapshot
      const previousData = queryClient.getQueryData(['feedPosts']);

      // Optimistic Update
      queryClient.setQueryData(['feedPosts'], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: Post) => {
              if (post.id === postId) {
                return {
                  ...post,
                  isLiked: !post.isLiked,
                  likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1
                };
              }
              return post;
            })
          }))
        };
      });

      return { previousData };
    },
    onError: (err, newTodo, context) => {
      // Rollback
      if (context?.previousData) {
        queryClient.setQueryData(['feedPosts'], context.previousData);
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      await api.delete(`/api/posts/${postId}`);
      return postId;
    },
    onSuccess: (postId) => {
      // Remove from cache
      queryClient.setQueryData(['feedPosts'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            posts: page.posts.filter((p: Post) => p.id !== postId)
          }))
        };
      });
    }
  });

  const handleLike = (postId: string) => {
    likeMutation.mutate(postId);
  };

  const handleDelete = (postId: string) => {
    deleteMutation.mutate(postId);
  };

  if (status === 'pending') {
    return (
      <div className="flex justify-center items-center h-screen pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Flatten posts from pages
  const allPosts = data?.pages.flatMap(page => page.posts) || [];

  return (
    <div className="max-w-full mx-auto px-4 py-20 md:py-8 md:max-w-2xl">
      {/* Mobile Story Tray */}
      <div className="md:hidden mb-6">
        <StoryTray isDark={isDark} />
      </div>

      {/* Posts Feed */}
      {status === 'success' && allPosts.length > 0 ? (
        <div>
          {allPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onDelete={handleDelete}
            />
          ))}

          {/* Loading Connector for Infinite Scroll */}
          <div ref={ref} className="flex justify-center py-8">
            {isFetchingNextPage ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            ) : hasNextPage ? (
              <span className="text-sm text-gray-400">Loading more...</span>
            ) : (
              <span className="text-sm text-gray-500">You're all caught up!</span>
            )}
          </div>
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
