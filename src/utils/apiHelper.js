/**
 * API接口辅助工具
 * 统一管理员API调用格式
 */

import { adminApi } from '@/api/index.js'

/**
 * 统一的管理员操作API调用
 * @param {string} tableName - 表名
 * @param {string} operationType - 操作类型 (list, detail, add, update, delete, batch_delete)
 * @param {Object} options - 操作参数
 * @returns {Promise} API调用结果
 */
export function adminOperate(tableName, operationType, options = {}) {
  const params = {
    table_name: tableName,
    operate_type: operationType
  }

  // 根据操作类型添加不同的参数结构
  switch (operationType) {
    case 'list':
      params.kwargs = {
        page: options.page || 1,
        size: options.size || 10,
        ...options.filters
      }
      break

    case 'detail':
      params.id = options.id
      break

    case 'add':
      params.kwargs = options.data
      break

    case 'update':
      params.id = options.id
      params.kwargs = options.data
      break

    case 'delete':
      params.id = options.id
      break

    case 'batch_delete':
      params.kwargs = { ids: options.ids }
      break

    default:
      params.kwargs = options.data
      break
  }

  return adminApi.operate(params)
}

/**
 * 标准化错误处理
 * @param {Error} error - 错误对象
 * @param {string} defaultMessage - 默认错误消息
 * @returns {string} 用户友好的错误消息
 */
export function formatErrorMessage(error, defaultMessage = '操作失败') {
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
 * @param {number} page - 当前页码
 * @param {number} size - 每页大小
 * @returns {Object} 标准化的分页参数
 */
export function formatPaginationParams(page, size) {
  return {
    page: Math.max(1, parseInt(page) || 1),
    size: Math.min(100, Math.max(1, parseInt(size) || 10))
  }
}

/**
 * 标准化查询参数
 * @param {Object} queryParams - 原始查询参数
 * @param {Array} allowedFields - 允许的字段列表
 * @returns {Object} 标准化的查询参数
 */
export function formatQueryParams(queryParams, allowedFields = []) {
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
 * @returns {string|null} 有效的token
 */
export function getAuthToken() {
  return localStorage.getItem('admin_token') || localStorage.getItem('user_token')
}

/**
 * 处理API响应数据
 * @param {Object} response - API响应
 * @returns {Object} 标准化的响应数据
 */
export function formatApiResponse(response) {
  return {
    success: response.success || false,
    data: response.data || response,
    message: response.message,
    total: response.total || response.data?.total || 0,
    items: response.items || response.data?.items || []
  }
}