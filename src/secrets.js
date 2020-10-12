/*
 * secrets.js
 *
 * Contains the secret values used within the application that must not be directly exposed to the user.
 */

// Secret for JSON Web Tokens
export const jwtSecret = process.env.JWT_SECRET;

// Secret for cookie signing
export const cookieSecret = process.env.COOKIE_SECRET;

// Secret for session data
export const sessionSecret = process.env.SESSION_SECRET;

// Redis client options
/**
 * @type {import("ioredis").RedisOptions}
 */
export const redisOptions = {
  port: Number.parseInt(process.env.REDIS_PORT, 10) ?? 6379,
  host: process.env.REDIS_HOST ?? 'localhost',
  password: process.env.REDIS_PASS ?? null,
};
