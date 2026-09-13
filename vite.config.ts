/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['**/svg-path-editor-master/**', '**/node_modules/**']
  },
  server: {
    port: 3000,
    open: false
  }
});
