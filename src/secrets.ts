/*
 * secrets.ts
 *
 * Contains the secret values used within the application that must not be directly exposed to the user.
 */
import { RedisOptions } from 'ioredis';

// Secret for JSON Web Tokens
export const jwtSecret = process.env.JWT_SECRET;

// Secret for cookie signing
export const cookieSecret = process.env.COOKIE_SECRET;

// Secret for session data
export const sessionSecret = process.env.SESSION_SECRET;

// Redis client options
export const redisOptions: RedisOptions = {
  port: Number.parseInt(process.env.REDIS_PORT ?? '6379', 10) ?? 6379,
  host: process.env.REDIS_HOST ?? 'localhost',
  password: process.env.REDIS_PASS ?? undefined,
};
