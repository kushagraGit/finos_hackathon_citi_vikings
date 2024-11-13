# Health Check Documentation

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Available Endpoints](#available-endpoints)
  - [Basic Health Check](#1-basic-health-check)
  - [Detailed Health Check](#2-detailed-health-check)
  - [Liveness Probe](#3-liveness-probe)
  - [Readiness Probe](#4-readiness-probe)
- [Testing Health Checks](#testing-health-checks)
- [Response Status Codes](#response-status-codes)
- [Use Cases](#use-cases)
- [Monitoring Best Practices](#monitoring-best-practices)
- [Integration Examples](#integration-examples)
- [Troubleshooting](#troubleshooting)

## Overview

This document describes the health check endpoints available in the User Service API. These endpoints help monitor the service's health, readiness, and performance metrics.

## Base URL

All health check endpoints are prefixed with `/v1/health`

## Available Endpoints

### 1. Basic Health Check

Quick check to verify if the service is running.

```bash
GET /v1/health
```

#### Response

```json
{
  "status": "healthy",
  "timestamp": "2024-03-14T12:00:00.000Z",
  "uptime": 123.45,
  "service": "user-service"
}
```

### 2. Detailed Health Check

Provides comprehensive information about the service's health, including memory usage and database connection status.

```bash
GET /v1/health/detailed
```

#### Response

```json
{
  "status": "healthy",
  "timestamp": "2024-03-14T12:00:00.000Z",
  "uptime": 123.45,
  "service": "user-service",
  "memory": {
    "usage": {
      "heapUsed": 12345678,
      "heapTotal": 23456789,
      "external": 1234567
    },
    "free": 11111111
  },
  "database": {
    "status": "connected",
    "healthy": true
  }
}
```

### 3. Liveness Probe

Used by container orchestration systems to determine if the service needs to be restarted.

```bash
GET /v1/health/live
```

#### Response

```json
{
  "status": "alive",
  "timestamp": "2024-03-14T12:00:00.000Z"
}
```

### 4. Readiness Probe

Used by container orchestration systems to determine if the service can receive traffic.

```bash
GET /v1/health/ready
```

#### Response

```json
{
  "status": "ready",
  "timestamp": "2024-03-14T12:00:00.000Z"
}
```

## Testing Health Checks

### Using cURL

```bash
# Basic health check
curl http://localhost:8080/v1/health

# Detailed health check
curl http://localhost:8080/v1/health/detailed

# Liveness probe
curl http://localhost:8080/v1/health/live

# Readiness probe
curl http://localhost:8080/v1/health/ready
```

### Continuous Monitoring

For Unix-based systems, use the `watch` command for continuous monitoring:

```bash
# Monitor basic health every 2 seconds
watch -n 2 'curl -s http://localhost:8080/v1/health'

# Monitor detailed health every 5 seconds
watch -n 5 'curl -s http://localhost:8080/v1/health/detailed'
```

## Response Status Codes

| Status Code | Description |
|------------|-------------|
| 200 | Service is healthy and functioning normally |
| 503 | Service is unavailable or not ready to handle requests |
| 500 | Internal server error during health check |

## Use Cases

### Basic Health Check (`/health`)

- Quick service status verification
- Load balancer health checks
- Basic monitoring systems

### Detailed Health Check (`/health/detailed`)

- System monitoring and debugging
- Resource usage tracking
- Performance monitoring
- Database connection status

### Liveness Probe (`/health/live`)

- Kubernetes liveness checks
- Container orchestration
- Service restart decisions

### Readiness Probe (`/health/ready`)

- Kubernetes readiness checks
- Traffic routing decisions
- Load balancer configuration

## Monitoring Best Practices

1. **Regular Checks**: Implement automated checks every 30-60 seconds
2. **Alerting**: Set up alerts for repeated health check failures
3. **Logging**: Log health check failures for debugging
4. **Metrics**: Track health check metrics over time
5. **Documentation**: Keep health check endpoints documented and updated

## Integration Examples

### Kubernetes Configuration

```yaml
livenessProbe:
  httpGet:
    path: /v1/health/live
    port: 8080
  initialDelaySeconds: 3
  periodSeconds: 3

readinessProbe:
  httpGet:
    path: /v1/health/ready
    port: 8080
  initialDelaySeconds: 3
  periodSeconds: 3
```

### Docker Compose Health Check

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/v1/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## Troubleshooting

### Common Issues

1. Database Connection Failures
   - Check MongoDB connection string
   - Verify network connectivity
   - Check database server status

2. Memory Issues
   - Monitor heap usage in detailed health check
   - Check for memory leaks
   - Consider scaling resources

3. Service Unavailable
   - Check application logs
   - Verify dependencies are running
   - Check system resources
