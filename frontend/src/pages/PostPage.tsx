import { useParams } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import api from '../lib/api';
import PostCard from '../components/common/PostCard';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function PostPage() {
    const { id } = useParams<{ id: string }>();
    const { ref, inView } = useInView();

    // Fetch single post
    const { data: postData, isLoading: postLoading } = useQuery({
        queryKey: ['post', id],
        queryFn: async () => {
            const res = await api.get(`/api/posts/${id}`);
            return res.data.post;
        },
        enabled: !!id,
    });

    const userId = postData?.userId;

    // Fetch feed for "more posts"
    const {
        data: feedData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['posts', 'feed', userId], // Include userId in query key
        queryFn: async ({ pageParam = 1 }) => {
            const url = userId
                ? `/api/posts?page=${pageParam}&limit=5&userId=${userId}`
                : `/api/posts?page=${pageParam}&limit=5`;
            const res = await api.get(url);
            return res.data.posts;
        },
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === 5 ? allPages.length + 1 : undefined;
        },
        initialPageParam: 1,
        enabled: !!userId, // Only fetch when we know the userId
    });

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, fetchNextPage, hasNextPage]);

    if (postLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!postData) {
        return <div className="text-center py-20 text-gray-500">Post not found</div>;
    }

    return (
        <div className="max-w-xl mx-auto py-8 px-4 space-y-8">
            <PostCard post={postData} />

            <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
                <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">More Posts</h3>
                <div className="space-y-6">
                    {feedData?.pages.map((group, i) => (
                        <div key={i} className="space-y-6">
                            {group.map((post: any) => (
                                // Filter out the current post to avoid duplication
                                post.id !== id && <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Infinite scroll trigger */}
                <div ref={ref} className="py-8 flex justify-center">
                    {isFetchingNextPage && <Loader2 className="w-6 h-6 animate-spin text-blue-500" />}
                </div>
            </div>
        </div>
    );
}
