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

/**
 * 统一的权限检查Hook
 * 整合了基于角色的权限检查和基于资源的权限检查
 */
import { computed } from 'vue'
import { useAuthStore as _useAuthStore } from './auth'
import {
  checkPermission as checkResourcePermission,
  checkRole,
  checkLevel,
  checkFeature,
  permissionManager
} from '@/utils/permissions'

export const usePermissions = () => {
  const store = _useAuthStore()

  return {
    // 基于角色的权限检查（向后兼容）
    hasPermission: store.hasPermission,
    hasFeaturePermission: store.hasFeaturePermission,

    // 基于资源的细粒度权限检查（新系统）
    checkResourcePermission,
    checkRole,
    checkLevel,
    checkFeature,
    permissionManager,

    // 快捷方法：检查管理员权限
    hasAdminRights: computed(() => store.isSuperAdmin || store.isAdmin),

    // 角色信息
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