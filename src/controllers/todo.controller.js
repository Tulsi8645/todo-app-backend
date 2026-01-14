const todoService = require('../services/todo.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Create a new todo
 * @route   POST /api/todos
 * @access  Private
 */
const createTodo = asyncHandler(async (req, res) => {
    const todo = await todoService.createTodo(req.user.id, req.body);

    ApiResponse.created('Todo created successfully', { todo }).send(res);
});

/**
 * @desc    Get all todos for the authenticated user
 * @route   GET /api/todos
 * @access  Private
 */
const getTodos = asyncHandler(async (req, res) => {
    const { todos, pagination } = await todoService.getTodos(req.user.id, req.query);

    ApiResponse.paginated(
        todos,
        pagination,
        'Todos retrieved successfully'
    ).send(res);
});

/**
 * @desc    Get a single todo by ID
 * @route   GET /api/todos/:id
 * @access  Private
 */
const getTodoById = asyncHandler(async (req, res) => {
    const todo = await todoService.getTodoById(req.user.id, req.params.id);

    ApiResponse.ok('Todo retrieved successfully', { todo }).send(res);
});

/**
 * @desc    Update a todo
 * @route   PATCH /api/todos/:id
 * @access  Private
 */
const updateTodo = asyncHandler(async (req, res) => {
    const todo = await todoService.updateTodo(req.user.id, req.params.id, req.body);

    ApiResponse.ok('Todo updated successfully', { todo }).send(res);
});

/**
 * @desc    Delete a todo
 * @route   DELETE /api/todos/:id
 * @access  Private
 */
const deleteTodo = asyncHandler(async (req, res) => {
    await todoService.deleteTodo(req.user.id, req.params.id);

    ApiResponse.ok('Todo deleted successfully').send(res);
});

/**
 * @desc    Toggle todo completion status
 * @route   PATCH /api/todos/:id/toggle
 * @access  Private
 */
const toggleComplete = asyncHandler(async (req, res) => {
    const todo = await todoService.toggleComplete(req.user.id, req.params.id);

    ApiResponse.ok(
        `Todo marked as ${todo.isCompleted ? 'completed' : 'incomplete'}`,
        { todo }
    ).send(res);
});

/**
 * @desc    Get todo statistics
 * @route   GET /api/todos/stats
 * @access  Private
 */
const getTodoStats = asyncHandler(async (req, res) => {
    const stats = await todoService.getTodoStats(req.user.id);

    ApiResponse.ok('Statistics retrieved successfully', { stats }).send(res);
});

/**
 * @desc    Bulk update todos
 * @route   PATCH /api/todos/bulk
 * @access  Private
 */
const bulkUpdate = asyncHandler(async (req, res) => {
    const { todoIds, updates } = req.body;
    const result = await todoService.bulkUpdate(req.user.id, todoIds, updates);

    ApiResponse.ok('Todos updated successfully', result).send(res);
});

/**
 * @desc    Bulk delete todos
 * @route   DELETE /api/todos/bulk
 * @access  Private
 */
const bulkDelete = asyncHandler(async (req, res) => {
    const { todoIds } = req.body;
    const result = await todoService.bulkDelete(req.user.id, todoIds);

    ApiResponse.ok('Todos deleted successfully', result).send(res);
});

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
