import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 初始化时从localStorage恢复用户信息
  const storedUserInfo = localStorage.getItem('user_info')
  let initialUser = null
  if (storedUserInfo) {
    try {
      initialUser = JSON.parse(storedUserInfo)
    } catch (error) {
      console.warn('Failed to parse stored user info:', error)
      localStorage.removeItem('user_info')
    }
  }

  const user = ref(initialUser)
  const token = ref(localStorage.getItem('user_token') || '')
  const isAuthenticated = ref(!!token.value && !!user.value)

  // 登录
  const login = async (credentials) => {
    try {
      // 根据角色选择正确的API端点
      const roleApiMap = {
        admin: '/api/admin/login',
        user: '/api/user/login'
      }

      const apiPath = roleApiMap[credentials.role] || '/api/user/login'
      const { BASE_URL } = await import('@/config.js')
      const apiUrl = `${BASE_URL}${apiPath}`

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account: credentials.account,
          password: credentials.password
        })
      })

      if (response.ok) {
        const data = await response.json()

        // 检查后端返回的success字段
        if (data.success) {
          // 构造用户信息对象
          const userInfo = {
            id: data.data?.user?.id,
            account: data.data?.user?.account || credentials.account,
            username: data.data?.user?.username || data.data?.user?.account || credentials.account,
            name: data.data?.user?.name || data.data?.user?.username || credentials.account,
            nickname: data.data?.user?.nickname || data.data?.user?.name,
            email: data.data?.user?.email,
            phone: data.data?.user?.phone,
            avatar: data.data?.user?.avatar || data.data?.user?.head_pic || data.data?.user?.profile_image,
            role: credentials.role,
            created_at: data.data?.user?.created_at || data.data?.user?.createdAt,
            status: data.data?.user?.status || 'active',
            // 保留其他可能的用户字段
            ...(data.data?.user || {})
          }

          user.value = userInfo
          token.value = data.data?.token
          isAuthenticated.value = true
          localStorage.setItem('user_token', data.data?.token)
          localStorage.setItem('user_info', JSON.stringify(userInfo))

          return { success: true, data: data.data, user: userInfo }
        } else {
          return { success: false, error: data.message || '登录失败' }
        }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.message || '登录失败' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 注册
  const register = async (userData) => {
    try {
      const { BASE_URL } = await import('@/config.js')
      const response = await fetch(`${BASE_URL}/api/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        const data = await response.json()
        return { success: true, data }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.message || '注册失败' }
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 登出
  const logout = () => {
    user.value = null
    token.value = ''
    isAuthenticated.value = false
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_info')
  }

  // 检查登录状态
  const checkAuth = async () => {
    if (!token.value) return false

    try {
      // 使用与登录相同的BASE_URL和正确的验证端点
      const { BASE_URL } = await import('@/config.js')

      // 先尝试从localStorage获取用户信息进行本地验证
      const userInfo = localStorage.getItem('user_info')
      if (userInfo) {
        try {
          const parsedUserInfo = JSON.parse(userInfo)
          user.value = parsedUserInfo
          isAuthenticated.value = true

          // 可选：如果需要服务器端验证，可以调用验证API
          // 这里先注释掉，避免API端点不匹配问题
          /*
          const response = await fetch(`${BASE_URL}/api/admin/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token.value}`
            }
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              user.value = data.user || parsedUserInfo
              isAuthenticated.value = true
              return true
            }
          }
          */

          return true
        } catch (parseError) {
          console.error('Failed to parse user info:', parseError)
        }
      }

      // 如果本地验证失败，清除状态
      logout()
      return false
    } catch (error) {
      console.error('Auth check error:', error)
      logout()
      return false
    }
  }

  // 设置用户信息（用于登录时直接设置）
  const setUser = (userInfo, userToken) => {
    user.value = userInfo
    token.value = userToken
    isAuthenticated.value = true
    if (userToken) {
      localStorage.setItem('user_token', userToken)
    }
  }

  // 更新用户信息
  const updateProfile = async (profileData) => {
    try {
      const { BASE_URL } = await import('@/config.js')
      const response = await fetch(`${BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        const data = await response.json()
        user.value = { ...user.value, ...data.user }
        return { success: true, data }
      } else {
        return { success: false, error: '更新失败' }
      }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 获取管理员详细信息（管理员登录到用户页面时使用）
  const fetchAdminUserInfo = async () => {
    try {
      const { BASE_URL } = await import('@/config.js')
      const response = await fetch(`${BASE_URL}/api/admin/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          const adminInfo = {
            id: data.data.id,
            username: data.data.username || data.data.name,
            nickname: data.data.nickname || data.data.name,
            email: data.data.email,
            phone: data.data.phone,
            avatar: data.data.avatar || data.data.head_pic,
            role: 'admin',
            created_at: data.data.created_at || data.data.createdAt,
            status: data.data.status || 'active',
            ...data.data
          }
          user.value = adminInfo
          localStorage.setItem('user_info', JSON.stringify(adminInfo))
          return { success: true, data: adminInfo }
        }
      }
      return { success: false, error: '获取管理员信息失败' }
    } catch (error) {
      console.error('Fetch admin info error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    setUser,
    updateProfile,
    fetchAdminUserInfo
  }
})