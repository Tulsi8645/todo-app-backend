const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
    const { user, tokens } = await authService.register(req.body);

    ApiResponse.created('Registration successful', {
        user,
        tokens
    }).send(res);
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { user, tokens } = await authService.login(email, password);

    ApiResponse.ok('Login successful', {
        user,
        tokens
    }).send(res);
});

/**
 * @desc    Refresh tokens
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshTokens = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokens(refreshToken);

    ApiResponse.ok('Tokens refreshed successfully', { tokens }).send(res);
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);

    ApiResponse.ok('Logout successful').send(res);
});

/**
 * @desc    Logout from all devices
 * @route   POST /api/auth/logout-all
 * @access  Private
 */
const logoutAll = asyncHandler(async (req, res) => {
    const count = await authService.logoutAll(req.user.id);

    ApiResponse.ok('Logged out from all devices', {
        revokedSessions: count
    }).send(res);
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user.id);

    ApiResponse.ok('Profile retrieved successfully', { user }).send(res);
});

/**
 * @desc    Update user profile
 * @route   PATCH /api/auth/me
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user.id, req.body);

    ApiResponse.ok('Profile updated successfully', { user }).send(res);
});

/**
 * @desc    Change password
 * @route   POST /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);

    ApiResponse.ok('Password changed successfully. Please login again.').send(res);
});

module.exports = {
    register,
    login,
    refreshTokens,
    logout,
    logoutAll,
    getProfile,
    updateProfile,
    changePassword
};
