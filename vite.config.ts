import { fileURLToPath, URL } from 'node:url'

import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue() /*vueDevTools()*/, , tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // '/api': 'http://localhost:8000',
      '/api': {
        target: 'http://localhost:8000', // Адрес вашего API-сервера
        changeOrigin: true, // Перезаписывает заголовок Origin
        secure: false, // Если сервер работает через HTTPS с самоподписанным сертификатом
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
