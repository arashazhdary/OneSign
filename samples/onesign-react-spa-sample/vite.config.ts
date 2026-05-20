import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    // CJS dist does not expose named exports to Rollup; use SDK source in the sample.
    alias: {
      '@onesign/react-sdk': path.resolve(__dirname, '../../sdk/react-sdk/src/index.ts'),
    },
  },
  server: {
    port: 5173,
  },
});
