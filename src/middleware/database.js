// Imports
import bootstrapDatabase from '../bootstrapDatabase';

// Middleware
async function database(req, res, next) {
  try {
    // Initialize database connection
    const connection = await bootstrapDatabase();

    // Attach connection to request object
    req.db = connection;

    // Proceed with middleware chain
    next();
  } catch (error) {
    // If an error occurs, pass to error handlers
    next(error);
  }
}

// Exports
export default database;
