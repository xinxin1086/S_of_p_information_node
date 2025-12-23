/**
 * API相关类型定义
 */

import type { ApiError, ApiResponse } from './auth'

// HTTP方法类型
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

// 请求配置接口
export interface RequestConfig {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: any
  timeout?: number
  useAuth?: boolean
  baseURL?: string
  params?: Record<string, any>
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer'
  withCredentials?: boolean
}

// 响应配置接口
export interface ResponseConfig {
  status: number
  statusText: string
  headers: Record<string, string>
  config: RequestConfig
  data: any
  request?: any
}

// 拦截器接口
export interface RequestInterceptor {
  (config: RequestConfig): RequestConfig | Promise<RequestConfig>
}

export interface ResponseInterceptor {
  (response: ResponseConfig): ResponseConfig | Promise<ResponseConfig>
}

export interface ErrorInterceptor {
  (error: any): any
}

// API客户端接口
export interface ApiClient {
  get<T = any>(url: string, config?: RequestConfig): Promise<T>
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T>
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T>
  delete<T = any>(url: string, config?: RequestConfig): Promise<T>
  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T>
  request<T = any>(config: RequestConfig & { url: string }): Promise<T>

  // 拦截器管理
  addRequestInterceptor(interceptor: RequestInterceptor): number
  addResponseInterceptor(interceptor: ResponseInterceptor): number
  addErrorInterceptor(interceptor: ErrorInterceptor): number
  removeRequestInterceptor(id: number): void
  removeResponseInterceptor(id: number): void
  removeErrorInterceptor(id: number): void
}

// 分页相关类型
export interface PaginationParams {
  page: number
  pageSize?: number
  limit?: number
  offset?: number
}

export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
  success: boolean
  message?: string
}

// 批量操作类型
export interface BatchOperation<T> {
  action: 'create' | 'update' | 'delete'
  items: T[]
  options?: {
    validateOnly?: boolean
    continueOnError?: boolean
  }
}

export interface BatchResult<T> {
  successful: T[]
  failed: Array<{
    item: T
    error: any
  }>
  totalProcessed: number
  successCount: number
  failureCount: number
}

// 文件上传类型
export interface FileUploadOptions {
  url: string
  file: File | Blob
  fieldName?: string
  data?: Record<string, any>
  headers?: Record<string, string>
  onProgress?: (progress: number) => void
  onSuccess?: (response: any) => void
  onError?: (error: any) => void
  timeout?: number
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

// 缓存相关类型
export interface CacheConfig {
  ttl?: number // 生存时间（毫秒）
  maxSize?: number // 最大缓存条目数
  strategy?: 'lru' | 'fifo' | 'lfu' // 缓存策略
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl?: number
  accessCount?: number
}

// API统计类型
export interface ApiStatistics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  totalResponseTime: number
  endpointStats: Record<string, {
    count: number
    averageTime: number
    errors: number
  }>
}

// WebSocket相关类型
export interface WebSocketConfig {
  url: string
  protocols?: string | string[]
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
  onOpen?: (event: Event) => void
  onMessage?: (event: MessageEvent) => void
  onClose?: (event: CloseEvent) => void
  onError?: (event: Event) => void
}

export interface WebSocketMessage<T = any> {
  type: string
  data: T
  timestamp?: number
  id?: string
}

export {}