/**
 * API接口辅助工具
 * 提供 API 调用的格式化和辅助函数
 */

import { tokenManager } from '@/utils/tokenManager'

// API响应接口定义
interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message: string
  total?: number
  items?: T[]
}

// 错误响应接口
interface ErrorResponse {
  response?: {
    status: number
    data?: {
      message?: string
    }
  }
  code?: string
  message?: string
}

/**
 * 标准化错误处理
 * @param error - 错误对象
 * @param defaultMessage - 默认错误消息
 * @returns 用户友好的错误消息
 */
export function formatErrorMessage(error: ErrorResponse, defaultMessage: string = '操作失败'): string {
  if (error.response) {
    const { status, data } = error.response
    switch (status) {
      case 400:
        return data?.message || '请求参数错误'
      case 401:
        return '登录已过期，请重新登录'
      case 403:
        return '没有权限访问该资源'
      case 404:
        return '请求的资源不存在'
      case 500:
        return '服务器内部错误，请稍后重试'
      case 503:
        return '服务暂时不可用，请稍后重试'
      default:
        return data?.message || `${defaultMessage} (${status})`
    }
  } else if (error.code === 'ECONNABORTED') {
    return '请求超时，请检查网络连接'
  } else if (error.code === 'ERR_NETWORK') {
    return '网络连接失败，请检查网络设置'
  } else {
    return error.message || defaultMessage
  }
}

/**
 * 标准化分页参数
 * @param page - 当前页码
 * @param size - 每页大小
 * @returns 标准化的分页参数
 */
export function formatPaginationParams(page: number | string, size: number | string): { page: number; size: number } {
  return {
    page: Math.max(1, parseInt(page) || 1),
    size: Math.min(100, Math.max(1, parseInt(size) || 10))
  }
}

/**
 * 标准化查询参数
 * @param queryParams - 原始查询参数
 * @param allowedFields - 允许的字段列表
 * @returns 标准化的查询参数
 */
export function formatQueryParams(queryParams: Record<string, unknown>, allowedFields: string[] = []): Record<string, unknown> {
  const formatted = {}

  for (const field of allowedFields) {
    const value = queryParams[field]
    if (value !== null && value !== undefined && value !== '') {
      // 如果是字符串，去除首尾空格
      if (typeof value === 'string') {
        formatted[field] = value.trim()
      } else {
        formatted[field] = value
      }
    }
  }

  return formatted
}

/**
 * 检查和管理Token
 * @returns 有效的token
 */
export function getAuthToken(): string | null {
  return tokenManager.getAccessToken()
}

/**
 * 处理API响应数据
 * @param response - API响应（响应拦截器已返回 response.data）
 * @returns 标准化的响应数据
 *
 * 兼容两种响应格式：
 * 1. { success: true, data: { items: [], total: 0 } }
 * 2. { success: true, items: [], total: 0 } (拦截器已经解包了data)
 */
export function formatApiResponse(response: Record<string, unknown>): ApiResponse<unknown> {
  // 获取实际的数据对象（兼容两种格式）
  const data = response.data || response || {}

  return {
    success: response.success || false,
    data: data,
    message: response.message || '',
    total: response.total || data.total || 0,
    items: response.items || data.items || data.list || []
  }
}

/**
 * 安全地提取 API 响应数据（处理 null/undefined 边界情况）
 * @param response - 响应拦截器返回的响应数据（已解包 response.data）
 * @returns 提取的数据对象，如果不存在则返回空对象
 */
export function safeResponseData<T = unknown>(response: { data?: T } | null): T | null {
  if (!response) return null
  // 响应拦截器已返回 response.data，所以 response 本身就是数据
  return response.data ?? null
}

/**
 * 检查响应是否成功
 * @param response - 响应拦截器返回的响应数据
 * @returns 是否成功
 */
export function isResponseSuccess(response: { success?: boolean } | null): boolean {
  return !!response?.success
}

/**
 * 获取响应消息
 * @param response - 响应拦截器返回的响应数据
 * @param defaultMessage - 默认消息
 * @returns 响应消息
 */
