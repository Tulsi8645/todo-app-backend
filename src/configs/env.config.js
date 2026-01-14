const { z } = require('zod');
require('dotenv').config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('5000').transform(Number),
    MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
    JWT_ACCESS_SECRET: z.string().min(32, 'JWT access secret must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters'),
    JWT_ACCESS_EXPIRY: z.string().default('15m'),
    JWT_REFRESH_EXPIRY: z.string().default('7d'),
    CORS_ORIGIN: z.string().default('http://localhost:3000')
});

const parseEnv = () => {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        console.error('❌ Invalid environment variables:');
        console.error(error.errors);
        process.exit(1);
    }
};

const env = parseEnv();

module.exports = { env };
