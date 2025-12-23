import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import type { Plugin } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    
  // <!-- DEV-INJECT-START -->
  {
    name: 'dev-inject',
    enforce: 'post', // 确保在 HTML 注入阶段最后执行
    transformIndexHtml(html) {
      if (!html.includes('data-id="dev-inject-monitor"')) {
        return html.replace("</head>", `
    <script data-id="dev-inject-monitor">
      (function() {
        const remote = "/sdk/dev-monitor.js";
        const separator = remote.includes('?') ? '&' : '?';
        const script = document.createElement('script');
        script.src = remote + separator + 't=' + Date.now();
        script.dataset.id = 'dev-inject-monitor-script';
        script.defer = true;
        // 防止重复注入
        if (!document.querySelector('[data-id="dev-inject-monitor-script"]')) {
          document.head.appendChild(script);
        }
      })();
    </script>
  \n</head>`);
      }
      return html;
    }
  },
  // <!-- DEV-INJECT-END -->
  
    vue(),
    vueDevTools()
  ],
  server: {
    port: 4051, // 使用指定的4051端口
    host: true, // 允许外部访问
    strictPort: false, // 如果端口被占用，自动尝试下一个可用端口
    open: false, // 不自动打开浏览器
    hmr: {
      overlay: true
    },
    // 启用 TypeScript 类型检查
    fs: {
      strict: true
    },
    cors: true, // 启用CORS
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true, // 支持WebSocket
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  build: {
    // 优化构建配置以减少运行时错误
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // UI 库分离
          if (id.includes('element-plus')) {
            return id.includes('icons') ? 'element-icons' : 'element-plus'
          }
          // Vue 核心
          if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
            return 'vue-vendor'
          }
          // 图表和可视化库
          if (id.includes('echarts') || id.includes('vue-echarts')) {
            return 'charts'
          }
          // 工具库
          if (id.includes('axios') || id.includes('dayjs') || id.includes('lodash')) {
            return 'utils'
          }
          // 大型功能库
          if (id.includes('exceljs') || id.includes('file-saver')) {
            return 'vendor-heavy'
          }
          // 地图相关
          if (id.includes('amap')) {
            return 'maps'
          }
          // 图片处理相关
          if (id.includes('vue-cropper') || id.includes('vue-upload')) {
            return 'media'
          }
          // 拖拽相关
          if (id.includes('vuedraggable')) {
            return 'interaction'
          }
          // 表单验证
          if (id.includes('vee-validate')) {
            return 'validation'
          }
          // 其他第三方库
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    },
    // 设置合理的警告阈值
    chunkSizeWarningLimit: 800,
    // 启用CSS代码分割
    cssCodeSplit: true
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      '@element-plus/icons-vue'
    ]
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // 启用 TypeScript 类型检查
  esbuild: {
    target: 'es2020'
  }
})