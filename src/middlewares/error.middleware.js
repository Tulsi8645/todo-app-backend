const ApiError = require('../utils/apiError');
const logger = require('../configs/logger.config');

/**
 * 404 Not Found handler
 * Handles requests to undefined routes
 */
const notFoundHandler = (req, res, next) => {
    const error = ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`);
    next(error);
};

/**
 * Global error handler
 * Handles all errors and sends appropriate response
 */
const errorHandler = (err, req, res, next) => {
    // Default error values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = err.errors || [];
    let isOperational = err.isOperational || false;

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        statusCode = 422;
        message = 'Validation failed';
        isOperational = true;
        errors = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message
        }));
    }

    // Handle Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
        isOperational = true;
    }

    // Handle Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        isOperational = true;
        errors = [{ field, message }];
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
        isOperational = true;
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token has expired';
        isOperational = true;
    }

    // Log error
    if (isOperational) {
        logger.warn({
            statusCode,
            message,
            path: req.path,
            method: req.method
        });
    } else {
        logger.error({
            statusCode,
            message,
            stack: err.stack,
            path: req.path,
            method: req.method
        });
    }

    // Build response
    const response = {
        success: false,
        statusCode,
        message
    };

    if (errors.length > 0) {
        response.errors = errors;
    }

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development' && err.stack) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = {
    notFoundHandler,
    errorHandler
};
