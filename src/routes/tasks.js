// Imports
import { Router } from 'express';

// Express router setup
const taskRoutes = Router();

// Routes
taskRoutes
  .route('/') // /tasks
  .get((req, res) => {
    // TODO: Ensure user is logged in and load their tasks
    res.render('index');
  });

// Exports
export default taskRoutes;
