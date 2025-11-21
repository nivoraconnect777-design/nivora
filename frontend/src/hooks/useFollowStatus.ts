import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export function useFollowStatus(userId: string | undefined) {
  return useQuery({
    queryKey: ['followStatus', userId],
    queryFn: async () => {
      if (!userId) return { isFollowing: false };
      
      const response = await api.get(`/api/users/${userId}/follow-status`);
      return response.data.data;
    },
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
  });
}
