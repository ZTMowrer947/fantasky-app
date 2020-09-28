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
