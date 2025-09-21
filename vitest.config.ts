import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'),
      '@/components': path.resolve(__dirname, './app/components'),
      '@/api': path.resolve(__dirname, './app/api'),
      '@/hooks': path.resolve(__dirname, './app/hooks'),
      '@/types': path.resolve(__dirname, './app/types'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './app/__tests__/setup.ts',
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      all: true,
      include: ['app/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        'app/**/*.test.{js,jsx,ts,tsx}',
        'app/**/*.spec.{js,jsx,ts,tsx}',
        'app/types/interfaces.ts',
        'app/**/*.d.ts',
        'next-env.d.ts',
      ],
      thresholds: {
        global: {
          statements: 80,
          branches: 50,
          functions: 50,
          lines: 50,
        },
      },
    },
  },
});
