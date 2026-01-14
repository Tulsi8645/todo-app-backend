const mongoose = require('mongoose');
const tokenService = require('../../../src/services/token.service');
const { Token } = require('../../../src/models/token.model');
const User = require('../../../src/models/user.model');

describe('Token Service', () => {
    let testUser;

    beforeEach(async () => {
        testUser = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Password123!'
        });
    });

    describe('generateAuthTokens', () => {
        it('should generate access and refresh tokens', async () => {
            const tokens = await tokenService.generateAuthTokens(testUser._id);

            expect(tokens.accessToken).toBeDefined();
            expect(tokens.refreshToken).toBeDefined();
            expect(tokens.expiresIn).toBeDefined();
        });

        it('should save refresh token to database', async () => {
            const tokens = await tokenService.generateAuthTokens(testUser._id);

            const savedToken = await Token.findOne({ token: tokens.refreshToken });
            expect(savedToken).toBeDefined();
            expect(savedToken.userId.toString()).toBe(testUser._id.toString());
        });
    });

    describe('verifyAndValidateRefreshToken', () => {
        it('should validate a valid refresh token', async () => {
            const tokens = await tokenService.generateAuthTokens(testUser._id);
            const result = await tokenService.verifyAndValidateRefreshToken(tokens.refreshToken);

            expect(result).toBeDefined();
            expect(result.tokenDoc).toBeDefined();
            expect(result.decoded.userId).toBe(testUser._id.toString());
        });

        it('should return null for invalid token', async () => {
            const result = await tokenService.verifyAndValidateRefreshToken('invalid-token');
            expect(result).toBeNull();
        });
    });

    describe('revokeRefreshToken', () => {
        it('should revoke a refresh token', async () => {
            const tokens = await tokenService.generateAuthTokens(testUser._id);
            const result = await tokenService.revokeRefreshToken(tokens.refreshToken);

            expect(result).toBe(true);

            const token = await Token.findOne({ token: tokens.refreshToken });
            expect(token.isRevoked).toBe(true);
        });
    });

    describe('revokeAllUserTokens', () => {
        it('should revoke all tokens for a user', async () => {
            await tokenService.generateAuthTokens(testUser._id);
            await tokenService.generateAuthTokens(testUser._id);

            const count = await tokenService.revokeAllUserTokens(testUser._id);

            expect(count).toBe(2);

            const activeTokens = await Token.countDocuments({
                userId: testUser._id,
                isRevoked: false
            });
            expect(activeTokens).toBe(0);
        });
    });

    describe('rotateRefreshToken', () => {
        it('should rotate tokens', async () => {
            const oldTokens = await tokenService.generateAuthTokens(testUser._id);
            const newTokens = await tokenService.rotateRefreshToken(
                oldTokens.refreshToken,
                testUser._id
            );

            expect(newTokens.accessToken).not.toBe(oldTokens.accessToken);
            expect(newTokens.refreshToken).not.toBe(oldTokens.refreshToken);

            const oldToken = await Token.findOne({ token: oldTokens.refreshToken });
            expect(oldToken.isRevoked).toBe(true);
        });
    });
});
