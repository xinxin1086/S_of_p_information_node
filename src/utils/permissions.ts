/**
 * 优化的权限控制系统
 * 基于后端权限等级系统设计细粒度权限管理
 */

import type { UserRole, Permissions, FineGrainedPermission } from '@/types/auth'

// 权限等级定义（从低到高）
export const PERMISSION_LEVELS = {
  VISITOR: 0,
  USER: 100,
  ADMIN: 200,
  SUPER_ADMIN: 300
} as const

// 权限资源类型
export type PermissionResource =
  | 'user_profile'
  | 'user_management'
  | 'content_create'
  | 'content_edit'
  | 'content_delete'
  | 'content_moderate'
  | 'forum_post'
  | 'forum_reply'
  | 'forum_moderate'
  | 'activity_create'
  | 'activity_manage'
  | 'science_article'
  | 'notice_manage'
  | 'system_config'
  | 'analytics_view'
  | 'export_data'

// 权限操作类型
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'moderate'

// 权限条件类型
export interface PermissionCondition {
  userId?: number
  ownerId?: number
  timeRestriction?: {
    start?: string
    end?: string
  }
  department?: string[]
  status?: string[]
}

// 角色权限映射
export const ROLE_PERMISSIONS: Record<UserRole, {
  level: number
  resources: Partial<Record<PermissionResource, PermissionAction[]>>
  specialPermissions?: string[]
}> = {
  USER: {
    level: PERMISSION_LEVELS.USER,
    resources: {
      user_profile: ['read', 'update'],
      content_create: ['create', 'read'],
      forum_post: ['create', 'read'],
      forum_reply: ['create', 'read'],
      activity_create: ['create', 'read'],
      science_article: ['read']
    }
  },
  ADMIN: {
    level: PERMISSION_LEVELS.ADMIN,
    resources: {
      user_profile: ['read', 'update'],
      user_management: ['read'],
      content_create: ['create', 'read', 'update'],
      content_edit: ['create', 'read', 'update'],
      content_delete: ['read'],
      forum_post: ['create', 'read', 'update', 'delete'],
      forum_reply: ['create', 'read', 'update', 'delete'],
      forum_moderate: ['read', 'moderate'],
      activity_create: ['create', 'read', 'update'],
      activity_manage: ['read', 'manage'],
      science_article: ['read', 'create', 'update'],
      notice_manage: ['read', 'create'],
      analytics_view: ['read']
    }
  },
  SUPER_ADMIN: {
    level: PERMISSION_LEVELS.SUPER_ADMIN,
    resources: {
      user_profile: ['create', 'read', 'update', 'delete', 'manage'],
      user_management: ['create', 'read', 'update', 'delete', 'manage'],
      content_create: ['create', 'read', 'update', 'delete', 'manage'],
      content_edit: ['create', 'read', 'update', 'delete', 'manage'],
      content_delete: ['create', 'read', 'update', 'delete', 'manage'],
      content_moderate: ['create', 'read', 'update', 'delete', 'manage', 'moderate'],
      forum_post: ['create', 'read', 'update', 'delete', 'manage', 'moderate'],
      forum_reply: ['create', 'read', 'update', 'delete', 'manage', 'moderate'],
      forum_moderate: ['create', 'read', 'update', 'delete', 'manage', 'moderate'],
      activity_create: ['create', 'read', 'update', 'delete', 'manage'],
      activity_manage: ['create', 'read', 'update', 'delete', 'manage'],
      science_article: ['create', 'read', 'update', 'delete', 'manage'],
      notice_manage: ['create', 'read', 'update', 'delete', 'manage'],
      system_config: ['create', 'read', 'update', 'delete', 'manage'],
      analytics_view: ['read'],
      export_data: ['read', 'create']
    },
    specialPermissions: ['system_override', 'emergency_access']
  }
}

/**
 * 权限管理器类
 */
export class PermissionManager {
  private currentPermissions: Permissions | null = null
  private fineGrainedPermissions: FineGrainedPermission[] = []

  /**
   * 设置当前用户权限
   */
  setPermissions(permissions: Permissions): void {
    this.currentPermissions = permissions
  }

