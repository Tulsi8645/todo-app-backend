const { Todo } = require('../models/todo.model');
const ApiError = require('../utils/apiError');
const logger = require('../configs/logger.config');

/**
 * Create a new todo
 * @param {string} userId - User ID
 * @param {Object} todoData - Todo data
 * @returns {Object} Created todo
 */
const createTodo = async (userId, todoData) => {
    const todo = await Todo.create({
        ...todoData,
        userId,
        dueDate: todoData.dueDate ? new Date(todoData.dueDate) : null
    });

    logger.debug(`Todo created: ${todo._id} by user: ${userId}`);

    return todo.toJSON();
};

/**
 * Get todos for a user with pagination and filtering
 * @param {string} userId - User ID
 * @param {Object} queryOptions - Query parameters
 * @returns {Object} Todos and pagination info
 */
const getTodos = async (userId, queryOptions = {}) => {
    const result = await Todo.findByUser(userId, queryOptions);

    return {
        todos: result.todos,
        pagination: result.pagination
    };
};

/**
 * Get a single todo by ID
 * @param {string} userId - User ID
 * @param {string} todoId - Todo ID
 * @returns {Object} Todo object
 */
const getTodoById = async (userId, todoId) => {
    const todo = await Todo.findOne({ _id: todoId, userId });

    if (!todo) {
        throw ApiError.notFound('Todo not found');
    }

    return todo.toJSON();
};

/**
 * Update a todo
 * @param {string} userId - User ID
 * @param {string} todoId - Todo ID
 * @param {Object} updates - Fields to update
 * @returns {Object} Updated todo
 */
const updateTodo = async (userId, todoId, updates) => {
    const todo = await Todo.findOne({ _id: todoId, userId });

    if (!todo) {
        throw ApiError.notFound('Todo not found');
    }

    // Apply updates
    const allowedUpdates = ['title', 'description', 'isCompleted', 'priority', 'dueDate', 'tags'];
    allowedUpdates.forEach((field) => {
        if (updates[field] !== undefined) {
            if (field === 'dueDate') {
                todo[field] = updates[field] ? new Date(updates[field]) : null;
            } else {
                todo[field] = updates[field];
            }
        }
    });

    await todo.save();

    logger.debug(`Todo updated: ${todo._id}`);

    return todo.toJSON();
};

/**
 * Delete a todo
 * @param {string} userId - User ID
 * @param {string} todoId - Todo ID
 */
const deleteTodo = async (userId, todoId) => {
    const todo = await Todo.findOneAndDelete({ _id: todoId, userId });

    if (!todo) {
        throw ApiError.notFound('Todo not found');
    }

    logger.debug(`Todo deleted: ${todoId}`);
};

/**
 * Toggle todo completion status
 * @param {string} userId - User ID
 * @param {string} todoId - Todo ID
 * @returns {Object} Updated todo
 */
const toggleComplete = async (userId, todoId) => {
    const todo = await Todo.findOne({ _id: todoId, userId });

    if (!todo) {
        throw ApiError.notFound('Todo not found');
    }

    todo.isCompleted = !todo.isCompleted;
    await todo.save();

    logger.debug(`Todo completion toggled: ${todo._id} -> ${todo.isCompleted}`);

    return todo.toJSON();
};

/**
 * Get todo statistics for a user
 * @param {string} userId - User ID
 * @returns {Object} Statistics
 */
const getTodoStats = async (userId) => {
    const stats = await Todo.getStats(userId);

    return {
        total: stats.total,
        completed: stats.completed,
        pending: stats.pending,
        overdue: stats.overdue,
        byPriority: {
            low: stats.lowPriority,
            medium: stats.mediumPriority,
            high: stats.highPriority
        },
        completionRate: stats.total > 0
            ? Math.round((stats.completed / stats.total) * 100)
            : 0
    };
};

/**
 * Bulk update todos
 * @param {string} userId - User ID
 * @param {Array} todoIds - Array of todo IDs
 * @param {Object} updates - Fields to update
 * @returns {Object} Update result
 */
const bulkUpdate = async (userId, todoIds, updates) => {
    const updateFields = {};
    const allowedUpdates = ['isCompleted', 'priority'];

    allowedUpdates.forEach((field) => {
        if (updates[field] !== undefined) {
            updateFields[field] = updates[field];
        }
    });

    if (updates.isCompleted !== undefined) {
        updateFields.completedAt = updates.isCompleted ? new Date() : null;
    }

    const result = await Todo.updateMany(
        { _id: { $in: todoIds }, userId },
        { $set: updateFields }
    );

    logger.debug(`Bulk updated ${result.modifiedCount} todos for user: ${userId}`);

    return {
        matched: result.matchedCount,
        modified: result.modifiedCount
    };
};

/**
 * Bulk delete todos
 * @param {string} userId - User ID
 * @param {Array} todoIds - Array of todo IDs
 * @returns {Object} Delete result
 */
const bulkDelete = async (userId, todoIds) => {
    const result = await Todo.deleteMany({ _id: { $in: todoIds }, userId });

    logger.debug(`Bulk deleted ${result.deletedCount} todos for user: ${userId}`);

    return {
        deleted: result.deletedCount
    };
};

module.exports = {
    createTodo,
    getTodos,
    getTodoById,
    updateTodo,
    deleteTodo,
    toggleComplete,
    getTodoStats,
    bulkUpdate,
    bulkDelete
};
