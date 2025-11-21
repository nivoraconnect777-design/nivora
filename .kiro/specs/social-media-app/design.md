# Design Document: Social Media Application

## Overview

This document outlines the technical design for a production-grade social media application with Instagram-like features. The application will be built using free-tier services and modern web technologies, making it suitable for a student portfolio while demonstrating professional development practices.

### Technology Stack

**Frontend:**
- React 18 with TypeScript for type safety and modern UI development
- Vite for fast development and optimized production builds
- TailwindCSS for responsive, utility-first styling
- React Router for client-side routing
- TanStack Query (React Query) for server state management and caching
- Zustand for lightweight client state management
- Socket.io-client for real-time features

**Backend:**
- Node.js with Express.js for REST API
- TypeScript for type safety across the stack
- Socket.io for WebSocket connections (chat, notifications)
- Prisma ORM for database access and migrations
- PostgreSQL (free tier: Supabase or Neon) for relational data
- JWT for authentication tokens

**Media Storage & CDN:**
- Cloudinary free tier (25GB storage, 25GB bandwidth/month) for image/video storage and optimization
- Automatic image transformations and thumbnail generation

**Real-Time Communication:**
- PeerJS with free PeerServer for WebRTC video calling
- Socket.io for signaling and chat messages

**Deployment:**
- Frontend: Vercel or Netlify free tier
- Backend: Railway or Render free tier
- Database: Supabase or Neon free tier


## Architecture

### System Architecture

The application follows a client-server architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   UI Layer   │  │  State Mgmt  │  │  API Client  │      │
│  │  Components  │  │ React Query  │  │   Axios      │      │
│  │              │  │   Zustand    │  │  Socket.io   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
         ┌──────────▼─────────┐  ┌─────▼──────┐
         │   REST API Server  │  │  WebSocket │
         │   (Express.js)     │  │ (Socket.io)│
         └──────────┬─────────┘  └─────┬──────┘
                    │                   │
         ┌──────────▼───────────────────▼──────┐
         │        Business Logic Layer          │
         │  ┌────────┐  ┌────────┐  ┌────────┐ │
         │  │  Auth  │  │ Content│  │  Chat  │ │
         │  │Service │  │Service │  │Service │ │
         │  └────────┘  └────────┘  └────────┘ │
         └──────────┬───────────────────────────┘
                    │
         ┌──────────▼─────────┐
         │   Data Layer       │
         │  ┌──────────────┐  │
         │  │   Prisma ORM │  │
         │  └──────┬───────┘  │
         └─────────┼──────────┘
                   │
         ┌─────────▼─────────┐
         │   PostgreSQL DB   │
         └───────────────────┘

