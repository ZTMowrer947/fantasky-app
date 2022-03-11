// Imports
import fetchUser from '@/lib/queries/user/fetchUser';
import prisma from '@/prisma';

// Validation schemas
/**
 * @type {import("express-validator").Schema}
 */
const apiUserValidationSchema = {
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
      async options(emailAddress) {
        // Check if a user with this email already exists
        const user = await fetchUser(prisma, emailAddress);

        // If an account is using this email address,
        if (user) {
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
};

/**
 * @type {import("express-validator").Schema}
 */
const frontendUserValidationSchema = {
  ...apiUserValidationSchema,
  confirmPassword: {
    in: ['body'],
    trim: true,
    notEmpty: {
      errorMessage: 'Password Confirmation is required',
    },
    custom: {
      errorMessage: 'Passwords do not match',
      options(value, { req }) {
        return value === req.body.password;
      },
    },
  },
};

// Exports
export { apiUserValidationSchema, frontendUserValidationSchema };
