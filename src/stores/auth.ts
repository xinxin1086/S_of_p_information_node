import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  AuthState,
  LoginRequest,
  LoginResponse,
  ApiLoginResponse,
  UserInfo,
  Permissions,
  UserRole,
  RegisterRequest,
  RegisterResponse,
  TokenVerifyRequest,
  TokenVerifyResponse,
  TokenRefreshRequest,
  TokenRefreshResponse,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  EmailVerifyRequest,
  EmailVerifyConfirmRequest,
  PhoneVerifyRequest,
  PhoneVerifyConfirmRequest
} from '@/types/auth'
import { tokenManager, handleApiError } from '@/utils/tokenManager'
import apiClient from '@/utils/request'
import { authExtendedApi } from '@/api/extended'

export const useAuthStore = defineStore('auth', () => {
  // State
  const isAuthenticated = ref(false)
  const user = ref<UserInfo | null>(null)
  const permissions = ref<Permissions | null>(null)
  const token = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const loading = ref(false)

  // Getters
  const currentRole = computed(() => permissions.value?.current_role || null)
  const isSuperAdmin = computed(() => currentRole.value === 'SUPER_ADMIN')
  const isAdmin = computed(() => currentRole.value === 'ADMIN')
  const userPermissions = computed(() => permissions.value?.role_info?.permissions || [])

  /**
   * 检查是否有指定权限
   */
  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!permissions.value) return false

    // 超级管理员拥有所有权限
    if (permissions.value.current_role === 'SUPER_ADMIN') {
      return true
    }

    // 检查具体角色权限，确保all_roles存在且为数组
    const allRoles = permissions.value.all_roles
    if (!Array.isArray(allRoles)) return false

    return allRoles.includes(requiredRole)
  }

  /**
   * 检查是否有指定功能权限
   */
  const hasFeaturePermission = (permission: string): boolean => {
    return userPermissions.value.includes(permission)
  }

  /**
   * 登录
   */
  const login = async (credentials: LoginRequest): Promise<void> => {
    loading.value = true

    try {
      // 用户和管理员使用统一的登录接口
      // 后端根据账号自动识别用户类型，返回 user_type 字段 ('user' | 'admin')
      const loginEndpoint = '/api/user/auth/login'

      console.log('🔐 登录请求:', {
        endpoint: loginEndpoint,
        credentials: {
          account: credentials.account,
          password: '[HIDDEN]',
          role: credentials.role
        }
      })

      const response = await apiClient.post(loginEndpoint, {
        account: credentials.account,
        password: credentials.password
        // 不需要传递 role 参数，后端会根据账号自动识别
      })

      console.log('🔐 登录响应成功:', response)

      // axios已经处理了HTTP状态码，response直接就是数据
      const responseData = response as ApiLoginResponse
      console.log('🔐 登录响应数据:', responseData)

      // 检查响应数据结构
      console.log('🔐 完整响应数据:', responseData)
      console.log('🔐 响应类型:', typeof responseData)
      console.log('🔐 响应键值:', Object.keys(responseData))

      // 直接使用后端返回的数据格式
      // axios响应: { data: { data: {...}, message: '登录成功', success: true } }
      const loginData = responseData.data
      console.log('🔐 后端返回的业务数据:', loginData)
      console.log('🔐 业务数据键值:', Object.keys(loginData))

      // 打印完整的实际数据，方便调试
      const actualData = loginData.data || {}
      console.log('🔐 实际用户数据详情:', {
        actualData_keys: Object.keys(actualData),
        actualData_full: actualData,
        user_keys: actualData.user ? Object.keys(actualData.user) : 'no user field',
        user_full: actualData.user || 'no user field'
      })

      // 验证业务响应状态
      if (!loginData.success) {
        const errorMessage = loginData.message || '登录失败'
        console.error('🔐 业务层面登录失败:', loginData)
        throw new Error(errorMessage)
      }

      // 后端返回的数据结构:
      // {
      //   token: "jwt_token",
      //   user_type: "admin" | "user",
      //   role: "ADMIN" | "USER",  // 数据库中的角色字段
      //   ...其他用户信息字段
      // }

      // 安全地获取用户数据
      const userData = actualData.user || actualData || {}
      const userName = actualData.name || actualData.username || userData.account || ''

      // 优先使用 role 字段（数据库中的真实角色），其次使用 user_type
      // role 字段格式: 'ADMIN' | 'USER' | 'SUPER_ADMIN'
      // user_type 字段格式: 'admin' | 'user' | 'super_admin'
      let userRole: UserRole = 'USER'

      if (userData.role) {
        // 后端返回了 role 字段（大写格式，如 'ADMIN'）
        const roleUpper = userData.role.toUpperCase()
        if (roleUpper === 'ADMIN' || roleUpper === 'SUPER_ADMIN' || roleUpper === 'USER') {
          userRole = roleUpper as UserRole
        }
      } else if (actualData.user_type) {
        // 使用 user_type 字段（小写格式）
        const userType = actualData.user_type.toLowerCase()
        if (userType === 'admin') {
          userRole = 'ADMIN'
        } else if (userType === 'super_admin') {
          userRole = 'SUPER_ADMIN'
        } else {
          userRole = 'USER'
        }
      }

      const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'

      // 转换为前端期望的格式
      const data: LoginResponse = {
        access_token: actualData.token || '',
        refresh_token: '', // API没有返回refresh_token，使用空字符串
        user: {
          id: userData.id?.toString() || '',
          account: userData.account || '',
          username: userName,
          role: userRole,
          email: userData.email || '',
          phone: userData.phone || '',
          avatar: userData.avatar || '',
          nickname: userName,
          // 如果后端未返回 created_at/updated_at，使用当前时间作为默认值
          created_at: userData.created_at || userData.createdAt || new Date().toISOString(),
          updated_at: userData.updated_at || userData.updatedAt || new Date().toISOString(),
          status: isAdmin ? 'active' : (userData.status || ''),
          permissions: userData.permissions,
          role_info: userData.role_info,
          all_roles: [userRole],
          name: userName,
          head_pic: userData.head_pic || '',
          profile_image: userData.profile_image || '',
          createdAt: userData.createdAt || userData.created_at || new Date().toISOString(),
          updatedAt: userData.updatedAt || userData.updated_at || new Date().toISOString()
        },
        permissions: {
          current_role: userRole,
          role_info: {
            role_name: isAdmin ? '管理员' : '用户',
            permissions: userData.permissions || []
          },
          all_roles: [userRole]
        }
      }

      console.log('🔐 用户角色识别:', {
        backend_role: userData.role,
        backend_user_type: actualData.user_type,
        final_role: userRole,
        is_admin: isAdmin,
        role_source: userData.role ? 'role字段' : 'user_type字段'
      })

      // 验证返回数据格式
      if (!data.access_token) {
        console.error('🔐 登录响应缺少 access_token，实际数据:', data)
        throw new Error('登录响应缺少访问令牌')
      }

      console.log('🔐 解析后的登录数据:', {
        hasAccessToken: !!data.access_token,
        hasRefreshToken: !!data.refresh_token,
        hasUser: !!data.user,
        hasPermissions: !!data.permissions,
        userInfo: data.user ? {
          id: data.user.id,
          account: data.user.account,
          role: data.user.role
        } : null,
        permissions: data.permissions ? {
          currentRole: data.permissions.current_role,
          allRoles: data.permissions.all_roles
        } : null
      })

      console.log('✅ 登录成功，用户信息:', {
        id: data.user?.id,
        account: data.user?.account,
        role: data.user?.role,
        currentRole: data.permissions?.current_role
      })

      // 保存Token
      console.log('🔐 准备保存Token:', {
        accessTokenLength: data.access_token?.length || 0,
        hasAccessToken: !!data.access_token
      })

      tokenManager.setTokens(data.access_token, data.refresh_token || '')

      console.log('🔐 Token保存完成，验证保存结果:', {
        savedToken: tokenManager.getAccessToken()?.substring(0, 20) + '...',
        isLoggedIn: tokenManager.isLoggedIn()
      })

      // 调试权限数据设置
      console.log('🔐 设置权限数据:', {
        currentRole: data.permissions.current_role,
        permissionsData: data.permissions,
        userRole: data.user.role
      })

      // 更新状态
      token.value = data.access_token
      refreshToken.value = data.refresh_token || ''
      user.value = data.user
      permissions.value = data.permissions
      isAuthenticated.value = true

  
      // 触发登录成功事件
      window.dispatchEvent(new CustomEvent('auth:login', {
        detail: { user: data.user, permissions: data.permissions }
      }))

    } catch (error: any) {
      const apiError = handleApiError(error)
      throw apiError
    } finally {
      loading.value = false
    }
  }

  /**
   * 登出
   */
  const logout = async (): Promise<void> => {
    try {
      // 调用服务端登出接口（可选）
      if (token.value) {
        await apiClient.post('/admin/logout').catch(() => {
          // 忽略登出接口错误
        })
      }
    } catch (error) {
      console.error('登出接口调用失败:', error)
    } finally {
      // 清除本地状态
      tokenManager.clearTokens()
      token.value = null
      refreshToken.value = null
      user.value = null
      permissions.value = null
      isAuthenticated.value = false

      // 触发登出事件
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }
  }

  /**
   * 刷新用户权限信息
   */
  const refreshPermissions = async (): Promise<void> => {
    if (!tokenManager.isLoggedIn()) {
      throw new Error('用户未登录')
    }

    try {
      let userInfo: any
      let data: Permissions

      // 先尝试从用户表获取信息
      try {
        userInfo = await apiClient.get('/api/user/user/info')

        // 如果获取成功且用户是管理员，需要额外获取管理员权限
        if (userInfo.role === 'admin' || userInfo.role === 'super_admin') {
          data = await apiClient.get('/api/admin/permissions')
        } else {
          // 普通用户，创建基本的权限数据
          data = {
            current_role: userInfo.role?.toUpperCase() || 'USER',
            all_roles: [userInfo.role?.toUpperCase() || 'USER'],
            role_info: {
              permissions: []
            }
          }
        }
      } catch (userError: any) {
        // 如果用户表查询失败，尝试从管理员表查询
        console.warn('用户表查询失败，尝试管理员表:', userError.message)

        try {
          const adminInfo = await apiClient.get('/api/admin/info')
          userInfo = adminInfo
          data = await apiClient.get('/api/admin/permissions')
        } catch (adminError: any) {
          console.error('两个表都查询失败:', adminError.message)
          throw new Error('用户信息获取失败')
        }
      }

      // 更新权限数据
      permissions.value = data

      // 触发权限更新事件
      window.dispatchEvent(new CustomEvent('auth:permissions-updated', {
        detail: { permissions: data }
      }))

    } catch (error: any) {
      const apiError = handleApiError(error)

      // 如果是权限错误，自动登出
      if (apiError.isPermissionError) {
        await logout()
      }

      throw apiError
    }
  }

  /**
   * 获取用户信息
   */
  const fetchUserInfo = async (): Promise<void> => {
    if (!tokenManager.isLoggedIn()) {
      throw new Error('用户未登录')
    }

    try {
      // 先尝试从用户表获取信息
      try {
        const response = await apiClient.get('/api/user/user/info')
        // 修复：正确提取用户数据
        // axios响应结构: { data: { data: {用户信息}, success: true, message: '' }, status: 200, ... }
        const businessData = response.data
        const userData = businessData.data || businessData
        user.value = userData
        console.log('✅ 从用户表获取信息成功:', user.value)
      } catch (userError: any) {
        // 如果用户表查询失败，尝试从管理员表查询
        console.warn('用户表查询失败，尝试管理员表:', userError.message)

        try {
          const response = await apiClient.get('/api/admin/info')
          // 修复：正确提取用户数据
          const businessData = response.data
          const userData = businessData.data || businessData
          user.value = userData
          console.log('✅ 从管理员表获取信息成功:', user.value)
        } catch (adminError: any) {
          console.error('两个表都查询失败:', adminError.message)
          throw new Error('用户信息获取失败')
        }
      }

    } catch (error: any) {
      const apiError = handleApiError(error)
      throw apiError
    }
  }

  /**
   * 初始化认证状态（应用启动时调用）
   */
  const initializeAuth = async (): Promise<void> => {
    if (tokenManager.isLoggedIn()) {
      try {
        token.value = tokenManager.getAccessToken()
        refreshToken.value = tokenManager.getRefreshToken()
        isAuthenticated.value = true

        // 获取最新的用户和权限信息
        await Promise.all([
          fetchUserInfo(),
          refreshPermissions()
        ])

      } catch (error) {
        console.error('初始化认证状态失败:', error)
        await logout()
      }
    }
  }

  /**
   * 更新用户信息
   */
  const updateUserInfo = (userInfo: Partial<UserInfo>): void => {
    if (user.value) {
      user.value = { ...user.value, ...userInfo }
    }
  }

  /**
   * 自动刷新Token（如果需要）
   */
  const autoRefreshToken = async (): Promise<boolean> => {
    // 如果没有Token，不需要刷新
    if (!tokenManager.isLoggedIn()) {
      return true
    }

    if (tokenManager.isTokenExpiring()) {
      try {
        const refreshTokenValue = tokenManager.getRefreshToken()
        if (!refreshTokenValue) {
          throw new Error('No refresh token available')
        }

        const refreshRequest: TokenRefreshRequest = {
          refresh_token: refreshTokenValue
        }

        const response = await authExtendedApi.refreshToken(refreshRequest)

        if (response.success && response.access_token) {
          tokenManager.setTokens(response.access_token, response.refresh_token || refreshTokenValue)
          token.value = response.access_token
          return true
        } else {
          throw new Error(response.error || 'Token refresh failed')
        }
      } catch (error) {
        console.error('自动刷新Token失败:', error)
        await logout()
        return false
      }
    }
    return true
  }

  /**
   * 用户注册
   */
  const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
    loading.value = true

    try {
      console.log('🔐 注册请求:', userData)
      const response = await authExtendedApi.register(userData)

      console.log('✅ 注册成功:', response)

      // 如果注册成功且不需要验证，自动登录
      if (response.success && response.user && !response.requires_verification) {
        // 更新用户信息
        user.value = response.user
        isAuthenticated.value = true

        // 触发注册成功事件
        window.dispatchEvent(new CustomEvent('auth:register', {
          detail: { user: response.user }
        }))
      }

      return response
    } catch (error: any) {
      const apiError = handleApiError(error)
      throw apiError
    } finally {
      loading.value = false
    }
  }

  /**
   * 验证当前Token
   */
  const verifyCurrentToken = async (): Promise<boolean> => {
    const currentToken = tokenManager.getAccessToken()
    if (!currentToken) {
      return false
    }

    try {
      const verifyRequest: TokenVerifyRequest = {
        token: currentToken
      }

      const response = await authExtendedApi.verifyToken(verifyRequest)

      if (response.valid && !response.expired) {
        // 更新用户信息
        if (response.user) {
          user.value = response.user
        }
        if (response.permissions) {
          permissions.value = response.permissions
        }
        return true
      } else {
        // Token无效，清除登录状态
        await logout()
        return false
      }
    } catch (error) {
      console.error('Token验证失败:', error)
      await logout()
      return false
    }
  }

  /**
   * 发送密码重置验证码
   */
  const sendPasswordReset = async (request: PasswordResetRequest): Promise<{ success: boolean; message: string }> => {
    try {
      return await authExtendedApi.sendPasswordReset(request)
    } catch (error: any) {
      const apiError = handleApiError(error)
      throw apiError
    }
  }

  /**
   * 确认密码重置
   */
  const confirmPasswordReset = async (request: PasswordResetConfirmRequest): Promise<{ success: boolean; message: string }> => {
    try {
      return await authExtendedApi.confirmPasswordReset(request)
    } catch (error: any) {
      const apiError = handleApiError(error)
      throw apiError
    }
  }

  /**
   * 发送邮箱验证码
   */
  const sendEmailVerification = async (request: EmailVerifyRequest): Promise<{ success: boolean; message: string }> => {
    try {
      return await authExtendedApi.sendEmailVerification(request)
    } catch (error: any) {
      const apiError = handleApiError(error)
      throw apiError
    }
  }

  /**
   * 确认邮箱验证
   */
  const confirmEmailVerification = async (request: EmailVerifyConfirmRequest): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authExtendedApi.confirmEmailVerification(request)

      // 如果验证成功，更新用户信息
      if (response.success) {
        await fetchUserInfo()
      }

      return response
    } catch (error: any) {
      const apiError = handleApiError(error)
      throw apiError
    }
  }

  /**
   * 发送手机验证码
   */
  const sendPhoneVerification = async (request: PhoneVerifyRequest): Promise<{ success: boolean; message: string }> => {
    try {
      return await authExtendedApi.sendPhoneVerification(request)
    } catch (error: any) {
      const apiError = handleApiError(error)
      throw apiError
    }
  }

  /**
   * 确认手机验证
   */
  const confirmPhoneVerification = async (request: PhoneVerifyConfirmRequest): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authExtendedApi.confirmPhoneVerification(request)

      // 如果验证成功，更新用户信息
      if (response.success) {
        await fetchUserInfo()
      }

      return response
    } catch (error: any) {
      const apiError = handleApiError(error)
      throw apiError
    }
  }

  return {
    // State
    isAuthenticated,
    user,
    permissions,
    token,
    refreshToken,
    loading,

    // Getters
    currentRole,
    isSuperAdmin,
    isAdmin,
    userPermissions,

    // Actions
    login,
    logout,
    register,
    refreshPermissions,
    fetchUserInfo,
    initializeAuth,
    updateUserInfo,
    autoRefreshToken,
    verifyCurrentToken,
    sendPasswordReset,
    confirmPasswordReset,
    sendEmailVerification,
    confirmEmailVerification,
    sendPhoneVerification,
    confirmPhoneVerification,
    hasPermission,
    hasFeaturePermission
  }
})