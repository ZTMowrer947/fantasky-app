// Validation schemas
/**
 * @type {import("express-validator").Schema}
 */
const taskValidationSchema = {
  name: {
    in: ['body'],
    notEmpty: {
      errorMessage: 'Name is required',
    },
    trim: true,
    escape: true,
  },
  description: {
    in: ['body'],
    trim: true,
    escape: true,
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
};

// Exports
// eslint-disable-next-line import/prefer-default-export
export { taskValidationSchema };