  /**
   * 设置细粒度权限
   */
  setFineGrainedPermissions(permissions: FineGrainedPermission[]): void {
    this.fineGrainedPermissions = permissions
  }

  /**
   * 获取当前用户角色
   */
  getCurrentRole(): UserRole | null {
    return this.currentPermissions?.current_role || null
  }

  /**
   * 获取当前用户权限等级
   */
  getCurrentLevel(): number {
    const role = this.getCurrentRole()
    return role ? ROLE_PERMISSIONS[role]?.level || 0 : 0
  }

  /**
   * 检查角色权限
   */
  hasRole(requiredRole: UserRole): boolean {
    if (!this.currentPermissions) return false

    // 超级管理员拥有所有权限
    if (this.currentPermissions.current_role === 'SUPER_ADMIN') {
      return true
    }

    return this.currentPermissions.all_roles?.includes(requiredRole) || false
  }

  /**
   * 检查基础权限等级
   */
  hasMinimumLevel(minimumLevel: number): boolean {
    return this.getCurrentLevel() >= minimumLevel
  }

  /**
   * 检查资源权限
   */
  hasResourcePermission(
    resource: PermissionResource,
    action: PermissionAction,
    condition?: PermissionCondition
  ): boolean {
    const role = this.getCurrentRole()
    if (!role) return false

    const roleConfig = ROLE_PERMISSIONS[role]
    if (!roleConfig) return false

    // 检查基础资源权限
    const allowedActions = roleConfig.resources[resource]
    if (!allowedActions || !allowedActions.includes(action)) {
      return false
    }

    // 检查细粒度权限
    if (this.fineGrainedPermissions.length > 0) {
      const finePermission = this.fineGrainedPermissions.find(
        p => p.resource === resource && p.actions.includes(action)
      )

      if (finePermission) {
        return this.evaluateConditions(finePermission.conditions, condition)
      }
    }

    // 检查条件限制
    if (condition) {
      return this.evaluateDefaultConditions(condition, action)
    }

    return true
  }

  /**
   * 检查特殊权限
   */
  hasSpecialPermission(permission: string): boolean {
    const role = this.getCurrentRole()
    if (!role) return false

    const roleConfig = ROLE_PERMISSIONS[role]
    return roleConfig?.specialPermissions?.includes(permission) || false
  }

  /**
   * 检查功能权限
   */
  hasFeaturePermission(feature: string): boolean {
    if (!this.currentPermissions) return false
    return this.currentPermissions.role_info?.permissions?.includes(feature) || false
  }

  /**
   * 评估权限条件
   */
  private evaluateConditions(
    conditions: Record<string, unknown> = {},
    context?: PermissionCondition
  ): boolean {
    if (!context) return true

    // 检查用户ID限制
    if (conditions.userId && context.userId !== conditions.userId) {
      return false
    }

    // 检查所有者限制
    if (conditions.ownerId && context.ownerId !== conditions.ownerId) {
      return false
    }

    // 检查时间限制
    if (conditions.timeRestriction) {
      const now = new Date()
      const start = conditions.timeRestriction.start ? new Date(conditions.timeRestriction.start) : null
      const end = conditions.timeRestriction.end ? new Date(conditions.timeRestriction.end) : null

      if (start && now < start) return false
      if (end && now > end) return false
    }

    // 检查部门限制
    if (conditions.department && conditions.department.length > 0) {
      if (!context.department || !conditions.department.some(d => context.department?.includes(d))) {
        return false
      }
    }

    // 检查状态限制
    if (conditions.status && conditions.status.length > 0) {
      if (!context.status || !conditions.status.includes(context.status)) {
        return false
      }
    }

    return true
  }

  /**
   * 评估默认条件
   */
  private evaluateDefaultConditions(condition: PermissionCondition, action: PermissionAction): boolean {
    // 用户只能编辑自己的资料
    if (condition.userId && condition.ownerId && action === 'update') {
      return condition.userId === condition.ownerId
    }

    return true
  }

  /**
   * 获取用户可访问的资源列表
   */
  getAccessibleResources(): PermissionResource[] {
    const role = this.getCurrentRole()
    if (!role) return []

    const roleConfig = ROLE_PERMISSIONS[role]
    if (!roleConfig) return []

    return Object.keys(roleConfig.resources) as PermissionResource[]
  }

