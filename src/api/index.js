// Imports
import express from 'express';
import createError from 'http-errors';
import passport from 'passport';
import { BasicStrategy } from 'passport-http';

import apiErrorHandler from './middleware/apiErrorHandler';
import tokenRoutes from './routes/token';
import userRoutes from './routes/users';
import bootstrapDatabase from '../bootstrapDatabase';
import closeDatabaseOnError from '../middleware/closeDatabaseOnError';
import UserService from '../services/UserService';

// Express sub-app setup
const api = express();

// Sub-app configuration
api.disable('x-powered-by');

// Middleware
api.use(express.json());
api.use(passport.initialize());

// Authentication strategies
passport.use(
  new BasicStrategy(async (emailAddress, password, done) => {
    // Create database connection
    const connection = await bootstrapDatabase();

    try {
      // Instantiate user service
      const service = new UserService(connection);

      // Use service to verify credentials
      const credentialsValid = await service.verifyCredentials(
        emailAddress,
        password
      );

      // If they are invalid,
      if (!credentialsValid) {
        // Close database connection
        await connection.close();

        // Deny access
        return done(null, false);
      }

      // Otherwise, retrieve user data
      const user = await service.getByEmail(emailAddress);

      // Close database connection
      await connection.close();

      // Grant access
      return done(null, user);
    } catch (error) {
      // If an error occurs, close database connection
      await connection.close();

      // Pass error through callback
      return done(error);
    }
  })
);

// Routes
api.use('/token', tokenRoutes);
api.use('/users', userRoutes);
api.all('*', async (req, res, next) => {
  // Create 404 error
  const message = `Cannot ${req.method} ${req.path}`;
  const error = createError(404, message);

  // Pass to error handlers
  next(error);
});

// Error handlers
api.use(closeDatabaseOnError);
api.use(apiErrorHandler);

// Exports
export default api;
