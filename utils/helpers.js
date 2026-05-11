// helpers.js - Utility functions for k6 load testing
// This file contains reusable helper functions to keep test scripts clean and maintainable.
// In k6, you can import ES6 modules like this to organize your code.

/**
 * Selects a random item from an array of test data.
 * This is useful for simulating different user scenarios in load tests.
 * @param {Array} testData - Array of test data objects
 * @returns {Object} Random test data item
 * @throws {Error} If testData is not a non-empty array
 */
export function getRandomTestData(testData) {
  if (!Array.isArray(testData) || testData.length === 0) {
    throw new Error('testData must be a non-empty array');
  }
  const index = Math.floor(Math.random() * testData.length);
  return testData[index];
}

/**
 * Logs a message with a prefix for easy identification in k6 output.
 * k6's console.log outputs to stdout, which is useful for debugging during test runs.
 * @param {string} message - The message to log
 */
export function logMessage(message) {
  console.log(`[load-test] ${message}`);
}

/**
 * Checks if HTTP response status matches expected value.
 * This is a common assertion in API testing - verifying the response code.
 * @param {Object} response - k6 HTTP response object
 * @param {number} expected - Expected status code (default: 200)
 * @returns {boolean} True if status matches
 */
export function checkStatus(response, expected = 200) {
  return response.status === expected;
}

/**
 * Checks if response time is below a maximum threshold.
 * Performance testing often includes response time validation.
 * @param {Object} response - k6 HTTP response object
 * @param {number} maxTime - Maximum allowed time in ms (default: 500)
 * @returns {boolean} True if response time is acceptable
 */
export function checkResponseTime(response, maxTime = 500) {
  return response.timings.duration < maxTime;
}

/**
 * Validates that JSON response contains required fields.
 * Useful for ensuring API responses have expected structure.
 * @param {Object} response - k6 HTTP response object
 * @param {Array<string>} fields - Array of required field names
 * @returns {boolean} True if all fields are present
 */
export function checkJsonFields(response, fields) {
  try {
    const body = JSON.parse(response.body);
    return fields.every(field => body.hasOwnProperty(field));
  } catch {
    return false;
  }
}

/**
 * Specific check for user email validation in JSON response.
 * Demonstrates custom validation logic beyond simple field presence.
 * @param {Object} response - k6 HTTP response object
 * @returns {boolean} True if email field exists and contains '@'
 */
export function checkUserEmail(response) {
  try {
    const body = JSON.parse(response.body);
    return body.email && body.email.includes('@');
  } catch {
    return false;
  }
}

/**
 * Checks if response is a non-empty array (useful for list endpoints).
 * Common pattern for validating collection responses.
 * @param {Object} response - k6 HTTP response object
 * @returns {boolean} True if response is array with length > 0
 */
export function checkCommentsArray(response) {
  try {
    const body = JSON.parse(response.body);
    return Array.isArray(body) && body.length > 0;
  } catch {
    return false;
  }
}
