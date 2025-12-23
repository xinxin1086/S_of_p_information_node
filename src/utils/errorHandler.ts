/**
 * 统一错误处理工具类
 * 提供标准化的错误处理、用户友好消息和错误报告机制
 */

import type { ApiError } from '@/types/auth'

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 错误严重级别
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * 自定义错误类
 */
export class AppError extends Error {
  public readonly type: ErrorType
  public readonly severity: ErrorSeverity
  public readonly code?: string
  public readonly details?: any
  public readonly timestamp: Date
  public readonly userMessage?: string

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN_ERROR,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    code?: string,
    details?: any,
    userMessage?: string
  ) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.severity = severity
    this.code = code
    this.details = details
    this.timestamp = new Date()
    this.userMessage = userMessage || this.generateUserMessage(type)

    // 确保堆栈跟踪正确
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }

  private generateUserMessage(type: ErrorType): string {
    const userMessages: Record<ErrorType, string> = {
      [ErrorType.NETWORK_ERROR]: '网络连接失败，请检查您的网络连接',
      [ErrorType.AUTHENTICATION_ERROR]: '登录已过期，请重新登录',
      [ErrorType.AUTHORIZATION_ERROR]: '您没有权限执行此操作',
      [ErrorType.VALIDATION_ERROR]: '输入信息有误，请检查后重试',
      [ErrorType.SERVER_ERROR]: '服务器暂时不可用，请稍后再试',
      [ErrorType.TIMEOUT_ERROR]: '请求超时，请检查网络连接后重试',
      [ErrorType.PARSE_ERROR]: '数据格式错误，请刷新页面重试',
      [ErrorType.UNKNOWN_ERROR]: '操作失败，请重试或联系技术支持'
    }

    return userMessages[type] || '操作失败，请重试'
  }

  /**
   * 转换为API错误格式
   */
  toApiError(): ApiError {
    return {
      code: this.code || this.type,
      message: this.message,
      details: this.details,
      isNetworkError: this.type === ErrorType.NETWORK_ERROR,
      isServerError: this.type === ErrorType.SERVER_ERROR,
      isValidationError: this.type === ErrorType.VALIDATION_ERROR,
      isPermissionError: this.type === ErrorType.AUTHORIZATION_ERROR
    }
  }

  /**
   * 转换为JSON格式用于日志记录
   */
  toJSON(): any {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
      userMessage: this.userMessage
    }
  }
}

/**
 * 错误处理器类
 */
export class ErrorHandler {
  private static errorLog: AppError[] = []
  private static readonly MAX_LOG_SIZE = 1000
  private static subscribers: Array<(error: AppError) => void> = []

  /**
   * 处理和分类错误
   */
  static handle(error: any, context?: string): AppError {
    const appError = this.classifyError(error, context)
    this.logError(appError)
    this.notifySubscribers(appError)
    return appError
  }

  /**
   * 分类错误
   */
  private static classifyError(error: any, context?: string): AppError {
    if (error instanceof AppError) {
      return error
    }

    // 网络错误
    if (this.isNetworkError(error)) {
      return new AppError(
        error.message || '网络连接失败',
        ErrorType.NETWORK_ERROR,
        ErrorSeverity.HIGH,
        error.code,
        { ...error, context }
      )
    }

    // HTTP状态码错误
    if (error.response) {
      const status = error.response.status
      return this.handleHttpError(error, status, context)
    }

    // 超时错误
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      return new AppError(
        '请求超时',
        ErrorType.TIMEOUT_ERROR,
        ErrorSeverity.MEDIUM,
        error.code,
        { ...error, context }
      )
    }

    // JSON解析错误
    if (error instanceof SyntaxError) {
      return new AppError(
        '数据解析失败',
        ErrorType.PARSE_ERROR,
        ErrorSeverity.MEDIUM,
        error.code,
        { ...error, context }
      )
    }

