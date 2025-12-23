/**
 * 统一Store导出
 * 所有状态管理模块的统一入口
 */

// 认证相关
export { useAuthStore } from './auth'
export type { UserRole, UserInfo, Permissions } from '@/types/auth'

// 全局状态
export { useMainStore } from './main'

// 业务模块
export { useActivityStore } from './activity'
export { useNoticeStore } from './notice'
export { useScienceStore } from './science'

// 便捷的权限Hook
import { useAuthStore as _useAuthStore } from './auth'
import { computed } from 'vue'

export const usePermissions = () => {
  const store = _useAuthStore()

  return {
    // 权限检查 - 使用 computed 确保响应式
    hasPermission: store.hasPermission,
    hasFeaturePermission: store.hasFeaturePermission,
    currentRole: computed(() => store.currentRole),
    isSuperAdmin: computed(() => store.isSuperAdmin),
    isAdmin: computed(() => store.isAdmin),
    userPermissions: computed(() => store.userPermissions),

    // 认证状态
    isAuthenticated: computed(() => store.isAuthenticated),
    user: computed(() => store.user),
    permissions: computed(() => store.permissions),
    token: computed(() => store.token),
    refreshToken: computed(() => store.refreshToken),
    loading: computed(() => store.loading),

    // 操作方法
    login: store.login,
    logout: store.logout,
    fetchUserInfo: store.fetchUserInfo,
    refreshPermissions: store.refreshPermissions,
    initializeAuth: store.initializeAuth,
    autoRefreshToken: store.autoRefreshToken,
    updateUserInfo: store.updateUserInfo
  }
}