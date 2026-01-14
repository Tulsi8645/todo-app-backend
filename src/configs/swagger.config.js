const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Todo App API',
            version: '1.0.0',
            description: 'A production-grade Todo application REST API with JWT authentication',
            contact: {
                name: 'API Support'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        name: { type: 'string', example: 'John Doe' },
                        email: { type: 'string', format: 'email', example: 'john@example.com' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Todo: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        title: { type: 'string', example: 'Complete project' },
                        description: { type: 'string', example: 'Finish the todo app' },
                        isCompleted: { type: 'boolean', default: false },
                        priority: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' },
                        dueDate: { type: 'string', format: 'date-time' },
                        userId: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        statusCode: { type: 'integer' },
                        message: { type: 'string' },
                        data: { type: 'object' }
                    }
                },
                ApiError: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        statusCode: { type: 'integer' },
                        message: { type: 'string' },
                        errors: { type: 'array', items: { type: 'object' } }
                    }
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        name: { type: 'string', minLength: 2, maxLength: 50, example: 'John Doe' },
                        email: { type: 'string', format: 'email', example: 'john@example.com' },
                        password: { type: 'string', minLength: 8, example: 'Password123!' }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'john@example.com' },
                        password: { type: 'string', example: 'Password123!' }
                    }
                },
                TokenResponse: {
                    type: 'object',
                    properties: {
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' }
                    }
                },
                RefreshRequest: {
                    type: 'object',
                    required: ['refreshToken'],
                    properties: {
                        refreshToken: { type: 'string' }
                    }
                },
                CreateTodoRequest: {
                    type: 'object',
                    required: ['title'],
                    properties: {
                        title: { type: 'string', minLength: 1, maxLength: 200, example: 'Complete project' },
                        description: { type: 'string', maxLength: 1000, example: 'Finish the todo app' },
                        priority: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' },
                        dueDate: { type: 'string', format: 'date-time' }
                    }
                },
                UpdateTodoRequest: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', minLength: 1, maxLength: 200 },
                        description: { type: 'string', maxLength: 1000 },
                        isCompleted: { type: 'boolean' },
                        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                        dueDate: { type: 'string', format: 'date-time' }
                    }
                }
            }
        },
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Todos', description: 'Todo management endpoints' }
        ]
    },
    apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = { swaggerSpec };