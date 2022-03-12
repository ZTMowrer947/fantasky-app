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

import renderPage from '@/lib/helpers/renderPage';
import fetchUser from '@/lib/queries/user/fetchUser';

import attachLoginStatusToView from './middleware/attachLoginStatusToView';
import errorHandler from './middleware/errorHandler';
import prisma from './prisma';
import frontendRoutes from './routes';
import { redisOptions, sessionSecret } from './secrets';

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
    name: 'fts.sessid',
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
  res.locals.showSeal = app.get('env') === 'production';

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
      try {
        // Retrieve user data and verify credentials
        const user = await fetchUser(prisma, emailAddress, password);

        // Grant access only if credentials were valid and user was found
        return done(null, user ?? false);
      } catch (error) {
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
  try {
    // Retrieve user data
    const user = await fetchUser(prisma, emailAddress);

    // If user was found,
    if (user) {
      // Return deserialized user
      return done(null, user);
    }

    // Otherwise, return error
    return done(new Error('Serialized user could not be found.'));
  } catch (error) {
    // Pass error through callback
    return done(error);
  }
});

// Frontend routes
app.use(frontendRoutes);

app.get('/react-test', (req, res) => {
  res.locals.title = 'React test';

  res.send(renderPage(req, res, <h1>React test</h1>));
});

app.use((req, res, next) => {
  // Redirect all uncaught routes to 404 page
  const error = createError(404);

  next(error);
});

// Error handlers
app.use(errorHandler);

// Exports
export default app;
