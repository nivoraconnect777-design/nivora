// User types
export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  profilePicUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Post types
export interface Post {
  id: string;
  userId: string;
  user: User;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  thumbnailUrl?: string;
  caption?: string;
  createdAt: string;
  updatedAt: string;
  likes: Like[];
  comments: Comment[];
  _count?: {
    likes: number;
    comments: number;
  };
}

// Reel types
export interface Reel {
  id: string;
  userId: string;
  user: User;
  videoUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
  likes: Like[];
  comments: Comment[];
  _count?: {
    likes: number;
    comments: number;
  };
}

// Story types
export interface Story {
  id: string;
  userId: string;
  user: User;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration?: number;
  createdAt: string;
  expiresAt: string;
}

// Like types
export interface Like {
  id: string;
  userId: string;
  user: User;
  postId?: string;
  reelId?: string;
  createdAt: string;
}

// Comment types
export interface Comment {
  id: string;
  userId: string;
  user: User;
  postId?: string;
  reelId?: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

// Follow types
export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  follower: User;
  following: User;
  createdAt: string;
}

// Message types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  receiverId: string;
  receiver: User;
  text?: string;
  imageUrl?: string;
  createdAt: string;
}

// Conversation types
export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  user: User;
  lastReadAt?: string;
}

// Notification types
export type NotificationType = 'like_post' | 'like_reel' | 'comment_post' | 'comment_reel' | 'follow';

export interface Notification {
  id: string;
  recipientId: string;
  recipient: User;
  actorId: string;
  actor: User;
  type: NotificationType;
  postId?: string;
  reelId?: string;
  commentId?: string;
  isRead: boolean;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    field?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
