/* eslint-disable import/no-extraneous-dependencies */
// Imports
import { ensureLoggedIn } from 'connect-ensure-login';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { checkSchema, param, validationResult } from 'express-validator';
import createError from 'http-errors';
import { DateTime } from 'luxon';
import validator from 'validator';

import renderPage from '@/lib/helpers/renderPage';
import createTask from '@/lib/queries/tasks/createTask';
import deleteTask from '@/lib/queries/tasks/deleteTask';
import editTask from '@/lib/queries/tasks/editTask';
import fetchTask from '@/lib/queries/tasks/fetchTask';
import fetchTasks from '@/lib/queries/tasks/fetchTasks';
import toggleActivityForDay from '@/lib/queries/tasks/toggleActivityForDay';
import csrf from '@/middleware/csrf';
import TaskList from '@/pages/tasks';
import TaskDetail from '@/pages/tasks/[id]';
import DeleteTask from '@/pages/tasks/[id]/delete';
import EditTask from '@/pages/tasks/[id]/edit';
import NewTask from '@/pages/tasks/[id]/new';
import prisma from '@/prisma';
import { taskValidationSchema } from '@/validation/task';

// Express router setup
const taskRoutes = Router();

// Routes
taskRoutes
  .route('/') // /tasks
  .get(
    ensureLoggedIn('/login'),
    asyncHandler(async (req, res) => {
      const tasks = await fetchTasks(prisma, Number.parseInt(req.user.id, 10));

      // Render task listing for user
      res.locals.title = 'Tasks | Fantasky';
      res.send(renderPage(req, res, <TaskList tasks={tasks} />));
    })
  );

