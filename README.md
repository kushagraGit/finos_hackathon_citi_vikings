# App Directory for FDC3

## Overview

An application directory (appD) is a structured repository of information about apps that can be used in an FDC3-enabled desktop. In other words, it’s a convenient way of storing and managing metadata about apps in your ecosystem.

## Table of Contents

-   [Features](#features)
-   [Prerequisites](#prerequisites)
-   [Getting Started](#getting-started)
-   [Configuration](#configuration)
-   [API Documentation](#api-documentation)
-   [Development](#development)
-   [Testing](#testing)
-   [Deployment](#deployment)
-   [Contributing](#contributing)

## Features

-   User CRUD operations
-   Health monitoring endpoints
-   MongoDB integration
-   Environment-based configuration
-   Seed data support
-   Docker support

## Prerequisites

-   Node.js (v14 or higher)
-   MongoDB
-   npm or yarn
-   Docker (optional)

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/kushagraGit/finos_hackathon_citi_vikings.git

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

Once the server is running, you can access the Swagger documentation at:

```
http://localhost:8080/api-docs
```

Detailed documentation is available for:

-   [Health Check Documentation](./docs/health-check.md)
-   [User API Documentation](./docs/user-api.md)
-   [Deployment Guide](./docs/deployment.md)

### Quick API Reference

```bash
# User endpoints
GET    /v1/users          # Get all users
POST   /v1/users          # Create user
GET    /v1/users/:email   # Get user by email
PATCH  /v1/users/:email   # Update user
DELETE /v1/users/:email   # Delete user
POST  /v1/users/initialize #Initialize users (Development only)

# Health check endpoints
GET    /v1/health         # Basic health check
GET    /v1/health/detailed # Detailed health status

#Application endpoints
POST  /api/v2/apps              #Create a new application
GET   /api/v2/apps              #Retrieve all application definitions
GET   /api/v2/apps/{appId}      #Retrieve an application definition by appId
PATCH  /api/v2/apps/{appId}     #Update an application by appId
DELETE /api/v2/apps/{appId}     #Delete an application by appId
POST  /api/v2/apps/search       #Search applications based on multiple criteria
POST  /api/v2/apps/initialize   #Initialize applications with sample data (Development only)
```

## Development

In the project directory, you can run:

### `npm start`

Runs the app in production mode.

```bash
npm start
```

### `npm run dev`

Runs the app in development mode with hot reload.

```bash
npm run dev
```

### `npm test`

Launches the test runner.

```bash
npm test
```

### `npm run seed`

Seeds both users and applications data in development mode.

```bash
npm run seed
```

### `npm run seed:users`

Seeds only user data in development mode. This will create default users with the following data:

```bash
npm run seed:users
```

Example users created:

-   Vishal Gautam (Admin)
-   Kushagra Asthana
-   Yousuf Ejaz Ahmad

### `npm run seed:apps`

Seeds only application data in development mode. This will create default FDC3 applications:

```bash
npm run seed:apps
```

Example applications created:

-   FDC3 Workbench
-   Trading View
-   Market Data Terminal

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=8080
HOST=localhost
NODE_ENV=development # Options: development, production, test

# MongoDB Configuration
MONGODB_URL=your_mongodb_connection_string
```

## Development Notes

1. The seed commands are only available in development mode
2. Running in development mode (`npm run dev`) will automatically seed the data
3. Seed commands can be run multiple times safely (they check for duplicates)
4. Production mode disables seeding functionality

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

-   Project Maintainer: Vishal Gautam, Yousuf Ejaz Ahmad, Kushagra Asthana
-   Email: <Vishalgautam.tech@gmail.com>, <ejazahmadyousuf2@gmail.com>, <kushagra.asthana@gmail.com>

## Acknowledgments

-   MongoDB Team
-   Express.js Team
-   Node.js Community
