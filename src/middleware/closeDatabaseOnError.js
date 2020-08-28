// Imports
import asyncHandler from 'express-async-handler';

// Error-handling middleware
async function closeDatabaseOnError(err, req, res, next) {
  // If the database is connected,
  if (req.db?.isConnected) {
    // Close the database connection
    await req.db.close();
  }

  // Pass error next handler
  next(err);
}

// Exports
export default asyncHandler(closeDatabaseOnError);
