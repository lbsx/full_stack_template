import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      gzipSize: true,
      brotliSize: true,
      emitFile: false,
      // filename: "test.html", //分析图生成的文件名
      open: true //如果存在本地服务端口，将在打包后自动展示
    }),

  ],
  base: '/jedi',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/antd')) return 'chunk';
        },
      },
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000/',
        changeOrigin: true,
        // rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
})
