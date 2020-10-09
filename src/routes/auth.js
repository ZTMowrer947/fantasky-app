// Imports
import { Router } from 'express';
import passport from 'passport';

// Express router setup
const authRoutes = Router();

// Routes
authRoutes
  .route('/login')
  .get((req, res) => {
    // Get flash message and attach to view locals
    [res.locals.failureMessage] = req.flash('error');

    // Render login form
    res.render('login');
  })
  .post(
    passport.authenticate('local', {
      failureRedirect: '/login',
      failureFlash: 'Incorrect email/password combination.',
      successRedirect: '/tasks',
    })
  );

authRoutes.route('/register').get((req, res) => {
  res.render('auth/register');
});

// Exports
export default authRoutes;
