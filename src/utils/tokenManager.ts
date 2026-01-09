import type { ApiError } from '@/types/auth'
import { logger } from '@/utils/logger'

/**
 * Token管理工具类
 * 负责Token的存储、验证和自动刷新
 * 包含刷新锁机制，防止并发刷新
 */
export class TokenManager {
  private readonly ACCESS_TOKEN_KEY = 'access_token'
  private readonly REFRESH_TOKEN_KEY = 'refresh_token'
  private readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000 // 5分钟缓冲期

  // 刷新锁机制相关
  private isRefreshing = false
  private refreshPromise: Promise<string> | null = null
  private pendingRequests: Array<{
    resolve: (token: string) => void
    reject: (error: Error) => void
  }> = []

  constructor() {
    // 初始化时检查并清理损坏的Token
    this.cleanupCorruptedTokens()
  }

  /**
   * 清理损坏或无效的Token
   */
  private cleanupCorruptedTokens(): void {
    try {
      const accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY)
      if (accessToken && !this.isValidTokenFormat(accessToken)) {
        logger.warn('清理无效的访问Token')
        localStorage.removeItem(this.ACCESS_TOKEN_KEY)
      }

      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY)
      if (refreshToken && !this.isValidTokenFormat(refreshToken)) {
        logger.warn('清理无效的刷新Token')
        localStorage.removeItem(this.REFRESH_TOKEN_KEY)
      }
    } catch (error) {
      logger.error('Token清理失败:', error)
    }
  }

  /**
   * 验证Token格式是否有效
   */
  private isValidTokenFormat(token: string): boolean {
    if (typeof token !== 'string' || !token.includes('.')) {
      return false
    }

    const parts = token.split('.')
    return parts.length === 3
  }

  /**
   * 解析JWT Token的payload部分
   * 提取为私有方法，避免在多个方法中重复相同的解析逻辑
   */
  private parseJwtPayload(token: string): Record<string, unknown> {
    // 验证Token格式
    if (typeof token !== 'string' || !token.includes('.')) {
      throw new Error('Token格式无效，期望JWT格式')
    }

    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Token格式无效，期望三段式JWT格式')
    }

    // 解析JWT Token的payload部分
    const payloadPart = parts[1]

    // 处理Base64URL编码（JWT使用Base64URL而非标准Base64）
    let base64Payload = payloadPart.replace(/-/g, '+').replace(/_/g, '/')

    // 补全填充字符
    while (base64Payload.length % 4) {
      base64Payload += '='
    }

    try {
      return JSON.parse(atob(base64Payload))
    } catch (error) {
      throw new Error('JWT Token payload解析失败，Token格式无效')
    }
  }

  /**
   * 获取访问Token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  /**
   * 获取刷新Token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  /**
   * 设置Token
   */
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)

    // 通知其他Tab页
    window.localStorage.setItem('token_updated', Date.now().toString())
  }

  /**
   * 清除Token
   */
  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)

    // 通知其他Tab页
    window.localStorage.setItem('token_cleared', Date.now().toString())
  }

  /**
   * 检查Token是否即将过期
   */
  isTokenExpiring(): boolean {
    const token = this.getAccessToken()
    if (!token) return true

    try {
      const payload = this.parseJwtPayload(token)

      // 检查exp字段是否存在且为数字
      if (!payload.exp || typeof payload.exp !== 'number') {
        logger.warn('Token缺少有效的exp字段')
        return true
      }

      const expiryTime = payload.exp * 1000
      const currentTime = Date.now()

      return currentTime >= (expiryTime - this.TOKEN_EXPIRY_BUFFER)
    } catch (error) {
      console.error('Token解析失败:', error instanceof Error ? error.message : error)
      // 清除无效的Token
      this.clearTokens()
      return true
    }
  }

  /**
   * 获取Token剩余有效时间（秒）
   */
  getTokenRemainingTime(): number {
    const token = this.getAccessToken()
    if (!token) return 0

    try {
      const payload = this.parseJwtPayload(token)

      if (!payload.exp || typeof payload.exp !== 'number') {
        return 0
      }

      const expiryTime = payload.exp * 1000
      const currentTime = Date.now()

      return Math.max(0, Math.floor((expiryTime - currentTime) / 1000))
    } catch (error) {
      console.error('获取Token剩余时间失败:', error instanceof Error ? error.message : error)
      return 0
    }
  }

  /**
   * 检查是否已登录
   */
  isLoggedIn(): boolean {
    return !!this.getAccessToken() && !this.isTokenExpiring()
  }

  /**
   * 刷新访问Token（带锁机制，防止并发刷新）
   *
   * 工作原理：
   * 1. 如果已经在刷新中，返回同一个Promise，避免重复刷新
   * 2. 如果没有在刷新，获取刷新锁并执行刷新
   * 3. 刷新完成后，解析所有等待的请求
   * 4. 如果刷新失败，拒绝所有等待的请求
   */
  async refreshAccessToken(): Promise<string> {
    // 如果正在刷新，直接返回当前的刷新Promise
    if (this.isRefreshing && this.refreshPromise) {
      logger.debug('Token刷新正在进行中，复用现有刷新请求')
      return this.refreshPromise
    }

    // 获取刷新锁
    this.isRefreshing = true

    // 创建刷新Promise
    this.refreshPromise = this.doRefreshToken()

    try {
      // 执行刷新
      const newToken = await this.refreshPromise

      // 刷新成功，解析所有等待的请求
      this.pendingRequests.forEach(({ resolve }) => {
        resolve(newToken)
      })
      this.pendingRequests = []

      return newToken
    } catch (error) {
      // 刷新失败，拒绝所有等待的请求
      const refreshError = error instanceof Error ? error : new Error('Token刷新失败')
      this.pendingRequests.forEach(({ reject }) => {
        reject(refreshError)
      })
      this.pendingRequests = []

      throw refreshError
    } finally {
      // 释放刷新锁
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  /**
   * 实际执行Token刷新的内部方法
   */
  private async doRefreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('未找到刷新Token')
    }

    try {
      logger.debug('开始刷新Token...')

      // 使用统一的Token刷新端点
      // 开发环境：使用空字符串，由 Vite 代理转发
      // 生产环境：使用完整的环境变量配置的URL
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
      const refreshUrl = apiBaseUrl
        ? `${apiBaseUrl}/api/user/auth/refresh`
        : '/api/user/auth/refresh'

      const response = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        })
      })

      if (!response.ok) {
        throw new Error(`刷新Token失败: ${response.status}`)
      }

      const data = await response.json()
      const { access_token, refresh_token: newRefreshToken } = data

      this.setTokens(access_token, newRefreshToken || refreshToken)

      logger.debug('Token刷新成功')

      return access_token
    } catch (error) {
      logger.error('Token刷新失败:', error)
      this.clearTokens()
      throw error
    }
  }

  /**
   * 添加等待刷新的请求
   * 当Token正在刷新时，其他请求可以调用此方法等待刷新完成
   */
  private waitForRefresh(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.pendingRequests.push({ resolve, reject })
    })
  }

  /**
   * 检查是否正在刷新Token
   * 用于外部判断当前刷新状态
   */
  isRefreshingToken(): boolean {
    return this.isRefreshing
  }

  /**
   * 获取等待中的请求数量
   * 用于调试和监控
   */
  getPendingRequestsCount(): number {
    return this.pendingRequests.length
  }
}