External Services:
┌──────────────┐  ┌──────────────┐
│  Cloudinary  │  │  PeerServer  │
│ Media Storage│  │  WebRTC      │
└──────────────┘  └──────────────┘
```

### Design Rationale

**Monolithic Backend with Modular Services:** For a portfolio project with free-tier constraints, a single backend service is more manageable than microservices while still maintaining clean separation through service modules.

**PostgreSQL over NoSQL:** Relational database chosen for strong consistency requirements in follow relationships, likes, and comments. The structured nature of social media data (users, posts, relationships) benefits from SQL's relational model.

**Cloudinary for Media:** Handles image/video optimization, thumbnail generation, and CDN delivery automatically, eliminating the need to build custom media processing pipelines.

**WebRTC with PeerJS:** Enables peer-to-peer video calling without routing video through our servers, reducing bandwidth costs and staying within free-tier limits.


## Components and Interfaces

### Frontend Components

#### Core Layout Components
- **AppLayout**: Main application wrapper with navigation
- **Navbar**: Top navigation bar (desktop) / Bottom navigation bar (mobile)
- **Sidebar**: User profile quick access and navigation (desktop only)

#### Authentication Components
- **LoginForm**: Email/password login with validation
- **RegisterForm**: User registration with password strength indicator
- **PasswordResetForm**: Email-based password reset flow

#### Profile Components
- **ProfileHeader**: Profile picture, stats (followers, following, posts), bio, follow/unfollow button
- **ProfileGrid**: Grid layout of user's posts with thumbnails
- **ProfileReels**: Vertical list of user's reels
- **EditProfileModal**: Form for updating profile information and picture

#### Content Components
- **PostCard**: Displays post with image/video, caption, likes, comments
- **PostModal**: Full-screen post view with comments section
- **ReelPlayer**: Vertical video player with auto-play and swipe navigation
- **StoryViewer**: Full-screen story viewer with tap-to-advance
- **StoryRing**: Circular profile picture with gradient ring indicating active stories
- **CreatePostModal**: Upload interface for creating posts
- **CreateReelModal**: Upload interface for creating reels
- **CreateStoryModal**: Upload interface for creating stories

#### Feed Components
- **Feed**: Infinite scroll feed of posts and reels from followed users
- **FeedItem**: Individual post or reel in the feed
- **LoadingSkeleton**: Placeholder UI while content loads

#### Interaction Components
- **LikeButton**: Heart icon with animation and like count
- **CommentSection**: List of comments with input field
- **CommentItem**: Individual comment with user info and timestamp

#### Chat Components
- **ChatList**: List of conversations with unread indicators
- **ChatWindow**: Message thread with input field
- **MessageBubble**: Individual message with timestamp
- **TypingIndicator**: Shows when other user is typing

#### Video Call Components
- **VideoCallModal**: Full-screen video call interface
- **VideoStream**: Local and remote video displays
- **CallControls**: Mute, video toggle, end call buttons
- **IncomingCallNotification**: Call notification with accept/reject

#### Search & Discovery Components
- **SearchBar**: Real-time search input with 300ms debouncing (per Requirement 9)
- **SearchResults**: List of user search results with case-insensitive partial matching
- **UserSearchItem**: User profile preview in search results with profile picture, username, and display name

#### Notification Components
- **NotificationList**: List of user notifications
- **NotificationItem**: Individual notification with actor, action, and timestamp


### Backend API Endpoints

#### Authentication Endpoints
```
POST   /api/auth/register          - Create new user account
POST   /api/auth/login             - Authenticate user and return JWT
POST   /api/auth/logout            - Invalidate session
POST   /api/auth/refresh           - Refresh JWT token
POST   /api/auth/forgot-password   - Send password reset email
POST   /api/auth/reset-password    - Reset password with token
GET    /api/auth/me                - Get current user info
```

#### User Endpoints
```
GET    /api/users/:username        - Get user profile by username
PUT    /api/users/:id              - Update user profile
GET    /api/users/:id/followers    - Get user's followers list
GET    /api/users/:id/following    - Get user's following list
POST   /api/users/:id/follow       - Follow a user
DELETE /api/users/:id/follow       - Unfollow a user
GET    /api/users/search           - Search users by username/name
```

#### Post Endpoints
```
POST   /api/posts                  - Create new post
GET    /api/posts/:id              - Get post by ID
DELETE /api/posts/:id              - Delete post
GET    /api/posts/feed             - Get personalized feed
GET    /api/users/:id/posts        - Get user's posts
POST   /api/posts/:id/like         - Like a post
DELETE /api/posts/:id/like         - Unlike a post
GET    /api/posts/:id/likes        - Get post likes
POST   /api/posts/:id/comments     - Add comment to post
GET    /api/posts/:id/comments     - Get post comments
DELETE /api/comments/:id           - Delete comment
```

#### Reel Endpoints
```
POST   /api/reels                  - Create new reel
GET    /api/reels/:id              - Get reel by ID
DELETE /api/reels/:id              - Delete reel
GET    /api/reels/feed             - Get reels feed
GET    /api/users/:id/reels        - Get user's reels
POST   /api/reels/:id/like         - Like a reel
DELETE /api/reels/:id/like         - Unlike a reel
POST   /api/reels/:id/comments     - Add comment to reel
GET    /api/reels/:id/comments     - Get reel comments
```

#### Story Endpoints
```
POST   /api/stories                - Create new story
GET    /api/stories/:id            - Get story by ID
DELETE /api/stories/:id            - Delete story
GET    /api/stories/feed           - Get active stories from followed users
GET    /api/users/:id/stories      - Get user's active stories
```

#### Chat Endpoints
```
GET    /api/conversations          - Get user's conversations
GET    /api/conversations/:id      - Get conversation messages
POST   /api/conversations/:id/messages - Send message
PUT    /api/conversations/:id/read - Mark conversation as read
```

#### Notification Endpoints
```
GET    /api/notifications          - Get user notifications
PUT    /api/notifications/read     - Mark notifications as read
DELETE /api/notifications/:id      - Delete notification
```

#### Media Upload Endpoints
```
POST   /api/media/upload-signature - Get Cloudinary signed upload URL
POST   /api/media/upload           - Upload media to Cloudinary
```

### WebSocket Events

#### Chat Events
```
connect                    - Client connects to socket
disconnect                 - Client disconnects
message:send               - Send chat message
message:receive            - Receive chat message
typing:start               - User starts typing
typing:stop                - User stops typing
```

#### Notification Events
```
notification:new           - New notification received
notification:read          - Notification marked as read
```

#### Video Call Events
```
call:initiate              - Initiate video call
call:accept                - Accept incoming call
call:reject                - Reject incoming call
call:end                   - End active call
call:signal                - WebRTC signaling data
```


## Data Models

### Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  username      String    @unique
  email         String    @unique
  password      String    // bcrypt hashed
  displayName   String?
  bio           String?   @db.VarChar(150)
  profilePicUrl String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  posts         Post[]
  reels         Reel[]
  stories       Story[]
  comments      Comment[]
  likes         Like[]
  
  followers     Follow[]  @relation("UserFollowers")
  following     Follow[]  @relation("UserFollowing")
  
  sentMessages      Message[] @relation("SentMessages")
  receivedMessages  Message[] @relation("ReceivedMessages")
  conversations     ConversationParticipant[]
  
  notifications     Notification[] @relation("NotificationRecipient")
  triggeredNotifications Notification[] @relation("NotificationActor")
  
  @@index([username])
  @@index([email])
}

model Post {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  mediaUrl    String
  mediaType   String    // 'image' or 'video'
  thumbnailUrl String?
  caption     String?   @db.VarChar(2200)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  likes       Like[]
  comments    Comment[]
  
  @@index([userId])
  @@index([createdAt])
}

model Reel {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  videoUrl    String
  thumbnailUrl String?
  caption     String?   @db.VarChar(2200)
  duration    Int       // in seconds
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  likes       Like[]
  comments    Comment[]
  
  @@index([userId])
  @@index([createdAt])
}

model Story {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  mediaUrl    String
  mediaType   String    // 'image' or 'video'
  duration    Int?      // for videos, in seconds
  createdAt   DateTime  @default(now())
  expiresAt   DateTime  // 24 hours from creation
  
  @@index([userId])
  @@index([expiresAt])
}

model Follow {
  id          String    @id @default(cuid())
  followerId  String
  followingId String
  follower    User      @relation("UserFollowing", fields: [followerId], references: [id], onDelete: Cascade)
  following   User      @relation("UserFollowers", fields: [followingId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
  
  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
}

model Like {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  postId    String?
  post      Post?     @relation(fields: [postId], references: [id], onDelete: Cascade)
  reelId    String?
  reel      Reel?     @relation(fields: [reelId], references: [id], onDelete: Cascade)
  createdAt DateTime  @default(now())
  
  @@unique([userId, postId])
  @@unique([userId, reelId])
  @@index([postId])
  @@index([reelId])
}

model Comment {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  postId    String?
  post      Post?     @relation(fields: [postId], references: [id], onDelete: Cascade)
  reelId    String?
  reel      Reel?     @relation(fields: [reelId], references: [id], onDelete: Cascade)
  text      String    @db.VarChar(500)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  @@index([postId])
  @@index([reelId])
  @@index([userId])
}

model Conversation {
  id           String    @id @default(cuid())
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  participants ConversationParticipant[]
  messages     Message[]
}

model ConversationParticipant {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  userId         String
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  lastReadAt     DateTime?
  
  @@unique([conversationId, userId])
  @@index([userId])
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId       String
  sender         User         @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)
  receiverId     String
  receiver       User         @relation("ReceivedMessages", fields: [receiverId], references: [id], onDelete: Cascade)
  text           String?      @db.VarChar(1000)
  imageUrl       String?
  createdAt      DateTime     @default(now())
  
  @@index([conversationId])
  @@index([createdAt])
}

model Notification {
  id          String    @id @default(cuid())
  recipientId String
  recipient   User      @relation("NotificationRecipient", fields: [recipientId], references: [id], onDelete: Cascade)
  actorId     String
  actor       User      @relation("NotificationActor", fields: [actorId], references: [id], onDelete: Cascade)
  type        String    // 'like', 'comment', 'follow'
  postId      String?
  reelId      String?
  commentId   String?
  isRead      Boolean   @default(false)
  createdAt   DateTime  @default(now())
  
  @@index([recipientId])
  @@index([createdAt])
}
```

