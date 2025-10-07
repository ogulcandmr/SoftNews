import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Simple dev proxy to forward /api/ai to an external AI API endpoint if configured
const aiTarget = process.env.VITE_AI_PROXY_TARGET || '';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: aiTarget
      ? {
          '/api/ai': {
            target: aiTarget,
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/ai/, ''),
          },
        }
      : undefined,
  },
});
