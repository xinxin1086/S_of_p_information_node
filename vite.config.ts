import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

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
        configure: (proxy) => {
          proxy.on('error', (_err) => {
            console.log('proxy error');
          });
          proxy.on('proxyReq', (_proxyReq, _req) => {
            console.log('Sending Request to the Target');
          });
          proxy.on('proxyRes', (proxyRes, _req) => {
            console.log('Received Response from the Target:', proxyRes.statusCode);
          });
        }
      }
    }
  },
  build: {
    // 优化构建配置以减少运行时错误
    rollupOptions: {
      output: {
        // 更细粒度的代码分割，解决大块文件问题
        manualChunks: (id) => {
          // Element Plus UI 库 - 细分模块
          if (id.includes('element-plus')) {
            if (id.includes('icons')) return 'element-icons'
            if (id.includes('theme-chalk')) return 'element-styles'
            return 'element-plus'
          }

          // Vue 核心 - 保持独立
          if (id.includes('node_modules/vue/') && id.includes('vue-router')) {
            return 'vue-router'
          }
          if (id.includes('node_modules/vue/') && id.includes('pinia')) {
            return 'pinia'
          }
          if (id.includes('node_modules/vue/') && !id.includes('vue-router') && !id.includes('pinia')) {
            return 'vue-core'
          }

          // ECharts 图表库 - 进一步细分
          if (id.includes('echarts')) {
            if (id.includes('node_modules/echarts/core')) return 'echarts-core'
            if (id.includes('node_modules/echarts/charts/')) return 'echarts-charts'
            if (id.includes('node_modules/echarts/components/')) return 'echarts-components'
            if (id.includes('node_modules/echarts/renderers/')) return 'echarts-renderers'
            return 'echarts'
          }
          if (id.includes('vue-echarts')) {
            return 'vue-echarts'
          }

          // 工具库 - 分离到独立块
          if (id.includes('node_modules/axios')) return 'axios'
          if (id.includes('node_modules/dayjs')) return 'dayjs'
          if (id.includes('node_modules/lodash')) return 'lodash'

          // Excel 处理 - 大型独立库
          if (id.includes('node_modules/exceljs')) return 'exceljs'
          if (id.includes('node_modules/file-saver')) return 'file-saver'

          // 高德地图
          if (id.includes('node_modules/@amap')) return 'amap'

          // 图片处理
          if (id.includes('node_modules/vue-cropper')) return 'vue-cropper'
          if (id.includes('node_modules/vue-upload')) return 'vue-upload'

          // 图片预览
          if (id.includes('node_modules/vue3-photo-preview')) return 'photo-preview'

          // 拖拽功能
          if (id.includes('node_modules/vuedraggable')) return 'vuedraggable'

          // 表单验证 - 分离
          if (id.includes('node_modules/@vee-validate')) return 'vee-validate'

          // VueUse 工具库
          if (id.includes('node_modules/@vueuse')) return 'vueuse'

          // Vue Motion 动画
          if (id.includes('node_modules/@vueuse/motion')) return 'vue-motion'

          // 虚拟滚动
          if (id.includes('node_modules/@tanstack/vue-virtual')) return 'vue-virtual'

          // DOMPurify 安全库
          if (id.includes('node_modules/dompurify')) return 'dompurify'

          // 其他第三方库
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    },
    // 提高警告阈值，但我们已经通过细分代码块解决了大块问题
    chunkSizeWarningLimit: 600,
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 启用源码映射（生产环境建议关闭）
    sourcemap: false,
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        // 移除 console
        drop_console: true,
        drop_debugger: true
      }
    }
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
    target: 'es2020',
    // 生产环境自动移除 console
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
})