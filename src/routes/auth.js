// Imports
import csrf from '@/middleware/csrf';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { body, checkSchema, validationResult } from 'express-validator';
import { DateTime } from 'luxon';
import passport from 'passport';

import database from '../middleware/database';
import UserService from '../services/UserService';
import { frontendUserValidationSchema } from '../validation/user';

// Express router setup
const authRoutes = Router();

// Routes
authRoutes
  .route('/login')
  .get(csrf, (req, res) => {
    const [failureMessage] = req.flash('error');

    // If there is a failure message, set status to 401
    if (failureMessage) res.status(401);

    // Get flash message and attach to view locals
    res.locals.failureMessage = failureMessage;

    // Attach CSRF token to view locals
    res.locals.csrfToken = req.csrfToken();

    // Render login form
    res.render('auth/login');
  })
  .post(
    csrf,
    body('emailAddress').normalizeEmail(),
    passport.authenticate('local', {
      failureRedirect: '/login',
      failureFlash: 'Incorrect email/password combination.',
      successReturnToOrRedirect: '/tasks',
    })
  );

authRoutes
  .route('/register')
  .get(csrf, (req, res) => {
    // Attach CSRF token to view locals
    res.locals.csrfToken = req.csrfToken();

    // Render registration form
    res.render('auth/register');
  })
  .post(
    csrf,
    database,
    checkSchema(frontendUserValidationSchema),
    asyncHandler(async (req, res, next) => {
      // Get validation results
      const errors = validationResult(req);

      // If there are validation errors,
      if (!errors.isEmpty()) {
        // Set status to 400
        res.status(400);

        // Attach errors to view locals
        res.locals.errors = errors.mapped();

        // Attach form values from previous submission, excluding password fields
        res.locals.values = {
          ...req.body,
          dob: req.body?.dob
            ? DateTime.fromJSDate(req.body.dob, { zone: 'utc' }).toISODate()
            : undefined,
          password: '',
          confirmPassword: '',
        };

        // Attach CSRF token to view locals
        res.locals.csrfToken = req.csrfToken();

        // Re-render registration form
        res.render('auth/register');
      } else {
        // If we got here, proceed to next handler
        next();
      }
    }),
    asyncHandler(async (req, res, next) => {
      // Instantiate user service
      const service = new UserService(req.db);

      // Define user data
      const { confirmPassword, ...userDto } = req.body;

      // Create new user
      await service.create(userDto);

      // Retrieve newly created user
      const newUser = await service.getByEmail(userDto.emailAddress);

      // Log in new user
      req.login(newUser, (err) => {
        // If there is an error, pass it to error handlers
        if (err) return next(err);

        // Otherwise, redirect to task listing
        return res.redirect('/tasks');
      });
    })
  );

authRoutes.get('/logout', (req, res) => {
  // Log out user
  req.logout();

  // Redirect to login page
  res.redirect('/login');
});

// Exports
export default authRoutes;
