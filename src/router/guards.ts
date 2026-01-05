import { ElMessage } from 'element-plus'
import type { RouteLocationNormalized } from 'vue-router'

import { usePermissions } from '@/stores'
import { useAuthStore } from '@/stores/auth'
import type { Permissions } from '@/types/auth'

/**
 * 路由守卫配置
 */

// 需要登录的路由
const requiresAuthRoutes: string[] = [
  '/user',
  '/admin'
]

// 管理员专属路由
const adminRoutes: string[] = [
  '/admin'
]

// 组织用户专属路由
const organizationRoutes: string[] = [
  '/user/weave'
]

/**
 * 检查路由是否需要登录
 * @param path 路由路径
 * @returns boolean
 */
export const requiresAuth = (path: string): boolean => {
  return requiresAuthRoutes.some(route => path.startsWith(route))
}

/**
 * 检查路由是否需要管理员权限
 * @param path 路由路径
 * @returns boolean
 */
export const requiresAdmin = (path: string): boolean => {
  return adminRoutes.some(route => path.startsWith(route))
}

/**
 * 检查路由是否需要组织用户权限
 * @param path 路由路径
 * @returns boolean
 */
export const requiresOrganization = (path: string): boolean => {
  return organizationRoutes.some(route => path.startsWith(route))
}

/**
 * 检查用户认证状态
 * @param authStore 认证存储
 * @param to 目标路由
 * @param next 下一步回调
 * @returns 是否已处理导航
 */
function checkAuthentication(
  authStore: ReturnType<typeof useAuthStore>,
  to: RouteLocationNormalized,
  next: (to?: string | Location) => void
): boolean {
  if (requiresAuth(to.path) && !authStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return true
  }
  return false
}

/**
 * 检查管理员权限
 * @param authStore 认证存储
 * @param to 目标路由
 * @param next 下一步回调
 * @returns 是否已处理导航
 */
function checkAdminPermission(
  authStore: ReturnType<typeof useAuthStore>,
  to: RouteLocationNormalized,
  next: (to?: string | Location) => void
): boolean {
  if (requiresAdmin(to.path)) {
    const userRole = authStore.currentRole
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      ElMessage.error('没有管理员权限')
      next('/user/dashboard')
      return true
    }
  }
  return false
}

/**
 * 检查组织用户权限
 * @param hasPermission 权限检查函数
 * @param to 目标路由
 * @param next 下一步回调
 * @returns 是否已处理导航
 */
function checkOrganizationPermission(
  hasPermission: (permission: string) => boolean,
  to: RouteLocationNormalized,
  next: (to?: string | Location) => void
): boolean {
  if (requiresOrganization(to.path) || to.meta?.requiresOrganization) {
    if (!hasPermission('ORGANIZATION')) {
      ElMessage.error('只有组织用户可以访问此功能')
      next('/user/dashboard')
      return true
    }
  }
  return false
}

/**
 * 检查细粒度权限
 * @param hasPermission 权限检查函数
 * @param to 目标路由
 * @param next 下一步回调
 * @returns 是否已处理导航
 */
function checkFineGrainedPermissions(
  hasPermission: (permission: string) => boolean,
  to: RouteLocationNormalized,
  next: (to?: string | Location) => void
): boolean {
  // 统一检查所有 /admin/ 路径的权限
  // 如果不是管理员，访问任何管理后台页面都需要拦截
  if (to.path.startsWith('/admin/') && !hasPermission('ADMIN')) {
    ElMessage.error('需要管理员权限才能访问此功能')
    next('/admin/dashboard')
    return true
  }

  return false
}

/**
 * 全局前置守卫 - 使用新的统一权限系统
 * @param to 目标路由
 * @param from 来源路由
 * @param next 下一步回调
 */
export const beforeEachGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: (to?: string | Location) => void
): Promise<void> => {
  const authStore = useAuthStore()
  const { hasPermission } = usePermissions()

  // 如果路由需要认证，进行权限检查
  if (requiresAuth(to.path)) {
    // 检查登录状态
    if (checkAuthentication(authStore, to, next)) {
      return
    }

    // 检查管理员权限
    if (checkAdminPermission(authStore, to, next)) {
      return
    }

    // 检查组织用户权限
    if (checkOrganizationPermission(hasPermission, to, next)) {
      return
    }

    // 检查细粒度权限
    if (checkFineGrainedPermissions(hasPermission, to, next)) {
      return
    }
  }

  next()
}

/**
 * 全局后置守卫
 * @param to 目标路由
 * @param _from 来源路由
 */
export const afterEachGuard = (to: RouteLocationNormalized, _from: RouteLocationNormalized): void => {
  // 设置页面标题
  if (to.meta?.title && typeof to.meta.title === 'string') {
    document.title = `${to.meta.title} - 汉江垂钓站`
  } else {
    document.title = '汉江垂钓站'
  }

  // 滚动到页面顶部
  window.scrollTo(0, 0)

  // 可以在这里添加页面访问统计
  // trackPageView(to.path)
}

/**
 * 路由错误处理
 * @param error 错误对象
 */
export const onErrorGuard = (error: Error): void => {
  console.error('路由错误:', error)

  // 如果是导航取消错误，不显示错误消息
  if (error.name === 'NavigationDuplicated') {
    return
  }

  // 如果是组件加载失败
  if (error.message?.includes('Failed to resolve async component')) {
    ElMessage.error('页面组件加载失败，请刷新页面重试')
    return
  }

  // 如果是hydration相关错误
  if (error.message?.includes('locateNonHydratedAsyncRoot') ||
      error.message?.includes('hydrate') ||
      error.message?.includes('async root')) {
    console.warn('Hydration error detected, reloading page...')
    // 可以选择自动刷新页面或显示友好的错误消息
    ElMessage.warning('页面状态异常，建议刷新页面')
    return
  }

  ElMessage.error('页面跳转失败，请重试')
}

/**
 * 权限检查工具函数（使用新的统一权限系统）
 */
export const permissions = {
  // 检查用户是否有指定权限（使用新权限系统）
  hasPermission: (user: { permissions?: Permissions } | null, permission: string): boolean => {
    if (!user) return false

    // 使用新的权限检查方式
    const { hasPermission } = usePermissions()
    return hasPermission(permission)
  },

  // 检查用户是否可以访问指定路由（使用新权限系统）
  canAccessRoute: (user: { permissions?: Permissions } | null, route: { path: string }): boolean => {
    if (!user) {
      // 未登录用户只能访问公共路由
      const publicRoutes = ['/', '/login', '/register', '/about', '/notice', '/activities', '/science', '/search']
      return publicRoutes.includes(route.path) || route.path.startsWith('/public')
    }

    const { hasPermission } = usePermissions()
    const authStore = useAuthStore()

    // 修复：直接检查 currentRole 而不是访问 computed 属性
    const userRole = authStore.currentRole

    // 超级管理员可以访问所有路由
    if (userRole === 'SUPER_ADMIN') return true

    // 管理员权限检查
    if (userRole === 'ADMIN' && requiresAdmin(route.path)) return true
    if (userRole !== 'ADMIN' && requiresAdmin(route.path)) return false

    // 组织用户权限检查
    if (requiresOrganization(route.path) && !hasPermission('ORGANIZATION')) {
      return false
    }

    return true
  }
}

export default {
  beforeEachGuard,
  afterEachGuard,
  onErrorGuard,
  permissions
}