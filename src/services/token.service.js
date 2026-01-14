const { Token } = require('../models/token.model');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    getTokenExpiration
} = require('../libs/jwt.lib');
const { jwtConfig } = require('../configs/jwt.config');
const logger = require('../configs/logger.config');

/**
 * Generate authentication tokens (access + refresh)
 * @param {string} userId - User ID
 * @returns {Object} Token pair
 */
const generateAuthTokens = async (userId) => {
    const payload = { userId: userId.toString() };

    // Generate access token
    const accessToken = generateAccessToken(payload);

    // Generate refresh token with jti
    const { token: refreshToken, jti } = generateRefreshToken(payload);

    // Calculate expiration date
    const expiresAt = getTokenExpiration(jwtConfig.refreshToken.expiresIn);

    // Save refresh token to database
    await Token.create({
        token: refreshToken,
        jti,
        userId,
        type: 'refresh',
        expiresAt
    });

    logger.debug(`Generated auth tokens for user: ${userId}`);

    return {
        accessToken,
        refreshToken,
        expiresIn: {
            accessToken: jwtConfig.accessToken.expiresIn,
            refreshToken: jwtConfig.refreshToken.expiresIn
        }
    };
};

/**
 * Verify and validate a refresh token
 * @param {string} token - Refresh token
 * @returns {Object|null} Token document and decoded payload
 */
const verifyAndValidateRefreshToken = async (token) => {
    // Verify JWT signature
    const decoded = verifyRefreshToken(token);

    if (!decoded) {
        return null;
    }

    // Find token in database
    const tokenDoc = await Token.findValidToken(token);

    if (!tokenDoc) {
        return null;
    }

    return { tokenDoc, decoded };
};

/**
 * Revoke a specific refresh token
 * @param {string} token - Refresh token
 * @returns {boolean} Success status
 */
const revokeRefreshToken = async (token) => {
    const result = await Token.revokeToken(token);
    return !!result;
};

/**
 * Revoke all refresh tokens for a user
 * @param {string} userId - User ID
 * @returns {number} Number of tokens revoked
 */
const revokeAllUserTokens = async (userId) => {
    const result = await Token.revokeAllUserTokens(userId);
    logger.info(`Revoked ${result.modifiedCount} tokens for user: ${userId}`);
    return result.modifiedCount;
};

/**
 * Rotate refresh token (revoke old, generate new)
 * @param {string} oldToken - Old refresh token
 * @param {string} userId - User ID
 * @returns {Object} New token pair
 */
const rotateRefreshToken = async (oldToken, userId) => {
    // Revoke the old token
    await revokeRefreshToken(oldToken);

    // Generate new tokens
    return generateAuthTokens(userId);
};

/**
 * Get active token count for a user
 * @param {string} userId - User ID
 * @returns {number} Active token count
 */
const getActiveTokenCount = async (userId) => {
    return Token.countDocuments({
        userId,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
    });
};

/**
 * Clean up expired tokens
 * @returns {number} Number of tokens deleted
 */
const cleanupExpiredTokens = async () => {
    const result = await Token.cleanupTokens();
    if (result.deletedCount > 0) {
        logger.info(`Cleaned up ${result.deletedCount} expired tokens`);
    }
    return result.deletedCount;
};

module.exports = {
    generateAuthTokens,
    verifyAndValidateRefreshToken,
    revokeRefreshToken,
    revokeAllUserTokens,
    rotateRefreshToken,
    getActiveTokenCount,
    cleanupExpiredTokens
};
