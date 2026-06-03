import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server for React app — talks to API at localhost:4000 via VITE_API_URL
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
