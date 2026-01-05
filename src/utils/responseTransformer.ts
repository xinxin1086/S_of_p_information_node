/**
 * API 响应数据转换工具
 * 提供统一的数据转换、格式化和验证功能
 */

import type {
  ApiResponse,
  PaginatedResponse,
  PaginationMeta,
  ResponseTransformer
} from '@/types/apiResponse'
import type { ApiError } from '@/types/auth'

/**
 * 分页数据转换器
 * 将后端返回的分页数据转换为前端标准格式
 */
export function transformPaginationData<T>(
  response: ApiResponse<unknown>,
  options?: {
    itemsKey?: string
    totalKey?: string
    pageKey?: string
    pageSizeKey?: string
  }
): PaginatedResponse<T> {
  const {
    itemsKey = 'items',
    totalKey = 'total',
    pageKey = 'page',
    pageSizeKey = 'pageSize'
  } = options || {}

  if (!response.success || !response.data) {
    return {
      items: [],
      pagination: {
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      },
      success: false,
      message: response.message || '数据获取失败'
    }
  }

  const data = response.data as Record<string, unknown>
  const items = (data[itemsKey] || data.data || []) as T[]
  const total = (data[totalKey] || data.total || 0) as number
  const page = (data[pageKey] || data.page || 1) as number
  const pageSize = (data[pageSizeKey] || data.pageSize || 10) as number
  const totalPages = Math.ceil(total / pageSize)

  return {
    items,
    pagination: {
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    success: true,
    message: response.message
  }
}

/**
 * 时间字段转换器
 * 将后端返回的时间字符串转换为 Date 对象或格式化字符串
 */
export function transformDateFields<T extends Record<string, unknown>>(
  data: T,
  dateFields: (keyof T)[],
  format?: 'timestamp' | 'iso' | 'locale'
): T {
  const transformed = { ...data }

  dateFields.forEach(field => {
    const value = transformed[field]
    if (value && typeof value === 'string') {
      const date = new Date(value)

      if (!isNaN(date.getTime())) {
        if (format === 'timestamp') {
          transformed[field] = date.getTime() as T[typeof field]
        } else if (format === 'iso') {
          transformed[field] = date.toISOString() as T[typeof field]
        } else if (format === 'locale') {
          transformed[field] = date.toLocaleString('zh-CN') as T[typeof field]
        } else {
          transformed[field] = date as T[typeof field]
        }
      }
    }
  })

  return transformed
}

/**
 * 数值字段转换器
 * 确保数值字段为 number 类型
 */
export function transformNumberFields<T extends Record<string, unknown>>(
  data: T,
  numberFields: (keyof T)[]
): T {
  const transformed = { ...data }

  numberFields.forEach(field => {
    const value = transformed[field]
    if (value !== null && value !== undefined) {
      const numValue = typeof value === 'string' ? parseFloat(value) : value
      transformed[field] = (isNaN(numValue as number) ? 0 : numValue) as T[typeof field]
    }
  })

  return transformed
}

/**
 * 布尔字段转换器
 * 将各种布尔表示转换为标准布尔值
 */
export function transformBooleanFields<T extends Record<string, unknown>>(
  data: T,
  booleanFields: (keyof T)[]
): T {
  const transformed = { ...data }

  booleanFields.forEach(field => {
    const value = transformed[field]
    if (value === 'true' || value === '1' || value === 1) {
      transformed[field] = true as T[typeof field]
    } else if (value === 'false' || value === '0' || value === 0) {
      transformed[field] = false as T[typeof field]
    } else {
      transformed[field] = Boolean(value) as T[typeof field]
    }
  })

  return transformed
}

/**
 * 用户信息转换器
 * 标准化用户数据结构
 */
export interface UserData {
  id: number
  username: string
  nickname?: string
  avatar?: string
  email?: string
  phone?: string
  role?: string
  userType?: string
}

export function transformUser(data: unknown): UserData | null {
  if (!data || typeof data !== 'object') {
    return null
  }

  const user = data as Record<string, unknown>

  return {
    id: (user.id || user.user_id || 0) as number,
    username: (user.username || user.nickname || user.name || '') as string,
    nickname: (user.nickname || user.display_name) as string | undefined,
    avatar: (user.avatar || user.avatar_url || user.head_img) as string | undefined,
    email: user.email as string | undefined,
    phone: user.phone as string | undefined,
    role: user.role as string | undefined,
    userType: user.user_type as string | undefined
  }
}

/**
 * 批量转换用户信息
 */
export function transformUsers(data: unknown[]): UserData[] {
  if (!Array.isArray(data)) {
    return []
  }

  return data.map(transformUser).filter((user): user is UserData => user !== null)
}

/**
 * 列表数据转换器
 * 处理各种格式的列表响应
 */
export function transformListData<T>(response: ApiResponse<unknown>, options?: {
  itemsKey?: string
  transformer?: ResponseTransformer<T, T>
}): T[] {
  const { itemsKey = 'items', transformer } = options || {}

  if (!response.success || !response.data) {
    return []
  }

  let items: unknown[] = []

  if (Array.isArray(response.data)) {
    items = response.data
  } else if (typeof response.data === 'object') {
    const data = response.data as Record<string, unknown>
    items = (data[itemsKey] || data.data || data.list || []) as unknown[]
  }

  if (transformer) {
    return items.map(item => transformer(item as T)).filter(Boolean) as T[]
  }

  return items as T[]
}

/**
 * 响应数据包装器
 * 确保响应符合标准格式
 */
export function wrapResponse<T>(
  data: T | ApiResponse<T>,
  defaultMessage = '操作成功'
): ApiResponse<T> {
  if (typeof data === 'object' && data !== null && 'success' in data) {
    return data as ApiResponse<T>
  }

  return {
    success: true,
    data: data as T,
    message: defaultMessage,
    timestamp: new Date().toISOString()
  }
}

/**
 * 错误响应包装器
 * 将各种错误格式转换为标准 ApiError
 */
export function wrapError(error: unknown): ApiError {
  if (error && typeof error === 'object') {
    // 已经是 ApiError 格式
    if ('isNetworkError' in error || 'isServerError' in error) {
      return error as ApiError
    }

    // Axios 错误格式
    if ('response' in error) {
      const axiosError = error as { response?: { status?: number; data?: unknown } }
      const status = axiosError.response?.status
      const data = axiosError.response?.data as { message?: string; code?: string } | undefined

      return {
        code: data?.code || `HTTP_${status}`,
        message: data?.message || `请求失败 (${status})`,
        isNetworkError: false,
        isServerError: (status || 0) >= 500,
        isValidationError: status === 422,
        isPermissionError: status === 403
      }
    }

    // 普通错误对象
    if ('message' in error) {
      return {
        code: 'ERROR',
        message: (error as Error).message,
        isNetworkError: false,
        isServerError: false,
        isValidationError: false,
        isPermissionError: false
      }
    }
  }

  // 字符串错误
  if (typeof error === 'string') {
    return {
      code: 'ERROR',
      message: error,
      isNetworkError: false,
      isServerError: false,
      isValidationError: false,
      isPermissionError: false
    }
  }

  // 未知错误
  return {
    code: 'UNKNOWN_ERROR',
    message: '未知错误',
    isNetworkError: false,
    isServerError: false,
    isValidationError: false,
    isPermissionError: false
  }
}

/**
 * 数据清理工具
 * 移除空值和 undefined
 */
export function cleanData<T extends Record<string, unknown>>(data: T): Partial<T> {
  const cleaned: Partial<T> = {}

  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key as keyof T] = value
    }
  })

  return cleaned
}