### Design Rationale

**CUID for IDs:** Using CUID instead of auto-incrementing integers prevents enumeration attacks and provides globally unique identifiers suitable for distributed systems.

**Polymorphic Likes/Comments:** Likes and comments can belong to either posts or reels using nullable foreign keys. This avoids creating separate tables for each content type while maintaining referential integrity.

**Conversation Model:** Separate conversation entity allows for potential group chat expansion in the future, though initially supporting only 1-on-1 chats.

**Story Expiration:** Stories include an `expiresAt` timestamp for automatic cleanup via scheduled job, ensuring 24-hour temporary content.

**Indexes:** Strategic indexes on foreign keys and frequently queried fields (username, createdAt) optimize query performance for feeds and searches.


## Authentication & Authorization

### Authentication Flow

1. **Registration:**
   - User submits username, email, password
   - Backend validates uniqueness and password requirements (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
   - Password hashed with bcrypt (10 rounds)
   - User record created in database
   - JWT access token (15min expiry) and refresh token (7 days expiry) returned

2. **Login:**
   - User submits email/username and password
   - Backend verifies credentials against hashed password
   - JWT tokens generated and returned
   - Tokens stored in httpOnly cookies for security

3. **Token Refresh:**
   - When access token expires, client automatically requests refresh
   - Refresh token validated and new access token issued
   - If refresh token expired, user must re-login

4. **Password Reset:**
   - User requests reset with email
   - Backend generates secure reset token (UUID) with 1-hour expiry
   - Reset link sent to email (using free SMTP service like SendGrid free tier)
   - User clicks link, submits new password
   - Token validated, password updated

### Authorization Strategy

**JWT Payload:**
```typescript
{
  userId: string;
  username: string;
  iat: number;  // issued at
  exp: number;  // expiration
}
```

**Protected Routes:**
- All API endpoints except `/auth/register`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password` require valid JWT
- Middleware validates JWT on each request
- User ID extracted from token for authorization checks

**Resource Authorization:**
- Users can only edit/delete their own content (posts, reels, stories, comments)
- Users can view public profiles and content from followed users
- Private messages only accessible to conversation participants


## Media Handling

### Upload Flow

1. **Client-Side:**
   - User selects media file
   - Client validates file type and size
   - Request signed upload URL from backend

2. **Backend:**
   - Generate Cloudinary signed upload parameters
   - Return signature and upload URL to client

3. **Client Upload:**
   - Upload file directly to Cloudinary using signed URL
   - Receive media URL and metadata from Cloudinary

4. **Save to Database:**
   - Client sends media URL and post/reel/story data to backend
   - Backend saves record with Cloudinary URL

### Media Transformations

**Profile Pictures:**
- Original: max 1000x1000, quality auto
- Thumbnail: 150x150, crop to face detection

**Post Images:**
- Original: max 1080x1080, quality auto
- Thumbnail: 320x320, crop center

**Post Videos:**
- Format: MP4 with H.264 codec
- Max resolution: 1080p
- Thumbnail: auto-generated first frame at 320x320

**Reels:**
- Format: MP4 with H.264 codec
- Aspect ratio: 9:16 (vertical)
- Max resolution: 1080x1920
- Thumbnail: auto-generated first frame

**Stories:**
- Images: max 1080x1920, quality auto
- Videos: MP4, max 15 seconds, 1080x1920

### Cloudinary Configuration

```javascript
{
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  upload_preset: 'social_media_app'
}
```

**Upload Presets:**
- `profile_pictures`: 5MB limit, image only, auto-optimize
- `posts`: 10MB images / 50MB videos, auto-optimize
- `reels`: 100MB limit, video only, 90s max duration
- `stories`: 20MB limit, 15s max for videos
- `chat_images`: 5MB limit, image only

### Design Rationale

**Direct Upload to Cloudinary:** Reduces server bandwidth and processing load by uploading directly from client to CDN. Backend only handles metadata and authorization.

**Signed Uploads:** Prevents unauthorized uploads while maintaining direct client-to-Cloudinary flow. Signatures expire after 1 hour.

**Automatic Optimization:** Cloudinary's auto quality and format features reduce file sizes while maintaining visual quality, crucial for free-tier bandwidth limits.


## Real-Time Features

### Chat System

**Architecture:**
- Socket.io for WebSocket connections
- Room-based messaging (conversation ID as room)
- Message persistence in PostgreSQL
- Real-time delivery with offline message queuing
- Target delivery time: < 2 seconds (per Requirement 10)

**Flow:**
1. User connects to Socket.io server with JWT authentication
2. Server joins user to their conversation rooms
3. User sends message via socket event
4. Server validates, saves to database (< 500ms), emits to room
5. Recipients receive message in real-time (total < 2 seconds)
6. Typing indicators broadcast to conversation room with minimal latency
7. Offline messages queued and delivered on reconnection

**Performance Optimization:**
- Batch database writes for typing indicators
- Use Redis pub/sub for message routing (if scaling needed)
- Compress large messages
- Implement message pagination (50 messages per load)

**Message Structure:**
```typescript
{
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text?: string;
  imageUrl?: string;
  createdAt: Date;
}
```

### Notifications

**Real-Time Delivery:**
- User connects to Socket.io with authentication
- Server joins user to personal notification room (userId)
- When notification created, emit to user's room
- Client displays notification badge/toast

**Notification Types:**
```typescript
type NotificationType = 
  | 'like_post'
  | 'like_reel'
  | 'comment_post'
  | 'comment_reel'
  | 'follow';

interface Notification {
  id: string;
  recipientId: string;
  actor: {
    id: string;
    username: string;
    profilePicUrl: string;
  };
  type: NotificationType;
  postId?: string;
  reelId?: string;
  commentId?: string;
  isRead: boolean;
  createdAt: Date;
}
```

### Video Calling

**WebRTC with PeerJS:**
- PeerJS simplifies WebRTC peer connection setup
- Free PeerServer for signaling (or self-hosted on backend)
- STUN servers for NAT traversal (free Google STUN servers)
- Target connection time: < 5 seconds (per Requirement 11)

**Call Flow:**
1. Caller initiates call via Socket.io signal to recipient (< 500ms)
2. Recipient receives call notification immediately
3. If accepted, both peers connect via PeerJS
4. PeerJS handles ICE candidate exchange and media stream setup (< 3 seconds)
5. Direct peer-to-peer video/audio streams established (total < 5 seconds)
6. Call controls (mute, video toggle, end) managed locally
7. Call end signal sent via Socket.io

**Connection Optimization:**
- Pre-initialize PeerJS connection on app load
- Use aggressive ICE candidate gathering
- Implement connection timeout with user feedback
- Fallback to audio-only if video connection fails
- Display connection status indicators

**PeerJS Configuration:**
```javascript
{
  host: 'peerjs-server.herokuapp.com', // or self-hosted
  port: 443,
  path: '/peerjs',
  secure: true,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  }
}
```

### Design Rationale

**Socket.io over WebSockets:** Socket.io provides automatic reconnection, room management, and fallback to long-polling if WebSockets unavailable.

**Room-Based Architecture:** Efficiently scales by only broadcasting messages to relevant users rather than all connected clients.

**Peer-to-Peer Video:** Keeps video traffic off our servers, crucial for staying within free-tier bandwidth limits. Only signaling data goes through our server.

**Separate Signaling:** Using Socket.io for call signaling (initiate, accept, reject) while PeerJS handles media streams provides clean separation of concerns.


## Feed Algorithm & Content Delivery

### Feed Generation

**Initial Implementation (Chronological):**
```sql
SELECT posts.*, users.username, users.profilePicUrl
FROM posts
JOIN users ON posts.userId = users.id
WHERE posts.userId IN (
  SELECT followingId FROM follows WHERE followerId = :currentUserId
)
ORDER BY posts.createdAt DESC
LIMIT 20 OFFSET :offset
```

**Pagination Requirements:**
- Load exactly 20 items per page as specified in Requirement 8
- Implement infinite scroll with automatic loading when user reaches bottom
- Use cursor-based pagination for better performance at scale
- Prefetch next page while user scrolls for seamless experience

**Optimization with Caching:**
- Cache user's following list in Redis (if added later) or in-memory
- Cache feed results for 5 minutes with stale-while-revalidate
- Invalidate cache on new post creation or follow/unfollow actions

**Future Enhancement (Engagement-Based):**
- Score posts by: recency, likes, comments, user engagement history
- Personalize based on user's interaction patterns
- Implement as optional feature if time permits

### Reels Feed

**Discovery-Focused:**
- Show reels from all users, not just followed
- Prioritize recent reels with high engagement
- Vertical infinite scroll with auto-play

```sql
SELECT reels.*, users.username, users.profilePicUrl,
       COUNT(likes.id) as likeCount
