const { ZodError } = require('zod');
const ApiError = require('../utils/apiError');

/**
 * Validation middleware factory
 * Creates middleware that validates request against a Zod schema
 * @param {Object} schema - Zod schema to validate against
 * @returns {Function} Express middleware
 */
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            // Create an object with the parts of the request we want to validate
            const toValidate = {};

            if (schema.shape.body) {
                toValidate.body = req.body;
            }
            if (schema.shape.params) {
                toValidate.params = req.params;
            }
            if (schema.shape.query) {
                toValidate.query = req.query;
            }

            // Parse and validate
            const validated = await schema.parseAsync(toValidate);

            // Replace request parts with validated/transformed values
            if (validated.body) {
                req.body = validated.body;
            }
            if (validated.params) {
                req.params = validated.params;
            }
            if (validated.query) {
                req.query = validated.query;
            }

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }));

                return next(ApiError.validationError('Validation failed', errors));
            }
            next(error);
        }
    };
};

module.exports = validate;
