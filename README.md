# App Directory for FDC3

## Overview

An application directory (appD) is a structured repository of information about apps that can be used in an FDC3-enabled desktop. It provides a secure and efficient way of storing and managing metadata about apps in your ecosystem, with role-based access control and comprehensive API documentation.

## Features

### Core Features
- User authentication and authorization with JWT (RS256)
- Role-based access control (User, Admin, Editor, Desktop Agent)
- User and Application CRUD operations
- Application approval workflow
- Health monitoring endpoints
- MongoDB integration
- Environment-based configuration
- Seed data support
- Swagger API documentation

### Platform Support
- Cross-platform compatibility (Windows, macOS, Linux)

### Security Features
- JWT-based authentication with RS256 algorithm
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Request validation
- Error handling middleware
- CORS support

### Developer Features
- Hot reload in development mode
- Environment-based configuration
- Comprehensive error logging
- Testing support
- Seed data generation

### Seeding Commands

```bash
# Seed all data (users and applications)
npm run seed

# Seed only users
npm run seed:users
# Creates default users:
# - Vishal Gautam (Admin)
# - Kushagra Asthana (User)
# - Yousuf Ejaz Ahmad (User)

# Seed only applications
npm run seed:apps
# Creates default applications:
# - FDC3 Workbench
# - Trading View
# - Market Data Terminal
```

### Application Categories
- DEVELOPER_TOOLS
- TESTING
- TRADING
- ANALYTICS
- MARKET_DATA

### User Roles
- Admin: Full system access
- Editor: Can manage applications and content
- User: Basic access to applications
- Desktop Agent: Special access for FDC3 desktop agents

### API Features
- RESTful endpoints
- JSON payload support
- Search functionality
- Filtering capabilities
- Detailed error responses
- Rate limiting
- API versioning (v1, v2)


### Database Features
- MongoDB integration
- Schema validation
- Indexing for performance

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/kushagraGit/finos_hackathon_citi_vikings.git

# Install dependencies
npm install

# Copy environment file and update with your MongoDB URL
cp .env.example .env
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=8080
HOST=localhost
NODE_ENV=development

# MongoDB Configuration
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Running the Application

```bash
# Development mode (includes auto-seeding)
npm run dev

# Production mode
npm start
```

## API Documentation

Access the Swagger documentation at:
```
http://localhost:8080/api-docs
```

### Key Endpoints

#### Authentication
```bash
POST   /v1/users/login    # User login
```

#### User Management
```bash
POST   /v1/users          # Create user
GET    /v1/users          # Get all users (Admin only)
GET    /v1/users/:email   # Get user by email
PATCH  /v1/users/:email   # Update user (Admin/Editor)
DELETE /v1/users/:email   # Delete user (Admin only)
PATCH  /v1/users-approve  # Approve/reject user (Admin only)
```

#### Application Management
```bash
POST   /api/v2/apps              # Create application
GET    /api/v2/apps              # Get all applications
GET    /api/v2/apps/{appId}      # Get application by ID
PATCH  /api/v2/apps/{appId}      # Update application
DELETE /api/v2/apps/{appId}      # Delete application
POST   /api/v2/apps/search       # Search applications
PATCH  /api/v2/apps/approve      # Approve/reject application
```

#### Health Monitoring
```bash
GET    /v1/health         # Basic health check
GET    /v1/health/detailed # Detailed health status
GET    /v1/health/live    # Kubernetes liveness probe
GET    /v1/health/ready   # Kubernetes readiness probe
```

## Development Notes

1. The seed commands are only available in development mode
2. Development mode automatically seeds sample users and applications
3. Production mode disables seeding functionality
4. JWT tokens use RS256 algorithm with public/private key pairs
5. All endpoints (except login and health) require authentication

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

## Configuration

Configure the application using environment variables:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# MongoDB Configuration
MONGODB_URL=your_mongodb_connection_string
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

-   Project Maintainer: Vishal Gautam, Yousuf Ejaz Ahmad, Kushagra Asthana
-   Email: <Vishalgautam.tech@gmail.com>, <ejazahmadyousuf2@gmail.com>, <kushagra661@gmail.com>

## Acknowledgments

-   MongoDB Team
-   Express.js Team
-   Node.js Community
