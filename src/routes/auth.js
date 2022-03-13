// Imports
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { body, checkSchema, validationResult } from 'express-validator';
import passport from 'passport';

import renderPage from '@/lib/helpers/renderPage';
import createUser from '@/lib/queries/user/createUser';
import csrf from '@/middleware/csrf';
import Login from '@/pages/login';
import Register from '@/pages/register';
import prisma from '@/prisma';
import { frontendUserValidationSchema } from '@/validation/user';

// Express router setup
const authRoutes = Router();

// Routes
authRoutes
  .route('/login')
  .get(csrf, (req, res) => {
    const [failureMessage] = req.flash('error');

    // If there is a failure message, set status to 401
    if (failureMessage) res.status(401);

    // Get CSRF token
    const csrfToken = req.csrfToken();

    // Render login form
    res.send(
      renderPage(
        req,
        res,
        <Login csrfToken={csrfToken} failureFlash={failureMessage} />
      )
    );
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
    // Get CSRF token
    const csrfToken = req.csrfToken();

    // Render registration form
    res.send(renderPage(req, res, <Register csrfToken={csrfToken} />));
  })
  .post(
    csrf,
    checkSchema(frontendUserValidationSchema),
    asyncHandler(async (req, res, next) => {
      // Get validation results
      const errors = validationResult(req);

      // If there are validation errors,
      if (!errors.isEmpty()) {
        // Set status to 400
        res.status(400);

        // Map validation errors
        const errorMap = errors.mapped();

        // Retrieve form values from previous submission, excluding password fields
        const prevValues = {
          ...req.body,
          password: undefined,
          confirmPassword: undefined,
        };

        // Get CSRF token
        const csrfToken = req.csrfToken();

        // Re-render registration form
        res.send(
          renderPage(
            req,
            res,
            <Register
              csrfToken={csrfToken}
              errors={errorMap}
              prevValues={prevValues}
            />
          )
        );
      } else {
        // If we got here, proceed to next handler
        next();
      }
    }),
    asyncHandler(async (req, res, next) => {
      // Define user DTO from form data
      const { confirmPassword, ...userData } = req.body;

      // Create new user
      const newUser = await createUser(prisma, userData);

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
