# Social Media Backend

Express.js + TypeScript + Prisma backend for the social media application.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database (FREE OPTIONS)

You have two free PostgreSQL options:

#### Option A: Neon (Recommended - 0.5GB free)
1. Go to https://neon.tech
2. Sign up for free account
3. Create a new project
4. Copy the connection string
5. Update `DATABASE_URL` in `.env`

#### Option B: Supabase (1GB free)
1. Go to https://supabase.com
2. Sign up for free account
3. Create a new project
4. Go to Settings > Database
5. Copy the connection string (use "Connection pooling" for better performance)
6. Update `DATABASE_URL` in `.env`

#### Option C: Local PostgreSQL
If you have PostgreSQL installed locally:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/social_media_db"
```

### 3. Configure Environment Variables

Update the `.env` file with your values:

```env
# Database - Use your Neon or Supabase connection string
DATABASE_URL="postgresql://..."

# JWT Secrets - Generate random strings
JWT_SECRET="your-random-secret-key"
JWT_REFRESH_SECRET="your-random-refresh-key"

# Cloudinary (Free tier - sign up at cloudinary.com)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 4. Run Database Migrations

```bash
# Generate Prisma client
npm run db:generate

# Create database tables
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Server will run on http://localhost:5000

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## API Endpoints

### Health Check
- `GET /health` - Check if server is running

### API Info
- `GET /api` - Get API information

More endpoints will be added as features are implemented.

## Database Schema

The database includes the following models:
- User
- Post
- Reel
- Story
- Follow
- Like
- Comment
- Conversation
- ConversationParticipant
- Message
- Notification

View the full schema in `prisma/schema.prisma`

## Free Tier Limits

### Neon PostgreSQL
- 0.5 GB storage
- 1 project
- Unlimited queries

### Supabase PostgreSQL
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth

### Cloudinary
- 25 GB storage
- 25 GB bandwidth/month
- 25 credits/month

All limits are more than enough for a portfolio project!
