import { ElMessage } from 'element-plus'

/**
 * 认证相关工具函数
 */

// 检查用户是否已登录
export const isLoggedIn = () => {
  const token = localStorage.getItem('user_token')
  return !!token
}

// 获取用户信息
export const getUserInfo = () => {
  const userInfo = localStorage.getItem('user_info')
  return userInfo ? JSON.parse(userInfo) : null
}

// 获取用户角色
export const getUserRole = () => {
  const userInfo = getUserInfo()
  return userInfo?.role || null
}

// 检查是否为管理员
export const isAdmin = () => {
  return getUserRole() === 'admin'
}

// 检查是否为组织用户
export const isOrganization = () => {
  return getUserRole() === 'organization'
}

// 检查是否为普通用户
export const isUser = () => {
  return getUserRole() === 'user'
}

// 检查是否为访客
export const isGuest = () => {
  return getUserRole() === 'guest'
}

// 保存用户信息
export const saveUserInfo = (userInfo) => {
  localStorage.setItem('user_info', JSON.stringify(userInfo))
}

// 清除用户信息
export const clearUserInfo = () => {
  localStorage.removeItem('user_token')
  localStorage.removeItem('user_info')
}

// 生成随机token（仅用于演示）
export const generateToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

// 权限检查函数
export const checkPermission = (requiredRole) => {
  const userRole = getUserRole()

  if (!requiredRole) return true

  switch (requiredRole) {
    case 'admin':
      return isAdmin()
    case 'organization':
      return isOrganization()
    case 'user':
      return isUser() || isOrganization() || isAdmin() // 普通用户及以上权限
    case 'guest':
      return true // 访客权限（所有人都可以访问）
    default:
      return false
  }
}

// 路由权限守卫
export const routeGuard = (to, from, next) => {
  const requiresAuth = to.meta.requiresAuth
  const requiresAdmin = to.meta.requiresAdmin
  const requiresOrganization = to.meta.requiresOrganization
  const requiresUser = to.meta.requiresUser

  if (requiresAuth && !isLoggedIn()) {
    ElMessage.warning('请先登录')
    next('/login')
    return
  }

  if (requiresAdmin && !isAdmin()) {
    ElMessage.error('需要管理员权限')
    next('/')
    return
  }

  if (requiresOrganization && !isOrganization() && !isAdmin()) {
    ElMessage.error('需要组织用户权限')
    next('/user/dashboard')
    return
  }

  if (requiresUser && !isLoggedIn()) {
    ElMessage.error('需要用户权限')
    next('/login')
    return
  }

  next()
}

// 密码强度检查
export const checkPasswordStrength = (password) => {
  if (!password) return { score: 0, message: '请输入密码' }

  let score = 0
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }

  // 计算分数
  Object.values(checks).forEach(passed => {
    if (passed) score++
  })

  // 返回结果
  if (score <= 2) {
    return { score, message: '密码强度：弱', color: '#f56c6c' }
  } else if (score <= 3) {
    return { score, message: '密码强度：中', color: '#e6a23c' }
  } else if (score <= 4) {
    return { score, message: '密码强度：较强', color: '#409eff' }
  } else {
    return { score, message: '密码强度：强', color: '#67c23a' }
  }
}

// 邮箱格式验证
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 手机号格式验证
export const validatePhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

// 用户名格式验证
export const validateUsername = (username) => {
  // 用户名长度4-20，只能包含字母、数字、下划线
  const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/
  return usernameRegex.test(username)
}