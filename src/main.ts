// ./src/main.ts
import axios from 'axios'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'


import 'element-plus/dist/index.css'
import '@/styles/common/global.css'
import { tokenManager } from '@/utils/tokenManager'

const app = createApp(App)

// 清理旧的localStorage键（已弃用，现在使用tokenManager）
localStorage.removeItem('user_token')
localStorage.removeItem('admin_token')

// 全局错误处理器
app.config.errorHandler = (err: unknown, vm: unknown, info: string): void => {
  console.error('全局错误:', err)
  console.error('错误信息:', info)
  console.error('Vue 实例:', vm)

  // 如果是路由相关错误，特殊处理
  const error = err instanceof Error ? err : new Error(String(err))
  if (info?.includes('render') || error.message?.includes('hydrate')) {
    console.warn('检测到渲染或hydration错误，这可能是因为组件状态不一致')
  }

  // 可以在这里添加错误上报逻辑
  // reportError(err, vm, info)
}

app.config.warnHandler = (msg: string, vm: unknown, trace: string): void => {
  console.warn('Vue 警告:', msg, trace)
}

app.use(createPinia())
    .use(router)
    .use(ElementPlus)
    .mount('#app')

// 基础令牌传递 - 仅作为备用，主要使用utils/request.ts
axios.defaults.headers.common['Content-Type'] = 'application/json'

// 简化的请求拦截器，仅用于基础认证
axios.interceptors.request.use(
    (config) => {
        // 如果不是使用 /api 前缀的请求，添加基础认证
        if (!config.url?.startsWith('/api') && !config.url?.startsWith('http')) {
            const token = tokenManager.getAccessToken()
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`
            }
        }
        return config
    },
    (error) => Promise.reject(error)
)

// 简化的响应拦截器
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        // 仅处理非utils/request.ts管理的请求的401错误
        if (error.response?.status === 401 && !error.config?.url?.startsWith('/api')) {
            tokenManager.clearTokens()
            if (!window.location.hash.includes('#/login')) {
                window.location.hash = '#/login'
            }
        }
        return Promise.reject(error)
    }
)