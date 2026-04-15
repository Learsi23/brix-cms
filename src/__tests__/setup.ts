// Test environment setup — runs before every test file
process.env.DATABASE_URL = 'file:./test.db';
process.env.NODE_ENV    = 'test';