FROM reels
JOIN users ON reels.userId = users.id
LEFT JOIN likes ON reels.id = likes.reelId
WHERE reels.createdAt > NOW() - INTERVAL '7 days'
GROUP BY reels.id
ORDER BY likeCount DESC, reels.createdAt DESC
LIMIT 20 OFFSET :offset
```

### Stories Feed

**Active Stories Only:**
- Show stories from followed users that haven't expired
- Order by creation time (most recent first)
- Group by user (show user's story ring once)

```sql
SELECT DISTINCT ON (userId) stories.*, users.username, users.profilePicUrl
FROM stories
JOIN users ON stories.userId = users.id
WHERE stories.userId IN (
  SELECT followingId FROM follows WHERE followerId = :currentUserId
)
AND stories.expiresAt > NOW()
ORDER BY userId, stories.createdAt DESC
```

### Content Caching Strategy

**Client-Side (React Query):**
- Cache feed data for 5 minutes
- Stale-while-revalidate pattern
- Optimistic updates for likes/comments
- Infinite query for pagination

**Server-Side:**
- Cache user profile data (5 minutes)
- Cache follower/following counts (1 minute)
- Cache post/reel counts (1 minute)
- Invalidate on mutations

### Design Rationale

**Chronological First:** Simpler to implement and debug. Engagement-based algorithms can be added later without changing the API contract.

**Cursor Pagination:** More efficient than offset pagination for large datasets. Uses `createdAt` timestamp as cursor.

**Separate Feeds:** Posts/reels in main feed, dedicated reels discovery feed, stories in top bar. Matches user expectations from Instagram/TikTok.


## Error Handling

### Error Response Format

All API errors follow a consistent structure:

```typescript
{
  success: false,
  error: {
    code: string,        // Machine-readable error code
    message: string,     // Human-readable error message
    details?: any,       // Optional additional context
    field?: string       // For validation errors
  }
}
```

### Error Categories

**Authentication Errors (401):**
- `AUTH_INVALID_CREDENTIALS`: Wrong email/password
- `AUTH_TOKEN_EXPIRED`: JWT expired, refresh needed
- `AUTH_TOKEN_INVALID`: Malformed or invalid JWT
- `AUTH_UNAUTHORIZED`: Valid token but insufficient permissions

**Validation Errors (400):**
- `VALIDATION_FAILED`: Request body validation failed
- `VALIDATION_FILE_TOO_LARGE`: File exceeds size limit
- `VALIDATION_INVALID_FORMAT`: Invalid file format
- `VALIDATION_USERNAME_TAKEN`: Username already exists
- `VALIDATION_EMAIL_TAKEN`: Email already exists

**Resource Errors (404):**
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `USER_NOT_FOUND`: User doesn't exist
- `POST_NOT_FOUND`: Post doesn't exist
- `CONVERSATION_NOT_FOUND`: Conversation doesn't exist

**Permission Errors (403):**
- `FORBIDDEN_RESOURCE`: User cannot access this resource
- `FORBIDDEN_ACTION`: User cannot perform this action

**Server Errors (500):**
- `INTERNAL_ERROR`: Unexpected server error
- `DATABASE_ERROR`: Database operation failed
- `EXTERNAL_SERVICE_ERROR`: Third-party service (Cloudinary) failed

### Frontend Error Handling

**Global Error Boundary:**
- Catches React component errors
- Displays friendly error UI
- Logs errors to console (or error tracking service)

**API Error Handling:**
```typescript
// React Query error handling
const { data, error, isError } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  onError: (error) => {
    if (error.code === 'AUTH_TOKEN_EXPIRED') {
      // Trigger token refresh
      refreshToken();
    } else {
      // Show toast notification
      toast.error(error.message);
    }
  }
});
```

**Form Validation:**
- Client-side validation before submission
- Display field-specific errors inline
- Server-side validation as final check

**Network Errors:**
- Detect offline status
- Show offline indicator
- Queue actions for retry when online
- Automatic retry with exponential backoff

### Logging Strategy

**Development:**
- Console logs for all errors
- Detailed stack traces
- Request/response logging

**Production:**
- Error tracking service (Sentry free tier: 5k events/month)
- Log critical errors only
- Sanitize sensitive data (passwords, tokens)
- Include user context (userId, action)

### Design Rationale

**Consistent Error Format:** Makes client-side error handling predictable and easier to implement across all API endpoints.

**Specific Error Codes:** Machine-readable codes allow programmatic error handling (e.g., auto-refresh on token expiry).

**User-Friendly Messages:** Error messages written for end users, not developers. Technical details logged separately.

**Graceful Degradation:** App remains functional when non-critical features fail (e.g., notifications fail but posting still works).


## Performance Optimization

### Frontend Optimization

**Code Splitting:**
- Route-based code splitting with React.lazy()
- Separate bundles for main feed, profile, chat, video call
- Lazy load heavy components (video player, image editor)

**Image Optimization:**
- Lazy loading with Intersection Observer
- Responsive images with srcset
- Blur placeholder while loading (LQIP - Low Quality Image Placeholder)
- WebP format with fallback to JPEG

**React Performance:**
- Memoization with React.memo() for expensive components
- useMemo/useCallback for expensive computations
- Virtual scrolling for long lists (react-window)
- Debounced search input (300ms per Requirement 9)
- Optimistic UI updates for instant feedback

**Caching Strategy:**
- React Query for server state with stale-while-revalidate
- Service Worker for offline support (optional PWA feature)
- LocalStorage for user preferences

**Bundle Size:**
- Tree shaking unused code
- Minimize dependencies
- Use lightweight alternatives (date-fns over moment.js)
- Target bundle size: < 200KB initial load

### Backend Optimization

**Database Optimization:**
- Indexes on frequently queried fields
- Connection pooling (max 10 connections for free tier)
- Prepared statements to prevent SQL injection and improve performance
- Pagination to limit result sets

**Query Optimization:**
```typescript
// Efficient feed query with single join
const feed = await prisma.post.findMany({
  where: {
    userId: { in: followingIds }
  },
  include: {
    user: {
      select: { username: true, profilePicUrl: true }
    },
    _count: {
      select: { likes: true, comments: true }
    }
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: offset
});
```

**Caching:**
- In-memory cache for frequently accessed data (user profiles, follower counts)
- Cache invalidation on mutations
- TTL-based expiration

**API Response Optimization:**
- Gzip compression for responses
- Minimize response payload (only send needed fields)
- Batch requests where possible

### Media Optimization

**Cloudinary Transformations:**
- Automatic format selection (WebP for supported browsers)
- Quality: auto (Cloudinary optimizes based on content)
- Lazy loading with low-quality placeholders
- Responsive images with multiple sizes

**Video Optimization:**
- Adaptive bitrate streaming for longer videos
- Thumbnail generation for quick previews
- Limit video resolution to 1080p max

### Monitoring & Metrics

**Key Metrics to Track (Per Requirement 15):**
- Initial page load time (target: < 3 seconds on standard broadband)
- Navigation time between pages (target: < 1 second)
- Time to Interactive (target: < 5s)
- API response time (target: < 500ms)
- Database query time (target: < 100ms)
- Chat message delivery time (target: < 2 seconds)
- Video call connection time (target: < 5 seconds)
- Error rate (target: < 1%)

**Tools:**
- Lighthouse for performance audits
- React DevTools Profiler for component performance
- Browser DevTools Network tab for API monitoring
- Prisma query logging in development

### Design Rationale

**Lazy Loading Everything:** Reduces initial bundle size and improves perceived performance. Users only download code for features they use.

**Aggressive Caching:** With free-tier database limits, caching reduces database load and improves response times.

**Virtual Scrolling:** Essential for infinite feeds to prevent DOM bloat and maintain smooth scrolling with hundreds of items.

**Cloudinary Auto-Optimization:** Leverages Cloudinary's intelligent optimization to reduce bandwidth without manual tuning.


## Testing Strategy

### Frontend Testing

**Unit Tests (Vitest + React Testing Library):**
- Utility functions (validation, formatting, date helpers)
- Custom hooks (useAuth, useInfiniteScroll)
- Component logic (form validation, state management)
- Target coverage: 70% for critical paths

**Component Tests:**
- User interactions (clicks, form submissions)
- Conditional rendering
- Props handling
- Accessibility (ARIA labels, keyboard navigation)

**Integration Tests:**
- API integration with mock server (MSW - Mock Service Worker)
- Authentication flows
- Form submissions with validation
- Real-time features with mock Socket.io

**E2E Tests (Playwright - Optional):**
- Critical user journeys:
  - Registration and login
  - Create and view post
  - Follow user and see feed update
  - Send and receive chat message
- Run on CI/CD pipeline

### Backend Testing

**Unit Tests (Jest):**
- Service layer functions
- Validation logic
- Utility functions
- JWT token generation/verification
- Target coverage: 80% for business logic

**Integration Tests:**
- API endpoints with test database
- Database operations (CRUD)
- Authentication middleware
- File upload flow
- WebSocket events

**API Contract Tests:**
- Request/response schemas
- Error responses
- Status codes
- Authentication requirements

### Test Database

**Setup:**
- Separate PostgreSQL database for testing
- Reset database before each test suite
- Seed with test data
- Use transactions for test isolation

```typescript
// Test setup
beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.message.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.like.deleteMany(),
    prisma.story.deleteMany(),
    prisma.reel.deleteMany(),
    prisma.post.deleteMany(),
    prisma.follow.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

### Testing Priorities

**Must Test:**
1. Authentication and authorization
2. Content creation (posts, reels, stories)
3. Follow/unfollow functionality
4. Like and comment interactions
5. Feed generation
6. Chat message sending/receiving

**Should Test:**
7. Profile updates
8. Search functionality
9. Notifications
10. Media upload validation

**Nice to Test:**
11. Video calling signaling
12. Story expiration
13. Real-time typing indicators

### Continuous Integration

**GitHub Actions Workflow:**
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:frontend
      - run: npm run test:backend
      - run: npm run build
```

### Design Rationale

**Focus on Integration Tests:** More valuable than pure unit tests for catching real bugs in a full-stack application. Tests actual API contracts and database interactions.

**Mock External Services:** Cloudinary and PeerJS mocked in tests to avoid dependencies on external services and API rate limits.

**Test Database Isolation:** Each test runs in a clean state, preventing flaky tests from shared state.

**Pragmatic Coverage:** 70-80% coverage targets balance thoroughness with development speed. Focus on critical paths rather than 100% coverage.


## Security Considerations

### Authentication Security

**Password Security:**
- Bcrypt hashing with 10 salt rounds
- Minimum password requirements enforced
- No password hints or security questions
- Rate limiting on login attempts (5 attempts per 15 minutes)

**Token Security:**
- JWT stored in httpOnly cookies (not localStorage)
- Short-lived access tokens (15 minutes)
- Refresh tokens with 7-day expiry
- Token rotation on refresh
- Secure flag for cookies in production (HTTPS only)

**Session Management:**
- Logout invalidates refresh token
- Concurrent session limit (optional: 3 devices)
- Token blacklist for immediate revocation (if needed)

### API Security

**Input Validation:**
- Validate all user inputs on backend
- Sanitize HTML/script tags from text inputs
- File type and size validation
- SQL injection prevention via Prisma parameterized queries

**Rate Limiting:**
```typescript
// Express rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later'
});

