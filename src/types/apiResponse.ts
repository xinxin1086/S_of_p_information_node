/**
 * 统一 API 响应类型定义
 * 规范所有 API 响应的数据结构，确保类型安全和一致性
 */

/**
 * 标准分页参数
 */
export interface PaginationParams {
  page: number
  pageSize?: number
  size?: number
  limit?: number
  offset?: number
}

/**
 * 分页元数据
 */
export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

/**
 * 标准分页响应
 */
export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationMeta
  success: boolean
  message?: string
}

/**
 * 标准成功响应（带数据）
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
  code?: string
  timestamp?: string
}

/**
 * 标准错误响应
 */
export interface ApiErrorResponse {
  success: false
  error: string
  message: string
  code?: string
  details?: unknown
  timestamp?: string
}

/**
 * 统一 API 响应类型（成功或错误）
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * 判断是否为成功响应的类型守卫
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true
}

/**
 * 判断是否为错误响应的类型守卫
 */
export function isErrorResponse(response: ApiResponse): response is ApiErrorResponse {
  return response.success === false
}

/**
 * 提取响应数据
 */
export function getResponseData<T>(response: ApiResponse<T>): T | null {
  if (isSuccessResponse(response)) {
    return response.data
  }
  return null
}

/**
 * 提取响应消息
 */
export function getResponseMessage(response: ApiResponse): string {
  if (isSuccessResponse(response)) {
    return response.message || '操作成功'
  }
  return response.message || response.error || '操作失败'
}

/**
 * 批量操作结果
 */
export interface BatchOperationResult<T> {
  successful: T[]
  failed: Array<{
    item: T
    error: string
    message?: string
  }>
  totalProcessed: number
  successCount: number
  failureCount: number
}

/**
 * 创建成功响应
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  code?: string
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    message,
    code,
    timestamp: new Date().toISOString()
  }
}

/**
 * 创建错误响应
 */
export function createErrorResponse(
  error: string,
  message?: string,
  code?: string,
  details?: unknown
): ApiErrorResponse {
  return {
    success: false,
    error,
    message: message || error,
    code,
    details,
    timestamp: new Date().toISOString()
  }
}

/**
 * 响应包装器类型（用于包装原始响应数据）
 */
export type ResponseWrapper<T = unknown> = ApiResponse<T>

/**
 * 文件上传响应
 */
export interface FileUploadResponse {
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
}

/**
 * 导出任务响应
 */
export interface ExportTaskResponse {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  fileUrl?: string
  progress?: number
  message?: string
}

/**
 * 统计数据响应
 */
export interface StatisticsResponse {
  total: number
  growth?: number
  growthRate?: string
  breakdown?: Record<string, number>
  period?: string
}

/**
 * 通用列表响应（不分页）
 */
export interface ListResponse<T> {
  items: T[]
  total: number
  success: boolean
  message?: string
}

/**
 * 创建列表响应
 */
export function createListResponse<T>(
  items: T[],
  message?: string
): ListResponse<T> {
  return {
    items,
    total: items.length,
    success: true,
    message
  }
}

/**
 * 创建分页响应
 */
export function createPaginatedResponse<T>(
  items: T[],
  pagination: PaginationMeta,
  message?: string
): PaginatedResponse<T> {
  return {
    items,
    pagination,
    success: true,
    message
  }
}

/**
 * API 响应验证选项
 */
export interface ValidationOptions {
  /** 是否验证 success 字段 */
  validateSuccess?: boolean
  /** 是否验证 data 字段存在性 */
  validateDataExists?: boolean
  /** 自定义验证函数 */
  customValidator?: (_response: ApiResponse) => boolean
}

/**
 * 验证 API 响应
 */
export function validateResponse(
  response: ApiResponse,
  options: ValidationOptions = {}
): { valid: boolean; error?: string } {
  const {
    validateSuccess = true,
    validateDataExists = false,
    customValidator
  } = options

  // 验证 success 字段
  if (validateSuccess && !response.success) {
    return {
      valid: false,
      error: response.message || response.error || '请求失败'
    }
  }

  // 验证数据存在性
  if (validateDataExists && isSuccessResponse(response)) {
    if (response.data === undefined || response.data === null) {
      return {
        valid: false,
        error: '响应数据为空'
      }
    }
  }

  // 自定义验证
  if (customValidator && !customValidator(response)) {
    return {
      valid: false,
      error: '自定义验证失败'
    }
  }

  return { valid: true }
}

/**
 * 响应数据转换器
 */
export type ResponseTransformer<T, R = T> = (_data: T) => R

/**
 * 应用转换器到响应数据
 */
export function transformResponse<T, R>(
  response: ApiResponse<T>,
  transformer: ResponseTransformer<T, R>
): ApiResponse<R> {
  if (isSuccessResponse(response)) {
    return {
      ...response,
      data: transformer(response.data)
    }
  }
  return response as unknown as ApiResponse<R>
}

/**
 * 批量响应处理
 */
export interface BatchResponseResult<T> {
  responses: ApiResponse<T>[]
  successCount: number
  failureCount: number
  hasAnyFailure: boolean
}

/**
 * 批量处理响应
 */
export function processBatchResponses<T>(
  responses: ApiResponse<T>[]
): BatchResponseResult<T> {
  const successCount = responses.filter(isSuccessResponse).length
  const failureCount = responses.length - successCount

  return {
    responses,
    successCount,
    failureCount,
    hasAnyFailure: failureCount > 0
  }
}

export default {
  isSuccessResponse,
  isErrorResponse,
  getResponseData,
  getResponseMessage,
  createSuccessResponse,
  createErrorResponse,
  createListResponse,
  createPaginatedResponse,
  validateResponse,
  transformResponse,
  processBatchResponses
}
