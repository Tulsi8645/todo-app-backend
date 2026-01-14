const { hashPassword, comparePassword } = require('../../../src/libs/password.lib');

describe('Password Library', () => {
    describe('hashPassword', () => {
        it('should hash a password successfully', async () => {
            const password = 'TestPassword123!';
            const hash = await hashPassword(password);

            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
            expect(hash.length).toBeGreaterThan(50);
        });

        it('should generate different hashes for the same password', async () => {
            const password = 'TestPassword123!';
            const hash1 = await hashPassword(password);
            const hash2 = await hashPassword(password);

            expect(hash1).not.toBe(hash2);
        });
    });

    describe('comparePassword', () => {
        it('should return true for matching password', async () => {
            const password = 'TestPassword123!';
            const hash = await hashPassword(password);

            const result = await comparePassword(password, hash);
            expect(result).toBe(true);
        });

        it('should return false for non-matching password', async () => {
            const password = 'TestPassword123!';
            const wrongPassword = 'WrongPassword123!';
            const hash = await hashPassword(password);

            const result = await comparePassword(wrongPassword, hash);
            expect(result).toBe(false);
        });

        it('should handle empty password', async () => {
            const password = 'TestPassword123!';
            const hash = await hashPassword(password);

            const result = await comparePassword('', hash);
            expect(result).toBe(false);
        });
    });
});
