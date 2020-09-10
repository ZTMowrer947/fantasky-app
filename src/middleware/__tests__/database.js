// Imports
import httpMocks from 'node-mocks-http';
import { mocked } from 'ts-jest/utils';
import { getConnection } from 'typeorm';

import database from '../database';
import bootstrapDatabase from '../../bootstrapDatabase';

// Mocks
jest.mock('../../bootstrapDatabase');
const { selectDatabaseEnvironment } = jest.requireActual(
  '../../bootstrapDatabase'
);

// Setup function
function setup(req, res) {
  // Create middleware invocation function
  function invoke() {
    return new Promise((resolve, reject) => {
      database(req, res, (error) => {
        if (error) {
          return reject(error);
        }

        return resolve();
      });
    });
  }

  // Return invocation function
  return { invoke };
}

// Test Suite
describe('database middleware', () => {
  it('should properly set up database connection', async () => {
    // Setup HTTP mocks
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse({ req });

    // Setup middleware
    const { invoke } = setup(req, res);

    // Mock database bootstrap to use existing database connection rather than creating a new one
    mocked(bootstrapDatabase).mockImplementationOnce(async () => {
      // Get database environment
      const dbEnv = selectDatabaseEnvironment();

      // Retrieve connection for environment
      return getConnection(dbEnv);
    });

    // Invoke middleware and expect no errors
    await expect(invoke()).resolves.toBeUndefined();

    // Expect database bootstrapper to be called
    expect(bootstrapDatabase).toHaveBeenCalled();

    // Expect db property to be set on request
    expect(req).toHaveProperty(
      'db',
      getConnection(selectDatabaseEnvironment())
    );
  });

  it('should invoke next handler and pass an error if one occurs', async () => {
    // Setup HTTP mocks
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse({ req });

    // Setup middleware
    const { invoke } = setup(req, res);

    // Define error to throw
    const error = new Error('Oh noes!');

    // Mock database bootstrap to throw error
    mocked(bootstrapDatabase).mockRejectedValueOnce(error);

    // Invoke middleware and expect error to be thrown
    await expect(invoke()).rejects.toThrowError(error);
  });
});
