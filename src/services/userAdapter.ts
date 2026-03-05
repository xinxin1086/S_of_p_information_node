/**
 * 用户 API 适配器
 * 根据配置自动切换 Mock API 和真实 API
 */

import { userApi as realUserApi, adminApi } from '@/api'
import { userMockApi } from '@/mock/userMockApi'
import { shouldUseMock } from '@/utils/mockHelper'
import type { UserInfo } from '@/types/auth'

/**
 * 用户 API 适配器
 * 统一接口，自动切换 Mock/Real
 */
export const userAdapter = {
  // ========== 用户管理 ==========

  /**
   * 获取用户列表
   */
  async getUserList(params?: {
    page?: number
    size?: number
    role?: string
    keyword?: string
    is_deleted?: number
  }) {
    if (shouldUseMock()) {
      return userMockApi.getUserList(params)
    }
    return realUserApi.getUserList(params)
  },

  /**
   * 获取用户详情
   */
  async getUserDetail(userId: number) {
    if (shouldUseMock()) {
      return userMockApi.getUserDetail(userId)
    }
    return realUserApi.getUserInfo()
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
  }) {
    if (shouldUseMock()) {
      return userMockApi.createUser(userData)
    }
    // 真实 API 需要使用注册接口
    return { success: false, message: '请使用注册接口创建用户' }
  },

  /**
   * 更新用户
   */
  async updateUser(userId: number, updates: {
    username?: string
    email?: string
    phone?: string
    avatar?: string
    role?: string
  }) {
    if (shouldUseMock()) {
      return userMockApi.updateUser(userId, updates)
    }
    return realUserApi.updateProfile(updates)
  },

  /**
   * 删除用户
   */
  async deleteUser(userId: number) {
    if (shouldUseMock()) {
      return userMockApi.deleteUser(userId)
    }
    return adminApi.deleteUser(userId)
  },

  /**
   * 批量删除用户
   */
  async batchDeleteUsers(userIds: number[]) {
    if (shouldUseMock()) {
      return userMockApi.batchDeleteUsers(userIds)
    }
    // 真实 API 需要循环调用删除接口
    return { success: false, message: '批量删除功能需要单独实现' }
  },

  /**
   * 封禁/解封用户
   */
  async toggleUserStatus(userId: number, action: 'ban' | 'unban') {
    if (shouldUseMock()) {
      return userMockApi.toggleUserStatus(userId, action)
    }
    return adminApi.manageUser(userId, { action })
  },

  /**
   * 重置用户密码
   */
  async resetUserPassword(userId: number) {
    if (shouldUseMock()) {
      return userMockApi.resetUserPassword(userId)
    }
    return { success: false, message: '请使用忘记密码功能' }
  },

  // ========== 管理员管理 ==========

  /**
   * 获取管理员列表
   */
  async getAdminList(params?: { page?: number; size?: number; role?: string }) {
    if (shouldUseMock()) {
      return userMockApi.getAdminList(params)
    }
    return adminApi.getUserList(params)
  },

  /**
   * 创建管理员
   */
  async createAdmin(adminData: {
    account: string
    username: string
    phone: string
    email?: string
    role?: 'ADMIN' | 'SUPER_ADMIN'
  }) {
    if (shouldUseMock()) {
      return userMockApi.createAdmin(adminData)
    }
    return adminApi.createAdmin(adminData)
  },

  /**
   * 降级管理员
   */
  async demoteAdmin(adminId: number) {
    if (shouldUseMock()) {
      return userMockApi.demoteAdmin(adminId)
    }
    return adminApi.demoteAdmin(adminId)
  },

  /**
   * 批量降级管理员
   */
  async batchDemoteAdmins(adminIds: number[]) {
    if (shouldUseMock()) {
      return userMockApi.batchDemoteAdmins(adminIds)
    }
    return adminApi.batchDemoteAdmins(adminIds)
  },

  // ========== 已注销用户 ==========

  /**
   * 获取已注销用户列表
   */
  async getDeletedUsersList(params?: { page?: number; size?: number }) {
    if (shouldUseMock()) {
      return userMockApi.getDeletedUsersList(params)
    }
    return { success: false, message: '功能开发中' }
  },

  // ========== 统计数据 ==========

  /**
   * 获取用户统计
   */
  async getUserStats() {
    if (shouldUseMock()) {
      return userMockApi.getUserStats()
    }
    return realUserApi.getUserStats()
  },

  // ========== 当前用户相关 ==========

  /**
   * 获取当前用户信息
   */
  async getUserInfo() {
    if (shouldUseMock()) {
      return userMockApi.getUserInfo?.() || Promise.resolve({ success: true, data: null })
    }
    return realUserApi.getUserInfo()
  },

  /**
   * 获取用户活动列表
   */
  async getUserActivities(params?: { limit?: number; page?: number }) {
    if (shouldUseMock()) {
      return userMockApi.getUserActivities?.(params) || Promise.resolve({ success: true, data: [] })
    }
    return realUserApi.getRecentActivities(params)
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
  }) {
    if (shouldUseMock()) {
      return userMockApi.updateProfile?.(profileData) || Promise.resolve({ success: true, data: null })
    }
    return realUserApi.updateProfile(profileData)
  },

  /**
   * 上传头像
   */
  async uploadAvatar(file: File) {
    if (shouldUseMock()) {
      return userMockApi.uploadAvatar?.(file) || Promise.resolve({ success: true, data: { avatar_url: '' } })
    }
    return realUserApi.uploadAvatar(file)
  }
}

export default userAdapter
