/**
 * API 响应拦截器
 * 提供统一的响应拦截、转换和错误处理
 */

import type { AxiosResponse, AxiosError, InternalAxiosRequestConfig, AxiosInstance } from 'axios'
import { ElMessage, ElNotification } from 'element-plus'

import type { ApiResponse } from '@/types/apiResponse'
import type { ApiError } from '@/types/auth'
import { wrapResponse, wrapError } from '@/utils/responseTransformer'

/**
 * 拦截器配置选项
 */
export interface InterceptorConfig {
  /** 是否显示成功消息 */
  showSuccessMessage?: boolean
  /** 是否显示错误消息 */
  showErrorMessage?: boolean
  /** 是否使用通知组件 */
  useNotification?: boolean
  /** 成功消息文本 */
  successMessage?: string
  /** 自定义错误处理 */
  customErrorHandler?: (error: ApiError) => void
  /** 响应数据转换器 */
  responseTransformer?: (data: unknown) => unknown
  /** 是否启用响应日志 */
  enableLogging?: boolean
  /** 是否验证响应格式 */
  validateResponse?: boolean
}

/**
 * 默认拦截器配置
 */
const defaultConfig: InterceptorConfig = {
  showSuccessMessage: false,
  showErrorMessage: true,
  useNotification: false,
  enableLogging: import.meta.env.DEV,
  validateResponse: true
}

/**
 * 响应拦截器类
 */
export class ResponseInterceptor {
  private config: InterceptorConfig

  constructor(config: InterceptorConfig = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<InterceptorConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 成功响应拦截器
   */
  handleSuccess(response: AxiosResponse): AxiosResponse {
    const { enableLogging, responseTransformer, showSuccessMessage, successMessage, useNotification } = this.config

    // 日志记录
    if (enableLogging) {
      console.log('✅ API响应成功:', {
        url: response.config.url,
        method: response.config.method?.toUpperCase(),
        status: response.status,
        data: response.data
      })
    }

    // 验证响应格式
    if (this.config.validateResponse) {
      const validated = this.validateResponseFormat(response.data)
      if (!validated.valid) {
        console.warn('⚠️ 响应格式验证失败:', validated.error)
      }
    }

    // 应用自定义转换器
    if (responseTransformer && response.data) {
      response.data = responseTransformer(response.data)
    }

    // 显示成功消息
    if (showSuccessMessage) {
      const message = successMessage || this.extractSuccessMessage(response.data)
      if (message) {
        if (useNotification) {
          ElNotification({
            title: '操作成功',
            message,
            type: 'success',
            duration: 3000
          })
        } else {
          ElMessage({
            message,
            type: 'success',
            duration: 3000
          })
        }
      }
    }

    // 包装响应数据
    response.data = wrapResponse(response.data)

    return response
  }

  /**
   * 错误响应拦截器
   */
  async handleError(error: AxiosError): Promise<never> {
    const { showErrorMessage, useNotification, customErrorHandler, enableLogging } = this.config

    // 包装错误
    const apiError = wrapError(error)

    // 日志记录
    if (enableLogging) {
      console.error('❌ API响应错误:', {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        status: error.response?.status,
        message: apiError.message,
        error
      })
    }

    // 自定义错误处理
    if (customErrorHandler) {
      customErrorHandler(apiError)
    } else {
      // 默认错误处理
      this.handleDefaultError(apiError, useNotification)
    }

    return Promise.reject(apiError)
  }

  /**
   * 处理权限错误
   */
  private handlePermissionError(error: ApiError): void {
    ElNotification({
      title: '权限不足',
      message: error.message || '您没有执行此操作的权限',
      type: 'error',
      duration: 5000
    })
  }

  /**
   * 处理网络错误
   */
  private handleNetworkError(error: ApiError): void {
    ElNotification({
      title: '网络连接失败',
      message: error.message || '请检查网络连接后重试',
      type: 'error',
      duration: 0
    })
  }

  /**
   * 处理服务器错误
   */
  private handleServerError(error: ApiError): void {
    ElNotification({
      title: '服务器错误',
      message: error.message || '服务器暂时无法响应，请稍后重试',
      type: 'error',
      duration: 6000
    })
  }

  /**
   * 处理验证错误
   */
  private handleValidationError(error: ApiError, useNotification?: boolean): void {
    const message = error.message || '数据验证失败'

    if (useNotification) {
      ElNotification({
        title: '数据验证失败',
        message,
        type: 'warning',
        duration: 5000
      })
    } else {
      ElMessage({
        message,
        type: 'warning',
        duration: 5000
      })
    }
  }

  /**
   * 处理其他错误
   */
  private handleGenericError(error: ApiError, useNotification?: boolean): void {
    const message = error.message || '操作失败，请重试'

    if (useNotification) {
      ElNotification({
        title: '操作失败',
        message,
        type: 'error',
        duration: 5000
      })
    } else {
      ElMessage({
        message,
        type: 'error',
        duration: 5000
      })
    }
  }

  /**
   * 默认错误处理
   */
  private handleDefaultError(error: ApiError, useNotification?: boolean): void {
    if (error.isPermissionError) {
      this.handlePermissionError(error)
      return
    }

    if (error.isNetworkError) {
      this.handleNetworkError(error)
      return
    }

    if (error.isServerError) {
      this.handleServerError(error)
      return
    }

    if (error.isValidationError) {
      this.handleValidationError(error, useNotification)
      return
    }

    this.handleGenericError(error, useNotification)
  }

  /**
   * 验证响应格式
   */
  private validateResponseFormat(data: unknown): { valid: boolean; error?: string } {
    // 基本格式验证
    if (!data || typeof data !== 'object') {
      return { valid: false, error: '响应数据格式无效' }
    }

    const responseData = data as Record<string, unknown>

    // 检查是否包含 success 字段
    if ('success' in responseData && typeof responseData.success !== 'boolean') {
      return { valid: false, error: 'success 字段必须是布尔值' }
    }

    // 如果有 data 字段，确保它存在
    if (responseData.success === true && !('data' in responseData)) {
      return { valid: false, error: '成功响应必须包含 data 字段' }
    }

    return { valid: true }
  }

  /**
   * 提取成功消息
   */
  private extractSuccessMessage(data: unknown): string | undefined {
    if (!data || typeof data !== 'object') {
      return undefined
    }

    const responseData = data as Record<string, unknown>

    // 从标准响应中提取消息
    if (responseData.message && typeof responseData.message === 'string') {
      return responseData.message
    }

    // 从自定义字段提取
    if (responseData.msg && typeof responseData.msg === 'string') {
      return responseData.msg
    }

    return undefined
  }

  /**
   * 创建请求拦截器（用于添加请求ID等）
   */
  createRequestInterceptor() {
    return (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      // 添加请求ID用于追踪
      config.headers = config.headers || {}
      config.headers['X-Request-ID'] = this.generateRequestId()

      // 添加时间戳
      config.metadata = { ...config.metadata, startTime: Date.now() }

      return config
    }
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }
}

/**
 * 创建默认的响应拦截器实例
 */
export const defaultResponseInterceptor = new ResponseInterceptor()

/**
 * 创建自定义配置的响应拦截器实例
 */
export function createResponseInterceptor(
  config: InterceptorConfig
): ResponseInterceptor {
  return new ResponseInterceptor(config)
}

/**
 * 批量操作响应拦截器
 * 用于处理批量API调用的响应
 */
export class BatchResponseInterceptor {
  private config: InterceptorConfig

