/* eslint-disable import/no-extraneous-dependencies */
// Imports
import { ensureLoggedIn } from 'connect-ensure-login';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { checkSchema, param, validationResult } from 'express-validator';
import createError from 'http-errors';
import { DateTime, Interval } from 'luxon';
import validator from 'validator';

import {
  deserializeDaysToRepeat,
  formatDaysToRepeat,
} from '@/lib/helpers/days';
import createTask from '@/lib/queries/tasks/createTask';
import deleteTask from '@/lib/queries/tasks/deleteTask';
import editTask from '@/lib/queries/tasks/editTask';
import fetchTask from '@/lib/queries/tasks/fetchTask';
import fetchTasks from '@/lib/queries/tasks/fetchTasks';
import toggleActivityForDay from '@/lib/queries/tasks/toggleActivityForDay';
import csrf from '@/middleware/csrf';
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
      const prismaTasks = await fetchTasks(
        prisma,
        Number.parseInt(req.user.id, 10)
      );

      // Map tasks into view model data
      res.locals.tasks = prismaTasks.map((task) => {
        const activeDays = deserializeDaysToRepeat(task.daysToRepeat);

        // Calculate active days
        const activeDayString = formatDaysToRepeat(activeDays);

        return {
          id: task.id,
          name: task.name,
          activeDays: activeDayString,
        };
      });

      // Render task listing for user
      res.render('tasks/index');
    })
  );

taskRoutes
  .route('/new')
  .get(ensureLoggedIn('/login'), csrf, (req, res) => {
    res.locals.values = {
      startDate: DateTime.utc().toISODate(),
    };

    // Attach CSRF token to view locals
    res.locals.csrfToken = req.csrfToken();

    // Render task creation form
    res.render('tasks/new');
  })
  .post(
    ensureLoggedIn('/login'),
    csrf,
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
        // Set status to 400
        res.status(400);

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

        // Attach CSRF token to view locals
        res.locals.csrfToken = req.csrfToken();

        // Re-render task creation form
        res.render('tasks/new');
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

      const activeDays = deserializeDaysToRepeat(task.daysToRepeat);

      // Calculate active days
      const activeDayString = formatDaysToRepeat(activeDays);

      const days = task.tasksToDays.map((taskToDay) =>
        DateTime.fromJSDate(taskToDay.day.date, { zone: 'utc' })
      );

      const reversedStreakStartIndex = [...days]
        .reverse()
        .findIndex((day, idx, array) => {
          const nextDay = idx < array.length - 1 ? array[idx + 1] : null;

          return nextDay && day.plus({ days: 1 }).equals(nextDay);
        });
      const streakStartIndex =
        reversedStreakStartIndex >= 0
          ? days.length - 1 - reversedStreakStartIndex
          : reversedStreakStartIndex;

      const streak = days.slice(streakStartIndex);

      // Determine streak text
      const streakText =
        streak.length > 0
          ? `Streak ongoing since ${streak[0].toLocaleString(
              DateTime.DATE_SHORT
            )}`
          : 'No Streak';

      // Declare variable for Saturday in week that today falls into
      const nextSaturday = DateTime.utc()
        .endOf('week')
        .startOf('day')
        .minus({ days: 1 });

      // Get the Sunday after the present/future Saturday, then back up three weeks
      const sundayThreeWeeksAgo = nextSaturday.minus({ days: 20 });

      // Define the interval between the Sunday three weeks ago and the present/future Saturday
      const chartInterval = Interval.fromDateTimes(
        sundayThreeWeeksAgo,
        nextSaturday.plus({ days: 1 })
      );

      // Split the interval up by days, then reverse it
      const pastThreeWeeks = chartInterval
        .splitBy({ weeks: 1 })
        .map((weekInterval) =>
          weekInterval.splitBy({ days: 1 }).map((dayInterval) => {
            // Get start date of interval
            const day = dayInterval.start;

            // Format date as numeric months and day
            return {
              date: day.toLocaleString({ day: 'numeric', month: 'numeric' }),
              marked: streak.some((streakDay) => streakDay.equals(day)),
            };
          })
        );

      // Define task view data
      res.locals.task = {
        id: task.id,
        name: task.name,
        description: task.description,
        activeDays: activeDayString,
        streak: streakText,
      };

      res.locals.activity = pastThreeWeeks;

      // Attach CSRF token to view locals
      res.locals.csrfToken = req.csrfToken();

      // Render task detail view
      res.render('tasks/detail');
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

      // Convert binary day representation into boolean values
      const activeDays = deserializeDaysToRepeat(task.daysToRepeat);

      // Define local data for view
      res.locals.values = {
        name: task.name,
        description: task.description,
        startDate: DateTime.fromJSDate(task.startDate, {
          zone: 'utc',
        }).toISODate(),
        ...activeDays,
      };
      res.locals.taskId = task.id;

      // Attach CSRF token to view locals
      res.locals.csrfToken = req.csrfToken();

      // Render task modification form
      res.render('tasks/edit');
    })
  )
  .post(
    ensureLoggedIn('/login'),
    csrf,
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
        // Set status to 400
        res.status(400);

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

        // Attach CSRF token to view locals
        res.locals.csrfToken = req.csrfToken();

        // Re-render task modification form
        res.render('tasks/edit');
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

      // Attach needed task data for view
      res.locals.task = {
        id: task.id,
        name: task.name,
      };

      // Attach CSRF token to view locals
      res.locals.csrfToken = req.csrfToken();

      // Render deletion confirmation
      res.render('tasks/delete');
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
