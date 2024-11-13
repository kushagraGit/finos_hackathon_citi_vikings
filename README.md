# User Service API

## Overview

A RESTful service for managing user data with health monitoring capabilities.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Features

- User CRUD operations
- Health monitoring endpoints
- MongoDB integration
- Environment-based configuration
- Seed data support
- Docker support

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Docker (optional)

## Getting Started

### Installation

```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Running the Application

```bash
# Development mode
npm run dev

# Production mode
npm start

# Seed initial data
npm run seed
```

## Configuration

Configure the application using environment variables:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# MongoDB Configuration
MONGODB_URL=your_mongodb_connection_string
```

## API Documentation

Detailed documentation is available for:

- [Health Check Documentation](./docs/health-check.md)
- [User API Documentation](./docs/user-api.md)
- [Deployment Guide](./docs/deployment.md)

### Quick API Reference

```bash
# User endpoints
GET    /v1/users          # Get all users
POST   /v1/users          # Create user
GET    /v1/users/:email   # Get user by email
PATCH  /v1/users/:email   # Update user
DELETE /v1/users/:email   # Delete user

# Health check endpoints
GET    /v1/health         # Basic health check
GET    /v1/health/detailed # Detailed health status
```

## Development

### Running in Development Mode

```bash
npm run dev
```

### Code Style

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Docker

```bash
# Build Docker image
docker build -t user-service .

# Run Docker container
docker run -p 8080:8080 user-service
```

### Docker Compose

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- Project Maintainer: [Your Name]
- Email: [your.email@example.com]

## Acknowledgments

- MongoDB Team
- Express.js Team
- Node.js Community
