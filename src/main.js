import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(ElementPlus);

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

app.use(createPinia()).use(router).use(ElementPlus).mount('#app')