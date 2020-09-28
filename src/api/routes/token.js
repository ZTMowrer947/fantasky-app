// Imports
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import passport from 'passport';

import { jwtSecret } from '../../secrets';

// Helper function
/**
 *
 * @param {string | object | Buffer} payload
 * @param {import('jsonwebtoken').SignOptions} options
 * @returns {Promise<string>}
 */
async function signAsync(payload, options = undefined) {
  // Construct promise to asynchonously sign payload
  return new Promise((resolve, reject) => {
    jwt.sign(payload, jwtSecret, options, (error, token) => {
      // If an error has occurred, reject with it
      if (error) return reject(error);

      // Otherwise, resolve with token
      return resolve(token);
    });
  });
}

// Router setup
const tokenRoutes = Router();

// Routes
tokenRoutes
  .route('/') // /api/token
  .post(
    passport.authenticate('basic', { session: false, failWithError: true }),
    asyncHandler(async (req, res) => {
      // Define payload to sign
      const payload = {
        exp: Math.trunc(Date.now() / 1000) + 7200,
        userid: req.user.id,
        sub: req.user.emailAddress,
      };

      // Sign payload and get token
      const token = await signAsync(payload, {
        algorithm: 'HS384',
      });

      // Extract token expiration value and convert to HTTP Date String
      const expDateString = new Date(payload.exp * 1000).toUTCString();

      // Set Expires HTTP header
      res.header('Expires', expDateString);

      // Respond with token data
      res.json({ token });
    })
  );

// Exports
export default tokenRoutes;
