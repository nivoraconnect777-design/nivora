# Social Media Frontend

React + TypeScript + Vite + TailwindCSS frontend for the social media application.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Update the `.env` file with your values:

```env
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

# Cloudinary (Free tier - sign up at cloudinary.com)
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=social_media_app
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend will run on http://localhost:5173

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first CSS
- **React Router** - Client-side routing
- **TanStack Query** - Server state management with caching
- **Zustand** - Lightweight client state management
- **Axios** - HTTP client with interceptors

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components
│   └── layout/          # Layout components (Navbar, etc.)
├── pages/               # Page components
├── stores/              # Zustand stores
├── lib/                 # Utilities and API client
├── types/               # TypeScript types
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

## Features Implemented

✅ React Router with nested routes
✅ Responsive navbar (desktop top, mobile bottom)
✅ TanStack Query for API caching
✅ Zustand for auth and UI state
✅ Axios with automatic token refresh
✅ Error boundary for error handling
✅ Loading skeletons
✅ TypeScript types for all data models
✅ TailwindCSS styling

## State Management

### Auth Store (Zustand)
- User authentication state
- Token management
- Persisted to localStorage

### UI Store (Zustand)
- Modal states
- Mobile menu state
- Other UI interactions

### Server State (TanStack Query)
- API data caching (5 min default)
- Automatic background refetching
- Optimistic updates

## Responsive Design

- **Mobile** (< 768px): Bottom navigation bar
- **Desktop** (>= 768px): Top navigation bar
- Touch-optimized for mobile
- Hover states for desktop

## Next Steps

The frontend is ready for feature implementation:
1. Authentication forms (Task 5)
2. Profile components (Task 7)
3. Post/Reel creation (Tasks 11, 13)
4. Feed implementation (Task 20)
5. Real-time chat (Task 24)
6. Video calling (Task 26)
