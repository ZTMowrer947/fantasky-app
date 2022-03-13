import { Schema } from 'express-validator';

// Validation schema
const taskValidationSchema: Schema = {
  name: {
    in: ['body'],
    notEmpty: {
      errorMessage: 'Name is required',
    },
    trim: true,
  },
  description: {
    in: ['body'],
    trim: true,
  },
  activeDays: {
    in: ['body'],
    custom: {
      errorMessage: 'At least one day must be marked active',
      options(value) {
        // Ensure that at least one day is marked as active
        return Object.values(value).some((val) => !!val);
      },
    },
  },
  startDate: {
    in: ['body'],
    trim: true,
    notEmpty: {
      errorMessage: 'Start date is required',
    },
    isDate: {
      errorMessage: 'Start date must be a valid date',
    },
    toDate: true,
  },
};

// Exports
// eslint-disable-next-line import/prefer-default-export
export { taskValidationSchema };
