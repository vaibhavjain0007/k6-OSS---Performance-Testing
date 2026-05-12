import { sleep }                    from 'k6'
import { Rate, Trend, Counter }     from 'k6/metrics'
import { getRequest, postRequest,
         randomItem, randomSleep }  from '../utils/helpersClaude.js'

// ── Custom Metrics ─────────────────────────────────────────────
const errorRate     = new Rate('error_rate')
const responseTime  = new Trend('response_time', true) // true = milliseconds
const totalRequests = new Counter('total_requests')

// ── Test Config ────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // ramp up
    { duration: '1m',  target: 10 },  // hold — normal load
    { duration: '30s', target: 0  },  // ramp down
  ],
  thresholds: {
    http_req_duration:  ['p(95)<500'],   // 95% under 500ms
    http_req_failed:    ['rate<0.01'],   // under 1% errors
    error_rate:         ['rate<0.05'],   // custom metric under 5%
  },
}

const endpoints = ['/posts', '/users', '/todos', '/albums']

const newPost = {
  userId: 1,
  title:  'k6 Load Test',
  body:   'Testing under normal load conditions',
}

// ── Virtual User Script ────────────────────────────────────────
export default function () {

  // Random GET from available endpoints — simulates real user browsing
  const endpoint = randomItem(endpoints)
  const getRes   = getRequest(endpoint)

  errorRate.add(getRes.status !== 200)
  responseTime.add(getRes.timings.duration)
  totalRequests.add(1)

  sleep(randomSleep(1, 2))

  // GET single post
  const singleRes = getRequest('/posts/1')
  errorRate.add(singleRes.status !== 200)
  totalRequests.add(1)

  sleep(1)

  // POST new resource
  const postRes = postRequest('/posts', newPost)
  errorRate.add(postRes.status !== 201)
  totalRequests.add(1)

  sleep(randomSleep(1, 3))
}