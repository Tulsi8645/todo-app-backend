const { verifyAccessToken } = require('../libs/jwt.lib');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw ApiError.unauthorized('Access token is required');
    }

    // Check for Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
        throw ApiError.unauthorized('Invalid token format. Use: Bearer <token>');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        throw ApiError.unauthorized('Access token is required');
    }

    // Verify the token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
        throw ApiError.unauthorized('Invalid or expired access token');
    }

    // Find the user
    const user = await User.findById(decoded.userId);

    if (!user) {
        throw ApiError.unauthorized('User not found');
    }

    if (!user.isActive) {
        throw ApiError.forbidden('Your account has been deactivated');
    }

    // Attach user to request
    req.user = {
        id: user._id,
        email: user.email,
        name: user.name
    };

    next();
});

/**
 * Optional authentication middleware
 * Attaches user to request if valid token present, otherwise continues
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    const decoded = verifyAccessToken(token);

    if (decoded) {
        const user = await User.findById(decoded.userId);

        if (user && user.isActive) {
            req.user = {
                id: user._id,
                email: user.email,
                name: user.name
            };
        }
    }

    next();
});

module.exports = {
    authenticate,
    optionalAuth
};
