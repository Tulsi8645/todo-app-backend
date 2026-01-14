require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./configs/db.config');
const logger = require('./configs/logger.config');

const PORT = process.env.PORT || 5000;

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    // Close server
    if (server) {
        server.close(() => {
            logger.info('HTTP server closed');
        });
    }

    // Disconnect from database
    const mongoose = require('mongoose');
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');

    process.exit(0);
};

let server;

// Start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start Express server
        server = app.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
            logger.info(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
            logger.info(`🏥 Health Check: http://localhost:${PORT}/api/health`);
            logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            logger.error('Unhandled Promise Rejection:', err);
            server.close(() => {
                process.exit(1);
            });
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
            logger.error('Uncaught Exception:', err);
            process.exit(1);
        });

        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = server;