taskRoutes
  .route('/new')
  .get(ensureLoggedIn('/login'), csrf, (req, res) => {
    const initialValues = {
      startDate: DateTime.utc().toISODate(),
    };

    // Get CSRF token
    const csrfToken = req.csrfToken();

    // Render task creation form
    res.locals.title = 'New Task | Fantasky';
    res.send(
      renderPage(
        req,
        res,
        <NewTask csrfToken={csrfToken} prevValues={initialValues} />
      )
    );
  })
  .post(
    ensureLoggedIn('/login'),
    csrf,
    (req, res, next) => {
      // Get active days
      const {
        sunday,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        ...baseTask
      } = req.body;

      // Rearrange request body and sanitize active days
      req.body = {
        ...baseTask,
        activeDays: {
          sunday: validator.toBoolean(sunday ?? ''),
          monday: validator.toBoolean(monday ?? ''),
          tuesday: validator.toBoolean(tuesday ?? ''),
          wednesday: validator.toBoolean(wednesday ?? ''),
          thursday: validator.toBoolean(thursday ?? ''),
          friday: validator.toBoolean(friday ?? ''),
          saturday: validator.toBoolean(saturday ?? ''),
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
        // Set status to 400
        res.status(400);

        // Map validation errors
        const errorMap = errors.mapped();

        // Retrieve values from previous submission
        const prevValues = {
          name: req.body.name ?? '',
          description: req.body.description ?? '',
          startDate: req.body?.startDate
            ? DateTime.fromJSDate(req.body.startDate, {
                zone: 'utc',
              }).toISODate()
            : DateTime.utc().toISODate(),
          ...req.body.activeDays,
        };

        // Get CSRF token
        const csrfToken = req.csrfToken();

        // Render task creation form
        res.locals.title = 'New Task | Fantasky';
        res.send(
          renderPage(
            req,
            res,
            <NewTask
              csrfToken={csrfToken}
              prevValues={prevValues}
              errors={errorMap}
            />
          )
        );
      } else {
        // Otherwise, proceed to next handler
        next();
      }
    },
    asyncHandler(async (req, res) => {
      // Create task
      const { id } = await createTask(
        prisma,
        Number.parseInt(req.user.id, 10),
        req.body
      );

      // Redirect to detail page of newly created task
      res.redirect(`/tasks/${id}`);
    })
  );

taskRoutes
  .route('/:id') // /tasks/:id
  .all(param('id').toInt())
  .get(
    ensureLoggedIn('/login'),
    csrf,
    asyncHandler(async (req, res) => {
      // Retrieve task by id
      const task = await fetchTask(
        prisma,
        Number.parseInt(req.user.id, 10),
        req.params.id
      );

      // If task was not found,
      if (!task) {
        // Throw 404 error
        throw createError(404, 'The requested task cannot be found.');
      }

      // Get CSRF token
      const csrfToken = req.csrfToken();

      // Render task detail view
      res.locals.title = 'Task Details | Fantasky';
      res.send(
        renderPage(req, res, <TaskDetail task={task} csrfToken={csrfToken} />)
      );
    })
  )
  .post(
    ensureLoggedIn('/login'),
    csrf,
    asyncHandler(async (req, res) => {
      // Retrieve task by id
      const task = await fetchTask(
        prisma,
        Number.parseInt(req.user.id, 10),
        req.params.id
      );

      // If task was not found,
      if (!task) {
        // Throw 404 error
        throw createError(404, 'The requested task cannot be found.');
      }

      // Get current date
      const today = DateTime.utc().startOf('day').toJSDate();

      // Toggle association between day and date
      await toggleActivityForDay(
        prisma,
        Number.parseInt(req.user.id, 10),
        task,
        today
      );

      // Re-render task details
      res.redirect(`/tasks/${task.id}`);
    })
  );

taskRoutes
  .route('/:id/edit')
  .all(param('id').toInt())
  .get(
    ensureLoggedIn('/login'),
    csrf,
    asyncHandler(async (req, res) => {
      // Retrieve task by id
      const task = await fetchTask(
        prisma,
        Number.parseInt(req.user.id, 10),
        req.params.id
      );

      // If task was not found,
      if (!task) {
        // Throw 404 error
        throw createError(404, 'The requested task cannot be found.');
      }

      // Retrieve values from previous submission
      const prevValues = {
        name: task.name,
        description: task.description,
        startDate: DateTime.fromJSDate(task.startDate, {
          zone: 'utc',
        }).toISODate(),
        activeDays: task.activeDays,
      };

      // Get CSRF token
      const csrfToken = req.csrfToken();

      // Render task modification form
      res.locals.title = 'Edit Task | Fantasky';
      res.send(
        renderPage(
          req,
          res,
          <EditTask
            csrfToken={csrfToken}
            prevValues={prevValues}
            taskId={task.id}
          />
        )
      );
    })
  )
  .post(
    ensureLoggedIn('/login'),
    csrf,
    (req, res, next) => {
      // Get active days
      const {
        sunday,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        ...baseTask
      } = req.body;

      // Rearrange request body and sanitize active days
      req.body = {
        ...baseTask,
        activeDays: {
          sunday: validator.toBoolean(sunday ?? ''),
          monday: validator.toBoolean(monday ?? ''),
          tuesday: validator.toBoolean(tuesday ?? ''),
          wednesday: validator.toBoolean(wednesday ?? ''),
          thursday: validator.toBoolean(thursday ?? ''),
          friday: validator.toBoolean(friday ?? ''),
          saturday: validator.toBoolean(saturday ?? ''),
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
        // Set status to 400
        res.status(400);

        // Attach errors to view locals
        const errorsMap = errors.mapped();

        // Retrieve values from previous submission
        const prevValues = {
          name: req.body.name ?? '',
          description: req.body.description ?? '',
          startDate: req.body?.startDate
            ? DateTime.fromJSDate(req.body.startDate, {
                zone: 'utc',
              }).toISODate()
            : DateTime.utc().toISODate(),
          activeDays: req.body.activeDays,
        };

        // Get CSRF token
        const csrfToken = req.csrfToken();

        // Re-render task modification form
        res.locals.title = 'Edit Task | Fantasky';
        res.send(
          renderPage(
            req,
            res,
            <EditTask
              csrfToken={csrfToken}
              prevValues={prevValues}
              taskId={req.params.id}
              errors={errorsMap}
            />
          )
        );
      } else {
        // Otherwise, proceed to next handler
        next();
      }
    },
    asyncHandler(async (req, res) => {
      // Retrieve task by id
      const task = await fetchTask(
        prisma,
        Number.parseInt(req.user.id, 10),
        req.params.id
      );

      // If task was not found,
      if (!task) {
        // Throw 404 error
        throw createError(404, 'The requested task cannot be found.');
      }

      // Update task
      await editTask(prisma, task.id, req.body);

      // Redirect to detail page for task
      res.redirect(`/tasks/${task.id}`);
    })
  );

taskRoutes
  .route('/:id/delete')
  .all(param('id').toInt())
  .get(
    ensureLoggedIn('/login'),
    csrf,
    asyncHandler(async (req, res) => {
      // Retrieve task by id
      const task = await fetchTask(
        prisma,
        Number.parseInt(req.user.id, 10),
        req.params.id
      );

      // If task was not found,
      if (!task) {
        // Throw 404 error
        throw createError(404, 'The requested task cannot be found.');
      }

      // Extract needed task data for view
      const taskInfo = {
        id: task.id,
        name: task.name,
      };

      // Get CSRF token
      const csrfToken = req.csrfToken();

      // Render deletion confirmation
      res.locals.title = 'DELETING Task | Fantasky';
      res.send(
        renderPage(
          req,
          res,
          <DeleteTask csrfToken={csrfToken} task={taskInfo} />
        )
      );
    })
  )
  .post(
    ensureLoggedIn('/login'),
    csrf,
    asyncHandler(async (req, res) => {
      // Retrieve task by id
      const task = await fetchTask(
        prisma,
        Number.parseInt(req.user.id, 10),
        req.params.id
      );

      // If task was not found,
      if (!task) {
        // Throw 404 error
        throw createError(404, 'The requested task cannot be found.');
      }

      // Delete task
      await deleteTask(prisma, task.id);

      // Redirect to task listing
      res.redirect('/tasks');
    })
  );

// Exports
export default taskRoutes;
