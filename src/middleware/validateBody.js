// Import
import { validationResult } from 'express-validator';
import createError from 'http-errors';

// Middleware
function validateBody(req, res, next) {
  // Validate request body
  const errors = validationResult(req);

  // If there are any errors,
  if (!errors.isEmpty()) {
    // Create 400 error
    const validationError = createError(400, 'Validation Error', {
      errors: errors.array(),
    });

    // Pass error to error handlers
    next(validationError);
  } else {
    // If the validation succeeded, proceed as normal
    next();
  }
}

// Exports
export default validateBody;
