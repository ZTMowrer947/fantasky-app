/* eslint-disable import/no-extraneous-dependencies */
// Imports
import { ensureLoggedIn } from 'connect-ensure-login';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { checkSchema, validationResult } from 'express-validator';
import { DateTime } from 'luxon';
import validator from 'validator';

import database from '../middleware/database';
import TaskService from '../services/TaskService';
import { taskValidationSchema } from '../validation/task';

// Express router setup
const taskRoutes = Router();

// Routes
taskRoutes
  .route('/') // /tasks
  .get(
    ensureLoggedIn('/login'),
    database,
    asyncHandler(async (req, res) => {
      // // Instantiate task service
      // const service = new TaskService(req.db);

      // // Retrieve tasks for user
      // const tasks = await service.findAllForUser(req.user.id);

      // Close database connection
      await req.db.close();

      // TODO: Process and attach tasks of logged in user
      res.render('tasks/index');
    })
  );

taskRoutes
  .route('/new')
  .get(ensureLoggedIn('/login'), (req, res) => {
    res.locals.values = {
      startDate: DateTime.utc().toISODate(),
    };

    // Render task creation form
    res.render('tasks/new');
  })
  .post(
    ensureLoggedIn('/login'),
    (req, res, next) => {
      // Get active days
      const { sun, mon, tue, wed, thu, fri, sat, ...baseTask } = req.body;

      // Rearrange request body and sanitize active days
      req.body = {
        ...baseTask,
        activeDays: {
          sun: validator.toBoolean(sun ?? ''),
          mon: validator.toBoolean(mon ?? ''),
          tue: validator.toBoolean(tue ?? ''),
          wed: validator.toBoolean(wed ?? ''),
          thu: validator.toBoolean(thu ?? ''),
          fri: validator.toBoolean(fri ?? ''),
          sat: validator.toBoolean(sat ?? ''),
        },
      };

      // Proceed with middleware chain
      next();
    },
    checkSchema(taskValidationSchema),
    (req, res, next) => {
      // Get validation results
      const errors = validationResult(req);

      // If there are validation errors,
      if (!errors.isEmpty()) {
        // Attach errors to view locals
        res.locals.errors = errors.mapped();

        // Attach form values from previous submission
        res.locals.values = {
          name: validator.unescape(req.body.name ?? ''),
          description: validator.unescape(req.body.description ?? ''),
          startDate: req.body?.startDate
            ? DateTime.fromJSDate(req.body.startDate, {
                zone: 'utc',
              }).toISODate()
            : undefined,
          ...req.body.activeDays,
        };

        // Re-render task creation form
        res.render('tasks/new');
      } else {
        // Otherwise, proceed to next handler
        next();
      }
    },
    database,
    asyncHandler(async (req, res) => {
      // Instantiate task service
      const taskService = new TaskService(req.db);

      // Create task
      await taskService.create(req.user, req.body);

      // Close database connection
      await req.db.close();

      // Redirect to task listing (TODO: redirect to task that was just created)
      res.redirect('/tasks');
    })
  );

// Exports
export default taskRoutes;
