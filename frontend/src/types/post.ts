export interface Post {
    id: string;
    userId: string;
    user: {
        id: string;
        username: string;
        profilePicUrl: string | null;
    };
    mediaUrl: string;
    mediaType: string;
    thumbnailUrl: string | null;
    caption: string | null;
    createdAt: string;
    updatedAt: string;
    isLiked: boolean;
    likesCount: number;
    commentsCount: number;
}