export function getResponseMessage(response: { message?: string } | null, defaultMessage: string = ''): string {
  return response?.message || defaultMessage
}

/**
 * 创建带认证头的配置对象
 * @param additionalConfig - 额外的配置选项
 * @returns 包含认证头的配置对象
 */
export function createAuthConfig(additionalConfig: Record<string, unknown> = {}): Record<string, unknown> {
  const token = getAuthToken()
  const config = { ...additionalConfig }

  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    }
  }

  return config
}

/**
 * 执行带认证的API调用（通用方法）
 * @param apiFn - API函数
 * @param data - 请求数据
 * @param requireAuth - 是否需要认证（默认true）
 * @returns API响应
 *
 * @example
 * // 使用示例
 * const result = await callWithAuth(
 *   (params) => api.get('/api/science/articles', params),
 *   { id: 1 },
 *   true
 * )
 */
export async function callWithAuth<T = unknown>(
  apiFn: (data?: Record<string, unknown>, config?: Record<string, unknown>) => Promise<ApiResponse<T>>,
  data: Record<string, unknown> = {},
  requireAuth: boolean = true
): Promise<ApiResponse<T>> {
  try {
    // 如果需要认证但没有token，返回错误
    if (requireAuth && !getAuthToken()) {
      return {
        success: false,
        data: null as any,
        message: '未登录，请先登录'
      }
    }

    // 创建配置
    const config = requireAuth ? createAuthConfig() : {}

    // 调用API
    const response = await apiFn(data, config)

    return response
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '操作失败'
    return {
      success: false,
      data: null as T | null,
      message: errorMessage
    }
  }
}

/**
 * 批量执行API调用
 * @param apiCalls - API调用函数数组
 * @returns 所有响应的数组
 *
 * @example
 * const results = await batchApiCalls([
 *   () => api.get('/api/science/articles/1'),
 *   () => api.get('/api/science/articles/2')
 * ])
 */
export async function batchApiCalls<T = unknown>(
  apiCalls: Array<() => Promise<ApiResponse<T>>>
): Promise<ApiResponse<T>[]> {
  try {
    const results = await Promise.all(apiCalls.map(call => call()))
    return results
  } catch (error: unknown) {
    console.error('批量API调用失败:', error)
    return []
  }
}

/**
 * 串行执行API调用（按顺序执行）
 * @param apiCalls - API调用函数数组
 * @param stopOnError - 遇到错误是否停止（默认true）
 * @returns 所有响应的数组
 *
 * @example
 * const results = await serialApiCalls([
 *   () => scienceApi.likeScience(1),
 *   () => scienceApi.recordScienceVisit(1)
 * ])
 */
export async function serialApiCalls<T = unknown>(
  apiCalls: Array<() => Promise<ApiResponse<T>>>,
  stopOnError: boolean = true
): Promise<ApiResponse<T>[]> {
  const results: ApiResponse<T>[] = []

  for (const apiCall of apiCalls) {
    try {
      const result = await apiCall()
      results.push(result)

      // 如果失败且配置为停止执行，则中断
      if (stopOnError && !result.success) {
        break
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '操作失败'
      const errorResult: ApiResponse<T> = {
        success: false,
        data: null as T | null,
        message: errorMessage
      }
      results.push(errorResult)

      if (stopOnError) {
        break
      }
    }
  }

  return results
}

/**
 * 带重试的API调用
 * @param apiFn - API函数
 * @param maxRetries - 最大重试次数（默认3）
 * @param retryDelay - 重试延迟（毫秒，默认1000）
 * @returns API响应
 *
 * @example
 * const result = await retryApiCall(
 *   () => api.get('/api/science/articles/1'),
 *   3,
 *   1000
 * )
 */
export async function retryApiCall<T = unknown>(
  apiFn: () => Promise<ApiResponse<T>>,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<ApiResponse<T>> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await apiFn()
      if (result.success) {
        return result
      }
      lastError = result
    } catch (error) {
      lastError = error
    }

    // 如果不是最后一次尝试，等待后重试
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay))
    }
  }

  // 所有重试都失败
  return {
    success: false,
    data: null as T | null,
    message: lastError?.message || '请求失败，请稍后重试'
  }
}