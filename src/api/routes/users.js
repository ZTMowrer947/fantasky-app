// Imports
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { checkSchema } from 'express-validator';
import passport from 'passport';

import UserSchema from '../../entities/UserSchema';
import database from '../../middleware/database';
import validateBody from '../middleware/validateBody';
import UserService from '../../services/UserService';
import { apiUserValidationSchema } from '../../validation/user';

// Router setup
const userRoutes = Router();

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
    checkSchema(apiUserValidationSchema),
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
