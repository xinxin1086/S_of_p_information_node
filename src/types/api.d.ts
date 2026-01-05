/**
 * API相关类型定义
 */

// HTTP方法类型
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

// 请求配置接口
export interface RequestConfig {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
  useAuth?: boolean
  baseURL?: string
  params?: Record<string, unknown>
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer'
  withCredentials?: boolean
}

// 响应配置接口
export interface ResponseConfig {
  status: number
  statusText: string
  headers: Record<string, string>
  config: RequestConfig
  data: unknown
  request?: unknown
}

// 拦截器接口
export interface RequestInterceptor {
  (config: RequestConfig): RequestConfig | Promise<RequestConfig>
}

export interface ResponseInterceptor {
  (response: ResponseConfig): ResponseConfig | Promise<ResponseConfig>
}

export interface ErrorInterceptor {
  (error: unknown): unknown
}

// API客户端接口
export interface ApiClient {
  get<T = unknown>(url: string, config?: RequestConfig): Promise<T>
  post<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T>
  put<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T>
  delete<T = unknown>(url: string, config?: RequestConfig): Promise<T>
  patch<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T>
  request<T = unknown>(config: RequestConfig & { url: string }): Promise<T>

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
    error: Error
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
  data?: Record<string, unknown>
  headers?: Record<string, string>
  onProgress?: (progress: number) => void
  onSuccess?: (response: unknown) => void
  onError?: (error: Error) => void
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

export interface WebSocketMessage<T = unknown> {
  type: string
  data: T
  timestamp?: number
  id?: string
}

export {}