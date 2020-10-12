// Imports
import flash from 'connect-flash';
import createRedisStore from 'connect-redis';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import createError from 'http-errors';
import Redis from 'ioredis';
import nunjucks from 'nunjucks';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import path from 'path';

// import api from './api';
import { getDatabaseConnection } from './bootstrapDatabase';
import attachLoginStatusToView from './middleware/attachLoginStatusToView';
import errorHandler from './middleware/errorHandler';
import frontendRoutes from './routes';
import { redisOptions, sessionSecret } from './secrets';
import UserService from './services/UserService';

// Redis setup
const redis = new Redis(redisOptions);
const RedisStore = createRedisStore(session);
const sessionStore = new RedisStore({ client: redis });

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
app.set('trust proxy', 'loopback');

// Middleware
app.use(helmet.noSniff());
app.use(helmet.ieNoOpen());
app.use(helmet.frameguard());
app.use(
  helmet.referrerPolicy({
    policy: 'same-origin',
  })
);
app.use(
  helmet.permittedCrossDomainPolicies({
    permittedPolicies: 'none',
  })
);
app.use(helmet.xssFilter());
app.use('/public', express.static(publicDir));
// app.use('/api', api);

app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    cookie: {
      sameSite: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400000,
    },
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(attachLoginStatusToView);
app.use((req, res, next) => {
  // Determine whether security seal should be displayed
  const showSeal = app.get('env') === 'production';

  // Attach result to view locals
  res.locals.showSeal = showSeal;

  // Proceed with middleware chain
  next();
});

// Passport strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'emailAddress',
      passwordField: 'password',
    },
    async (emailAddress, password, done) => {
      // Create database connection
      const connection = getDatabaseConnection();

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
          // Deny access
          return done(null, false);
        }

        // Otherwise, retrieve user data
        const user = await service.getByEmail(emailAddress);

        // Grant access
        return done(null, user);
      } catch (error) {
        // If an error occurs, close database connection

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
  const connection = getDatabaseConnection();

  try {
    // Instantiate user service
    const service = new UserService(connection);

    // Retrieve user data
    const user = await service.getByEmail(emailAddress);

    // If user was found,
    if (user) {
      // Return deserialized user
      return done(null, user);
    }

    // Otherwise, return error
    return done(new Error('Serialized user could not be found.'));
  } catch (error) {
    // If an error occurs, close database connection

    // Pass error through callback
    return done(error);
  }
});

// Frontend routes
app.use(frontendRoutes);
app.use((req, res, next) => {
  // Redirect all uncaught routes to 404 page
  const error = createError(404);

  next(error);
});

// Error handlers
app.use(errorHandler);

// Exports
export default app;
