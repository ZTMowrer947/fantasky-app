// Imports
import httpMocks from 'node-mocks-http';
import { getConnection } from 'typeorm';

import database from '../database';
import { selectDatabaseEnvironment } from '../../bootstrapDatabase';

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

    // Invoke middleware and expect no errors
    await expect(invoke()).resolves.not.toThrow();

    // Expect db property to be set on request
    expect(req).toHaveProperty(
      'db',
      getConnection(selectDatabaseEnvironment())
    );
  });
});
