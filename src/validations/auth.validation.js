const { z } = require('zod');

/**
 * Password validation schema
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters')
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
    );

/**
 * Email validation schema
 */
const emailSchema = z
    .string()
    .email('Invalid email address')
    .max(255, 'Email cannot exceed 255 characters')
    .transform((val) => val.toLowerCase().trim());

/**
 * Name validation schema
 */
const nameSchema = z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .transform((val) => val.trim());

/**
 * Register request validation schema
 */
const registerSchema = z.object({
    body: z.object({
        name: nameSchema,
        email: emailSchema,
        password: passwordSchema
    })
});

/**
 * Login request validation schema
 */
const loginSchema = z.object({
    body: z.object({
        email: emailSchema,
        password: z.string().min(1, 'Password is required')
    })
});

/**
 * Refresh token request validation schema
 */
const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string().min(1, 'Refresh token is required')
    })
});

/**
 * Update profile validation schema
 */
const updateProfileSchema = z.object({
    body: z.object({
        name: nameSchema.optional(),
        email: emailSchema.optional()
    }).refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update'
    })
});

/**
 * Change password validation schema
 */
const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: passwordSchema,
        confirmPassword: z.string().min(1, 'Confirm password is required')
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword']
    }).refine((data) => data.currentPassword !== data.newPassword, {
        message: 'New password must be different from current password',
        path: ['newPassword']
    })
});

module.exports = {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    updateProfileSchema,
    changePasswordSchema,
    passwordSchema,
    emailSchema,
    nameSchema
};
