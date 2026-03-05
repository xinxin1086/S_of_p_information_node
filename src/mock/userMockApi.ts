/**
 * 用户 Mock API 服务
 * 模拟后端用户管理相关接口
 */

import type { UserInfo } from '@/types/auth'
import type { DeletedUserRecord, AdminModel } from './userMockData'
import { mockAllUsers, mockDeletedUsers, mockAdminModels, getAdminUserInfo } from './userMockData'
import { generateId } from '@/mock/mockStorage'

// 模拟网络延迟
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 生成新 ID
 */
function generateNewId(items: any[]): number {
  if (items.length === 0) return 1
  const maxId = Math.max(...items.map((item) => item.id))
  return maxId + 1
}

/**
 * 用户 Mock API
 */
export const userMockApi = {
  // ========== 用户管理 ==========

  /**
   * 获取用户列表
   */
  async getUserList(params: {
    page?: number
    size?: number
    role?: string
    keyword?: string
    is_deleted?: number
  } = {}): Promise<{
    success: boolean
    data?: {
      items: UserInfo[]
      total: number
      page: number
      size: number
      total_pages: number
    }
    message?: string
  }> {
    await delay()

    let users = [...mockAllUsers]

    // 角色过滤
    if (params.role) {
      users = users.filter((u) => u.role === params.role)
    }

    // 关键词搜索
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      users = users.filter(
        (u) =>
          u.username.toLowerCase().includes(keyword) ||
          u.account.toLowerCase().includes(keyword) ||
          u.phone.includes(keyword) ||
          u.email?.toLowerCase().includes(keyword)
      )
    }

    // 注销状态过滤（当前所有用户都是未删除状态）
    if (params.is_deleted !== undefined) {
      // 这里可以模拟已删除用户
    }

    // 排序（默认按创建时间降序）
    users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // 分页
    const page = params.page || 1
    const size = params.size || 10
    const total = users.length
    const total_pages = Math.ceil(total / size)
    const start = (page - 1) * size
    const paginatedUsers = users.slice(start, start + size)

    return {
      success: true,
      data: {
        items: paginatedUsers,
        total,
        page,
        size,
        total_pages
      }
    }
  },

  /**
   * 获取用户详情
   */
  async getUserDetail(userId: number): Promise<{
    success: boolean
    data?: UserInfo
    message?: string
  }> {
    await delay()

    const user = mockAllUsers.find((u) => u.id === userId)

    if (!user) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    return {
      success: true,
      data: user
    }
  },

  /**
   * 创建用户
   */
  async createUser(userData: {
    account: string
    username: string
    phone: string
    email?: string
    role?: string
    avatar?: string
  }): Promise<{
    success: boolean
    data?: UserInfo
    message?: string
  }> {
    await delay()

    // 检查账号是否已存在
    if (mockAllUsers.some((u) => u.account === userData.account)) {
      return {
        success: false,
        message: '账号已存在'
      }
    }

    // 检查手机号是否已存在
    if (mockAllUsers.some((u) => u.phone === userData.phone)) {
      return {
        success: false,
        message: '手机号已存在'
      }
    }

    const newUser: UserInfo = {
      id: generateNewId(mockAllUsers),
      account: userData.account,
      username: userData.username,
      phone: userData.phone,
      email: userData.email || '',
      role: userData.role || 'USER',
      avatar:
        userData.avatar ||
        'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      nickname: userData.username,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active',
      all_roles: [userData.role || 'USER'],
      name: userData.username,
      head_pic:
        userData.avatar ||
        'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      profile_image:
        userData.avatar ||
        'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    }

    mockAllUsers.push(newUser)

    return {
      success: true,
      data: newUser
    }
  },

  /**
   * 更新用户
   */
  async updateUser(
    userId: number,
    updates: {
      username?: string
      email?: string
      phone?: string
      avatar?: string
      role?: string
    }
  ): Promise<{
    success: boolean
    data?: UserInfo
    message?: string
  }> {
    await delay()

    const user = mockAllUsers.find((u) => u.id === userId)

    if (!user) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    // 更新字段
    if (updates.username) user.username = updates.username
    if (updates.email !== undefined) user.email = updates.email
    if (updates.phone) user.phone = updates.phone
    if (updates.avatar !== undefined) {
      user.avatar = updates.avatar
      user.head_pic = updates.avatar
      user.profile_image = updates.avatar
    }
    if (updates.role) {
      user.role = updates.role
      user.all_roles = [updates.role]
    }
    user.updated_at = new Date().toISOString()

    return {
      success: true,
      data: user
    }
  },

  /**
   * 删除用户（软删除）
   */
  async deleteUser(userId: number): Promise<{
    success: boolean
    message?: string
  }> {
    await delay()

    const index = mockAllUsers.findIndex((u) => u.id === userId)

    if (index === -1) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    const user = mockAllUsers[index]

    // 创建注销记录
    const deletedRecord: DeletedUserRecord = {
      id: generateNewId(mockDeletedUsers),
      original_user_id: user.id,
      original_account: user.account,
      original_phone: user.phone,
      delete_time: new Date().toISOString()
    }
    mockDeletedUsers.push(deletedRecord)

    // 从列表中移除用户（软删除）
    mockAllUsers.splice(index, 1)

    return {
      success: true,
      message: '用户已删除'
    }
  },

  /**
   * 批量删除用户
   */
  async batchDeleteUsers(userIds: number[]): Promise<{
    success: boolean
    message?: string
  }> {
    await delay()

    let deletedCount = 0

    for (const userId of userIds) {
      const index = mockAllUsers.findIndex((u) => u.id === userId)
      if (index !== -1) {
        const user = mockAllUsers[index]

        // 创建注销记录
        const deletedRecord: DeletedUserRecord = {
          id: generateNewId(mockDeletedUsers),
          original_user_id: user.id,
          original_account: user.account,
          original_phone: user.phone,
          delete_time: new Date().toISOString()
        }
        mockDeletedUsers.push(deletedRecord)

        // 移除用户
        mockAllUsers.splice(index, 1)
        deletedCount++
      }
    }

    return {
      success: true,
      message: `成功删除 ${deletedCount} 个用户`
    }
  },

  /**
   * 封禁/解封用户
   */
  async toggleUserStatus(
    userId: number,
    action: 'ban' | 'unban'
  ): Promise<{
    success: boolean
    message?: string
  }> {
    await delay()

    const user = mockAllUsers.find((u) => u.id === userId)

    if (!user) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    if (action === 'ban') {
      user.status = 'banned'
      return {
        success: true,
        message: '用户已封禁'
      }
    } else {
      user.status = 'active'
      return {
        success: true,
        message: '用户已解封'
      }
    }
  },

  /**
   * 重置用户密码
   */
  async resetUserPassword(userId: number): Promise<{
    success: boolean
    data?: { new_password: string }
    message?: string
  }> {
    await delay()

    const user = mockAllUsers.find((u) => u.id === userId)

    if (!user) {
      return {
        success: false,
        message: '用户不存在'
      }
    }

    // 生成随机密码
    const newPassword = '123456'

    return {
      success: true,
      data: { new_password: newPassword },
      message: '密码已重置为：123456'
    }
  },

  // ========== 管理员管理 ==========

  /**
   * 获取 Admin 模型列表（精简版，只包含管理信息）
   */
  async getAdminModelList(params: {
    page?: number
    size?: number
    role?: string
  } = {}): Promise<{
    success: boolean
    data?: {
      items: (AdminModel & { role?: string })[]
      total: number
      page: number
      size: number
    }
    message?: string
  }> {
    await delay()

    let admins = [...mockAdminModels]

    // 角色过滤（需要通过关联的 User 表获取 role）
    if (params.role) {
      admins = admins.filter((a) => {
        const user = mockAllUsers.find((u) => u.id === a.user_id)
        return user?.role === params.role
      })
    }

    // 排序
    admins.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // 分页
    const page = params.page || 1
    const size = params.size || 10
    const total = admins.length
    const start = (page - 1) * size
    const paginatedAdmins = admins.slice(start, start + size)

    // 附加 role 字段（从关联的 User 获取）
    const adminsWithRole = paginatedAdmins.map((a) => {
      const user = mockAllUsers.find((u) => u.id === a.user_id)
      return {
        ...a,
        role: user?.role
      }
    })

    return {
      success: true,
      data: {
        items: adminsWithRole,
        total,
        page,
        size
      }
    }
  },

  /**
   * 获取 Admin 模型详情（精简版）
   */
  async getAdminModelDetail(adminId: number): Promise<{
    success: boolean
    data?: AdminModel
    message?: string
  }> {
    await delay()

    const admin = mockAdminModels.find((a) => a.id === adminId)

    if (!admin) {
      return {
        success: false,
        message: '管理员不存在'
      }
    }

    return {
      success: true,
      data: admin
    }
  },

  /**
   * 获取管理员及其关联的完整用户信息
   * 模拟后端的 @property 装饰器方法
   */
  async getAdminWithUserInfo(adminId: number): Promise<{
    success: boolean
    data?: (AdminModel & { account?: string; username?: string; phone?: string; email?: string; avatar?: string })
    message?: string
  }> {
    await delay()

    const admin = mockAdminModels.find((a) => a.id === adminId)
    if (!admin) {
      return {
        success: false,
        message: '管理员不存在'
      }
    }

    // 从关联的用户获取登录信息
    const user = mockAllUsers.find((u) => u.id === admin.user_id)
    if (!user) {
      return {
        success: false,
        message: '关联的用户不存在'
      }
    }

    return {
      success: true,
      data: {
        ...admin,
        account: user.account,
        username: user.username,
        phone: user.phone,
        email: user.email,
        avatar: user.avatar
      }
    }
  },

  /**
   * 获取管理员列表
   */
  async getAdminList(params: {
    page?: number
    size?: number
    role?: string
  } = {}): Promise<{
    success: boolean
    data?: {
      items: UserInfo[]
      total: number
      page: number
      size: number
    }
    message?: string
  }> {
    await delay()

    let admins = mockAllUsers.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN')

    // 角色过滤
    if (params.role) {
      admins = admins.filter((u) => u.role === params.role)
    }

    // 排序
    admins.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // 分页
    const page = params.page || 1
    const size = params.size || 10
    const total = admins.length
    const start = (page - 1) * size
    const paginatedAdmins = admins.slice(start, start + size)

    return {
      success: true,
      data: {
        items: paginatedAdmins,
        total,
        page,
        size
      }
    }
  },

  /**
   * 创建管理员（使用精简的 Admin 模型）
   * 流程：
   * 1. 先创建 User 对象（包含登录凭证）
   * 2. 再创建 Admin 对象（只包含管理信息，关联到 user_id）
   */
  async createAdmin(adminData: {
    account: string
    username: string
    phone: string
    email?: string
    role?: 'ADMIN' | 'SUPER_ADMIN'
  }): Promise<{
    success: boolean
    data?: UserInfo
    message?: string
  }> {
    await delay()

    // 检查账号是否已存在
    if (mockAllUsers.some((u) => u.account === adminData.account)) {
      return {
        success: false,
        message: '账号已存在'
      }
    }

    // 检查手机号是否已存在
    if (mockAllUsers.some((u) => u.phone === adminData.phone)) {
      return {
        success: false,
        message: '手机号已存在'
      }
    }

    // 第一步：创建 User 对象（包含登录凭证）
    const newUserId = generateNewId(mockAllUsers)
    const newUser: UserInfo = {
      id: newUserId,
      account: adminData.account,
      username: adminData.username,
      phone: adminData.phone,
      email: adminData.email || '',
      role: 'USER',  // 用户表中的默认角色，实际角色由 Admin 决定
      avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
      nickname: adminData.username,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active',
      all_roles: [adminData.role || 'ADMIN'],
      name: adminData.username,
      head_pic: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
      profile_image: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
    }

    mockAllUsers.push(newUser)

    // 第二步：创建 Admin 对象（精简模型，只包含管理信息）
    const newAdminId = generateNewId(mockAdminModels)
    const newAdminModel: AdminModel = {
      id: newAdminId,
      user_id: newUserId,  // 关联到刚创建的用户
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    mockAdminModels.push(newAdminModel)

    // 返回合并后的完整用户信息（供前端使用）
    const mergedUserInfo: UserInfo = {
      ...newUser,
      admin_id: newAdminId,  // Admin 记录 ID
      user_id: newUserId,  // 关联的用户 ID（外键）
      role: adminData.role || 'ADMIN'  // role 来自 User 表
    }

    return {
      success: true,
      data: mergedUserInfo
    }
  },

  /**
   * 降级管理员为普通用户
   */
  async demoteAdmin(adminId: number): Promise<{
    success: boolean
    message?: string
  }> {
    await delay()

    const admin = mockAllUsers.find((u) => u.id === adminId)

    if (!admin) {
      return {
        success: false,
        message: '管理员不存在'
      }
    }

    if (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN') {
      return {
        success: false,
        message: '该用户不是管理员'
      }
    }

    // 降级为普通用户
    admin.role = 'USER'
    admin.all_roles = ['USER']
    admin.updated_at = new Date().toISOString()

    return {
      success: true,
      message: '管理员已降级为普通用户'
    }
  },

  /**
   * 批量降级管理员
   */
  async batchDemoteAdmins(adminIds: number[]): Promise<{
    success: boolean
    message?: string
  }> {
    await delay()

    let demotedCount = 0

    for (const adminId of adminIds) {
      const admin = mockAllUsers.find((u) => u.id === adminId)
      if (admin && (admin.role === 'ADMIN' || admin.role === 'SUPER_ADMIN')) {
        admin.role = 'USER'
        admin.all_roles = ['USER']
        admin.updated_at = new Date().toISOString()
        demotedCount++
      }
    }

    return {
      success: true,
      message: `成功降级 ${demotedCount} 个管理员`
    }
  },

  // ========== 已注销用户管理 ==========

  /**
   * 获取已注销用户列表
   */
  async getDeletedUsersList(params: {
    page?: number
    size?: number
  } = {}): Promise<{
    success: boolean
    data?: {
      items: DeletedUserRecord[]
      total: number
      page: number
      size: number
    }
    message?: string
  }> {
    await delay()

    const page = params.page || 1
    const size = params.size || 10
    const total = mockDeletedUsers.length
    const start = (page - 1) * size
    const paginatedUsers = mockDeletedUsers.slice(start, start + size)

    return {
      success: true,
      data: {
        items: paginatedUsers,
        total,
        page,
        size
      }
    }
  },

  // ========== 统计数据 ==========

  /**
   * 获取用户统计数据
   */
  async getUserStats(): Promise<{
    success: boolean
    data?: {
      total_users: number
      normal_users: number
      org_users: number
      admins: number
      deleted_users: number
      active_users: number
      banned_users: number
      postCount?: number
      commentCount?: number
      bookingCount?: number
      favoriteCount?: number
    }
    message?: string
  }> {
    await delay()

    const normalUsers = mockAllUsers.filter((u) => u.role === 'USER').length
    const orgUsers = mockAllUsers.filter((u) => u.role === 'ORG_USER').length
    const admins = mockAllUsers.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length
    const activeUsers = mockAllUsers.filter((u) => u.status === 'active').length
    const bannedUsers = mockAllUsers.filter((u) => u.status === 'banned').length

    return {
      success: true,
      data: {
        total_users: mockAllUsers.length,
        normal_users: normalUsers,
        org_users: orgUsers,
        admins: admins,
        deleted_users: mockDeletedUsers.length,
        active_users: activeUsers,
        banned_users: bannedUsers,
        // 当前用户的个人统计数据
        postCount: 0,
        commentCount: 0,
        bookingCount: 0,
        favoriteCount: 0
      }
    }
  },

  // ========== 当前用户相关 ==========

  /**
   * 获取当前登录用户信息
   */
  async getUserInfo(): Promise<{
    success: boolean
    data?: UserInfo
    message?: string
  }> {
    await delay()

    // 从 localStorage 获取当前登录用户信息
    const storedUser = localStorage.getItem('auth_user')
    if (storedUser) {
      try {
        const currentUser = JSON.parse(storedUser) as UserInfo
        return {
          success: true,
          data: currentUser
        }
      } catch (e) {
        console.error('解析用户信息失败:', e)
      }
    }

    // 如果没有登录用户，返回错误
    return {
      success: false,
      message: '未登录或用户不存在'
    }
  },

  /**
   * 获取用户活动列表
   */
  async getUserActivities(params?: {
    limit?: number
    page?: number
  }): Promise<{
    success: boolean
    data?: Array<{
      id: number
      type: 'post' | 'comment' | 'booking' | 'favorite'
      title: string
      time: string
    }>
    message?: string
  }> {
    await delay()

    // 返回空的活动列表
    return {
      success: true,
      data: []
    }
  },

  /**
   * 更新用户资料
   */
  async updateProfile(profileData: {
    username?: string
    email?: string
    phone?: string
    avatar?: string
    nickname?: string
  }): Promise<{
    success: boolean
    data?: UserInfo
    message?: string
  }> {
    await delay()

    // 从 localStorage 获取当前登录用户信息
    const storedUser = localStorage.getItem('auth_user')
    if (!storedUser) {
      return {
        success: false,
        message: '未登录或用户不存在'
      }
    }

    const currentUser = JSON.parse(storedUser) as UserInfo

    // 更新字段
    if (profileData.username) currentUser.username = profileData.username
    if (profileData.email !== undefined) currentUser.email = profileData.email
    if (profileData.phone) currentUser.phone = profileData.phone
    if (profileData.avatar !== undefined) {
      currentUser.avatar = profileData.avatar
      currentUser.head_pic = profileData.avatar
      currentUser.profile_image = profileData.avatar
    }
    if (profileData.nickname) currentUser.nickname = profileData.nickname
    currentUser.updated_at = new Date().toISOString()

    // 更新 localStorage 中的用户信息
    localStorage.setItem('auth_user', JSON.stringify(currentUser))

    // 同时更新 mockAllUsers 中的对应用户（如果存在）
    const mockUser = mockAllUsers.find((u) => u.id === currentUser.id)
    if (mockUser) {
      Object.assign(mockUser, currentUser)
    }

    return {
      success: true,
      data: currentUser
    }
  },

  /**
   * 上传头像
   */
  async uploadAvatar(file: File): Promise<{
    success: boolean
    data?: { avatar_url: string }
    message?: string
  }> {
    await delay()

    // 模拟上传，返回一个固定 URL
    const avatarUrl = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

    return {
      success: true,
      data: { avatar_url: avatarUrl }
    }
  }
}

export default userMockApi
