import { ref, readonly } from 'vue'
import { ElMessage, ElNotification, ElLoading } from 'element-plus'
import type { ApiError } from '@/types/auth'
import ErrorHandler, { AppError, ErrorType } from '@/utils/errorHandler'

/**
 * 错误处理Composable
 * 提供统一的错误处理和用户反馈机制
 */
export const useErrorHandler = () => {
  const error = ref<ApiError | null>(null)
  const currentAppError = ref<AppError | null>(null)

  /**
   * 处理错误（增强版本，使用ErrorHandler）
   */
  const handleError = (rawError: any, context?: string) => {
    const appError = ErrorHandler.handle(rawError, context)
    currentAppError.value = appError
    error.value = appError.toApiError()

    // 根据错误类型显示相应的用户界面反馈
    if (appError.type === ErrorType.AUTHENTICATION_ERROR) {
      showAuthError(appError)
    } else if (appError.type === ErrorType.AUTHORIZATION_ERROR) {
      showPermissionError(appError)
    } else if (appError.type === ErrorType.NETWORK_ERROR) {
      showNetworkError(appError)
    } else if (appError.type === ErrorType.SERVER_ERROR) {
      showServerError(appError)
    } else if (appError.type === ErrorType.VALIDATION_ERROR) {
      showValidationError(appError)
    } else {
      showGenericError(appError)
    }

    return appError
  }

  /**
   * 显示错误消息（兼容旧版本）
   */
  const showError = (apiError: ApiError, options?: {
    showNotification?: boolean
    duration?: number
    title?: string
  }) => {
    error.value = apiError

    const {
      showNotification = false,
      duration = 5000,
      title = '操作失败'
    } = options || {}

    if (showNotification) {
      ElNotification({
        title,
        message: apiError.message || '发生了未知错误',
        type: 'error',
        duration
      })
    } else {
      ElMessage({
        message: apiError.message || '操作失败',
        type: 'error',
        duration
      })
    }
  }

  /**
   * 显示成功消息
   */
  const showSuccess = (message: string, options?: {
    showNotification?: boolean
    duration?: number
    title?: string
  }) => {
    const {
      showNotification = false,
      duration = 3000,
      title = '操作成功'
    } = options || {}

    if (showNotification) {
      ElNotification({
        title,
        message,
        type: 'success',
        duration
      })
    } else {
      ElMessage({
        message,
        type: 'success',
        duration
      })
    }
  }

  /**
   * 显示警告消息
   */
  const showWarning = (message: string, options?: {
    showNotification?: boolean
    duration?: number
    title?: string
  }) => {
    const {
      showNotification = false,
      duration = 4000,
      title = '警告'
    } = options || {}

    if (showNotification) {
      ElNotification({
        title,
        message,
        type: 'warning',
        duration
      })
    } else {
      ElMessage({
        message,
        type: 'warning',
        duration
      })
    }
  }

  /**
   * 显示信息消息
   */
  const showInfo = (message: string, options?: {
    showNotification?: boolean
    duration?: number
    title?: string
  }) => {
    const {
      showNotification = false,
      duration = 3000,
      title = '提示'
    } = options || {}

    if (showNotification) {
      ElNotification({
        title,
        message,
        type: 'info',
        duration
      })
    } else {
      ElMessage({
        message,
        type: 'info',
        duration
      })
    }
  }

  /**
   * 显示认证错误
   */
  const showAuthError = (appError: AppError) => {
    ElNotification({
      title: '登录已过期',
      message: appError.userMessage || '请重新登录',
      type: 'warning',
      duration: 0, // 不自动关闭
      showClose: true
    })
  }

  /**
   * 显示通用错误
   */
  const showGenericError = (appError: AppError) => {
    ElMessage({
      message: appError.userMessage || '操作失败，请重试',
      type: 'error',
      duration: 5000
    })
  }

  /**
   * 显示权限错误
   */
  const showPermissionError = (appError: AppError | ApiError) => {
    const message = appError.userMessage || appError.message || '您没有执行此操作的权限'
    ElNotification({
      title: '权限不足',
      message,
      type: 'error',
      duration: 5000,
      showClose: true
    })
  }

  /**
   * 显示网络错误
   */
  const showNetworkError = (appError: AppError | ApiError) => {
    const message = appError.userMessage || appError.message || '请检查网络连接后重试'
    ElNotification({
      title: '网络连接失败',
      message,
      type: 'error',
      duration: 0, // 不自动关闭
      showClose: true
    })
  }

  /**
   * 显示服务器错误
   */
  const showServerError = (appError: AppError | ApiError) => {
    const message = appError.userMessage || appError.message || '服务器暂时无法响应，请稍后重试'
    ElNotification({
      title: '服务器错误',
      message,
      type: 'error',
      duration: 6000,
      showClose: true
    })
  }

  /**
   * 显示验证错误
   */
  const showValidationError = (appError: AppError | ApiError) => {
    const message = appError.userMessage || appError.message || '数据验证失败，请检查输入内容'
    ElMessage({
      message,
      type: 'warning',
      duration: 5000,
      showClose: true
    })

    // 如果有详细的验证错误信息，可以进一步处理
    if (appError.details) {
      console.warn('验证错误详情:', appError.details)
    }
  }

  /**
   * 清除错误状态
   */
  const clearError = () => {
    error.value = null
    currentAppError.value = null
  }

  /**
   * 判断是否需要重新认证
   */
  const shouldReauth = (rawError?: any) => {
    if (rawError) {
      return ErrorHandler.shouldReauth(rawError)
    }
    return currentAppError.value ? ErrorHandler.shouldReauth(currentAppError.value) : false
  }

  /**
   * 判断是否应该重试
   */
  const shouldRetry = (rawError?: any) => {
    if (rawError) {
      return ErrorHandler.shouldRetry(rawError)
    }
    return currentAppError.value ? ErrorHandler.shouldRetry(currentAppError.value) : false
  }

  /**
   * 获取错误报告
   */
  const getErrorReport = () => {
    return ErrorHandler.generateErrorReport()
  }

  /**
   * 检查错误模式
   */
  const checkErrorPatterns = () => {
    return ErrorHandler.checkErrorPatterns()
  }

  /**
   * 显示加载状态
   */
  const showLoading = (message = '加载中...', options?: {
    target?: string
    lock?: boolean
    text?: string
    background?: string
  }) => {
    const loadingInstance = ElLoading.service({
      lock: options?.lock ?? true,
      text: message,
      background: options?.background || 'rgba(0, 0, 0, 0.7)',
      target: options?.target || 'body'
    })

    return loadingInstance
  }

  return {
    // 状态
    error: readonly(error),
    currentAppError: readonly(currentAppError),

    // 主要方法
    handleError,
    showError,

    // 消息显示
    showSuccess,
    showWarning,
    showInfo,

    // 特定错误类型
    showAuthError,
    showPermissionError,
    showNetworkError,
    showServerError,
    showValidationError,
    showGenericError,

    // 工具方法
    clearError,
    shouldReauth,
    shouldRetry,
    getErrorReport,
    checkErrorPatterns,
    showLoading
  }
}

