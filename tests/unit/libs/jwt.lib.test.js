const {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    getTokenExpiration
} = require('../../../src/libs/jwt.lib');

describe('JWT Library', () => {
    const mockPayload = { userId: '507f1f77bcf86cd799439011' };

    describe('generateAccessToken', () => {
        it('should generate a valid access token', () => {
            const token = generateAccessToken(mockPayload);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3);
        });
    });

    describe('generateRefreshToken', () => {
        it('should generate a refresh token with jti', () => {
            const { token, jti } = generateRefreshToken(mockPayload);

            expect(token).toBeDefined();
            expect(jti).toBeDefined();
            expect(typeof token).toBe('string');
            expect(typeof jti).toBe('string');
        });

        it('should generate unique jti for each token', () => {
            const result1 = generateRefreshToken(mockPayload);
            const result2 = generateRefreshToken(mockPayload);

            expect(result1.jti).not.toBe(result2.jti);
        });
    });

    describe('verifyAccessToken', () => {
        it('should verify a valid access token', () => {
            const token = generateAccessToken(mockPayload);
            const decoded = verifyAccessToken(token);

            expect(decoded).toBeDefined();
            expect(decoded.userId).toBe(mockPayload.userId);
            expect(decoded.type).toBe('access');
        });

        it('should return null for invalid token', () => {
            const decoded = verifyAccessToken('invalid-token');
            expect(decoded).toBeNull();
        });

        it('should return null for refresh token', () => {
            const { token } = generateRefreshToken(mockPayload);
            const decoded = verifyAccessToken(token);
            expect(decoded).toBeNull();
        });
    });

    describe('verifyRefreshToken', () => {
        it('should verify a valid refresh token', () => {
            const { token } = generateRefreshToken(mockPayload);
            const decoded = verifyRefreshToken(token);

            expect(decoded).toBeDefined();
            expect(decoded.userId).toBe(mockPayload.userId);
            expect(decoded.type).toBe('refresh');
        });

        it('should return null for invalid token', () => {
            const decoded = verifyRefreshToken('invalid-token');
            expect(decoded).toBeNull();
        });

        it('should return null for access token', () => {
            const token = generateAccessToken(mockPayload);
            const decoded = verifyRefreshToken(token);
            expect(decoded).toBeNull();
        });
    });

    describe('getTokenExpiration', () => {
        it('should calculate expiration for minutes', () => {
            const expiry = getTokenExpiration('15m');
            const expectedTime = Date.now() + 15 * 60 * 1000;

            expect(expiry.getTime()).toBeGreaterThanOrEqual(expectedTime - 1000);
            expect(expiry.getTime()).toBeLessThanOrEqual(expectedTime + 1000);
        });

        it('should calculate expiration for hours', () => {
            const expiry = getTokenExpiration('2h');
            const expectedTime = Date.now() + 2 * 60 * 60 * 1000;

            expect(expiry.getTime()).toBeGreaterThanOrEqual(expectedTime - 1000);
            expect(expiry.getTime()).toBeLessThanOrEqual(expectedTime + 1000);
        });

        it('should calculate expiration for days', () => {
            const expiry = getTokenExpiration('7d');
            const expectedTime = Date.now() + 7 * 24 * 60 * 60 * 1000;

            expect(expiry.getTime()).toBeGreaterThanOrEqual(expectedTime - 1000);
            expect(expiry.getTime()).toBeLessThanOrEqual(expectedTime + 1000);
        });
    });
});
