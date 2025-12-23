import type { ApiError } from '@/types/auth'

/**
 * Token管理工具类
 * 负责Token的存储、验证和自动刷新
 */
export class TokenManager {
  private readonly ACCESS_TOKEN_KEY = 'access_token'
  private readonly REFRESH_TOKEN_KEY = 'refresh_token'
  private readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000 // 5分钟缓冲期

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
        console.warn('清理无效的访问Token')
        localStorage.removeItem(this.ACCESS_TOKEN_KEY)
      }

      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY)
      if (refreshToken && !this.isValidTokenFormat(refreshToken)) {
        console.warn('清理无效的刷新Token')
        localStorage.removeItem(this.REFRESH_TOKEN_KEY)
      }
    } catch (error) {
      console.error('Token清理失败:', error)
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
      // 验证Token格式
      if (typeof token !== 'string' || !token.includes('.')) {
        console.warn('Token格式无效，期望JWT格式')
        return true
      }

      const parts = token.split('.')
      if (parts.length !== 3) {
        console.warn('Token格式无效，期望三段式JWT格式')
        return true
      }

      // 解析JWT Token的payload部分
      const payloadPart = parts[1]

      // 处理Base64URL编码（JWT使用Base64URL而非标准Base64）
      let base64Payload = payloadPart.replace(/-/g, '+').replace(/_/g, '/')

      // 补全填充字符
      while (base64Payload.length % 4) {
        base64Payload += '='
      }

      const payload = JSON.parse(atob(base64Payload))

      // 检查exp字段是否存在且为数字
      if (!payload.exp || typeof payload.exp !== 'number') {
        console.warn('Token缺少有效的exp字段')
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
      // 验证Token格式（与isTokenExpiring方法保持一致）
      if (typeof token !== 'string' || !token.includes('.')) {
        return 0
      }

      const parts = token.split('.')
      if (parts.length !== 3) {
        return 0
      }

      const payloadPart = parts[1]
      let base64Payload = payloadPart.replace(/-/g, '+').replace(/_/g, '/')

      while (base64Payload.length % 4) {
        base64Payload += '='
      }

      const payload = JSON.parse(atob(base64Payload))

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
   * 刷新访问Token
   */
  async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('未找到刷新Token')
    }

    try {
      // 使用统一的Token刷新端点
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
      const response = await fetch(`${apiBaseUrl}/api/user/auth/refresh`, {
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

      return access_token
    } catch (error) {
      console.error('Token刷新失败:', error)
      this.clearTokens()
      throw error
    }
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
export function handleApiError(error: any): ApiError {
  if (error.response) {
    // 服务器响应了错误状态码
    const status = error.response.status
    const data = error.response.data || {}

    return {
      code: data.code || `HTTP_${status}`,
      message: data.message || `请求失败 (${status})`,
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