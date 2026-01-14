const mongoose = require('mongoose');

const PRIORITIES = ['low', 'medium', 'high'];

const todoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            minlength: [1, 'Title must be at least 1 character'],
            maxlength: [200, 'Title cannot exceed 200 characters']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
            default: ''
        },
        isCompleted: {
            type: Boolean,
            default: false
        },
        priority: {
            type: String,
            enum: {
                values: PRIORITIES,
                message: 'Priority must be one of: low, medium, high'
            },
            default: 'medium'
        },
        dueDate: {
            type: Date,
            default: null
        },
        completedAt: {
            type: Date,
            default: null
        },
        tags: {
            type: [String],
            default: [],
            validate: {
                validator: function (tags) {
                    return tags.length <= 10;
                },
                message: 'Cannot have more than 10 tags'
            }
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true
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

// Compound indexes for efficient queries
todoSchema.index({ userId: 1, createdAt: -1 });
todoSchema.index({ userId: 1, isCompleted: 1 });
todoSchema.index({ userId: 1, priority: 1 });
todoSchema.index({ userId: 1, dueDate: 1 });

// Pre-save hook to set completedAt when todo is completed
todoSchema.pre('save', function (next) {
    if (this.isModified('isCompleted')) {
        if (this.isCompleted) {
            this.completedAt = new Date();
        } else {
            this.completedAt = null;
        }
    }
    next();
});

/**
 * Find todos by user with pagination and filtering
 * @param {ObjectId} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
todoSchema.statics.findByUser = async function (userId, options = {}) {
    const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        isCompleted,
        priority,
        search,
        dueBefore,
        dueAfter
    } = options;

    const query = { userId };

    // Filter by completion status
    if (typeof isCompleted === 'boolean') {
        query.isCompleted = isCompleted;
    }

    // Filter by priority
    if (priority && PRIORITIES.includes(priority)) {
        query.priority = priority;
    }

    // Search in title and description
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    // Filter by due date range
    if (dueBefore || dueAfter) {
        query.dueDate = {};
        if (dueBefore) {
            query.dueDate.$lte = new Date(dueBefore);
        }
        if (dueAfter) {
            query.dueDate.$gte = new Date(dueAfter);
        }
    }

    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    const [todos, total] = await Promise.all([
        this.find(query)
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(limit)
            .lean(),
        this.countDocuments(query)
    ]);

    return {
        todos,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1
        }
    };
};

/**
 * Get statistics for user's todos
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Object>}
 */
todoSchema.statics.getStats = async function (userId) {
    const stats = await this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                completed: {
                    $sum: { $cond: ['$isCompleted', 1, 0] }
                },
                pending: {
                    $sum: { $cond: ['$isCompleted', 0, 1] }
                },
                lowPriority: {
                    $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] }
                },
                mediumPriority: {
                    $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] }
                },
                highPriority: {
                    $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
                },
                overdue: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $ne: ['$dueDate', null] },
                                    { $lt: ['$dueDate', new Date()] },
                                    { $eq: ['$isCompleted', false] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]);

    return stats[0] || {
        total: 0,
        completed: 0,
        pending: 0,
        lowPriority: 0,
        mediumPriority: 0,
        highPriority: 0,
        overdue: 0
    };
};

const Todo = mongoose.model('Todo', todoSchema);

module.exports = { Todo, PRIORITIES };
