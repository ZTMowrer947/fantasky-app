// Imports
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { checkSchema } from 'express-validator';
import passport from 'passport';

import UserSchema from '../../entities/UserSchema';
import database from '../../middleware/database';
import validateBody from '../../middleware/validateBody';
import UserService from '../../services/UserService';

// Router setup
const userRoutes = Router();

// User body validation schema
/**
 * @type {import("express-validator").Schema}
 */
const userValidationSchema = {
  firstName: {
    in: ['body'],
    notEmpty: {
      errorMessage: 'First Name is required',
    },
    trim: true,
  },
  lastName: {
    in: ['body'],
    trim: true,
    notEmpty: {
      errorMessage: 'Last Name is required',
    },
  },
  emailAddress: {
    in: ['body'],
    normalizeEmail: true,
    trim: true,
    notEmpty: {
      errorMessage: 'Email Address is required',
    },
    isEmail: {
      errorMessage: 'Email Address much be formatted as such',
    },
    custom: {
      async options(value, { req }) {
        // Get repository from database connection
        const repository = req.db.getRepository(UserSchema);

        // Check if any accounts are using the provided email address
        const emailCount = await repository.count({ emailAddress: value });

        // If an account is using this email address,
        if (emailCount > 0) {
          // Throw error
          throw new Error('The provided email address is already in use.');
        }
      },
    },
  },
  password: {
    in: ['body'],
    trim: true,
    notEmpty: {
      errorMessage: 'Password is required',
    },
    isLength: {
      options: {
        min: 16,
        max: 96,
      },
      errorMessage: 'Password must be between 16-96 characters in length',
    },
    custom: {
      options(value) {
        /*
         * Verify password has one of each of the following types of characters:
         * - Uppercase character
         * - Lowercase character
         * - Numeric digit
         * - Non-alphanumeric symbol
         */
        if (!/[A-Z]+/.test(value)) {
          throw new Error(
            'Password must contain at least one uppercase character'
          );
        } else if (!/[a-z]+/.test(value)) {
          throw new Error(
            'Password must contain at least one lowercase character'
          );
        } else if (!/\d+/.test(value)) {
          throw new Error('Password must contain at least one digit');
        } else if (!/[^A-Za-z\d\s]+/.test(value)) {
          throw new Error(
            'Password must contain at least one non-alphanumeric symbol'
          );
        }

        return true;
      },
    },
  },
  dob: {
    in: ['body'],
    trim: true,
    notEmpty: {
      errorMessage: 'Date of Birth is required',
    },
    isDate: {
      errorMessage: 'Date of Birth must be a valid date',
    },
    isBefore: {
      errorMessage: 'Date of Birth cannot be in the future',
    },
    toDate: true,
  },
};

// Routes
userRoutes
  .route('/') // /api/users
  .get(
    passport.authenticate('jwt', { session: false, failWithError: true }),
    (req, res) => {
      res.json(req.user);
    }
  )
  .post(
    database,
    checkSchema(userValidationSchema),
    validateBody,
    asyncHandler(async (req, res) => {
      // Create user service from connection
      const service = new UserService(req.db);

      // Retrieve user data from request body
      const userDto = req.body;

      // Attempt to create user
      await service.create(userDto);

      // Retrieve ID of newly created user
      const { id } = await req.db
        .getRepository(UserSchema)
        .createQueryBuilder('user')
        .select('user.id', 'id')
        .where('user.emailAddress = :emailAddress', {
          emailAddress: userDto.emailAddress,
        })
        .getRawOne();

      // Close database connection
      await req.db.close();

      // Construct and set location header
      const location = `/api/users/${id}`;
      res.header('Location', location);

      // Send 201 response
      res.status(201).json({ message: 'Created' });
    })
  );

// Exports
export default userRoutes;
