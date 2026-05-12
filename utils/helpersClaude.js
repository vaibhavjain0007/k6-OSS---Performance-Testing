import http from 'k6/http'
import { check } from 'k6'

export const BASE_URL = 'https://jsonplaceholder.typicode.com'

export const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept':       'application/json',
}

// Reusable GET request with built-in checks
export function getRequest(endpoint) {
  const res = http.get(`${BASE_URL}${endpoint}`)

  check(res, {
    [`GET ${endpoint} — status 200`]:      (r) => r.status === 200,
    [`GET ${endpoint} — under 500ms`]:     (r) => r.timings.duration < 500,
    [`GET ${endpoint} — has body`]:        (r) => r.body.length > 0,
  })

  return res
}

// Reusable POST request with built-in checks
export function postRequest(endpoint, payload) {
  const res = http.post(
    `${BASE_URL}${endpoint}`,
    JSON.stringify(payload),
    { headers: defaultHeaders }
  )

  check(res, {
    [`POST ${endpoint} — status 201`]:    (r) => r.status === 201,
    [`POST ${endpoint} — under 800ms`]:   (r) => r.timings.duration < 800,
    [`POST ${endpoint} — returns id`]:    (r) => JSON.parse(r.body).id !== undefined,
  })

  return res
}

// Random item picker — for realistic randomised requests
export function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)]
}

// Random think time between min and max seconds
export function randomSleep(min = 1, max = 3) {
  return Math.random() * (max - min) + min
}