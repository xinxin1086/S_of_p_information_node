import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage, ElNotification } from 'element-plus'
import { ref, readonly } from 'vue'

import { useAuthStore } from '@/stores/auth'
import type { ApiError } from '@/types/auth'
import { tokenManager, handleApiError } from '@/utils/tokenManager'


/**
 * 统一的API基础URL配置
 *
 * 开发环境：使用空字符串，让请求通过 Vite 代理转发
 * 生产环境：可以通过 VITE_API_BASE_URL 环境变量配置完整的后端URL
 *
 * 示例：
 * - 开发环境（默认）：使用相对路径，由 vite.config.ts 中的 proxy 配置转发到后端
 * - 生产环境：在 .env.production 中设置 VITE_API_BASE_URL=https://your-api.com
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

/**
 * 创建Axios实例
 * 注意: baseURL不再包含/api前缀,因为API调用路径中已经包含了/api
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

/**
 * 请求拦截器 - 自动添加认证头和刷新Token
 * 使用锁机制防止并发刷新
 */
apiClient.interceptors.request.use(
  async (config) => {
    // 登录和注册请求跳过Token检查
    const isLoginRequest = config.url?.includes('/login') || config.url?.includes('/register')

    if (!isLoginRequest && tokenManager.isLoggedIn()) {
      // 检查Token是否即将过期
      if (tokenManager.isTokenExpiring()) {
        // 如果正在刷新，等待刷新完成（锁机制自动处理）
        // 如果没有在刷新，触发刷新（锁机制自动处理）
        try {
          console.log('🔐 Token即将过期，触发刷新...', {
            url: config.url,
            isRefreshing: tokenManager.isRefreshingToken(),
            pendingRequests: tokenManager.getPendingRequestsCount()
          })

          const authStore = useAuthStore()
          const refreshSuccess = await authStore.autoRefreshToken()

          if (!refreshSuccess) {
            // Token刷新失败，取消请求
            return Promise.reject(new Error('Token刷新失败，请重新登录'))
          }

          console.log('✅ Token刷新成功，继续请求')
        } catch (error) {
          console.error('❌ Token刷新失败，取消请求:', error)
          return Promise.reject(error)
        }
      }
    }

    // 添加认证头（仅当有Token时且不是登录请求）
    const token = tokenManager.getAccessToken()
    console.log('🔐 请求拦截器:', {
      url: config.url,
      isLoginRequest,
      hasToken: !!token,
      tokenLength: token?.length || 0
    })

    if (token && !isLoginRequest) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔐 添加Authorization头:', config.headers.Authorization)
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器 - 统一处理错误和响应格式
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 检查业务状态码
    const data = response.data

    // 如果响应包含 success 字段且为 false，则认为是业务错误
    if (data && typeof data === 'object' && 'success' in data && !data.success) {
      const businessError: ApiError = {
        code: data.code || 'BUSINESS_ERROR',
        message: data.message || '业务处理失败',
        details: data.details,
        isPermissionError: data.code === 'PERMISSION_DENIED',
        isServerError: false,
        isValidationError: data.code === 'VALIDATION_ERROR',
        isNetworkError: false
      }

      return Promise.reject(businessError)
    }

    return response
  },
  async (error) => {
    const authStore = useAuthStore()
    const apiError = handleApiError(error)

    // 权限错误处理
    if (apiError.isPermissionError) {
      ElNotification({
        title: '权限不足',
        message: apiError.message || '您没有执行此操作的权限',
        type: 'error',
        duration: 5000
      })

      // 自动登出
      await authStore.logout()

      // 跳转到登录页（如果当前不在登录页）
      if (!window.location.hash.includes('#/login')) {
        window.location.hash = '#/login'
      }

      return Promise.reject(apiError)
    }

    // 网络错误处理
    if (apiError.isNetworkError) {
      ElNotification({
        title: '网络连接失败',
        message: '请检查网络连接后重试',
        type: 'error',
        duration: 5000
      })

      return Promise.reject(apiError)
    }

    // 服务器错误处理
    if (apiError.isServerError) {
      ElNotification({
        title: '服务器错误',
        message: '服务器暂时无法响应，请稍后重试',
        type: 'error',
        duration: 5000
      })

      return Promise.reject(apiError)
    }

    // 验证错误处理
    if (apiError.isValidationError) {
      ElMessage({
        message: apiError.message || '数据验证失败',
        type: 'warning',
        duration: 5000
      })

      return Promise.reject(apiError)
    }

    // 其他错误处理
    ElMessage({
      message: apiError.message || '操作失败',
      type: 'error',
      duration: 5000
    })

    return Promise.reject(apiError)
  }
)

/**
 * 封装通用请求方法
 */
export const request = {
  /**
   * GET 请求
   */
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.get<T>(url, config)
    return response.data
  },

  /**
   * POST 请求
   */
  async post<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.post<T>(url, data, config)
    return response.data
  },

  /**
   * PUT 请求
   */
  async put<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.put<T>(url, data, config)
    return response.data
  },

  /**
   * DELETE 请求
   */
  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.delete<T>(url, config)
    return response.data
  },

  /**
   * PATCH 请求
   */
  async patch<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.patch<T>(url, data, config)
    return response.data
  },

  /**
   * 上传文件
   */
  async upload<T = unknown>(url: string, file: File, config?: AxiosRequestConfig): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<T>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers
      }
    })

    return response.data
  }
}

/**
 * 带加载状态的API调用Hook
 */
export interface UseRequestOptions<T = unknown> {
  showError?: boolean
  showLoading?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: ApiError) => void
}

export const useRequest = () => {
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  const execute = async <T>(
    apiCall: () => Promise<T>,
    options: UseRequestOptions<T> = {}
  ): Promise<T | null> => {
    const {
      showError = true,
      onSuccess,
      onError
    } = options

    loading.value = true
    error.value = null

    try {
      const result = await apiCall()
      onSuccess?.(result)
      return result
    } catch (err: unknown) {
      const apiError = err as ApiError
      error.value = apiError

      // 如果不是在拦截器中显示的错误，在这里显示
      if (showError && !apiError.isPermissionError) {
        ElMessage({
          message: apiError.message || '操作失败',
          type: 'error'
        })
      }

      onError?.(apiError)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    execute
  }
}

/**
 * 创建不带/api前缀的API实例（用于健康检查等接口）
 */
export const apiClientNoPrefix: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// 为无前缀实例添加相同的拦截器
apiClientNoPrefix.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken()
    if (token && !config.url?.includes('/login')) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClientNoPrefix.interceptors.response.use(
  (response) => response,
  async (error) => {
    const apiError = handleApiError(error)
    return Promise.reject(apiError)
  }
)

export default apiClient