import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type {
  LoginRequest,
  LoginResponse,
  UserInfo,
  Permissions,
  UserRole,
  RegisterRequest,
  RegisterResponse
} from '@/types/auth'
import { loginUser, registerUser, getAllUserList } from '@/utils/localDataStore'

export const useAuthStore = defineStore('auth', () => {
  // State
  const isAuthenticated = ref(false)
  const user = ref<UserInfo | null>(null)
  const permissions = ref<Permissions | null>(null)
  const token = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const loading = ref(false)

  // Getters
  const currentRole = computed(() => permissions.value?.current_role || user.value?.role || 'USER')
  const isSuperAdmin = computed(() => currentRole.value === 'SUPER_ADMIN')
  const isAdmin = computed(() => currentRole.value === 'ADMIN' || currentRole.value === 'SUPER_ADMIN')
  const userPermissions = computed(() => permissions.value?.role_info?.permissions || [])

  /**
   * 检查是否有指定权限
   */
  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!user.value) return false

    // 超级管理员拥有所有权限
    if (user.value.role === 'SUPER_ADMIN') {
      return true
    }

    // 检查具体角色权限
    const allRoles = user.value.all_roles || []
    if (!Array.isArray(allRoles)) return false

    return allRoles.includes(requiredRole)
  }

  /**
   * 检查是否有指定功能权限
   */
  const hasFeaturePermission = (permission: string): boolean => {
    // 纯前端模式，管理员拥有所有权限
    if (isAdmin.value) return true
    return userPermissions.value.includes(permission)
  }

  /**
   * 登录 - 使用本地验证
   */
  const login = async (credentials: LoginRequest): Promise<void> => {
    loading.value = true

    try {
      // 使用本地数据验证登录
      const result = loginUser(credentials)

      if (!result.success) {
        throw new Error(result.message || '登录失败')
      }

      const userData = result.user!

      // 生成本地 token（使用简单的字符串）
      const localToken = `local_token_${userData.id}_${Date.now()}`

      // 构建权限数据
      const userPermissions: Permissions = {
        current_role: userData.role,
        role_info: {
          role_name: userData.role === 'SUPER_ADMIN' ? '超级管理员' : userData.role === 'ADMIN' ? '管理员' : '用户',
          permissions: [] // 管理员默认拥有所有权限
        },
        all_roles: [userData.role]
      }

      // 更新状态
      token.value = localToken
      refreshToken.value = localToken
      user.value = userData
      permissions.value = userPermissions
      isAuthenticated.value = true

      // 保存在 localStorage 中（使用多个键以确保兼容性）
      localStorage.setItem('auth_token', localToken)
      localStorage.setItem('access_token', localToken) // tokenManager 使用的键
      localStorage.setItem('auth_user', JSON.stringify(userData))
      localStorage.setItem('auth_permissions', JSON.stringify(userPermissions))

      // 触发登录成功事件
      window.dispatchEvent(new CustomEvent('auth:login', {
        detail: { user: userData, permissions: userPermissions }
      }))

    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 登出
   */
  const logout = async (): Promise<void> => {
    // 清除本地状态
    token.value = null
    refreshToken.value = null
    user.value = null
    permissions.value = null
    isAuthenticated.value = false

    // 清除 localStorage（清除所有相关键）
    localStorage.removeItem('auth_token')
    localStorage.removeItem('access_token') // tokenManager 使用的键
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_permissions')

    // 触发登出事件
    window.dispatchEvent(new CustomEvent('auth:logout'))
  }

  /**
   * 刷新用户权限信息
   */
  const refreshPermissions = async (): Promise<void> => {
    if (!isAuthenticated.value || !user.value) {
      throw new Error('用户未登录')
    }

    // 本地模式下，权限不需要从后端刷新
    // 可以在这里重新构建权限数据
    const userPermissions: Permissions = {
      current_role: user.value.role,
      role_info: {
        role_name: user.value.role === 'SUPER_ADMIN' ? '超级管理员' : user.value.role === 'ADMIN' ? '管理员' : '用户',
        permissions: []
      },
      all_roles: user.value.all_roles || [user.value.role]
    }

    permissions.value = userPermissions

    // 触发权限更新事件
    window.dispatchEvent(new CustomEvent('auth:permissions-updated', {
      detail: { permissions: userPermissions }
    }))
  }

  /**
   * 获取用户信息
   */
  const fetchUserInfo = async (): Promise<void> => {
    if (!isAuthenticated.value) {
      throw new Error('用户未登录')
    }

    // 本地模式下，用户信息已在登录时获取
    // 这里可以从 localStorage 重新加载
    const storedUser = localStorage.getItem('auth_user')
    if (storedUser) {
      user.value = JSON.parse(storedUser)
    }
  }

  /**
   * 初始化认证状态（应用启动时调用）
   */
  const initializeAuth = async (): Promise<void> => {
    // 优先从 auth_token 读取，兼容 access_token
    const storedToken = localStorage.getItem('auth_token') || localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('auth_user')
    const storedPermissions = localStorage.getItem('auth_permissions')

    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        refreshToken.value = storedToken
        user.value = JSON.parse(storedUser)
        permissions.value = storedPermissions ? JSON.parse(storedPermissions) : null
        isAuthenticated.value = true

        // 确保 access_token 键也存在
        if (!localStorage.getItem('access_token')) {
          localStorage.setItem('access_token', storedToken)
        }
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
      localStorage.setItem('auth_user', JSON.stringify(user.value))
    }
  }

  /**
   * 自动刷新Token（本地模式不需要）
   */
  const autoRefreshToken = async (): Promise<boolean> => {
    // 本地模式下 token 不会过期
    return true
  }

  /**
   * 用户注册 - 使用本地存储
   */
  const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
    loading.value = true

    try {
      const result = registerUser(userData)

      if (!result.success) {
        return {
          success: false,
          message: result.message || '注册失败',
          requires_verification: false
        }
      }

      return {
        success: true,
        message: '注册成功',
        user: result.user,
        requires_verification: false
      }
    } catch (error) {
      return {
        success: false,
        message: '注册失败',
        requires_verification: false
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 验证当前Token（本地模式）
   */
  const verifyCurrentToken = async (): Promise<boolean> => {
    return isAuthenticated.value
  }

  /**
   * 获取所有用户列表（管理员功能）
   */
  const getAllUsers = (): UserInfo[] => {
    return getAllUserList()
  }

  /**
   * 发送密码重置验证码（本地模式不支持）
   */
  const sendPasswordReset = async (): Promise<{ success: boolean; message: string }> => {
    return {
      success: false,
      message: '本地模式不支持此功能'
    }
  }

  /**
   * 确认密码重置（本地模式不支持）
   */
  const confirmPasswordReset = async (): Promise<{ success: boolean; message: string }> => {
    return {
      success: false,
      message: '本地模式不支持此功能'
    }
  }

  /**
   * 发送邮箱验证码（本地模式不支持）
   */
  const sendEmailVerification = async (): Promise<{ success: boolean; message: string }> => {
    return {
      success: false,
      message: '本地模式不支持此功能'
    }
  }

  /**
   * 确认邮箱验证（本地模式不支持）
   */
  const confirmEmailVerification = async (): Promise<{ success: boolean; message: string }> => {
    return {
      success: false,
      message: '本地模式不支持此功能'
    }
  }

  /**
   * 发送手机验证码（本地模式不支持）
   */
  const sendPhoneVerification = async (): Promise<{ success: boolean; message: string }> => {
    return {
      success: false,
      message: '本地模式不支持此功能'
    }
  }

  /**
   * 确认手机验证（本地模式不支持）
   */
  const confirmPhoneVerification = async (): Promise<{ success: boolean; message: string }> => {
    return {
      success: false,
      message: '本地模式不支持此功能'
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
    getAllUsers,
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
