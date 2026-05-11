# K6 Load Testing Project

A comprehensive example of load testing with k6, demonstrating best practices for API performance testing, custom metrics, and automated reporting.

## 📋 Overview

This project showcases a complete k6 load testing setup for a REST API. It includes:
- Multi-stage load testing scenarios
- Custom metrics and thresholds
- Reusable assertion helpers
- Automated HTML and console reporting
- GitHub Actions CI/CD integration

## 🏗️ Project Structure

```
k6-oss/
├── data/
│   └── testdata.json          # Test data for different user scenarios
├── reports/                   # Generated test reports (auto-created)
├── tests/
│   └── load-test.js           # Main load test script
├── utils/
│   └── helpers.js             # Reusable utility functions
├── .github/
│   └── workflows/
│       └── loadrun.yml        # GitHub Actions workflow
├── README.md                  # This file
└── package-lock.json          # Node.js dependencies (if any)
```

## 🚀 Quick Start

### Prerequisites

1. **Install k6**: Download from [k6.io](https://k6.io/docs/get-started/installation/)
   ```bash
   # Windows (using Chocolatey)
   choco install k6

   # Or download from: https://github.com/grafana/k6/releases
   ```

2. **Clone this repository**:
   ```bash
   git clone <repository-url>
   cd k6-oss
   ```

### Running the Load Test

1. **Basic execution**:
   ```bash
   k6 run tests/load-test.js
   ```

2. **With custom options**:
   ```bash
   # Run with different VU count
   k6 run --vus 10 --duration 30s tests/load-test.js

   # Generate JSON output
   k6 run --out json=reports/results.json tests/load-test.js
   ```

3. **View results**:
   - Console output shows real-time metrics
   - HTML report: `reports/summary.html`
   - JSON data: `reports/results.json` (if generated)

## 📊 Test Configuration

### Load Stages
The test runs in stages to simulate realistic load patterns:

1. **Ramp-up (20s)**: Gradually increase to 3 concurrent users
2. **Load (30s)**: Increase to 8 concurrent users
3. **Ramp-down (10s)**: Decrease back to 0 users

### Thresholds (SLOs)
- **Response Time**: 95% of requests < 500ms, 99% < 1000ms
- **Error Rate**: < 1% failed requests
- **Custom Metrics**: Additional application-specific thresholds

### Test Scenarios
1. **GET /posts/{id}**: Retrieve individual posts
2. **GET /users/{id}**: Fetch user information
3. **GET /comments?postId={id}**: Get comments for a post

## 🔧 Customization

### Modifying Test Data
Edit `data/testdata.json` to change test scenarios:
```json
[
  { "userId": 1, "postId": 1 },
  { "userId": 2, "postId": 11 }
]
```

### Adjusting Load Pattern
Modify the `stages` array in `tests/load-test.js`:
```javascript
stages: [
  { duration: '1m', target: 10 },   // Ramp up to 10 users
  { duration: '5m', target: 100 },  // Heavy load
  { duration: '1m', target: 0 },    // Ramp down
]
```

### Adding New Assertions
Extend `utils/helpers.js` with new validation functions:
```javascript
export function checkCustomValidation(response) {
  // Your custom logic here
  return true;
}
```

## 📈 Metrics and Monitoring

### Built-in Metrics
- `http_req_duration`: Request duration
- `http_req_failed`: Failed request rate
- `http_reqs`: Total requests

### Custom Metrics
- `errors`: Custom error rate
- `response_time`: Response time trend
- `success_requests`: Successful operations counter
- `concurrent_users`: Active users gauge

## 🤖 CI/CD Integration

### GitHub Actions
The project includes a GitHub Actions workflow (`.github/workflows/loadrun.yml`) that:
- Runs load tests on every push
- Generates and uploads HTML reports
- Sets status checks based on test results

### Local CI Simulation
```bash
# Run tests with summary export
k6 run --summary-export=reports/summary.json tests/load-test.js

# Check exit code for pass/fail
echo "Exit code: $?"
```

## 📚 Learning Resources

### k6 Concepts Covered
- **Modules**: ES6 import/export syntax
- **Options**: Test configuration and thresholds
- **Stages**: Load pattern definition
- **Checks**: Response validation
- **Metrics**: Custom performance tracking
- **Lifecycle**: setup/teardown functions
- **Reporting**: Custom summary generation

### Key Files Explained
- `tests/load-test.js`: Main test logic and scenarios
- `utils/helpers.js`: Reusable assertion functions
- `data/testdata.json`: Test data for parameterization
- `.github/workflows/loadrun.yml`: CI/CD automation

## 🐛 Troubleshooting

### Common Issues

1. **k6 not found**:
   ```bash
   k6 version  # Verify installation
   ```

2. **File not found errors**:
   - Ensure you're running from the project root
   - Check file paths in imports

3. **Test failures**:
   - Check API availability: `curl https://jsonplaceholder.typicode.com/posts/1`
   - Review thresholds in `options`

4. **Report generation fails**:
   - Ensure `reports/` directory exists
   - Check network connectivity for external modules

### Debug Mode
```bash
# Run with verbose output
k6 run --verbose tests/load-test.js

# Run single VU for debugging
k6 run --vus 1 --iterations 1 tests/load-test.js
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all checks pass
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Useful Links

- [k6 Documentation](https://k6.io/docs/)
- [k6 HTTP Testing](https://k6.io/docs/using-k6/http-requests/)
- [k6 Metrics](https://k6.io/docs/using-k6/metrics/)
- [k6 Thresholds](https://k6.io/docs/using-k6/thresholds/)
- [JSONPlaceholder API](https://jsonplaceholder.typicode.com/)