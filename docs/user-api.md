# User API Documentation

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Endpoints](#endpoints)
  - [Create User](#create-user)
  - [Get All Users](#get-all-users)
  - [Get User by Email](#get-user-by-email)
  - [Update User](#update-user)
  - [Delete User](#delete-user)
  - [Initialize Users](#initialize-users)
- [Error Handling](#error-handling)
- [Models](#models)

## Overview

This API provides CRUD operations for managing user data. All endpoints are prefixed with `/v1`.

## Base URL

```
http://localhost:8080/v1
```

## Endpoints

### Create User

Creates a new user in the system.

```http
POST /users
```

#### Request Body

```json
{
  "name": "Vishal Gautam",
  "email": "vishal.gautam@gmail.com",
  "password": "securePassword123",
  "age": 30
}
```

#### Success Response (201 Created)

```json
{
  "message": "User created successfully",
  "user": {
    "name": "Vishal Gautam",
    "email": "vishal.gautam@gmail.com",
    "age": 30,
    "_id": "507f1f77bcf86cd799439011",
    "createdAt": "2024-03-14T12:00:00.000Z",
    "updatedAt": "2024-03-14T12:00:00.000Z"
  }
}
```

#### Error Responses

- `409 Conflict`: User already exists
- `400 Bad Request`: Invalid input data

### Get All Users

Retrieves a list of all users.

```http
GET /users
```

#### Success Response (200 OK)

```json
{
  "count": 2,
  "users": [
    {
      "name": "Vishal Gautam",
      "email": "vishal.gautam@gmail.com",
      "age": 30,
      "_id": "507f1f77bcf86cd799439011"
    },
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "age": 28,
      "_id": "507f1f77bcf86cd799439012"
    }
  ]
}
```

### Get User by Email

Retrieves a specific user by their email address.

```http
GET /users/:email
```

#### Parameters

- `email`: User's email address (URL encoded)

#### Success Response (200 OK)

```json
{
  "name": "Vishal Gautam",
  "email": "vishal.gautam@gmail.com",
  "age": 30,
  "_id": "507f1f77bcf86cd799439011"
}
```

#### Error Response

- `404 Not Found`: User not found

### Update User

Updates an existing user's information.

```http
PATCH /users/:email
```

#### Parameters

- `email`: User's email address (URL encoded)

#### Request Body

```json
{
  "name": "Vishal Gautam",
  "age": 31
}
```

#### Allowed Updates

- `name`
- `password`
- `age`

#### Success Response (200 OK)

```json
{
  "message": "User updated successfully",
  "user": {
    "name": "Vishal Gautam",
    "email": "vishal.gautam@gmail.com",
    "age": 31,
    "_id": "507f1f77bcf86cd799439011"
  }
}
```

#### Error Responses

- `404 Not Found`: User not found
- `400 Bad Request`: Invalid updates

### Delete User

Removes a user from the system.

```http
DELETE /users/:email
```

#### Parameters

- `email`: User's email address (URL encoded)

#### Success Response (200 OK)

```json
{
  "message": "User deleted successfully",
  "user": {
    "name": "Vishal Gautam",
    "email": "vishal.gautam@gmail.com",
    "age": 30
  }
}
```

#### Error Response

- `404 Not Found`: User not found

### Initialize Users

Seeds the database with initial user data (Development only).

```http
POST /users/initialize
```

#### Success Response (201 Created)

```json
{
  "message": "Users initialized successfully"
}
```

#### Error Response

- `403 Forbidden`: Endpoint not available in production

## Error Handling

All endpoints return error responses in the following format:

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

### Common Error Codes

- `400`: Bad Request
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

## Models

### User Model

```typescript
{
  name: string;
  email: string;
  password: string;
  age: number;
  isAdmin?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Testing Examples

### Using cURL

```bash
# Create user
curl -X POST http://localhost:8080/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Vishal Gautam","email":"vishal.gautam@gmail.com","password":"secure123","age":30}'

# Get all users
curl http://localhost:8080/v1/users

# Get specific user
curl http://localhost:8080/v1/users/vishal.gautam@gmail.com

# Update user
curl -X PATCH http://localhost:8080/v1/users/vishal.gautam@gmail.com \
  -H "Content-Type: application/json" \
  -d '{"name":"Vishal Gautam","age":31}'

# Delete user
curl -X DELETE http://localhost:8080/v1/users/vishal.gautam@gmail.com
```

## Notes

- Password is never returned in responses
- Email is used as the unique identifier for users
- All timestamps are in ISO 8601 format
- The initialize endpoint is only available in development mode