/**
 * API操作Composable
 * 结合错误处理的API调用封装
 */
export const useApiOperation = () => {
  const { handleError, showSuccess } = useErrorHandler()
  const loading = ref(false)

  /**
   * 执行API操作
   */
  const execute = async <T>(
    apiCall: () => Promise<T>,
    options?: {
      showSuccessMessage?: boolean
      successMessage?: string
      showErrorMessage?: boolean
      onSuccess?: (data: T) => void
      onError?: (error: AppError) => void
      maxRetries?: number
      retryDelay?: number
    }
  ): Promise<T | null> => {
    const {
      showSuccessMessage = false,
      successMessage = '操作成功',
      showErrorMessage = true,
      onSuccess,
      onError,
      maxRetries = 2,
      retryDelay = 1000
    } = options || {}

    loading.value = true
    let lastError: any = null

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        const result = await apiCall()

        if (showSuccessMessage) {
          showSuccess(successMessage)
        }

        onSuccess?.(result)
        return result
      } catch (error: any) {
        lastError = error

        // 使用ErrorHandler判断是否应该重试
        if (!ErrorHandler.shouldRetry(error) || attempt > maxRetries) {
          if (showErrorMessage) {
            handleError(error)
          }
          onError?.(ErrorHandler.handle(error))
          return null
        }

        // 等待后重试
        if (attempt <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
        }
      }
    }

    loading.value = false
    return null
  }

  /**
   * 执行带重试的API操作
   */
  const executeWithRetry = async <T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T | null> => {
    return execute(apiCall, { maxRetries })
  }

  return {
    loading: readonly(loading),
    execute,
    executeWithRetry
  }
}