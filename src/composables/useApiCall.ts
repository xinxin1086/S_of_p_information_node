/**
 * 通用 API 调用封装
 * 用于消除重复的 API 调用逻辑，统一错误处理和 Token 管理
 */
import { ElMessage } from 'element-plus'
import { ref } from 'vue'

import type { ApiError } from '@/types/auth'
import { tokenManager } from '@/utils/tokenManager'

/**
 * API 响应基础类型
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  code?: string
  error?: string
}

/**
 * API 调用配置选项
 */
export interface ApiCallOptions<T = unknown> {
  /** 是否显示错误消息（默认 true） */
  showError?: boolean
  /** 是否显示加载状态（默认 false） */
  showLoading?: boolean
  /** 自定义错误处理函数 */
  onError?: (error: unknown) => void
  /** 自定义成功处理函数 */
  onSuccess?: (data: T) => void
  /** 是否需要认证（默认 true，会自动添加 Token） */
  requireAuth?: boolean
  /** 是否在错误时停止（用于批量调用，默认 true） */
  stopOnError?: boolean
}

/**
 * API 调用返回值
 */
export interface ApiCallResult<T = unknown> {
  /** 执行 API 调用 */
  execute: (...args: unknown[]) => Promise<ApiResponse<T>>
  /** 是否正在加载 */
  loading: ReturnType<typeof ref<boolean>>
  /** 错误信息 */
  error: ReturnType<typeof ref<unknown>>
  /** 响应数据 */
  data: ReturnType<typeof ref<T | null>>
}

/**
 * 通用 API 调用 Hook
 *
 * @param apiFn - API 调用函数
 * @param options - 配置选项
 * @returns API 调用方法和响应式状态
 *
 * @example
 * ```ts
 * // 基础用法
 * const { execute, loading, data } = useApiCall(scienceApi.getScienceList)
 * await execute({ page: 1, size: 10 })
 *
 * // 带选项的用法
 * const { execute, loading } = useApiCall(
 *   scienceApi.createArticle,
 *   { showError: true, showLoading: true }
 * )
 * await execute(articleData)
 * ```
 */
export function useApiCall<T = unknown>(
  apiFn: (...args: unknown[]) => Promise<ApiResponse<T>>,
  options: ApiCallOptions<T> = {}
): ApiCallResult<T> {
  const {
    showError = true,
    showLoading = false,
    onError,
    onSuccess,
    requireAuth = true
  } = options

  const loading = ref(false)
  const error = ref<unknown>(null)
  const data = ref<T | null>(null)

  /**
   * 执行 API 调用
   */
  const execute = async (...args: unknown[]): Promise<ApiResponse<T>> => {
    if (showLoading) {
      loading.value = true
    }
    error.value = null

    try {
      // 检查认证需求
      if (requireAuth) {
        const token = tokenManager.getAccessToken()
        if (!token) {
          const authError: ApiError = {
            code: 'NO_TOKEN',
            message: '未登录，请先登录',
            isPermissionError: false,
            isServerError: false,
            isValidationError: false,
            isNetworkError: false
          }
          throw authError
        }
      }

      // 调用 API 函数
      const result = await apiFn(...args)

      // 处理响应
      if (result.success) {
        data.value = result.data || null
        onSuccess?.(result.data)
        return result
      } else {
        const errorMsg = result.message || result.error || '操作失败'
        if (showError) {
          ElMessage.error(errorMsg)
        }
        error.value = errorMsg
        onError?.(errorMsg)
        return result
      }
    } catch (err: unknown) {
      // 处理错误
      let errorMessage = '操作失败'

      if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as Error).message
      } else if (typeof err === 'string') {
        errorMessage = err
      }

      if (showError) {
        ElMessage.error(errorMessage)
      }

      error.value = err
      onError?.(err)

      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      }
    } finally {
      if (showLoading) {
        loading.value = false
      }
    }
  }

  return {
    execute,
    loading,
    error,
    data
  }
}

/**
 * 创建带认证的 API 调用函数
 * 自动添加 Token 到请求头
 *
 * @param apiFn - 原始 API 函数
 * @returns 带 Token 的 API 调用函数
 *
 * @example
 * ```ts
 * const authenticatedApi = createAuthenticatedApi(scienceApi.likeScience)
 * await authenticatedApi(articleId)
 * ```
 */
