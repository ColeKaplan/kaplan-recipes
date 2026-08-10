import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3200,
    open: true,
  },
  build: {
    outDir: 'build', // Keeps the same output folder as Create React App
  },
});
