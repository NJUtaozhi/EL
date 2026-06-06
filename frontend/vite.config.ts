import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // ECharts 单独分包（~950KB），仅在 Analysis/Profile 页面加载
          echarts: ['echarts'],
          'echarts-wordcloud': ['echarts-wordcloud'],
          // React 核心（稳定，长期缓存）
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // TDesign 组件库
          'tdesign-vendor': ['tdesign-react', 'tdesign-icons-react'],
          // 工具库
          'utils-vendor': ['axios', 'zustand', 'dayjs'],
        },
      },
    },
  },
})
