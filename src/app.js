// Imports
import express from 'express';
import path from 'path';

import api from './api';

// Express app setup
const app = express();

// Paths
const projectRootDir = path.resolve(__dirname, '..');
const viewDir = path.resolve(projectRootDir, 'views');
const publicDir = path.resolve(projectRootDir, 'public');

// App configuration
app.disable('x-powered-by');
app.set('view engine', 'pug');
app.set('views', viewDir);

// Middleware
app.use('/public', express.static(publicDir));
app.use('/api', api);

// Exports
export default app;
