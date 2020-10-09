// Imports
import { ensureLoggedIn } from 'connect-ensure-login';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';

import database from '../middleware/database';
import TaskService from '../services/TaskService';

// Express router setup
const taskRoutes = Router();

// Routes
taskRoutes
  .route('/') // /tasks
  .get(
    ensureLoggedIn('/login'),
    database,
    asyncHandler(async (req, res) => {
      // Instantiate task service
      const service = new TaskService(req.db);

      // Retrieve tasks for user
      const tasks = await service.findAllForUser(req.user.id);

      // Close database connection
      await req.db.close();

      console.log(tasks);

      // TODO: Process and attach tasks of logged in user
      res.render('tasks/index');
    })
  );

// Exports
export default taskRoutes;
