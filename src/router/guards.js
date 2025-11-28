import { useAuthStore } from '@/store/modules/auth'
import { ElMessage } from 'element-plus'

/**
 * 路由守卫配置
 */

// 需要登录的路由
const requiresAuthRoutes = [
  '/user',
  '/admin'
]

// 管理员专属路由
const adminRoutes = [
  '/admin'
]

// 捕鱼者专属路由
const fisherRoutes = [
  '/user/fisher'
]

/**
 * 检查路由是否需要登录
 * @param {string} path 路由路径
 * @returns {boolean}
 */
export const requiresAuth = (path) => {
  return requiresAuthRoutes.some(route => path.startsWith(route))
}

/**
 * 检查路由是否需要管理员权限
 * @param {string} path 路由路径
 * @returns {boolean}
 */
export const requiresAdmin = (path) => {
  return adminRoutes.some(route => path.startsWith(route))
}

/**
 * 检查路由是否需要捕鱼者权限
 * @param {string} path 路由路径
 * @returns {boolean}
 */
export const requiresFisher = (path) => {
  return fisherRoutes.some(route => path.startsWith(route))
}

/**
 * 全局前置守卫
 * @param {Object} to 目标路由
 * @param {Object} from 来源路由
 * @param {Function} next 下一步回调
 */
export const beforeEachGuard = async (to, from, next) => {
  const authStore = useAuthStore()

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

    // 检查登录状态是否有效
    const isValid = await authStore.checkAuth()
    if (!isValid) {
      ElMessage.warning('登录已过期，请重新登录')
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // 检查管理员权限
    if (requiresAdmin(to.path) && authStore.user?.role !== 'admin') {
      ElMessage.error('没有管理员权限')
      next('/user/dashboard')
      return
    }

    // 检查捕鱼者权限
    if (requiresFisher(to.path) && authStore.user?.role !== 'fisher') {
      ElMessage.error('只有捕鱼者可以访问此功能')
      next('/user/dashboard')
      return
    }
  }

  
  next()
}

/**
 * 全局后置守卫
 * @param {Object} to 目标路由
 * @param {Object} from 来源路由
 */
export const afterEachGuard = (to, from) => {
  // 设置页面标题
  if (to.meta?.title) {
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
 * @param {Object} error 错误对象
 */
export const onErrorGuard = (error) => {
  console.error('路由错误:', error)

  // 如果是导航取消错误，不显示错误消息
  if (error.name === 'NavigationDuplicated') {
    return
  }

  ElMessage.error('页面跳转失败，请重试')
}

/**
 * 权限检查工具函数
 */
export const permissions = {
  // 检查用户是否有指定权限
  hasPermission: (user, permission) => {
    if (!user) return false

    const permissions = {
      admin: ['read', 'write', 'delete', 'manage_users', 'manage_content'],
      fisher: ['read', 'write', 'manage_own_activities'],
      user: ['read', 'write_own_content']
    }

    return permissions[user.role]?.includes(permission) || false
  },

  // 检查用户是否可以访问指定路由
  canAccessRoute: (user, route) => {
    if (!user) {
      // 未登录用户只能访问公共路由
      const publicRoutes = ['/', '/login', '/register', '/about', '/notice', '/activities', '/science', '/search']
      return publicRoutes.includes(route.path) || route.path.startsWith('/public')
    }

    // 管理员可以访问所有路由
    if (user.role === 'admin') return true

    // 检查捕鱼者权限
    if (user.role === 'fisher' && requiresAdmin(route.path)) return false

    // 检查用户权限
    if (user.role === 'user' && (requiresAdmin(route.path) || requiresFisher(route.path))) return false

    return true
  }
}

export default {
  beforeEachGuard,
  afterEachGuard,
  onErrorGuard,
  permissions
}