const authService = require('../../../src/services/auth.service');
const User = require('../../../src/models/user.model');
const { Token } = require('../../../src/models/token.model');

describe('Auth Service', () => {
    const validUserData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
    };

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const result = await authService.register(validUserData);

            expect(result.user).toBeDefined();
            expect(result.user.email).toBe(validUserData.email.toLowerCase());
            expect(result.user.name).toBe(validUserData.name);
            expect(result.user.password).toBeUndefined();
            expect(result.tokens).toBeDefined();
        });

        it('should throw error for duplicate email', async () => {
            await authService.register(validUserData);

            await expect(authService.register(validUserData)).rejects.toThrow(
                'Email already registered'
            );
        });
    });

    describe('login', () => {
        beforeEach(async () => {
            await authService.register(validUserData);
        });

        it('should login with valid credentials', async () => {
            const result = await authService.login(
                validUserData.email,
                validUserData.password
            );

            expect(result.user).toBeDefined();
            expect(result.tokens).toBeDefined();
        });

        it('should throw error for invalid email', async () => {
            await expect(
                authService.login('wrong@example.com', validUserData.password)
            ).rejects.toThrow('Invalid email or password');
        });

        it('should throw error for invalid password', async () => {
            await expect(
                authService.login(validUserData.email, 'WrongPassword123!')
            ).rejects.toThrow('Invalid email or password');
        });
    });

    describe('refreshTokens', () => {
        let tokens;

        beforeEach(async () => {
            const result = await authService.register(validUserData);
            tokens = result.tokens;
        });

        it('should refresh tokens successfully', async () => {
            const newTokens = await authService.refreshTokens(tokens.refreshToken);

            expect(newTokens.accessToken).toBeDefined();
            expect(newTokens.refreshToken).toBeDefined();
        });

        it('should throw error for invalid refresh token', async () => {
            await expect(
                authService.refreshTokens('invalid-token')
            ).rejects.toThrow('Invalid or expired refresh token');
        });
    });

    describe('logout', () => {
        let tokens;

        beforeEach(async () => {
            const result = await authService.register(validUserData);
            tokens = result.tokens;
        });

        it('should logout successfully', async () => {
            await expect(authService.logout(tokens.refreshToken)).resolves.not.toThrow();

            // Verify token is revoked
            const token = await Token.findOne({ token: tokens.refreshToken });
            expect(token.isRevoked).toBe(true);
        });
    });

    describe('getProfile', () => {
        let userId;

        beforeEach(async () => {
            const result = await authService.register(validUserData);
            userId = result.user._id;
        });

        it('should get user profile', async () => {
            const profile = await authService.getProfile(userId);

            expect(profile.email).toBe(validUserData.email);
            expect(profile.name).toBe(validUserData.name);
        });
    });

    describe('updateProfile', () => {
        let userId;

        beforeEach(async () => {
            const result = await authService.register(validUserData);
            userId = result.user._id;
        });

        it('should update profile successfully', async () => {
            const updates = { name: 'Updated Name' };
            const profile = await authService.updateProfile(userId, updates);

            expect(profile.name).toBe(updates.name);
        });

        it('should reject duplicate email', async () => {
            await authService.register({
                ...validUserData,
                email: 'other@example.com'
            });

            await expect(
                authService.updateProfile(userId, { email: 'other@example.com' })
            ).rejects.toThrow('Email already registered');
        });
    });
});
