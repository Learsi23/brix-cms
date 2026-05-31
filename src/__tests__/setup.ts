// Test environment setup — runs before every test file
process.env.DATABASE_URL = 'file:./test.db';
Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true, configurable: true });
