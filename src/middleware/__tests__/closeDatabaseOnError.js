// Imports
import createError from 'http-errors';
import httpMocks from 'node-mocks-http';

import closeDatabaseOnError from '../closeDatabaseOnError';

// Setup function
function setup(err, req, res) {
  // Create middleware invocation function
  function invoke() {
    return new Promise((resolve, reject) => {
      closeDatabaseOnError(err, req, res, (error) => {
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
describe('closeDatabaseOnError handler', () => {
  it('should not attempt to close the database connection if none is active, but still pass the error on', async () => {
    // Setup HTTP mocks
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse({ req });

    // Attach mock database object to request
    req.db = {
      isConnected: false,
      close: jest.fn(),
    };

    // Create error
    const error = createError(500);

    // Setup middleware
    const { invoke } = setup(error, req, res);

    // Invoke middleware and expect it to throw
    await expect(invoke()).rejects.toStrictEqual(error);

    // Expect database connection to have not been closed
    expect(req.db.close).not.toHaveBeenCalled();
  });

  it('should close the database connection if one is active, then pass the error on', async () => {
    // Setup HTTP mocks
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse({ req });

    // Attach mock database object to request
    req.db = {
      isConnected: true,
      close: jest.fn().mockResolvedValue(),
    };

    // Create error
    const error = createError(500);

    // Setup middleware
    const { invoke } = setup(error, req, res);

    // Invoke middleware and expect it to throw
    await expect(invoke()).rejects.toStrictEqual(error);

    // Expect database connection to have been closed
    expect(req.db.close).toHaveBeenCalled();
  });

  it('should, if an error occurs while closing the database connection, pass that error on instead of the one originally received', async () => {
    // Setup HTTP mocks
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse({ req });

    // Define errors
    const originalError = createError(500);
    const dbError = new Error('Error closing database connection');
    dbError.name = 'TEST_DatabaseConnectionError';

    // Attach mock database object to request, configuring close method to throw error
    req.db = {
      isConnected: true,
      close: jest.fn().mockRejectedValue(dbError),
    };

    // Setup middleware
    const { invoke } = setup(originalError, req, res);

    // Invoke middleware and expect it to throw error from database
    await expect(invoke()).rejects.toStrictEqual(dbError);

    // Expect middleware to have attempted to close database
    expect(req.db.close).toHaveBeenCalled();
  });
});
