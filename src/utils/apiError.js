/**
 * Custom API Error class for handling operational errors
 * @extends Error
 */
class ApiError extends Error {
    /**
     * Creates an ApiError instance
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Error message
     * @param {Array} errors - Array of detailed errors
     * @param {boolean} isOperational - Whether error is operational
     */
    constructor(statusCode, message, errors = [], isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
        this.isOperational = isOperational;
        this.success = false;

        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Creates a 400 Bad Request error
     * @param {string} message - Error message
     * @param {Array} errors - Detailed errors
     * @returns {ApiError}
     */
    static badRequest(message = 'Bad Request', errors = []) {
        return new ApiError(400, message, errors);
    }

    /**
     * Creates a 401 Unauthorized error
     * @param {string} message - Error message
     * @returns {ApiError}
     */
    static unauthorized(message = 'Unauthorized') {
        return new ApiError(401, message);
    }

    /**
     * Creates a 403 Forbidden error
     * @param {string} message - Error message
     * @returns {ApiError}
     */
    static forbidden(message = 'Forbidden') {
        return new ApiError(403, message);
    }

    /**
     * Creates a 404 Not Found error
     * @param {string} message - Error message
     * @returns {ApiError}
     */
    static notFound(message = 'Resource not found') {
        return new ApiError(404, message);
    }

    /**
     * Creates a 409 Conflict error
     * @param {string} message - Error message
     * @returns {ApiError}
     */
    static conflict(message = 'Resource already exists') {
        return new ApiError(409, message);
    }

    /**
     * Creates a 422 Validation error
     * @param {string} message - Error message
     * @param {Array} errors - Validation errors
     * @returns {ApiError}
     */
    static validationError(message = 'Validation failed', errors = []) {
        return new ApiError(422, message, errors);
    }

    /**
     * Creates a 429 Too Many Requests error
     * @param {string} message - Error message
     * @returns {ApiError}
     */
    static tooManyRequests(message = 'Too many requests, please try again later') {
        return new ApiError(429, message);
    }

    /**
     * Creates a 500 Internal Server error
     * @param {string} message - Error message
     * @returns {ApiError}
     */
    static internal(message = 'Internal server error') {
        return new ApiError(500, message, [], false);
    }

    /**
     * Converts error to JSON format
     * @returns {Object}
     */
    toJSON() {
        return {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            errors: this.errors.length > 0 ? this.errors : undefined,
            ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
        };
    }
}

module.exports = ApiError;