export function createAuthenticatedApi<T extends (...args: unknown[]) => unknown>(
  apiFn: T
): T {
  return ((...args: unknown[]) => {
    const token = tokenManager.getAccessToken()
    if (!token) {
      return Promise.reject({
        success: false,
        message: '未登录，请先登录',
        error: 'NO_TOKEN'
      })
    }
    return apiFn(...args)
  }) as T
}

/**
 * 批量 API 调用
 * 用于并行执行多个 API 请求
 *
 * @param apiCalls - API 调用数组
 * @param options - 配置选项
 * @returns 所有调用结果的数组
 *
 * @example
 * ```ts
 * const results = await batchApiCalls([
 *   () => scienceApi.getScienceList({ page: 1 }),
 *   () => activityApi.getPublicActivities()
 * ])
 * ```
 */
export async function batchApiCalls<T = unknown>(
  apiCalls: Array<() => Promise<ApiResponse<T>>>,
  options: ApiCallOptions = {}
): Promise<ApiResponse<T>[]> {
  const { showError = true } = options

  try {
    const results = await Promise.all(apiCalls.map(call => call()))

    // 如果有任何调用失败，显示错误消息
    if (showError) {
      const failedCalls = results.filter(r => !r.success)
      if (failedCalls.length > 0) {
        ElMessage.warning(`${failedCalls.length} 个请求失败`)
      }
    }

    return results
  } catch (error: unknown) {
    if (showError) {
      ElMessage.error('批量请求失败')
    }
    throw error
  }
}

/**
 * 序列 API 调用
 * 用于按顺序执行多个 API 请求
 *
 * @param apiCalls - API 调用数组
 * @param options - 配置选项
 * @returns 所有调用结果的数组
 *
 * @example
 * ```ts
 * const results = await serialApiCalls([
 *   () => scienceApi.likeScience(articleId),
 *   () => scienceApi.recordScienceVisit(articleId)
 * ])
 * ```
 */
export async function serialApiCalls<T = unknown>(
  apiCalls: Array<() => Promise<ApiResponse<T>>>,
  options: ApiCallOptions = {}
): Promise<ApiResponse<T>[]> {
  const { showError = true, stopOnError = true } = options
  const results: ApiResponse<T>[] = []

  for (const apiCall of apiCalls) {
    try {
      const result = await apiCall()
      results.push(result)

      // 如果出错且配置为停止执行，则中断
      if (stopOnError && !result.success) {
        if (showError) {
          ElMessage.error(result.message || '操作失败')
        }
        break
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? (error as Error).message
        : '操作失败'

      const errorResult: ApiResponse<T> = {
        success: false,
        message: errorMessage,
        error: errorMessage
      }
      results.push(errorResult)

      if (showError) {
        ElMessage.error(errorResult.message || '操作失败')
      }

      if (stopOnError) {
        break
      }
    }
  }

  return results
}

/**
 * 带重试的 API 调用
 * 当请求失败时自动重试
 *
 * @param apiFn - API 调用函数
 * @param maxRetries - 最大重试次数（默认 3）
 * @param retryDelay - 重试延迟（毫秒，默认 1000）
 * @param options - 配置选项
 * @returns API 调用结果
 *
 * @example
 * ```ts
 * const result = await retryApiCall(
 *   () => scienceApi.getScienceDetail(articleId),
 *   3,
 *   1000
 * )
 * ```
 */
export async function retryApiCall<T = unknown>(
  apiFn: () => Promise<ApiResponse<T>>,
  maxRetries: number = 3,
  retryDelay: number = 1000,
  options: ApiCallOptions = {}
): Promise<ApiResponse<T>> {
  const { showError = true } = options
  let lastError: unknown = null

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
  if (showError) {
    ElMessage.error('请求失败，请稍后重试')
  }

  const errorMessage = lastError && typeof lastError === 'object' && 'message' in lastError
    ? (lastError as Error).message
    : '请求失败'

  return {
    success: false,
    message: errorMessage,
    error: errorMessage
  }
}

export default useApiCall
