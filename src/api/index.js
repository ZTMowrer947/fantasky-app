// Imports
import express from 'express';
import createError from 'http-errors';

import apiErrorHandler from './middleware/apiErrorHandler';
import userRoutes from './routes/users';
import closeDatabaseOnError from '../middleware/closeDatabaseOnError';

// Express sub-app setup
const api = express();

// Sub-app configuration
api.disable('x-powered-by');

// Middleware
api.use(express.json());

// Routes
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
