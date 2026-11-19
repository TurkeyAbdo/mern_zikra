import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const { PORT = '4000' } = {
    ...loadEnv(mode, '../server', ''),
    ...process.env,
  };
  const api = 'http://127.0.0.1:' + PORT;
  return {
    plugins: [react()],
    server: { port: 5173, proxy: { '/api': api, '/uploads': api } },
  };
});
