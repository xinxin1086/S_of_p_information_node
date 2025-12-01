// ./src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/styles/common/global.css'

const app = createApp(App)

// 全局错误处理器
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误:', err)
  console.error('错误信息:', info)
  console.error('Vue 实例:', vm)

  // 如果是路由相关错误，特殊处理
  if (info?.includes('render') || err?.message?.includes('hydrate')) {
    console.warn('检测到渲染或hydration错误，这可能是因为组件状态不一致')
  }

  // 可以在这里添加错误上报逻辑
  // reportError(err, vm, info)
}

app.config.warnHandler = (msg, vm, trace) => {
  console.warn('Vue 警告:', msg, trace)
}

app.use(createPinia())
    .use(router)
    .use(ElementPlus)
    .mount('#app')

// 基础令牌传递
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('user_token')
        if (token) {
            // 仅设置：Bearer + 单个空格 + 原始令牌
            config.headers['Authorization'] = `Bearer ${token}`
            console.log('【请求头】原始令牌：', token)
            console.log('【请求地址】', config.url) // 方便检查端口是否正确
        }
        return config
    },
    (error) => Promise.reject(error)
)

// 响应拦截器：仅处理401
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('user_token')
            router.push('/login')
            alert('登录已过期或令牌无效，请重新登录')
        }
        return Promise.reject(error)
    }
)
