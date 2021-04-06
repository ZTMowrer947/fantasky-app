// Imports
import { getConnection } from 'typeorm';

// Middleware
function database(req, res, next) {
  try {
    // Initialize database connection
    req.db = getConnection();

    // Proceed with middleware chain
    next();
  } catch (error) {
    // If an error occurs, pass to error handlers
    next(error);
  }
}

// Exports
export default database;
