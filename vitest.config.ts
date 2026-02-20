import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  plugins: [svgr(), react()],
  test: {
    environment: 'jsdom',
    globals: true,                         // exposes expect/describe/it/vi globally (needed by jest-dom)
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/__tests__/**/*.{test,spec}.{ts,tsx}'],  // exclude e2e/ Playwright specs
    css: false,          // Skip CSS processing — faster and irrelevant for logic tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
