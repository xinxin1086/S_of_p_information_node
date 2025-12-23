import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/stores'
import { ElMessage } from 'element-plus'
import type { RouteLocationNormalized } from 'vue-router'

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

// 捕鱼者专属路由
const fisherRoutes: string[] = [
  '/user/fisher'
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
 * 检查路由是否需要捕鱼者权限
 * @param path 路由路径
 * @returns boolean
 */
export const requiresFisher = (path: string): boolean => {
  return fisherRoutes.some(route => path.startsWith(route))
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
  next: (to?: any) => void
): Promise<void> => {
  const authStore = useAuthStore()
  const { hasPermission, isAdmin, isSuperAdmin } = usePermissions()

  // 检查是否需要登录
  if (requiresAuth(to.path)) {
    // 如果未登录，跳转到登录页
    if (!authStore.isAuthenticated) {
      ElMessage.warning('请先登录')
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // 使用新的权限系统检查管理员权限
    if (requiresAdmin(to.path)) {
      if (!isAdmin && !isSuperAdmin) {
        ElMessage.error('没有管理员权限')
        next('/user/dashboard')
        return
      }
    }

    // 检查捕鱼者权限
    if (requiresFisher(to.path)) {
      if (!hasPermission('FISHERMAN') && !hasPermission('ORGANIZATION')) {
        ElMessage.error('只有组织用户可以访问此功能')
        next('/user/dashboard')
        return
      }
    }

    // 检查特定路由的细粒度权限
    if (to.path.startsWith('/admin/content') && !hasPermission('ADMIN')) {
      ElMessage.error('没有内容管理权限')
      next('/admin/dashboard')
      return
    }

    if (to.path.startsWith('/admin/user') && !hasPermission('ADMIN')) {
      ElMessage.error('没有用户管理权限')
      next('/admin/dashboard')
      return
    }

    if (to.path.startsWith('/admin/activity') && !hasPermission('ADMIN')) {
      ElMessage.error('没有活动管理权限')
      next('/admin/dashboard')
      return
    }
  }

  next()
}

/**
 * 全局后置守卫
 * @param to 目标路由
 * @param from 来源路由
 */
export const afterEachGuard = (to: RouteLocationNormalized, from: RouteLocationNormalized): void => {
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
export const onErrorGuard = (error: any): void => {
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
  hasPermission: (user: any, permission: string): boolean => {
    if (!user) return false

    // 使用新的权限检查方式
    const { hasPermission } = usePermissions()
    return hasPermission(permission)
  },

  // 检查用户是否可以访问指定路由（使用新权限系统）
  canAccessRoute: (user: any, route: { path: string }): boolean => {
    if (!user) {
      // 未登录用户只能访问公共路由
      const publicRoutes = ['/', '/login', '/register', '/about', '/notice', '/activities', '/science', '/search']
      return publicRoutes.includes(route.path) || route.path.startsWith('/public')
    }

    const { hasPermission, isAdmin, isSuperAdmin } = usePermissions()
    const authStore = useAuthStore()

    // 超级管理员可以访问所有路由
    if (isSuperAdmin) return true

    // 管理员权限检查
    if (isAdmin && requiresAdmin(route.path)) return true
    if (!isAdmin && requiresAdmin(route.path)) return false

    // 捕鱼者权限检查
    if (requiresFisher(route.path) && !hasPermission('FISHERMAN') && !hasPermission('ORGANIZATION')) {
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