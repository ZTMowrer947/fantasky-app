// Imports
import dateFormat from 'dateformat';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { checkSchema, validationResult } from 'express-validator';
import createError from 'http-errors';
import passport from 'passport';

import database from '../middleware/database';
import { frontendUserValidationSchema } from '../validation/user';

// Express router setup
const authRoutes = Router();

// Routes
authRoutes
  .route('/login')
  .get((req, res) => {
    // Get flash message and attach to view locals
    [res.locals.failureMessage] = req.flash('error');

    // Render login form
    res.render('auth/login');
  })
  .post(
    passport.authenticate('local', {
      failureRedirect: '/login',
      failureFlash: 'Incorrect email/password combination.',
      successRedirect: '/tasks',
    })
  );

authRoutes
  .route('/register')
  .get((req, res) => {
    res.render('auth/register');
  })
  .post(
    database,
    checkSchema(frontendUserValidationSchema),
    asyncHandler(async (req, res) => {
      // Get validation results
      const errors = validationResult(req);

      // If there are validation errors,
      if (!errors.isEmpty()) {
        // Close database connection
        await req.db.close();

        // Attach errors to view locals
        res.locals.errors = errors.mapped();

        // Attach form values from previous submission, excluding password fields
        res.locals.values = {
          ...req.body,
          dob: req.body?.dob ? dateFormat(req.body.dob, 'isoDate') : undefined,
          password: '',
          confirmPassword: '',
        };

        // Re-render registration form
        res.render('auth/register');
      } else {
        // If we got here, throw 503 error
        const error = createError(503);
        throw error;
      }
    })
  );

// Exports
export default authRoutes;