// Stricter limits for sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true
});
```

**CORS Configuration:**
```typescript
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
};
```

**Request Size Limits:**
- JSON body: 10MB max
- File uploads: Validated per endpoint
- Prevent DoS via large payloads

### Data Security

**Sensitive Data:**
- Never log passwords or tokens
- Sanitize error messages (no stack traces in production)
- Encrypt sensitive data at rest (database encryption)

**Authorization Checks:**
```typescript
// Middleware to verify resource ownership
const verifyOwnership = async (req, res, next) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id }
  });
  
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  if (post.userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  next();
};
```

**Database Security:**
- Principle of least privilege for database user
- No direct database access from frontend
- Prepared statements prevent SQL injection
- Regular backups (automated by hosting provider)

### Media Security

**Upload Security:**
- Signed upload URLs with 1-hour expiry
- File type validation (magic number checking)
- Virus scanning (ClamAV if resources allow)
- Content moderation (manual or automated)

**Access Control:**
- Public content accessible via CDN
- Private messages require authentication
- Cloudinary transformations prevent hotlinking abuse

### WebSocket Security

**Socket.io Authentication:**
```typescript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});
```

**Room Authorization:**
- Verify user belongs to conversation before joining room
- Validate message recipients
- Prevent unauthorized room access

### HTTPS & Transport Security

**Production Requirements:**
- HTTPS only (enforced by hosting platforms)
- HSTS headers
- Secure cookies
- CSP headers to prevent XSS

```typescript
// Security headers middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "https://res.cloudinary.com"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    }
  }
}));
```

### Design Rationale

**Defense in Depth:** Multiple layers of security (client validation, server validation, database constraints) ensure no single point of failure.

**HttpOnly Cookies:** Prevents XSS attacks from stealing tokens. More secure than localStorage for token storage.

**Rate Limiting:** Protects against brute force attacks and API abuse while staying within free-tier limits.

**Signed Uploads:** Prevents unauthorized media uploads while maintaining direct client-to-Cloudinary flow for performance.


## Deployment Strategy

### Environment Configuration

**Environment Variables:**

Frontend (.env):
```
VITE_API_URL=https://api.yourdomain.com
VITE_SOCKET_URL=https://api.yourdomain.com
VITE_PEER_HOST=peerjs-server.herokuapp.com
VITE_PEER_PORT=443
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=social_media_app
```

Backend (.env):
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
PORT=3000
```

