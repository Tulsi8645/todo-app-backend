const request = require('supertest');
const app = require('../../src/app');

describe('Todo E2E Tests', () => {
    let accessToken;
    let userId;

    const validUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
    };

    const validTodo = {
        title: 'Test Todo',
        description: 'Test Description',
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000).toISOString()
    };

    beforeEach(async () => {
        const res = await request(app).post('/api/auth/register').send(validUser);
        accessToken = res.body.data.tokens.accessToken;
        userId = res.body.data.user._id;
    });

    describe('POST /api/todos', () => {
        it('should create a new todo', async () => {
            const res = await request(app)
                .post('/api/todos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validTodo);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.todo.title).toBe(validTodo.title);
            expect(res.body.data.todo.priority).toBe(validTodo.priority);
        });

        it('should return validation error for missing title', async () => {
            const res = await request(app)
                .post('/api/todos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ description: 'No title' });

            expect(res.status).toBe(422);
            expect(res.body.success).toBe(false);
        });

        it('should return 401 without authentication', async () => {
            const res = await request(app)
                .post('/api/todos')
                .send(validTodo);

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/todos', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/todos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validTodo);

            await request(app)
                .post('/api/todos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ ...validTodo, title: 'Second Todo', priority: 'low' });
        });

        it('should get all todos with pagination', async () => {
            const res = await request(app)
                .get('/api/todos')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data).toHaveLength(2);
            expect(res.body.meta.pagination).toBeDefined();
        });

        it('should filter by priority', async () => {
            const res = await request(app)
                .get('/api/todos?priority=high')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].priority).toBe('high');
        });

        it('should filter by completion status', async () => {
            const res = await request(app)
                .get('/api/todos?isCompleted=false')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.every(t => !t.isCompleted)).toBe(true);
        });

        it('should search by title', async () => {
            const res = await request(app)
                .get('/api/todos?search=Second')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].title).toContain('Second');
        });
    });

    describe('GET /api/todos/:id', () => {
        let todoId;

        beforeEach(async () => {
            const res = await request(app)
                .post('/api/todos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validTodo);
            todoId = res.body.data.todo._id;
        });

        it('should get a todo by ID', async () => {
            const res = await request(app)
                .get(`/api/todos/${todoId}`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.todo._id).toBe(todoId);
        });

        it('should return 404 for non-existent todo', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const res = await request(app)
                .get(`/api/todos/${fakeId}`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(404);
        });
    });

    describe('PATCH /api/todos/:id', () => {
        let todoId;

        beforeEach(async () => {
            const res = await request(app)
                .post('/api/todos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validTodo);
            todoId = res.body.data.todo._id;
        });

        it('should update a todo', async () => {
            const res = await request(app)
                .patch(`/api/todos/${todoId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ title: 'Updated Title', priority: 'low' });

            expect(res.status).toBe(200);
            expect(res.body.data.todo.title).toBe('Updated Title');
            expect(res.body.data.todo.priority).toBe('low');
        });

        it('should mark todo as completed', async () => {
            const res = await request(app)
                .patch(`/api/todos/${todoId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ isCompleted: true });

            expect(res.status).toBe(200);
            expect(res.body.data.todo.isCompleted).toBe(true);
            expect(res.body.data.todo.completedAt).toBeDefined();
        });
    });

    describe('PATCH /api/todos/:id/toggle', () => {
        let todoId;

        beforeEach(async () => {
            const res = await request(app)
                .post('/api/todos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validTodo);
            todoId = res.body.data.todo._id;
        });

        it('should toggle todo completion', async () => {
            let res = await request(app)
                .patch(`/api/todos/${todoId}/toggle`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.todo.isCompleted).toBe(true);

            res = await request(app)
                .patch(`/api/todos/${todoId}/toggle`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.body.data.todo.isCompleted).toBe(false);
        });
    });

    describe('DELETE /api/todos/:id', () => {
        let todoId;

        beforeEach(async () => {
            const res = await request(app)
                .post('/api/todos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validTodo);
            todoId = res.body.data.todo._id;
        });

        it('should delete a todo', async () => {
            const res = await request(app)
                .delete(`/api/todos/${todoId}`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);

            const getRes = await request(app)
                .get(`/api/todos/${todoId}`)
                .set('Authorization', `Bearer ${accessToken}`);

            expect(getRes.status).toBe(404);
        });
    });

    describe('GET /api/todos/stats', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/todos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ ...validTodo, priority: 'high' });

            const res = await request(app)
                .post('/api/todos')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ ...validTodo, title: 'Low priority', priority: 'low' });

            await request(app)
                .patch(`/api/todos/${res.body.data.todo._id}/toggle`)
                .set('Authorization', `Bearer ${accessToken}`);
        });

        it('should return todo statistics', async () => {
            const res = await request(app)
                .get('/api/todos/stats')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.stats.total).toBe(2);
            expect(res.body.data.stats.completed).toBe(1);
            expect(res.body.data.stats.pending).toBe(1);
            expect(res.body.data.stats.byPriority).toBeDefined();
            expect(res.body.data.stats.completionRate).toBe(50);
        });
    });
});
