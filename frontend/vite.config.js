import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL?.startsWith('http')
    ? env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:3001';

  return {
    plugins: [react()],
    base: '/portal/',
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target:       apiTarget,
          changeOrigin: true,
          secure:       false,
        },
      },
    },
    build: {
      outDir:    'dist',
      sourcemap: mode !== 'production',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor:   ['react', 'react-dom', 'react-router-dom'],
            charts:   ['recharts'],
            icons:    ['lucide-react'],
            xlsx:     ['xlsx'],
          },
        },
      },
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
  };
});
