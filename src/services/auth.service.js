const User = require('../models/user.model');
const tokenService = require('./token.service');
const ApiError = require('../utils/apiError');
const logger = require('../configs/logger.config');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} User object and tokens
 */
const register = async (userData) => {
    const { name, email, password } = userData;

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw ApiError.conflict('Email already registered');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password
    });

    logger.info(`New user registered: ${user.email}`);

    // Generate tokens
    const tokens = await tokenService.generateAuthTokens(user._id);

    return {
        user: user.toJSON(),
        tokens
    };
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} User object and tokens
 */
const login = async (email, password) => {
    // Find user with password
    const user = await User.findByEmail(email);

    if (!user) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
        throw ApiError.forbidden('Your account has been deactivated');
    }

    // Verify password
    const isMatch = await user.isPasswordMatch(password);
    if (!isMatch) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    logger.info(`User logged in: ${user.email}`);

    // Generate tokens
    const tokens = await tokenService.generateAuthTokens(user._id);

    return {
        user: user.toJSON(),
        tokens
    };
};

/**
 * Refresh authentication tokens
 * @param {string} refreshToken - Refresh token
 * @returns {Object} New tokens
 */
const refreshTokens = async (refreshToken) => {
    const result = await tokenService.verifyAndValidateRefreshToken(refreshToken);

    if (!result) {
        throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const { decoded } = result;

    // Check if user still exists and is active
    const user = await User.findById(decoded.userId);

    if (!user) {
        throw ApiError.unauthorized('User not found');
    }

    if (!user.isActive) {
        throw ApiError.forbidden('Your account has been deactivated');
    }

    // Rotate tokens
    const tokens = await tokenService.rotateRefreshToken(refreshToken, user._id);

    logger.debug(`Tokens refreshed for user: ${user.email}`);

    return tokens;
};

/**
 * Logout user (revoke refresh token)
 * @param {string} refreshToken - Refresh token to revoke
 */
const logout = async (refreshToken) => {
    const revoked = await tokenService.revokeRefreshToken(refreshToken);

    if (!revoked) {
        throw ApiError.badRequest('Invalid refresh token');
    }

    logger.debug('User logged out');
};

/**
 * Logout from all devices
 * @param {string} userId - User ID
 * @returns {number} Number of sessions revoked
 */
const logoutAll = async (userId) => {
    const count = await tokenService.revokeAllUserTokens(userId);
    logger.info(`User logged out from all devices: ${userId}`);
    return count;
};

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {Object} User object
 */
const getProfile = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    return user.toJSON();
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Object} Updated user object
 */
const updateProfile = async (userId, updates) => {
    const user = await User.findById(userId);

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    // Check if email is being updated and if it's already taken
    if (updates.email && updates.email !== user.email) {
        const isEmailTaken = await User.isEmailTaken(updates.email, userId);
        if (isEmailTaken) {
            throw ApiError.conflict('Email already registered');
        }
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'email'];
    allowedUpdates.forEach((field) => {
        if (updates[field] !== undefined) {
            user[field] = updates[field];
        }
    });

    await user.save();

    logger.info(`Profile updated for user: ${user.email}`);

    return user.toJSON();
};

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 */
const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId).select('+password');

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    // Verify current password
    const isMatch = await user.isPasswordMatch(currentPassword);
    if (!isMatch) {
        throw ApiError.unauthorized('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Revoke all existing tokens (force re-login)
    await tokenService.revokeAllUserTokens(userId);

    logger.info(`Password changed for user: ${user.email}`);
};

module.exports = {
    register,
    login,
    refreshTokens,
    logout,
    logoutAll,
    getProfile,
    updateProfile,
    changePassword
};
