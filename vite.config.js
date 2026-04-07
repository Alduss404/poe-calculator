import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api/prices': {
        target: 'https://poe.ninja/api/data/currencyoverview',
        changeOrigin: true,
        rewrite: (path) => {
          const params = new URLSearchParams(path.split('?')[1]);
          const league = params.get('league') || 'Settlers';
          return `?league=${encodeURIComponent(league)}&type=Currency`;
        },
      },
    },
  },
})
