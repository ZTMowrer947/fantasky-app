// Imports
import { STATUS_CODES } from 'http';
import { serializeError } from 'serialize-error';

// Error handler
function apiErrorHandler(err, req, res, next) {
  // If headers have already been sent to the client,
  if (res.headersSent) {
    // Delegate to default error handler
    next(err);

    return;
  }

  // Determine response status
  const errorStatus = err.status ?? 500;

  // Determine whether error should be exposed to client
  const shouldExposeError = err.expose || errorStatus !== 500;

  // Set HTTP response status
  res.status(errorStatus);

  // If the error should not be exposed to the client (such as a server error),
  if (!shouldExposeError) {
    // Respond with only the message relating to the status
    res.json({ message: STATUS_CODES[errorStatus] });
  } else {
    // Otherwise, omit unneeded error properties
    const { expose, name, status, ...exposedError } = serializeError(err);

    // If we are in production, hide stack trace
    if (process.env.NODE_ENV === 'production') exposedError.stack = undefined;

    // Respond with error
    res.json(exposedError);
  }
}

// Exports
export default apiErrorHandler;
