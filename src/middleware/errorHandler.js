// Error handler
/**
 *
 * @type {import("express").ErrorRequestHandler}
 */
function errorHandler(err, req, res, next) {
  // If headers have already been sent to the client,
  if (res.headersSent) {
    // Delegate to default error handler
    next(err);

    return;
  }

  // Determine response status
  const errorStatus = err.status ?? 500;

  // Set status
  res.status(errorStatus);

  // If the error is a 404 error,
  if (errorStatus === 404) {
    // Render 404 page
    res.render('notfound');

    return;
  }

  // If we are not in production,
  if (process.env.NODE_ENV !== 'production') {
    // Attach stack trace to view locals
    res.locals.stack = err.stack;
  }

  // Render standard error page
  res.render('error');
}

// Exports
export default errorHandler;
