// Error handler
import renderPage from '@/lib/helpers/renderPage';
import CsrfError from '@/pages/_csrf';
import NotFound from '@/pages/404';
import UnexpectedError from '@/pages/500';

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
    res.header('refresh', '3; url=/tasks');
    res.locals.title = 'Not Found | Fantasky';
    res.send(renderPage(req, res, <NotFound />));

    return;
  }
  if (err.message.startsWith('Serialized user')) {
    // Log out user in case of serialization error
    req.logout();
  }

  // If we are not in production,
  if (process.env.NODE_ENV !== 'production') {
    // Attach stack trace to view locals
    res.locals.stack = err.stack;
  }

  // If the error is a CSRF error,
  if (err.code === 'EBADCSRFTOKEN') {
    // Set status to 403
    res.status(403);

    // Render CSRF error page
    res.header('refresh', '3; url=/tasks');
    res.locals.title = 'Error | Fantasky';
    res.send(renderPage(req, res, <CsrfError />));
  } else {
    // Otherwise, render standard error page
    res.header('refresh', '3; url=/tasks');
    res.locals.title = 'Error | Fantasky';
    res.send(renderPage(req, res, <UnexpectedError />));
  }
}

// Exports
export default errorHandler;
