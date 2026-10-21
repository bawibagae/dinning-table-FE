import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 배포를 위해 base: './' 상대 경로 적용 및 react-native -> react-native-web 별칭 설정
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