    // 未知错误
    return new AppError(
      error.message || '未知错误',
      ErrorType.UNKNOWN_ERROR,
      ErrorSeverity.MEDIUM,
      error.code,
      { ...error, context }
    )
  }

  /**
   * 处理HTTP错误
   */
  private static handleHttpError(error: any, status: number, context?: string): AppError {
    const data = error.response?.data || {}
    const message = data.message || data.error || error.message || `HTTP ${status}`

    switch (status) {
      case 401:
        return new AppError(
          message,
          ErrorType.AUTHENTICATION_ERROR,
          ErrorSeverity.HIGH,
          data.code,
          { ...error, status, context }
        )

      case 403:
        return new AppError(
          message,
          ErrorType.AUTHORIZATION_ERROR,
          ErrorSeverity.HIGH,
          data.code,
          { ...error, status, context }
        )

      case 422:
        return new AppError(
          message,
          ErrorType.VALIDATION_ERROR,
          ErrorSeverity.MEDIUM,
          data.code,
          { ...error, status, context, validationErrors: data.errors }
        )

      case 500:
      case 502:
      case 503:
      case 504:
        return new AppError(
          message,
          ErrorType.SERVER_ERROR,
          ErrorSeverity.HIGH,
          data.code,
          { ...error, status, context }
        )

      default:
        return new AppError(
          message,
          ErrorType.UNKNOWN_ERROR,
          ErrorSeverity.MEDIUM,
          data.code,
          { ...error, status, context }
        )
    }
  }

  /**
   * 判断是否为网络错误
   */
  private static isNetworkError(error: any): boolean {
    return !error.response && (
      !navigator.onLine ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('Network request failed') ||
      error.code === 'NETWORK_ERROR'
    )
  }

  /**
   * 记录错误日志
   */
  private static logError(error: AppError): void {
    // 添加到内存日志
    this.errorLog.unshift(error)

    // 限制日志大小
    if (this.errorLog.length > this.MAX_LOG_SIZE) {
      this.errorLog = this.errorLog.slice(0, this.MAX_LOG_SIZE)
    }

    // 控制台输出
    const logMethod = this.getLogMethod(error.severity)
    logMethod.call(console, `[${error.type}] ${error.message}`, error.toJSON())

    // 持久化存储关键错误
    if (error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL) {
      this.persistError(error)
    }
  }

  /**
   * 获取日志方法
   */
  private static getLogMethod(severity: ErrorSeverity): typeof console.log {
    switch (severity) {
      case ErrorSeverity.LOW:
        return console.debug
      case ErrorSeverity.MEDIUM:
        return console.info
      case ErrorSeverity.HIGH:
        return console.warn
      case ErrorSeverity.CRITICAL:
        return console.error
      default:
        return console.log
    }
  }

  /**
   * 持久化错误存储
   */
  private static persistError(error: AppError): void {
    try {
      const storedErrors = JSON.parse(localStorage.getItem('error_log') || '[]')
      storedErrors.unshift({
        ...error.toJSON(),
        timestamp: new Date().toISOString()
      })

      // 只保留最近的50个错误
      const limitedErrors = storedErrors.slice(0, 50)
      localStorage.setItem('error_log', JSON.stringify(limitedErrors))
    } catch (persistError) {
      console.warn('无法持久化错误日志:', persistError)
    }
  }

  /**
   * 通知订阅者
   */
  private static notifySubscribers(error: AppError): void {
    this.subscribers.forEach(callback => {
      try {
        callback(error)
      } catch (callbackError) {
        console.warn('错误通知回调执行失败:', callbackError)
      }
    })
  }

  /**
   * 订阅错误通知
   */
  static subscribe(callback: (error: AppError) => void): () => void {
    this.subscribers.push(callback)

    // 返回取消订阅函数
    return () => {
      const index = this.subscribers.indexOf(callback)
      if (index > -1) {
        this.subscribers.splice(index, 1)
      }
    }
  }

  /**
   * 获取错误日志
   */
  static getErrorLog(type?: ErrorType): AppError[] {
    if (type) {
      return this.errorLog.filter(error => error.type === type)
    }
    return [...this.errorLog]
  }

  /**
   * 清除错误日志
   */
  static clearErrorLog(): void {
    this.errorLog = []
    localStorage.removeItem('error_log')
  }

  /**
   * 创建用户友好的错误消息
   */
  static createUserMessage(error: any): string {
    const appError = error instanceof AppError ? error : this.classifyError(error)
    return appError.userMessage || '操作失败，请重试'
  }

  /**
   * 判断是否需要重新登录
   */
  static shouldReauth(error: any): boolean {
    const appError = error instanceof AppError ? error : this.classifyError(error)
    return appError.type === ErrorType.AUTHENTICATION_ERROR
  }

  /**
   * 判断是否需要重试
   */
  static shouldRetry(error: any): boolean {
    const appError = error instanceof AppError ? error : this.classifyError(error)
    return [
      ErrorType.NETWORK_ERROR,
      ErrorType.TIMEOUT_ERROR,
      ErrorType.SERVER_ERROR
    ].includes(appError.type)
  }

  /**
   * 获取重试延迟时间（毫秒）
   */
  static getRetryDelay(attempt: number, baseDelay: number = 1000): number {
    // 指数退避策略，最大延迟30秒
    return Math.min(baseDelay * Math.pow(2, attempt), 30000)
  }

  /**
   * 生成错误报告
   */
  static generateErrorReport(): any {
    const recentErrors = this.errorLog.slice(0, 10)
    const errorCounts = this.errorLog.reduce((counts, error) => {
      counts[error.type] = (counts[error.type] || 0) + 1
      return counts
    }, {} as Record<ErrorType, number>)

    return {
      timestamp: new Date().toISOString(),
      totalErrors: this.errorLog.length,
      errorCounts,
      recentErrors: recentErrors.map(error => error.toJSON())
    }
  }

  /**
   * 检查错误模式
   */
  static checkErrorPatterns(): {
    hasNetworkIssues: boolean
    hasAuthIssues: boolean
    hasServerIssues: boolean
    hasFrequentErrors: boolean
  } {
    const recentErrors = this.errorLog.slice(0, 50)
    const networkErrors = recentErrors.filter(e => e.type === ErrorType.NETWORK_ERROR).length
    const authErrors = recentErrors.filter(e => e.type === ErrorType.AUTHENTICATION_ERROR).length
    const serverErrors = recentErrors.filter(e => e.type === ErrorType.SERVER_ERROR).length

    return {
      hasNetworkIssues: networkErrors > 3,
      hasAuthIssues: authErrors > 0,
      hasServerIssues: serverErrors > 2,
      hasFrequentErrors: recentErrors.length > 20
    }
  }
}

export default ErrorHandler