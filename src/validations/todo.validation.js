const { z } = require('zod');
const mongoose = require('mongoose');

/**
 * MongoDB ObjectId validation
 */
const objectIdSchema = z.string().refine(
    (val) => mongoose.Types.ObjectId.isValid(val),
    { message: 'Invalid ID format' }
);

/**
 * Priority validation
 */
const prioritySchema = z.enum(['low', 'medium', 'high']);

/**
 * Create todo request validation schema
 */
const createTodoSchema = z.object({
    body: z.object({
        title: z
            .string()
            .min(1, 'Title is required')
            .max(200, 'Title cannot exceed 200 characters')
            .transform((val) => val.trim()),
        description: z
            .string()
            .max(1000, 'Description cannot exceed 1000 characters')
            .transform((val) => val.trim())
            .optional()
            .default(''),
        priority: prioritySchema.optional().default('medium'),
        dueDate: z
            .string()
            .datetime({ message: 'Invalid date format. Use ISO 8601 format' })
            .optional()
            .nullable(),
        tags: z
            .array(z.string().max(50, 'Tag cannot exceed 50 characters'))
            .max(10, 'Cannot have more than 10 tags')
            .optional()
            .default([])
    })
});

/**
 * Update todo request validation schema
 */
const updateTodoSchema = z.object({
    params: z.object({
        id: objectIdSchema
    }),
    body: z.object({
        title: z
            .string()
            .min(1, 'Title cannot be empty')
            .max(200, 'Title cannot exceed 200 characters')
            .transform((val) => val.trim())
            .optional(),
        description: z
            .string()
            .max(1000, 'Description cannot exceed 1000 characters')
            .transform((val) => val.trim())
            .optional(),
        isCompleted: z.boolean().optional(),
        priority: prioritySchema.optional(),
        dueDate: z
            .string()
            .datetime({ message: 'Invalid date format. Use ISO 8601 format' })
            .optional()
            .nullable(),
        tags: z
            .array(z.string().max(50, 'Tag cannot exceed 50 characters'))
            .max(10, 'Cannot have more than 10 tags')
            .optional()
    }).refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update'
    })
});

/**
 * Todo ID parameter validation schema
 */
const todoIdSchema = z.object({
    params: z.object({
        id: objectIdSchema
    })
});

/**
 * Query todos validation schema
 */
const queryTodosSchema = z.object({
    query: z.object({
        page: z
            .string()
            .optional()
            .default('1')
            .transform((val) => parseInt(val, 10))
            .refine((val) => val >= 1, { message: 'Page must be at least 1' }),
        limit: z
            .string()
            .optional()
            .default('10')
            .transform((val) => parseInt(val, 10))
            .refine((val) => val >= 1 && val <= 100, { message: 'Limit must be between 1 and 100' }),
        sortBy: z
            .enum(['createdAt', 'updatedAt', 'title', 'priority', 'dueDate', 'isCompleted'])
            .optional()
            .default('createdAt'),
        sortOrder: z
            .enum(['asc', 'desc'])
            .optional()
            .default('desc'),
        isCompleted: z
            .string()
            .optional()
            .transform((val) => {
                if (val === 'true') return true;
                if (val === 'false') return false;
                return undefined;
            }),
        priority: prioritySchema.optional(),
        search: z
            .string()
            .max(100, 'Search term cannot exceed 100 characters')
            .optional(),
        dueBefore: z
            .string()
            .datetime({ message: 'Invalid date format for dueBefore' })
            .optional(),
        dueAfter: z
            .string()
            .datetime({ message: 'Invalid date format for dueAfter' })
            .optional()
    })
});

module.exports = {
    createTodoSchema,
    updateTodoSchema,
    todoIdSchema,
    queryTodosSchema,
    objectIdSchema,
    prioritySchema
};
