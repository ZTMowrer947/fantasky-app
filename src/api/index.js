// Imports
import express from 'express';

// Express sub-app setup
const api = express();

// Sub-app configuration
api.disable('x-powered-by');

// Middleware
api.use(express.json());

// Exports
export default api;