### Hosting Options (Free Tier)

**Frontend Hosting:**
- **Vercel** (Recommended): 100GB bandwidth, automatic deployments, edge network
- **Netlify**: 100GB bandwidth, form handling, serverless functions
- **Cloudflare Pages**: Unlimited bandwidth, global CDN

**Backend Hosting:**
- **Railway** (Recommended): 500 hours/month, $5 credit, PostgreSQL included
- **Render**: 750 hours/month, automatic deployments, health checks
- **Fly.io**: 3 shared VMs, 3GB storage

**Database Hosting:**
- **Supabase** (Recommended): 500MB database, 1GB file storage, 2GB bandwidth
- **Neon**: 10GB storage, autoscaling, branching
- **Railway**: Included with backend hosting

### Deployment Pipeline

**GitHub Actions CI/CD:**

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd backend && npm ci
      - run: cd backend && npm run build
      - run: cd backend && npx prisma migrate deploy
      - uses: railway/deploy@v1
        with:
          service: backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build
      - uses: vercel/deploy@v1
        with:
          token: ${{ secrets.VERCEL_TOKEN }}
```

### Database Migrations

**Prisma Migration Strategy:**
```bash
# Development
npx prisma migrate dev --name migration_name

# Production
npx prisma migrate deploy
```

**Migration Best Practices:**
- Test migrations on staging database first
- Backup database before migrations
- Use transactions for data migrations
- Keep migrations small and focused

### Monitoring & Logging

**Free Tier Options:**
- **Sentry**: 5k errors/month for error tracking
- **LogRocket**: 1k sessions/month for session replay
- **Uptime Robot**: 50 monitors for uptime monitoring

**Health Check Endpoint:**
```typescript
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      database: 'disconnected'
    });
  }
});
```

### Backup Strategy

**Database Backups:**
- Automated daily backups (provided by hosting platform)
- Manual backup before major migrations
- Retention: 7 days for free tier

**Media Backups:**
- Cloudinary handles redundancy and backups
- Export media URLs from database for recovery

### Scaling Considerations

**Free Tier Limits:**
- Database: 500MB - 10GB depending on provider
- Bandwidth: 25GB - 100GB depending on provider
- Concurrent connections: 10-20 for database

**Optimization for Limits:**
- Aggressive caching to reduce database queries
- Image optimization to reduce bandwidth
- Connection pooling to manage database connections
- Pagination to limit result sets

**When to Upgrade:**
- Database storage > 80% capacity
- Bandwidth consistently hitting limits
- Response times degrading
- User base > 1000 active users

### Design Rationale

**Separate Frontend/Backend Hosting:** Allows independent scaling and deployment. Frontend on edge network for fast global delivery.

**Railway for Backend:** Includes database in same platform, simplifying management. Good free tier for portfolio projects.

**Vercel for Frontend:** Best-in-class performance with edge network and automatic optimizations. Zero-config deployments.

**Automated Deployments:** CI/CD pipeline ensures consistent deployments and catches issues before production.


## Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
/* Mobile: 320px - 767px (default) */
/* Tablet: 768px - 1023px */
@media (min-width: 768px) { }

/* Desktop: 1024px+ */
@media (min-width: 1024px) { }

/* Large Desktop: 1440px+ */
@media (min-width: 1440px) { }
```

