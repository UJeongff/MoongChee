// vite.config.js

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 환경변수 불러오기
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    define: {
      global: 'globalThis', // 브라우저 환경에서 global을 globalThis로 대체
    },
    resolve: {
      alias: {
        global: 'globalThis', // 추가 설정 (선택 사항)
      },
    },
    server: {
      port: 5174,
      proxy: {
        '/api': {
          target: env.VITE_REACT_APP_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
