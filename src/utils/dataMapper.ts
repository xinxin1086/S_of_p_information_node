/**
 * 数据映射工具类
 * 处理新旧系统之间的数据格式转换和兼容性
 */

import type {
  UserInfo,
  Permissions,
  RoleInfo,
  UserRole,
  LegacyUserRole,
  NewUserRole
} from '@/types/auth'

/**
 * 角色映射配置
 */
const ROLE_MAPPING: Record<LegacyUserRole, NewUserRole> = {
  'user': 'USER',
  'admin': 'ADMIN',
  'super_admin': 'SUPER_ADMIN'
}

const REVERSE_ROLE_MAPPING: Record<NewUserRole, LegacyUserRole> = {
  'USER': 'user',
  'ADMIN': 'admin',
  'SUPER_ADMIN': 'super_admin'
}

/**
 * 数据映射器类
 */
export class DataMapper {
  /**
   * 角色标准化：将旧角色转换为新角色格式
   */
  static normalizeRole(role: UserRole): NewUserRole {
    if (!role) return 'USER'

    // 如果已经是标准格式，直接返回
    if (['USER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return role as NewUserRole
    }

    // 转换旧角色格式
    const lowerRole = role.toLowerCase()
    return ROLE_MAPPING[lowerRole as LegacyUserRole] || 'USER'
  }

  /**
   * 角色反标准化：将新角色转换为旧角色格式
   */
  static denormalizeRole(role: NewUserRole): LegacyUserRole {
    return REVERSE_ROLE_MAPPING[role] || 'user'
  }

  /**
   * 从多种可能的字段名中提取头像URL
   */
  static extractAvatar(userData: Record<string, unknown> | null | undefined): string {
    if (!userData) return ''
    return (userData.avatar as string) ||
           (userData.head_pic as string) ||
           (userData.profile_image as string) ||
           (userData.profileImage as string) ||
           ''
  }

  /**
   * 从多种可能的字段名中提取用户名
   */
  static extractUsername(userData: Record<string, unknown> | null | undefined): string {
    if (!userData) return '未知用户'
    return (userData.username as string) ||
           (userData.name as string) ||
           (userData.nickname as string) ||
           (userData.displayName as string) ||
           (userData.account as string) ||
           '未知用户'
  }

  /**
   * 从多种可能的字段名中提取邮箱
   */
  static extractEmail(userData: Record<string, unknown> | null | undefined): string {
    if (!userData) return ''
    return (userData.email as string) ||
           (userData.email_address as string) ||
           (userData.contact_email as string) ||
           ''
  }

  /**
   * 标准化时间字段
   */
  static normalizeTimestamp(timestamp?: string | number | Date): string | undefined {
    if (!timestamp) return undefined

    if (typeof timestamp === 'number') {
      return new Date(timestamp).toISOString()
    }

    if (typeof timestamp === 'string') {
      // 如果已经是ISO格式，直接返回
      if (timestamp.includes('T') || timestamp.includes('-')) {
        return timestamp
      }

      // 尝试解析为数字时间戳
      const numTimestamp = parseInt(timestamp)
      if (!isNaN(numTimestamp)) {
        return new Date(numTimestamp).toISOString()
      }
    }

    return timestamp
  }

  /**
   * 映射用户信息：支持多种数据格式
   */
  static mapUserInfo(rawData: Record<string, unknown>): UserInfo {
    if (!rawData) {
      throw new Error('用户信息为空')
    }

    // 处理ID字段
    const id = rawData.id || rawData.userId || rawData.user_id || 0

    // 处理账户字段
    const account = rawData.account ||
                   rawData.email ||
                   rawData.username ||
                   rawData.name ||
                   ''

    // 处理用户名
    const username = this.extractUsername(rawData)

    // 标准化角色
    const rawRole = rawData.role ||
                   (rawData.permissions?.current_role?.toLowerCase()) ||
                   'user'
    const role = this.normalizeRole(rawRole)

    // 提取其他字段
    const email = this.extractEmail(rawData)
    const phone = rawData.phone || rawData.mobile || rawData.phoneNumber || ''
    const avatar = this.extractAvatar(rawData)
    const nickname = rawData.nickname || rawData.name || ''

    // 标准化时间字段
    const created_at = this.normalizeTimestamp(
      rawData.created_at ||
      rawData.createdAt ||
      rawData.create_time ||
      rawData.createTime
    )

    const updated_at = this.normalizeTimestamp(
      rawData.updated_at ||
      rawData.updatedAt ||
      rawData.update_time ||
      rawData.updateTime
    )

    // 处理新权限系统字段
    const permissions = rawData.permissions ? this.mapPermissions(rawData.permissions) : undefined
    const role_info = rawData.role_info ? this.mapRoleInfo(rawData.role_info) : undefined
    const all_roles = Array.isArray(rawData.all_roles)
      ? rawData.all_roles.map(r => this.normalizeRole(r))
      : (rawData.current_role ? [this.normalizeRole(rawData.current_role)] : [])

    return {
      id,
      account,
      username,
      role,
      email,
      phone,
      avatar,
      nickname,
      created_at,
      updated_at,
      permissions,
      role_info,
      all_roles,
      status: rawData.status || 'active',

      // 保留原始数据中的其他字段
      ...rawData
    }
  }

  /**
   * 映射权限信息
   */
  static mapPermissions(rawData: Record<string, unknown>): Permissions {
    if (!rawData) {
      throw new Error('权限信息为空')
    }

    const current_role = this.normalizeRole(rawData.current_role || rawData.currentRole || 'USER')

    // 处理role_info，优先使用专门的role_info字段
    let role_info
    if (rawData.role_info || rawData.roleInfo) {
      role_info = this.mapRoleInfo(rawData.role_info || rawData.roleInfo)
    } else {
      // 如果没有role_info，从当前数据创建一个基本的
      role_info = {
        role_name: rawData.role_name || rawData.name || '未知角色',
        permissions: Array.isArray(rawData.permissions) ? rawData.permissions : [],
        description: rawData.description || ''
      }
    }

    const all_roles = Array.isArray(rawData.all_roles)
      ? rawData.all_roles.map(r => this.normalizeRole(r))
      : (current_role ? [current_role] : ['USER'])

    return {
      current_role,
      role_info,
      all_roles
    }
  }

  /**
   * 映射角色信息
   */
  static mapRoleInfo(rawData: Record<string, unknown>): RoleInfo {
    if (!rawData) {
      return {
        role_name: '未知角色',
        permissions: [],
        description: ''
      }
    }

    const role_name = rawData.role_name ||
                     rawData.roleName ||
                     rawData.name ||
                     '未知角色'

    const permissions = Array.isArray(rawData.permissions)
      ? rawData.permissions
      : (rawData.permission ? [rawData.permission] : [])

    const description = rawData.description || ''

    return {
      role_name,
      permissions,
      description
    }
  }

  /**
   * 处理API响应：支持多种响应格式
   */
  static processApiResponse<T>(response: unknown): T {
    // 处理标准格式 { success: true, data: ... }
    if (response && typeof response === 'object' && response !== null && 'data' in response) {
      return (response as { data: T }).data
    }

    // 处理简化格式，直接返回数据
    return response as T
  }

  /**
   * 处理登录响应：支持多种登录响应格式
   */
  static processLoginResponse(response: Record<string, unknown>): {
    user: UserInfo
    permissions?: Permissions
    token: string
    refreshToken?: string
  } {
    // 处理新的完整API格式
    if (response.access_token && response.user && response.permissions) {
      return {
        user: this.mapUserInfo(response.user),
        permissions: this.mapPermissions(response.permissions),
        token: response.access_token,
        refreshToken: response.refresh_token
      }
    }

    // 处理简化API格式
    const userInfo = response.user || response.data?.user || response.data
    const token = response.access_token || response.token || response.data?.token

    if (!userInfo || !token) {
      throw new Error('登录响应格式不正确')
    }

    return {
      user: this.mapUserInfo(userInfo),
      token: token,
      refreshToken: response.refresh_token
    }
  }

  /**
   * 验证数据完整性
   */
  static validateUserInfo(userInfo: UserInfo): boolean {
    return !!(userInfo.id && userInfo.account && userInfo.username)
  }

  static validatePermissions(permissions: Permissions): boolean {
    return !!(permissions.current_role && permissions.role_info)
  }

  /**
   * 创建默认权限配置
   */
  static createDefaultPermissions(role: NewUserRole): Permissions {
    switch (role) {
      case 'ADMIN':
        return {
          current_role: 'ADMIN',
          role_info: {
            role_name: '管理员',
            permissions: ['content', 'users', 'notifications'],
            description: '系统管理员权限'
          },
          all_roles: ['ADMIN']
        }

      case 'SUPER_ADMIN':
        return {
          current_role: 'SUPER_ADMIN',
          role_info: {
            role_name: '超级管理员',
            permissions: ['content', 'users', 'admin', 'notifications', 'system'],
            description: '超级管理员权限'
          },
          all_roles: ['SUPER_ADMIN', 'ADMIN']
        }

      default:
        return {
          current_role: 'USER',
          role_info: {
            role_name: '普通用户',
            permissions: [],
            description: '普通用户权限'
          },
          all_roles: []
        }
    }
  }

  /**
   * 合并用户信息：更新时合并新旧数据
   */
  static mergeUserInfo(existing: UserInfo, updates: Partial<UserInfo>): UserInfo {
    return {
      ...existing,
      ...updates,
      // 确保关键字段不被意外覆盖
      id: existing.id,
      account: existing.account
    }
  }

  /**
   * 比较角色权限级别
   */
  static compareRoleLevel(role1: UserRole, role2: UserRole): number {
    // 先标准化角色
    const normalizedRole1 = this.normalizeRole(role1)
    const normalizedRole2 = this.normalizeRole(role2)

    const levels: Record<NewUserRole, number> = {
      'USER': 1,
      'ADMIN': 2,
      'SUPER_ADMIN': 3
    }

    const level1 = levels[normalizedRole1] || 0
    const level2 = levels[normalizedRole2] || 0

    return level1 - level2
  }

  /**
   * 检查权限级别
   */
  static hasPermissionLevel(userRole: UserRole, requiredRole: UserRole): boolean {
    return this.compareRoleLevel(userRole, requiredRole) >= 0
  }
}

export default DataMapper