### Layout Adaptations

**Mobile (< 768px):**
- Single column layout
- Bottom navigation bar (Home, Search, Create, Notifications, Profile)
- Full-width content
- Hamburger menu for additional options
- Touch-optimized tap targets (min 44x44px)
- Swipe gestures for stories and reels

**Tablet (768px - 1023px):**
- Two-column layout for feed (optional)
- Side navigation bar
- Modal dialogs for create/edit actions
- Larger tap targets
- Support for both touch and mouse input

**Desktop (1024px+):**
- Three-column layout (sidebar, main content, suggestions/activity)
- Left sidebar navigation
- Right sidebar for suggestions and activity
- Hover states for interactive elements
- Keyboard shortcuts
- Larger media previews

### Component Responsive Behavior

**Navigation:**
```
Mobile:   [Bottom Bar] Home | Search | + | Notifications | Profile
Tablet:   [Side Bar] Vertical navigation
Desktop:  [Side Bar] Vertical navigation with labels
```

**Feed:**
```
Mobile:   Single column, full width
Tablet:   Single column, max-width 600px, centered
Desktop:  Single column, max-width 600px, centered with sidebars
```

**Profile Grid:**
```
Mobile:   3 columns
Tablet:   3-4 columns
Desktop:  3 columns (larger thumbnails)
```

**Post Modal:**
```
Mobile:   Full screen
Tablet:   Centered modal, 80% viewport
Desktop:  Split view (image left, details right)
```

**Chat:**
```
Mobile:   Full screen conversation view
Tablet:   Split view (conversation list + active chat)
Desktop:  Split view with larger conversation list
```

### Touch Interactions

**Mobile Gestures:**
- Swipe left/right: Navigate between stories
- Swipe up/down: Scroll through reels
- Pull to refresh: Refresh feed
- Long press: Show post options menu
- Pinch to zoom: Zoom images in post view
- Double tap: Like post/reel

**Tablet Gestures:**
- Same as mobile plus mouse interactions
- Hover states for buttons and links

### Image Responsive Loading

**Responsive Images:**
```html
<img
  src="image-320w.jpg"
  srcset="
    image-320w.jpg 320w,
    image-640w.jpg 640w,
    image-1024w.jpg 1024w
  "
  sizes="
    (max-width: 767px) 100vw,
    (max-width: 1023px) 50vw,
    600px
  "
  alt="Post image"
/>
```

**Cloudinary Responsive URLs:**
```typescript
const getResponsiveImageUrl = (publicId: string, width: number) => {
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},f_auto,q_auto/${publicId}`;
};