  /**
   * 获取资源允许的操作
   */
  getResourceActions(resource: PermissionResource): PermissionAction[] {
    const role = this.getCurrentRole()
    if (!role) return []

    const roleConfig = ROLE_PERMISSIONS[role]
    if (!roleConfig) return []

    return roleConfig.resources[resource] || []
  }

  /**
   * 检查是否可以进行批量操作
   */
  canBatchOperate(
    resource: PermissionResource,
    action: PermissionAction,
    itemCount: number = 1
  ): boolean {
    // 检查基础权限
    if (!this.hasResourcePermission(resource, action)) {
      return false
    }

    // 普通用户批量操作限制
    const role = this.getCurrentRole()
    if (role === 'USER' && itemCount > 10) {
      return false
    }

    // 管理员批量操作限制
    if (role === 'ADMIN' && itemCount > 50) {
      return false
    }

    return true
  }

  /**
   * 权限装饰器工厂
   */
  static requirePermission(
    resource: PermissionResource,
    action: PermissionAction,
    condition?: PermissionCondition
  ) {
    return function (target: unknown, propertyName: string, descriptor: PropertyDescriptor) {
      const method = descriptor.value

      descriptor.value = function (...args: unknown[]) {
        const permissionManager = this.permissionManager as PermissionManager

        if (!permissionManager || !permissionManager.hasResourcePermission(resource, action, condition)) {
          throw new Error(`Insufficient permissions: ${action} ${resource}`)
        }

        return method.apply(this, args)
      }
    }
  }

  /**
   * 角色装饰器工厂
   */
  static requireRole(role: UserRole) {
    return function (target: unknown, propertyName: string, descriptor: PropertyDescriptor) {
      const method = descriptor.value

      descriptor.value = function (...args: unknown[]) {
        const permissionManager = this.permissionManager as PermissionManager

        if (!permissionManager || !permissionManager.hasRole(role)) {
          throw new Error(`Insufficient role: ${role} required`)
        }

        return method.apply(this, args)
      }
    }
  }

  /**
   * 生成权限报告
   */
  generatePermissionReport(): {
    currentRole: UserRole | null
    currentLevel: number
    accessibleResources: PermissionResource[]
    specialPermissions: string[]
    fineGrainedPermissions: FineGrainedPermission[]
    summary: {
      totalResources: number
      totalActions: number
      hasAdminRights: boolean
      hasSpecialRights: boolean
    }
  } {
    const role = this.getCurrentRole()
    const level = this.getCurrentLevel()
    const accessibleResources = this.getAccessibleResources()

    const roleConfig = role ? ROLE_PERMISSIONS[role] : null
    const specialPermissions = roleConfig?.specialPermissions || []

    let totalActions = 0
    accessibleResources.forEach(resource => {
      totalActions += this.getResourceActions(resource).length
    })

    return {
      currentRole: role,
      currentLevel: level,
      accessibleResources,
      specialPermissions,
      fineGrainedPermissions: this.fineGrainedPermissions,
      summary: {
        totalResources: accessibleResources.length,
        totalActions,
        hasAdminRights: level >= PERMISSION_LEVELS.ADMIN,
        hasSpecialRights: specialPermissions.length > 0
      }
    }
  }

  /**
   * 清除权限缓存
   */
  clearCache(): void {
    this.currentPermissions = null
    this.fineGrainedPermissions = []
  }
}

// 创建全局权限管理器实例
export const permissionManager = new PermissionManager()

// 权限检查便捷函数
export const checkPermission = (
  resource: PermissionResource,
  action: PermissionAction,
  condition?: PermissionCondition
): boolean => {
  return permissionManager.hasResourcePermission(resource, action, condition)
}

export const checkRole = (role: UserRole): boolean => {
  return permissionManager.hasRole(role)
}

export const checkLevel = (minimumLevel: number): boolean => {
  return permissionManager.hasMinimumLevel(minimumLevel)
}

export const checkFeature = (feature: string): boolean => {
  return permissionManager.hasFeaturePermission(feature)
}

export default PermissionManager