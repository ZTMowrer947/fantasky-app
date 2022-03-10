/* eslint-disable import/no-extraneous-dependencies */
// Imports
import { PrismaClient } from '@prisma/client';
import { ensureLoggedIn } from 'connect-ensure-login';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { checkSchema, param, validationResult } from 'express-validator';
import createError from 'http-errors';
import { DateTime, Interval } from 'luxon';
import validator from 'validator';

import Day from '@/entities/Day';
import {
  deserializeDaysToRepeat,
  formatDaysToRepeat,
} from '@/lib/helpers/days';
import fetchTasks from '@/lib/queries/tasks/fetchTasks';
import csrf from '@/middleware/csrf';
import database from '@/middleware/database';
import TaskService from '@/services/TaskService';
import { taskValidationSchema } from '@/validation/task';

// Express router setup
const taskRoutes = Router();

// Routes
taskRoutes
  .route('/') // /tasks
  .get(
    ensureLoggedIn('/login'),
    asyncHandler(async (req, res) => {
      const prisma = new PrismaClient();

      const prismaTasks = await fetchTasks(
        prisma,
        Number.parseInt(req.user.id, 10)
      );

      await prisma.$disconnect();

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
    database,
    asyncHandler(async (req, res) => {
      // Instantiate task service
      const taskService = new TaskService(req.db);

      // Create task
      const id = await taskService.create(req.user, req.body);

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
    database,
    asyncHandler(async (req, res) => {
      // Instantiate task service
      const service = new TaskService(req.db);

      // Retrieve task by id
      const task = await service.findById(req.params.id);

      // If task was not found or is not owned by the logged-in user,
      if (task?.creator?.id !== req.user.id) {
        // Throw 404 error
        throw createError(
          404,
          'The requested task either does not exist or you do not have permission to access it.'
        );
      }

      const daysOfWeek = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      const weekDays = daysOfWeek.slice(1, 6);
      const weekends = [daysOfWeek[0], daysOfWeek[6]];

      // Convert binary day representation into boolean values
      const [activeDays] = Array.from({ length: 7 }).reduce(
        ([daysActive, daysBinary]) => {
          const dayIsActive = daysBinary % 2 !== 0;
          const quotient = Math.trunc(daysBinary / 2);

          return [[dayIsActive, ...daysActive], quotient];
        },
        [[], task.daysToRepeat]
      );

      // Convert boolean values into string representations
      const activeDayStrings = activeDays
        .map((dayActive, index) => {
          return dayActive ? daysOfWeek[index] : dayActive;
        })
        .filter((day) => day);

      // Join days together
      let activeDayString = 'Every '.concat(activeDayStrings.join(', '));

      // Replace with special text if days are the whole week, the weekdays, or the weekends
      if (activeDayStrings.length === activeDays.length) {
        activeDayString = 'Every day';
      } else if (
        activeDayStrings.length === 5 &&
        activeDayString === weekDays.join(', ')
      ) {
        activeDayString = 'Every weekday';
      } else if (
        activeDayStrings.length === 2 &&
        activeDayString === weekends.join(', ')
      ) {
        activeDayString = 'Every weekend';
      }

      const streak = [];

      for (let i = task.completedDays.length - 1; i >= 0; i -= 1) {
        // Get day being processed
        const day = task.completedDays[i];

        // Parse date as ISO date string
        const parsedDate = DateTime.fromISO(day.date, { zone: 'utc' });

        // If this is the last element in the array,
        if (i === task.completedDays.length - 1) {
          // Prepend to streak
          streak.unshift(parsedDate);
        } else {
          // Otherwise, determine date of next day
          const dayAfterParsedDate = parsedDate.plus({ days: 1 });

          // Get day of element immediately following this one
          const nextDay = task.completedDays[i + 1];

          // Parse date of that day
          const nextDate = DateTime.fromISO(nextDay.date, { zone: 'utc' });

          // If the dates match,
          if (nextDate.equals(dayAfterParsedDate)) {
            // Prepend current date to streak
            streak.unshift(parsedDate);
          } else {
            // Otherwise, stop here
            break;
          }
        }
      }

      // Determine streak text
      const streakText =
        streak.length > 0
          ? `Streak ongoing since ${streak[0].toLocaleString(
              DateTime.DATE_SHORT
            )}`
          : 'No Streak';

      // Declare variable for Saturday in week that today falls into
      let nextSaturday = DateTime.fromISO(DateTime.utc().toISODate(), {
        zone: 'utc',
      });

      while (nextSaturday.weekday !== 6) {
        nextSaturday = nextSaturday.plus({ days: 1 });
      }

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
    database,
    asyncHandler(async (req, res) => {
      // Instantiate task service
      const service = new TaskService(req.db);

      // Retrieve task by id
      const task = await service.findById(req.params.id);

      // If task was not found or is not owned by the logged-in user,
      if (task?.creator?.id !== req.user.id) {
        // Throw 404 error
        throw createError(
          404,
          'The requested task either does not exist or you do not have permission to access it.'
        );
      }

      // Get current date in ISO date format
      const today = DateTime.utc().toISODate();

      // Query for day with current date
      let day = await req.db.getRepository(Day).findOne({
        date: today,
      });

      // If day was not found, create it
      if (!day) {
        day = await req.db.getRepository(Day).save({
          date: today,
        });
      }

      // Toggle association between day and date
      await service.toggleForDay(task, day);

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
    database,
    asyncHandler(async (req, res) => {
      // Instantiate task service
      const service = new TaskService(req.db);

      // Retrieve task by id
      const task = await service.findById(req.params.id);

      // If task was not found or is not owned by the logged-in user,
      if (task?.creator?.id !== req.user.id) {
        // Throw 404 error
        throw createError(
          404,
          'The requested task either does not exist or you do not have permission to access it.'
        );
      }

      // Convert binary day representation into boolean values
      const [activeDays] = Array.from({ length: 7 }).reduce(
        ([daysActive, daysBinary]) => {
          const dayIsActive = daysBinary % 2 !== 0;
          const quotient = Math.trunc(daysBinary / 2);

          return [[dayIsActive, ...daysActive], quotient];
        },
        [[], task.daysToRepeat]
      );

      const [sun, mon, tue, wed, thu, fri, sat] = activeDays;

      // Define local data for view
      res.locals.values = {
        name: task.name,
        description: task.description,
        startDate: task.startDate,
        sun,
        mon,
        tue,
        wed,
        thu,
        fri,
        sat,
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
    database,
    asyncHandler(async (req, res) => {
      // Instantiate task service
      const service = new TaskService(req.db);

      // Retrieve task by id
      const task = await service.findById(req.params.id);

      // If task was not found or is not owned by the logged-in user,
      if (task?.creator?.id !== req.user.id) {
        // Throw 404 error
        throw createError(
          404,
          'The requested task either does not exist or you do not have permission to access it.'
        );
      }

      // Update task
      await service.update(task, req.body);

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
    database,
    asyncHandler(async (req, res) => {
      // Instantiate task service
      const service = new TaskService(req.db);

      // Retrieve task by id
      const task = await service.findById(req.params.id);

      // If task was not found or is not owned by the logged-in user,
      if (task?.creator?.id !== req.user.id) {
        // Throw 404 error
        throw createError(
          404,
          'The requested task either does not exist or you do not have permission to access it.'
        );
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
    database,
    asyncHandler(async (req, res) => {
      // Instantiate task service
      const service = new TaskService(req.db);

      // Retrieve task by id
      const task = await service.findById(req.params.id);

      // If task was not found or is not owned by the logged-in user,
      if (task?.creator?.id !== req.user.id) {
        // Throw 404 error
        throw createError(
          404,
          'The requested task either does not exist or you do not have permission to access it.'
        );
      }

      // Delete task
      await service.delete(task);

      // Redirect to task listing
      res.redirect('/tasks');
    })
  );

// Exports
export default taskRoutes;
