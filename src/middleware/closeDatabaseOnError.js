// Error-handling middleware
async function closeDatabaseOnError(err, req, res, next) {
  try {
    // If the database is connected,
    if (req.db?.isConnected) {
      // Close the database connection
      await req.db.close();
    }

    // Pass error next handler
    next(err);
  } catch (error) {
    // If any error occurs during this process, pass that to error handlers
    next(error);
  }
}

// Exports
export default closeDatabaseOnError;
