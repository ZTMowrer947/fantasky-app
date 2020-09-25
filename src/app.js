// Imports
import express from 'express';
import nunjucks from 'nunjucks';
import path from 'path';

import api from './api';
import closeDatabaseOnError from './middleware/closeDatabaseOnError';

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
  express: app,
});

app.set('view engine', 'njk');

// Middleware
app.use('/public', express.static(publicDir));
app.use('/api', api);

// Error handlers
app.use(closeDatabaseOnError);

// Exports
export default app;
