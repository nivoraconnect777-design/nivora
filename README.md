# Social Media Application

A production-grade social media application with Instagram-like features including posts, reels, stories, profiles, follow system, text chat, and video calling.

## Project Structure

```
.
├── backend/          # Node.js + Express + TypeScript backend
│   ├── src/         # Source code
│   ├── .env.example # Environment variables template
│   └── package.json
├── frontend/         # React + TypeScript + Vite frontend
│   ├── src/         # Source code
│   ├── .env.example # Environment variables template
│   └── package.json
└── README.md
```

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- TailwindCSS for styling
- React Router for routing
- TanStack Query for server state
- Zustand for client state
- Socket.io-client for real-time features

### Backend
- Node.js with Express.js
- TypeScript
- Socket.io for WebSocket connections
- Prisma ORM
- PostgreSQL database
- JWT authentication

### External Services
- Cloudinary (media storage & CDN)
- PeerJS (WebRTC video calling)

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Cloudinary account (free tier)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment variables template:
   ```bash
   copy .env.example .env
   ```

4. Update `.env` with your configuration values

5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment variables template:
   ```bash
   copy .env.example .env
   ```

4. Update `.env` with your configuration values

5. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## Development

### Code Quality

Both frontend and backend are configured with:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety

Run linting:
```bash
npm run lint
```

Run formatting:
```bash
npm run format
```

### Building for Production

Backend:
```bash
cd backend
npm run build
npm start
```

Frontend:
```bash
cd frontend
npm run build
npm run preview
```

## Features

- User authentication and registration
- User profiles with customization
- Follow/unfollow system
- Posts with images/videos
- Reels (short-form videos)
- Stories (24-hour temporary content)
- Like and comment interactions
- Personalized content feed
- User search
- Real-time text chat
- Video calling
- Real-time notifications
- Responsive design (mobile, tablet, desktop)

## License

ISC
