import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

const hasRedisCredentials = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

if (!hasRedisCredentials) {
    console.warn('⚠️  Redis credentials not found. Caching is DISABLED.');
}

// Export null if credentials are missing to prevent errors
export const redis = hasRedisCredentials
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    : null;

export const CACHE_TTL = {
    FEED: 60, // 1 minute
    POST: 300, // 5 minutes
    USER: 300, // 5 minutes
    EXPLORE: 60, // 1 minute
};
