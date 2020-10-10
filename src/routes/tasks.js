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
      // Instantiate task service
      const service = new TaskService(req.db);

      // Retrieve tasks for user
      const tasks = await service.findAllForUser(req.user.id);

      // Close database connection
      await req.db.close();

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

      // Map tasks into view model data
      const taskViewData = tasks.map((task) => {
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
        } else if (activeDayStrings.length > 3) {
          const truncatedActiveDayStrings = activeDayStrings.map((day) =>
            day.substring(0, 3)
          );

          activeDayString = 'Every '.concat(
            truncatedActiveDayStrings.join(', ')
          );
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

        return {
          id: task.id,
          name: task.name,
          activeDays: activeDayString,
          streak: streakText,
        };
      });

      // Attach view data to locals
      res.locals.tasks = taskViewData;

      // Render task listing for user
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
