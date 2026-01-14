const mongoose = require('mongoose');
const { hashPassword, comparePassword } = require('../libs/password.lib');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                'Please provide a valid email address'
            ]
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false // Don't include password in queries by default
        },
        isActive: {
            type: Boolean,
            default: true
        },
        lastLoginAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                delete ret.password;
                delete ret.__v;
                return ret;
            }
        },
        toObject: {
            transform: function (doc, ret) {
                delete ret.password;
                delete ret.__v;
                return ret;
            }
        }
    }
);

// Index for faster queries (email index is auto-created by unique: true)
userSchema.index({ createdAt: -1 });

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        this.password = await hashPassword(this.password);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Check if password matches the user's password
 * @param {string} candidatePassword - Password to check
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (candidatePassword) {
    return comparePassword(candidatePassword, this.password);
};

/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Promise<User|null>}
 */
userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email.toLowerCase() }).select('+password');
};

/**
 * Check if email is already taken
 * @param {string} email - Email to check
 * @param {ObjectId} excludeUserId - User ID to exclude (for updates)
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
    const user = await this.findOne({
        email: email.toLowerCase(),
        _id: { $ne: excludeUserId }
    });
    return !!user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
