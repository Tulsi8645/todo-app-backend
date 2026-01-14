const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/user.model');

describe('Auth E2E Tests', () => {
    const validUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
    };

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(validUser);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.email).toBe(validUser.email);
            expect(res.body.data.tokens.accessToken).toBeDefined();
            expect(res.body.data.tokens.refreshToken).toBeDefined();
        });

        it('should return validation error for invalid email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ ...validUser, email: 'invalid-email' });

            expect(res.status).toBe(422);
            expect(res.body.success).toBe(false);
        });

        it('should return validation error for weak password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ ...validUser, password: 'weak' });

            expect(res.status).toBe(422);
            expect(res.body.success).toBe(false);
        });

        it('should return conflict error for duplicate email', async () => {
            await request(app).post('/api/auth/register').send(validUser);

            const res = await request(app)
                .post('/api/auth/register')
                .send(validUser);

            expect(res.status).toBe(409);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await request(app).post('/api/auth/register').send(validUser);
        });

        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: validUser.email,
                    password: validUser.password
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.tokens.accessToken).toBeDefined();
        });

        it('should return error for invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: validUser.email,
                    password: 'WrongPassword123!'
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/refresh', () => {
        let refreshToken;

        beforeEach(async () => {
            const res = await request(app).post('/api/auth/register').send(validUser);
            refreshToken = res.body.data.tokens.refreshToken;
        });

        it('should refresh tokens', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.tokens.accessToken).toBeDefined();
            expect(res.body.data.tokens.refreshToken).toBeDefined();
        });

        it('should return error for invalid refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: 'invalid-token' });

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/auth/me', () => {
        let accessToken;

        beforeEach(async () => {
            const res = await request(app).post('/api/auth/register').send(validUser);
            accessToken = res.body.data.tokens.accessToken;
        });

        it('should get user profile', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.email).toBe(validUser.email);
        });

        it('should return error without token', async () => {
            const res = await request(app).get('/api/auth/me');

            expect(res.status).toBe(401);
        });
    });

    describe('PATCH /api/auth/me', () => {
        let accessToken;

        beforeEach(async () => {
            const res = await request(app).post('/api/auth/register').send(validUser);
            accessToken = res.body.data.tokens.accessToken;
        });

        it('should update user profile', async () => {
            const res = await request(app)
                .patch('/api/auth/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ name: 'Updated Name' });

            expect(res.status).toBe(200);
            expect(res.body.data.user.name).toBe('Updated Name');
        });
    });

    describe('POST /api/auth/logout', () => {
        let refreshToken;

        beforeEach(async () => {
            const res = await request(app).post('/api/auth/register').send(validUser);
            refreshToken = res.body.data.tokens.refreshToken;
        });

        it('should logout successfully', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .send({ refreshToken });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
});
