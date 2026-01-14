const mongoose = require('mongoose');

const TOKEN_TYPES = ['refresh'];

const tokenSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: [true, 'Token is required'],
            index: true
        },
        jti: {
            type: String,
            required: [true, 'Token ID (jti) is required'],
            unique: true,
            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true
        },
        type: {
            type: String,
            enum: {
                values: TOKEN_TYPES,
                message: 'Token type must be: refresh'
            },
            required: [true, 'Token type is required'],
            default: 'refresh'
        },
        expiresAt: {
            type: Date,
            required: [true, 'Expiration date is required']
        },
        isRevoked: {
            type: Boolean,
            default: false
        },
        revokedAt: {
            type: Date,
            default: null
        },
        deviceInfo: {
            type: String,
            default: null
        },
        ipAddress: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                delete ret.__v;
                return ret;
            }
        }
    }
);

// Compound indexes
tokenSchema.index({ userId: 1, type: 1 });
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-cleanup

/**
 * Find valid token by token string
 * @param {string} token - Token string
 * @returns {Promise<Token|null>}
 */
tokenSchema.statics.findValidToken = function (token) {
    return this.findOne({
        token,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
    });
};

/**
 * Find valid token by jti
 * @param {string} jti - Token ID
 * @returns {Promise<Token|null>}
 */
tokenSchema.statics.findByJti = function (jti) {
    return this.findOne({
        jti,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
    });
};

/**
 * Revoke a token
 * @param {string} token - Token string
 * @returns {Promise<Token|null>}
 */
tokenSchema.statics.revokeToken = async function (token) {
    return this.findOneAndUpdate(
        { token },
        { isRevoked: true, revokedAt: new Date() },
        { new: true }
    );
};

/**
 * Revoke all tokens for a user
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Object>}
 */
tokenSchema.statics.revokeAllUserTokens = async function (userId) {
    const result = await this.updateMany(
        { userId, isRevoked: false },
        { isRevoked: true, revokedAt: new Date() }
    );
    return result;
};

/**
 * Clean up expired and revoked tokens
 * @returns {Promise<Object>}
 */
tokenSchema.statics.cleanupTokens = async function () {
    const result = await this.deleteMany({
        $or: [
            { expiresAt: { $lt: new Date() } },
            { isRevoked: true, revokedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        ]
    });
    return result;
};

const Token = mongoose.model('Token', tokenSchema);

module.exports = { Token, TOKEN_TYPES };
