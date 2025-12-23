/**
 * API接口辅助工具
 * 提供 API 调用的格式化和辅助函数
 */

import { tokenManager } from '@/utils/tokenManager'

// API响应接口定义
interface ApiResponse<T = any> {
  success: boolean
  data: T
  message: string
  total?: number
  items?: any[]
}

interface PaginatedResponse<T = any> {
  success: boolean
  data: {
    list: T[]
    total: number
    page: number
    page_size: number
    total_pages: number
  }
  message: string
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
export function formatQueryParams(queryParams: Record<string, any>, allowedFields: string[] = []): Record<string, any> {
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
export function formatApiResponse(response: any): ApiResponse {
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
export function safeResponseData<T = any>(response: any): T | null {
  if (!response) return null
  // 响应拦截器已返回 response.data，所以 response 本身就是数据
  return response.data ?? null
}

/**
 * 检查响应是否成功
 * @param response - 响应拦截器返回的响应数据
 * @returns 是否成功
 */
export function isResponseSuccess(response: any): boolean {
  return !!response?.success
}

/**
 * 获取响应消息
 * @param response - 响应拦截器返回的响应数据
 * @param defaultMessage - 默认消息
 * @returns 响应消息
 */
export function getResponseMessage(response: any, defaultMessage: string = ''): string {
  return response?.message || defaultMessage
}