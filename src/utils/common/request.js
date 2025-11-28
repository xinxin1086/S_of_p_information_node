import axios from 'axios'
import { ElMessage } from 'element-plus'
import { BASE_URL } from '@/config'

// 创建axios实例
const request = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const { response } = error

    if (response) {
      switch (response.status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          localStorage.removeItem('user_token')
          window.location.hash = '/login'
          break
        case 403:
          ElMessage.error('没有权限访问该资源')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(response.data?.message || '请求失败')
      }
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请检查网络连接')
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }

    return Promise.reject(error)
  }
)

// 封装常用请求方法
export const api = {
  // GET请求
  get(url, params = {}) {
    return request.get(url, { params })
  },

  // POST请求
  post(url, data = {}) {
    return request.post(url, data)
  },

  // PUT请求
  put(url, data = {}) {
    return request.put(url, data)
  },

  // DELETE请求
  delete(url) {
    return request.delete(url)
  },

  // 文件上传
  upload(url, formData) {
    return request.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 文件下载
  download(url, params = {}) {
    return request.get(url, {
      params,
      responseType: 'blob'
    })
  }
}

export default request