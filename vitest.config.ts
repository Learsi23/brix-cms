import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['src/__tests__/setup.ts'],
    include: ['src/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      include: [
        'src/app/api/**',
        'src/lib/totp.ts',
        'src/lib/blocks/registry.ts',
        'src/lib/blocks/types.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve('./src'),
    },
  },
});
