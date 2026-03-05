import { ElMessage } from 'element-plus'
import type { RouteLocationNormalized } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import type { Permissions } from '@/types/auth'

/**
 * 路由守卫配置 - 纯前端模式
 */

// 需要登录的路由
const requiresAuthRoutes: string[] = [
  '/user',
  '/admin'
]

/**
 * 检查路由是否需要登录
 */
export const requiresAuth = (path: string): boolean => {
  return requiresAuthRoutes.some(route => path.startsWith(route))
}

/**
 * 全局前置守卫 - 纯前端模式，管理员可访问所有页面
 */
export const beforeEachGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: (to?: string | Location) => void
): Promise<void> => {
  const authStore = useAuthStore()

  // 如果路由需要认证
  if (requiresAuth(to.path)) {
    // 检查登录状态
    if (!authStore.isAuthenticated) {
      ElMessage.warning('请先登录')
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // 纯前端模式：管理员可以访问所有页面
    // 用户只能访问用户页面
    const isAdmin = authStore.isAdmin
    const isUserRoute = to.path.startsWith('/user') || to.path === '/user'
    const isAdminRoute = to.path.startsWith('/admin') || to.path === '/admin'

    // 管理员可以访问任何页面
    if (isAdmin) {
      next()
      return
    }

    // 普通用户访问用户页面，允许
    if (isUserRoute && !isAdmin) {
      next()
      return
    }

    // 普通用户访问管理员页面，重定向
    if (isAdminRoute && !isAdmin) {
      ElMessage.error('需要管理员权限才能访问此功能')
      next('/user')
      return
    }

    next()
    return
  }

  // 公共页面，直接访问
  next()
}

/**
 * 全局后置守卫
 */
export const afterEachGuard = (to: RouteLocationNormalized, _from: RouteLocationNormalized): void => {
  // 设置页面标题
  if (to.meta?.title && typeof to.meta.title === 'string') {
    document.title = `${to.meta.title} - 社区交流平台`
  } else {
    document.title = '社区交流平台'
  }

  // 滚动到页面顶部
  window.scrollTo(0, 0)
}

/**
 * 路由错误处理
 */
export const onErrorGuard = (error: Error): void => {
  console.error('路由错误:', error)

  if (error.name === 'NavigationDuplicated') {
    return
  }

  if (error.message?.includes('Failed to resolve async component')) {
    ElMessage.error('页面组件加载失败，请刷新页面重试')
    return
  }

  if (error.message?.includes('hydrate') || error.message?.includes('async root')) {
    ElMessage.warning('页面状态异常，建议刷新页面')
    return
  }

  ElMessage.error('页面跳转失败，请重试')
}

/**
 * 权限检查工具函数
 */
export const permissions = {
  // 检查用户是否有指定权限
  hasPermission: (user: { permissions?: Permissions } | null, permission: string): boolean => {
    if (!user) return false

    // 管理员拥有所有权限
    const authStore = useAuthStore()
    if (authStore.isAdmin) return true

    return false
  },

  // 检查用户是否可以访问指定路由
  canAccessRoute: (user: { permissions?: Permissions } | null, route: { path: string }): boolean => {
    if (!user) {
      // 未登录用户只能访问公共路由
      const publicRoutes = ['/', '/login', '/register', '/about', '/notice', '/activities', '/science', '/search']
      return publicRoutes.includes(route.path) || route.path.startsWith('/public')
    }

    const authStore = useAuthStore()

    // 超级管理员可以访问所有路由
    if (authStore.isSuperAdmin) return true

    // 管理员权限检查
    if (authStore.isAdmin && route.path.startsWith('/admin')) return true
    if (!authStore.isAdmin && route.path.startsWith('/admin')) return false

    return true
  }
}

export default {
  beforeEachGuard,
  afterEachGuard,
  onErrorGuard,
  permissions
}
