const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { jwtConfig } = require('../configs/jwt.config');

/**
 * Generates a unique token ID (jti)
 * @returns {string} Unique token ID
 */
const generateTokenId = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Generates an access token
 * @param {Object} payload - Token payload (user data)
 * @returns {string} JWT access token
 */
const generateAccessToken = (payload) => {
    return jwt.sign(
        {
            ...payload,
            type: 'access'
        },
        jwtConfig.accessToken.secret,
        {
            expiresIn: jwtConfig.accessToken.expiresIn,
            jwtid: generateTokenId()
        }
    );
};

/**
 * Generates a refresh token
 * @param {Object} payload - Token payload (user data)
 * @returns {Object} Token object with token string and jti
 */
const generateRefreshToken = (payload) => {
    const jti = generateTokenId();
    const token = jwt.sign(
        {
            ...payload,
            type: 'refresh'
        },
        jwtConfig.refreshToken.secret,
        {
            expiresIn: jwtConfig.refreshToken.expiresIn,
            jwtid: jti
        }
    );

    return { token, jti };
};

/**
 * Verifies an access token
 * @param {string} token - JWT access token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, jwtConfig.accessToken.secret);
        if (decoded.type !== 'access') {
            return null;
        }
        return decoded;
    } catch (error) {
        return null;
    }
};

/**
 * Verifies a refresh token
 * @param {string} token - JWT refresh token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, jwtConfig.refreshToken.secret);
        if (decoded.type !== 'refresh') {
            return null;
        }
        return decoded;
    } catch (error) {
        return null;
    }
};

/**
 * Decodes a token without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token or null
 */
const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
};

/**
 * Gets token expiration date
 * @param {string} expiresIn - Token expiry string (e.g., '15m', '7d')
 * @returns {Date} Expiration date
 */
const getTokenExpiration = (expiresIn) => {
    const now = Date.now();
    const match = expiresIn.match(/^(\d+)([smhd])$/);

    if (!match) {
        throw new Error('Invalid expiration format');
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers = {
        s: 1000,            // seconds
        m: 60 * 1000,       // minutes
        h: 60 * 60 * 1000,  // hours
        d: 24 * 60 * 60 * 1000  // days
    };

    return new Date(now + value * multipliers[unit]);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    decodeToken,
    getTokenExpiration,
    generateTokenId
};
