// Imports
import { ensureLoggedIn } from 'connect-ensure-login';
import { Router } from 'express';

// Express router setup
const taskRoutes = Router();

// Routes
taskRoutes
  .route('/') // /tasks
  .get(ensureLoggedIn('/login'), (req, res) => {
    // TODO: Load tasks of logged in user
    res.render('index');
  });

// Exports
export default taskRoutes;
