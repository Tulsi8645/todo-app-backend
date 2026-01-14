/**
 * Standardized API Response class for consistent response format
 */
class ApiResponse {
    /**
     * Creates an ApiResponse instance
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Response message
     * @param {*} data - Response data
     * @param {Object} meta - Additional metadata (pagination, etc.)
     */
    constructor(statusCode, message, data = null, meta = null) {
        this.success = statusCode >= 200 && statusCode < 300;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.meta = meta ? { ...meta, timestamp: new Date().toISOString() } : { timestamp: new Date().toISOString() };
    }

    /**
     * Creates a 200 OK response
     * @param {string} message - Response message
     * @param {*} data - Response data
     * @param {Object} meta - Additional metadata
     * @returns {ApiResponse}
     */
    static ok(message = 'Success', data = null, meta = null) {
        return new ApiResponse(200, message, data, meta);
    }

    /**
     * Creates a 201 Created response
     * @param {string} message - Response message
     * @param {*} data - Response data
     * @returns {ApiResponse}
     */
    static created(message = 'Resource created successfully', data = null) {
        return new ApiResponse(201, message, data);
    }

    /**
     * Creates a 204 No Content response
     * @param {string} message - Response message
     * @returns {ApiResponse}
     */
    static noContent(message = 'Resource deleted successfully') {
        return new ApiResponse(204, message);
    }

    /**
     * Creates a paginated response
     * @param {Array} data - Array of items
     * @param {Object} pagination - Pagination info
     * @param {string} message - Response message
     * @returns {ApiResponse}
     */
    static paginated(data, pagination, message = 'Data retrieved successfully') {
        return new ApiResponse(200, message, data, { pagination });
    }

    /**
     * Sends the response
     * @param {Object} res - Express response object
     * @returns {Object}
     */
    send(res) {
        const response = {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message
        };

        if (this.data !== null && this.data !== undefined) {
            response.data = this.data;
        }

        if (this.meta) {
            response.meta = this.meta;
        }

        return res.status(this.statusCode).json(response);
    }
}

module.exports = ApiResponse;
