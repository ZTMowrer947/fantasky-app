// Imports
import flash from 'connect-flash';
import express from 'express';
import session from 'express-session';
import nunjucks from 'nunjucks';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import path from 'path';

import api from './api';
import bootstrapDatabase from './bootstrapDatabase';
import closeDatabaseOnError from './middleware/closeDatabaseOnError';
import frontendRoutes from './routes';
import { sessionSecret } from './secrets';
import UserService from './services/UserService';

// Express app setup
const app = express();

// Paths
const projectRootDir = path.resolve(__dirname, '..');
const viewDir = path.resolve(projectRootDir, 'views');
const publicDir = path.resolve(projectRootDir, 'public');

// App configuration
app.disable('x-powered-by');

nunjucks.configure(viewDir, {
  autoescape: true,
  watch: true,
  express: app,
});

app.set('view engine', 'njk');

// Middleware
app.use('/public', express.static(publicDir));
app.use('/api', api);

app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({ secret: sessionSecret, resave: false, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

// Passport strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'emailAddress',
      passwordField: 'password',
    },
    async (emailAddress, password, done) => {
      // Create database connection
      const connection = await bootstrapDatabase();

      try {
        // Instantiate user service
        const service = new UserService(connection);

        // Use service to verify credentials
        const credentialsValid = await service.verifyCredentials(
          emailAddress,
          password
        );

        // If they are invalid,
        if (!credentialsValid) {
          // Close database connection
          await connection.close();

          // Deny access
          return done(null, false);
        }

        // Otherwise, retrieve user data
        const user = await service.getByEmail(emailAddress);

        // Close database connection
        await connection.close();

        // Grant access
        return done(null, user);
      } catch (error) {
        // If an error occurs, close database connection
        await connection.close();

        // Pass error through callback
        return done(error);
      }
    }
  )
);

// User session management
passport.serializeUser((user, done) => {
  // Serialize user as email address
  done(null, user.emailAddress);
});

passport.deserializeUser(async (emailAddress, done) => {
  // Create database connection
  const connection = await bootstrapDatabase();

  try {
    // Instantiate user service
    const service = new UserService(connection);

    // Retrieve user data
    const user = await service.getByEmail(emailAddress);

    // Close database connection
    await connection.close();

    // If user was found,
    if (user) {
      // Return deserialized user
      return done(null, user);
    }

    // Otherwise, return error
    return done(new Error('Serialized user could not be found.'));
  } catch (error) {
    // If an error occurs, close database connection
    await connection.close();

    // Pass error through callback
    return done(error);
  }
});

// Frontend routes
app.use(frontendRoutes);

// Error handlers
app.use(closeDatabaseOnError);

// Exports
export default app;
