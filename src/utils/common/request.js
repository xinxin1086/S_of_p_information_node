import axios from 'axios'
import { ElMessage } from 'element-plus'
import { BASE_URL } from '@/config'
import { tokenManager } from '@/utils/tokenManager'

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
    // 使用新的token管理系统获取令牌
    const token = tokenManager.getAccessToken()
    if (token && !config.url?.includes('/login')) {
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
    // 检查 response 和 response.data 是否存在
    if (!response) {
      console.warn('⚠️ 响应对象为空')
      return Promise.reject(new Error('响应对象为空'))
    }

    // 返回 response.data，保持与现有代码的兼容性
    // 业务代码通过 response.data.success 和 response.data.data 访问数据
    return response.data
  },
  (error) => {
    const { response } = error

    if (response) {
      switch (response.status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          // 使用新的tokenManager清理令牌
          tokenManager.clearTokens()
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
  get(url, params = {}, config = {}) {
    return request.get(url, {
      ...config,
      params: {
        ...params,
        ...config.params
      }
    })
  },

  // POST请求
  post(url, data = {}, config = {}) {
    return request.post(url, data, config)
  },

  // PUT请求
  put(url, data = {}, config = {}) {
    return request.put(url, data, config)
  },

  // DELETE请求
  delete(url, config = {}) {
    return request.delete(url, config)
  },

  // 文件上传
  upload(url, formData, config = {}) {
    return request.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers
      },
      ...config
    })
  },

  // 文件下载
  download(url, params = {}, config = {}) {
    return request.get(url, {
      ...config,
      params: {
        ...params,
        ...config.params
      },
      responseType: config.responseType || 'blob'
    })
  }
}

export default request
