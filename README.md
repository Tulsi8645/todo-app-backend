# Todo App Backend

A production-grade RESTful API for a Todo application built with Node.js, Express, MongoDB, and JWT authentication.

## Features

- 🔐 **JWT Authentication** - Access & refresh token rotation with secure token storage
- ✅ **Complete CRUD** - Full todo management with priorities, due dates, and tags
- 📄 **Pagination & Filtering** - Search, filter, and sort todos efficiently
- 📊 **Statistics Dashboard** - Track completion rates and priority distribution
- ✨ **Zod Validation** - Runtime request validation with detailed error messages
- 📚 **OpenAPI/Swagger** - Interactive API documentation
- 🧪 **Comprehensive Testing** - Unit and E2E tests with MongoDB Memory Server
- 📝 **Structured Logging** - Production-ready logging with Pino

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | MongoDB with Mongoose |
| Authentication | JWT (Access + Refresh tokens) |
| Validation | Zod |
| Documentation | Swagger/OpenAPI |
| Logging | Pino |
| Testing | Jest, Supertest |
| Security | Helmet, CORS, bcryptjs |

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6+ (local or Atlas)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd todo-app-backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
```

### Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todo-app
JWT_ACCESS_SECRET=your-32-char-secret-key-here-xxx
JWT_REFRESH_SECRET=your-32-char-refresh-key-here-x
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=http://localhost:3000
```

### Running the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh tokens |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/logout-all` | Logout all devices |
| GET | `/api/auth/me` | Get profile |
| PATCH | `/api/auth/me` | Update profile |
| POST | `/api/auth/change-password` | Change password |

### Todos

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todos` | List todos (paginated) |
| POST | `/api/todos` | Create todo |
| GET | `/api/todos/:id` | Get single todo |
| PATCH | `/api/todos/:id` | Update todo |
| DELETE | `/api/todos/:id` | Delete todo |
| PATCH | `/api/todos/:id/toggle` | Toggle completion |
| GET | `/api/todos/stats` | Get statistics |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/docs` | Swagger UI |
| GET | `/api/docs.json` | OpenAPI spec |

## Request/Response Examples

### Register User

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-13T12:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbG...",
      "refreshToken": "eyJhbG...",
      "expiresIn": {
        "accessToken": "15m",
        "refreshToken": "7d"
      }
    }
  },
  "meta": {
    "timestamp": "2024-01-13T12:00:00.000Z"
  }
}
```

### Create Todo

**Request:**
```http
POST /api/todos
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive API docs",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "tags": ["documentation", "important"]
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Todo created successfully",
  "data": {
    "todo": {
      "_id": "...",
      "title": "Complete project documentation",
      "description": "Write comprehensive API docs",
      "priority": "high",
      "isCompleted": false,
      "dueDate": "2024-12-31T23:59:59.000Z",
      "tags": ["documentation", "important"],
      "userId": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  },
  "meta": {
    "timestamp": "..."
  }
}
```

### List Todos (with filters)

**Request:**
```http
GET /api/todos?page=1&limit=10&priority=high&isCompleted=false&search=project&sortBy=dueDate&sortOrder=asc
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Todos retrieved successfully",
  "data": [
    { "...todo1..." },
    { "...todo2..." }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "timestamp": "..."
  }
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed",
  "errors": [
    { "field": "body.email", "message": "Invalid email address" },
    { "field": "body.password", "message": "Password must be at least 8 characters" }
  ]
}
```

## Query Parameters for Todos

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page (max: 100) |
| sortBy | string | createdAt | Sort field |
| sortOrder | string | desc | Sort direction (asc/desc) |
| isCompleted | boolean | - | Filter by completion |
| priority | string | - | Filter by priority (low/medium/high) |
| search | string | - | Search in title/description |
| dueBefore | date | - | Filter todos due before date |
| dueAfter | date | - | Filter todos due after date |

## Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run E2E tests only
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## Project Structure

```
src/
├── app.js              # Express app setup
├── server.js           # Server entry point
├── configs/            # Configuration files
│   ├── db.config.js    # MongoDB connection
│   ├── env.config.js   # Environment validation
│   ├── jwt.config.js   # JWT settings
│   ├── logger.config.js # Pino logger
│   └── swagger.config.js # Swagger/OpenAPI
├── controllers/        # Request handlers
├── libs/               # Utility libraries
│   ├── jwt.lib.js      # JWT utilities
│   └── password.lib.js # Password hashing
├── middlewares/        # Express middlewares
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   └── validate.middleware.js
├── models/             # Mongoose schemas
├── routes/             # Route definitions
├── services/           # Business logic
├── utils/              # Helper utilities
│   ├── apiError.js     # Error class
│   ├── apiResponse.js  # Response class
│   └── asyncHandler.js # Async wrapper
└── validations/        # Zod schemas
tests/
├── setup.js            # Test setup
├── unit/               # Unit tests
└── e2e/                # E2E tests
```

## License

MIT