// 创建单例实例
export const tokenManager = new TokenManager()

/**
 * 创建带认证的请求头
 */
export function createAuthHeaders(): Record<string, string> {
  const token = tokenManager.getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

/**
 * 处理API错误响应
 */
export function handleApiError(error: unknown): ApiError {
  // 类型守卫：检查是否为 Axios 错误对象
  const isAxiosError = (err: unknown): err is { response?: { status: number; data?: Record<string, unknown> }; request?: unknown; message?: string } => {
    return typeof err === 'object' && err !== null && ('response' in err || 'request' in err)
  }

  if (!isAxiosError(error)) {
    // 不是 Axios 错误，返回通用错误
    return {
      code: 'UNKNOWN_ERROR',
      message: '未知错误',
      isNetworkError: false,
      isPermissionError: false,
      isServerError: false,
      isValidationError: false
    }
  }

  if (error.response) {
    // 服务器响应了错误状态码
    const status = error.response.status
    const data = (error.response.data as Record<string, unknown>) || {}

    return {
      code: (data.code as string) || `HTTP_${status}`,
      message: (data.message as string) || `请求失败 (${status})`,
      details: data.details,
      isPermissionError: status === 403,
      isServerError: status >= 500,
      isValidationError: status === 422,
      isNetworkError: false
    }
  } else if (error.request) {
    // 请求已发送但没有收到响应
    return {
      code: 'NETWORK_ERROR',
      message: '网络连接失败，请检查网络设置',
      isNetworkError: true,
      isPermissionError: false,
      isServerError: false,
      isValidationError: false
    }
  } else {
    // 请求配置错误
    return {
      code: 'REQUEST_ERROR',
      message: error.message || '请求配置错误',
      isNetworkError: false,
      isPermissionError: false,
      isServerError: false,
      isValidationError: false
    }
  }
}