/**
 * 深度清理数据
 * 递归清理嵌套对象中的空值
 */
export function deepCleanData<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map(item => deepCleanData(item)) as T
  }

  if (data !== null && typeof data === 'object') {
    const cleaned: Record<string, unknown> = {}

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        cleaned[key] = typeof value === 'object' ? deepCleanData(value) : value
      }
    })

    return cleaned as T
  }

  return data
}

/**
 * 字段重命名转换器
 * 重命名数据对象的字段
 */
export function renameFields<T extends Record<string, unknown>>(
  data: T,
  fieldMap: Record<string, string>
): T {
  const transformed = { ...data }

  Object.entries(fieldMap).forEach(([oldName, newName]) => {
    if (oldName in transformed) {
      transformed[newName as keyof T] = transformed[oldName as keyof T]
      delete transformed[oldName as keyof T]
    }
  })

  return transformed
}

/**
 * 批量字段重命名
 */
export function renameFieldsInArray<T extends Record<string, unknown>>(
  dataArray: T[],
  fieldMap: Record<string, string>
): T[] {
  return dataArray.map(item => renameFields(item, fieldMap))
}

/**
 * 默认值填充器
 * 为缺失的字段提供默认值
 */
export function fillDefaultValues<T extends Record<string, unknown>>(
  data: T,
  defaults: Partial<T>
): T {
  return {
    ...defaults,
    ...data
  }
}

/**
 * 验证响应数据完整性
 */
export function validateDataIntegrity<T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[]
): { valid: boolean; missingFields: string[] } {
  const missingFields: string[] = []

  requiredFields.forEach(field => {
    if (!(field in data) || data[field] === null || data[field] === undefined) {
      missingFields.push(String(field))
    }
  })

  return {
    valid: missingFields.length === 0,
    missingFields
  }
}

/**
 * 创建数据转换管道
 * 可以链式调用多个转换器
 */
export class TransformPipeline<T = unknown> {
  private transformers: Array<(data: T) => T> = []

  add(transformer: (data: T) => T): this {
    this.transformers.push(transformer)
    return this
  }

  execute(data: T): T {
    return this.transformers.reduce(
      (result, transformer) => transformer(result),
      data
    )
  }
}

/**
 * 创建转换管道实例
 */
export function createTransformPipeline<T>(): TransformPipeline<T> {
  return new TransformPipeline<T>()
}

export default {
  transformPaginationData,
  transformDateFields,
  transformNumberFields,
  transformBooleanFields,
  transformUser,
  transformUsers,
  transformListData,
  wrapResponse,
  wrapError,
  cleanData,
  deepCleanData,
  renameFields,
  renameFieldsInArray,
  fillDefaultValues,
  validateDataIntegrity,
  createTransformPipeline
}