// Usage
<img src={getResponsiveImageUrl(publicId, 320)} />
```

### Performance on Mobile

**Mobile Optimizations:**
- Reduce JavaScript bundle size
- Lazy load images below the fold
- Use CSS animations over JavaScript
- Minimize reflows and repaints
- Optimize font loading (font-display: swap)
- Service worker for offline support (optional)

**Network Awareness:**
```typescript
// Detect slow connection
const connection = navigator.connection;
if (connection && connection.effectiveType === '2g') {
  // Load lower quality images
  // Disable auto-play videos
  // Show data saver mode option
}
```

### Accessibility

**Mobile Accessibility:**
- Minimum touch target size: 44x44px
- Sufficient color contrast (WCAG AA)
- Screen reader support
- Keyboard navigation for external keyboards
- Focus indicators
- ARIA labels for icon buttons

**Desktop Accessibility:**
- Keyboard shortcuts (j/k for navigation, l for like, etc.)
- Skip to content link
- Focus management in modals
- Semantic HTML

### Design Rationale

**Mobile-First Approach:** Majority of social media usage is on mobile. Design for mobile first, then enhance for larger screens.

**Bottom Navigation on Mobile:** Thumb-friendly navigation for one-handed use. Matches user expectations from Instagram/TikTok.

**Single Column Feed:** Maintains focus on content. Easier to implement infinite scroll. Works well across all screen sizes.

**Touch-Optimized Targets:** 44x44px minimum ensures comfortable tapping on mobile devices, reducing user frustration.

**Responsive Images:** Reduces bandwidth usage on mobile devices while maintaining quality on desktop. Critical for free-tier bandwidth limits.


## Future Enhancements

### Phase 2 Features (Post-MVP)

**Enhanced Discovery:**
- Explore page with trending posts and reels
- Hashtag support for content categorization
- Search by hashtags and captions
- Recommended users based on interests

**Advanced Interactions:**
- Save/bookmark posts
- Share posts to other platforms
- Repost/share to your feed
- Tag users in posts and comments
- Mention users with @ in captions and comments

**Content Features:**
- Multiple images per post (carousel)
- Filters and editing tools for images
- Video trimming and editing
- Music library for reels
- Polls in stories
- Questions in stories

**Social Features:**
- Group chats (3+ participants)
- Voice messages in chat
- Read receipts for messages
- Close friends list for stories
- Private accounts with follow requests

**Engagement Features:**
- Activity feed showing friends' likes and comments
- Suggested posts in feed
- Personalized recommendations
- Push notifications (web push API)

### Technical Improvements

**Performance:**
- Redis caching layer
- Database read replicas
- CDN for API responses
- GraphQL API for flexible queries
- Server-side rendering for SEO

**Infrastructure:**
- Kubernetes for container orchestration
- Microservices architecture
- Message queue for async tasks (Bull/Redis)
- Elasticsearch for advanced search
- Analytics pipeline (user behavior tracking)

**Developer Experience:**
- API documentation (Swagger/OpenAPI)
- Component library (Storybook)
- E2E test coverage
- Performance monitoring dashboard
- Feature flags for gradual rollouts

### Monetization Options (If Scaling)

**Premium Features:**
- Verified badge
- Advanced analytics
- Longer video uploads
- Ad-free experience
- Custom themes

**Business Features:**
- Business accounts
- Sponsored posts
- Analytics dashboard
- Scheduling posts
- Multiple account management

### Scalability Path

**When to Scale:**
1. **1k users**: Add Redis caching, optimize queries
2. **10k users**: Upgrade database tier, add CDN
3. **100k users**: Microservices, read replicas, message queues
4. **1M+ users**: Kubernetes, multiple regions, dedicated infrastructure

**Cost Projections:**
- 1k users: $0-20/month (free tier)
- 10k users: $50-100/month
- 100k users: $500-1000/month
- 1M users: $5k-10k/month

### Design Rationale

**MVP First:** Focus on core features that demonstrate technical skills and product thinking. Additional features can be added iteratively.

**Modular Architecture:** Design allows adding features without major refactoring. Clean separation of concerns enables independent feature development.

**Free Tier Optimization:** Initial design maximizes free-tier usage, with clear upgrade path when needed.

**Portfolio Focus:** Feature set demonstrates full-stack capabilities, real-time systems, media handling, and modern web development practices.


## Development Workflow

### Project Structure

```
social-media-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── feed/
│   │   │   ├── profile/
│   │   │   ├── chat/
│   │   │   ├── common/
│   │   │   └── layout/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── types/
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── socket/
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── .github/
│   └── workflows/
│       └── deploy.yml
└── README.md
```

### Development Setup

**Prerequisites:**
- Node.js 18+
- PostgreSQL 14+ (or Docker)
- Git

**Initial Setup:**
```bash
# Clone repository
git clone https://github.com/username/social-media-app.git
cd social-media-app

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npx prisma migrate dev
npx prisma db seed
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env
# Edit .env with API URL
npm run dev
```

### Git Workflow

**Branch Strategy:**
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `fix/*`: Bug fixes
- `hotfix/*`: Production hotfixes

**Commit Convention:**
```
type(scope): subject

feat(auth): add password reset functionality
fix(feed): resolve infinite scroll bug
docs(readme): update setup instructions
style(ui): improve button hover states
refactor(api): simplify user service
test(auth): add login endpoint tests
chore(deps): update dependencies
```

### Code Quality

**Linting & Formatting:**
```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ]
}

// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**Pre-commit Hooks (Husky):**
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

### Development Scripts

**Frontend:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint src --ext ts,tsx",
    "format": "prettier --write src"
  }
}
```

**Backend:**
```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate",
    "prisma:studio": "prisma studio"
  }
}
```

### Design Rationale

**Monorepo Structure:** Keeps frontend and backend in same repository for easier development and deployment coordination.

**Feature-Based Organization:** Components organized by feature (auth, feed, profile) rather than type (components, containers) for better scalability.

**TypeScript Everywhere:** Type safety across the stack reduces bugs and improves developer experience with autocomplete.

**Conventional Commits:** Standardized commit messages enable automatic changelog generation and semantic versioning.


## Summary

This design document outlines a comprehensive architecture for a production-grade social media application built entirely with free-tier services. The design prioritizes:

1. **Scalability**: Modular architecture allows incremental feature additions and future scaling
2. **Performance**: Aggressive caching, lazy loading, and CDN usage ensure fast load times
3. **Security**: Multiple layers of authentication, authorization, and input validation
4. **Developer Experience**: TypeScript, clear separation of concerns, and comprehensive testing
5. **Cost Efficiency**: Optimized for free-tier limits while maintaining professional quality

The technology stack (React, Node.js, PostgreSQL, Cloudinary, Socket.io, WebRTC) represents modern, industry-standard tools that demonstrate professional development capabilities. The architecture supports all 15 requirements from the requirements document while providing a clear path for future enhancements.

Key design decisions include:
- Client-server architecture with REST API and WebSocket for real-time features
- PostgreSQL for relational data with Prisma ORM for type-safe database access
- Cloudinary for media storage and optimization
- Peer-to-peer WebRTC for video calling to minimize server bandwidth
- Mobile-first responsive design with progressive enhancement
- Comprehensive error handling and security measures

This design serves as a blueprint for implementation, with each section providing sufficient detail for developers to build the application while maintaining flexibility for refinement during development.