  constructor(config: InterceptorConfig = {}) {
    this.config = {
      ...defaultConfig,
      showSuccessMessage: false,
      showErrorMessage: false,
      ...config
    }
  }

  /**
   * 处理批量响应
   */
  handleBatchResponses<T>(responses: ApiResponse<T>[]): {
    successful: ApiResponse<T>[]
    failed: ApiResponse<T>[]
    summary: string
  } {
    const successful = responses.filter(r => r.success)
    const failed = responses.filter(r => !r.success)

    const summary = `批量操作完成: 成功 ${successful.length}/${responses.length}`

    // 只在配置启用时显示消息
    if (this.config.showSuccessMessage && successful.length > 0) {
      ElMessage.success(`${successful.length} 个操作成功`)
    }

    if (this.config.showErrorMessage && failed.length > 0) {
      ElMessage.warning(`${failed.length} 个操作失败`)
    }

    return {
      successful,
      failed,
      summary
    }
  }

  /**
   * 按错误类型分组
   */
  private groupErrorsByType(errors: ApiError[]): {
    network: ApiError[]
    server: ApiError[]
    permission: ApiError[]
    other: ApiError[]
  } {
    return errors.reduce((groups, error) => {
      if (error.isNetworkError) {
        groups.network.push(error)
      } else if (error.isServerError) {
        groups.server.push(error)
      } else if (error.isPermissionError) {
        groups.permission.push(error)
      } else {
        groups.other.push(error)
      }
      return groups
    }, {
      network: [] as ApiError[],
      server: [] as ApiError[],
      permission: [] as ApiError[],
      other: [] as ApiError[]
    })
  }

  /**
   * 显示批量错误通知
   */
  private showBatchErrorNotifications(
    errorGroups: { network: ApiError[]; server: ApiError[]; permission: ApiError[]; other: ApiError[] }
  ): void {
    if (errorGroups.network.length > 0) {
      ElNotification({
        title: '网络错误',
        message: `${errorGroups.network.length} 个请求因网络问题失败`,
        type: 'error',
        duration: 5000
      })
    }

    if (errorGroups.server.length > 0) {
      ElNotification({
        title: '服务器错误',
        message: `${errorGroups.server.length} 个请求因服务器问题失败`,
        type: 'error',
        duration: 5000
      })
    }

    if (errorGroups.permission.length > 0) {
      ElNotification({
        title: '权限错误',
        message: `${errorGroups.permission.length} 个请求因权限不足失败`,
        type: 'warning',
        duration: 5000
      })
    }
  }

  /**
   * 处理批量错误
   */
  handleBatchErrors(errors: ApiError[]): void {
    if (!this.config.showErrorMessage || errors.length === 0) {
      return
    }

    const errorGroups = this.groupErrorsByType(errors)
    this.showBatchErrorNotifications(errorGroups)
  }
}

/**
 * 创建批量响应拦截器实例
 */
export function createBatchResponseInterceptor(
  config: InterceptorConfig = {}
): BatchResponseInterceptor {
  return new BatchResponseInterceptor(config)
}

/**
 * 导出工厂函数，用于快速配置 Axios 拦截器
 */
export function setupResponseInterceptors(
  axiosInstance: AxiosInstance,
  config?: InterceptorConfig
): { responseInterceptor: ResponseInterceptor; ejectors: { response: number; error: number } } {
  const interceptor = new ResponseInterceptor(config)

  const responseInterceptorId = axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => interceptor.handleSuccess(response),
    (error: AxiosError) => interceptor.handleError(error)
  )

  return {
    responseInterceptor: interceptor,
    ejectors: {
      response: responseInterceptorId,
      error: responseInterceptorId
    }
  }
}

export default {
  ResponseInterceptor,
  BatchResponseInterceptor,
  defaultResponseInterceptor,
  createResponseInterceptor,
  createBatchResponseInterceptor,
  setupResponseInterceptors
}
