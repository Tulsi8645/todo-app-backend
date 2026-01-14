const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const todoRoutes = require('./todo.routes');

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Server is healthy
 *                 data:
 *                   type: object
 *                   properties:
 *                     uptime:
 *                       type: number
 *                     timestamp:
 *                       type: string
 *                     environment:
 *                       type: string
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is healthy',
        data: {
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            memoryUsage: {
                heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
                heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
            }
        }
    });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/todos', todoRoutes);

module.exports = router;
