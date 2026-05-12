// load-test.js - Comprehensive k6 load testing example
// This script demonstrates a complete load test for a REST API using k6.
// It covers: HTTP requests, custom metrics, checks, thresholds, and reporting.

// Import statements - k6 uses ES6 module syntax
// http: Core module for making HTTP requests
// check: Function to validate responses with multiple assertions
// sleep: Pauses execution between requests to simulate real user behavior
import http from 'k6/http';
import { check, sleep } from 'k6';
// Metrics: Custom metrics to track application-specific data
// Rate: Tracks error rates (percentage of failures)
// Trend: Tracks response times over time
// Counter: Counts successful requests
// Gauge: Tracks current values (like concurrent users)
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
// External modules: For generating HTML and text reports
// htmlReport: Generates detailed HTML reports
// textSummary: Provides console summary with colors
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
// Custom helpers: Reusable functions for data selection and assertions
import { getRandomTestData, logMessage, checkStatus, checkResponseTime, checkJsonFields, checkUserEmail, checkCommentsArray } from '../utils/helpers.js';

// Data loading: In k6, use open() to load files at initialization time
// This loads test data once, not per VU (Virtual User)
const testdata = JSON.parse(open('../data/testdata.json'));

// Configuration constants
// BASE_URL: The API endpoint being tested
const BASE_URL = 'https://jsonplaceholder.typicode.com';

// Custom metrics initialization
// These metrics provide detailed insights beyond k6's built-in metrics
const errorRate = new Rate('errors');           // Tracks custom error rate
const responseTime = new Trend('response_time'); // Custom response time trend
const successCounter = new Counter('success_requests'); // Counts successful operations
const loadGauge = new Gauge('concurrent_users'); // Tracks active users

// Test configuration - The 'options' object defines test behavior
export const options = {
  // Stages: Define load patterns over time
  // Each stage specifies duration and target number of VUs
  stages: [
    { duration: '20s', target: 3 },   // Ramp up to 3 users over 20 seconds
    { duration: '30s', target: 8 },   // Ramp up to 8 users over 30 seconds
    { duration: '10s', target: 0 },    // Ramp down to 0 users over 10 seconds
  ],
  // Thresholds: Define pass/fail criteria for the test
  // These are SLOs (Service Level Objectives) for your API
  thresholds: {
    // Built-in metrics thresholds
    'http_req_duration': ['p(95)<500', 'p(99)<1000'], // 95% under 500ms, 99% under 1000ms
    'http_req_failed': ['rate<0.01'],                   // Error rate below 1%
    // Custom metrics thresholds
    'errors': ['rate<0.01'],                             // Custom error rate below 1%
    'response_time': ['p(95)<500'],                     // Custom response time threshold
  },
};

// The main test function - executed by each VU for the test duration
export default function () {
  // Data selection: Get random test data for this iteration
  // This simulates different user scenarios
  const testUser = getRandomTestData(testdata);

  // Track concurrent users: Increment gauge for load monitoring
  loadGauge.add(1);

  // Test scenario 1: GET /posts endpoint
  // Make HTTP request to retrieve a specific post
  const getPostsResponse = http.get(`${BASE_URL}/posts/${testUser.postId}`);

  // Validation: Use check() to validate multiple aspects of the response
  // check() returns true if ALL assertions pass
  const getPostsCheck = check(getPostsResponse, {
    'GET /posts status is 200': checkStatus(getPostsResponse),                    // HTTP status validation
    'GET /posts response time < 500ms': checkResponseTime(getPostsResponse),      // Performance check
    'GET /posts has required fields': checkJsonFields(getPostsResponse, ['id', 'title', 'body']), // Data validation
  });

  // Metrics recording: Update custom metrics based on check results
  errorRate.add(!getPostsCheck);                    // Record error if check failed
  responseTime.add(getPostsResponse.timings.duration); // Record response time
  if (getPostsCheck) successCounter.add(1);         // Count successful requests

  // Pause: Simulate think time between requests
  sleep(1);

  // Test scenario 2: GET /users endpoint
  const getUsersResponse = http.get(`${BASE_URL}/users/${testUser.userId}`);

  const getUsersCheck = check(getUsersResponse, {
    'GET /users status is 200': checkStatus(getUsersResponse),
    'GET /users response time < 500ms': checkResponseTime(getUsersResponse),
    'GET /users has email': checkUserEmail(getUsersResponse), // Custom email validation
  });

  errorRate.add(!getUsersCheck);
  responseTime.add(getUsersResponse.timings.duration);
  if (getUsersCheck) successCounter.add(1);

  sleep(1);

  // Test scenario 3: GET /comments endpoint
  const getCommentsResponse = http.get(`${BASE_URL}/comments?postId=${testUser.postId}`);

  const getCommentsCheck = check(getCommentsResponse, {
    'GET /comments status is 200': checkStatus(getCommentsResponse),
    'GET /comments response time < 500ms': checkResponseTime(getCommentsResponse),
    'GET /comments returns array': checkCommentsArray(getCommentsResponse), // Array validation
  });

  errorRate.add(!getCommentsCheck);
  responseTime.add(getCommentsResponse.timings.duration);
  if (getCommentsCheck) successCounter.add(1);

  sleep(2);

  // Logging: Record completion for this VU iteration
  logMessage(`Test completed for userId: ${testUser.userId}, postId: ${testUser.postId}`);

  // Cleanup: Decrement concurrent users gauge
  loadGauge.add(-1);
}

// handleSummary: Custom summary generation after test completion
// This function allows generating multiple report formats
export function handleSummary(data) {
  return {
    // Console output: Colored text summary
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    // File output: HTML report saved to reports directory
    'reports/index.html': htmlReport(data),
  };
}