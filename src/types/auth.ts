// API响应和用户相关类型定义
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER'

export interface UserInfo {
  id: number
  account: string
  username: string
  role: UserRole
  email?: string
  phone?: string
  avatar?: string
  nickname?: string
  created_at?: string
  updated_at?: string
  status?: string
  permissions?: Permissions
  role_info?: RoleInfo
  all_roles?: UserRole[]
  name?: string
  head_pic?: string
  profile_image?: string
  createdAt?: string
  updatedAt?: string
}

export interface RoleInfo {
  role_name: string
  permissions: string[]
  description?: string
}

export interface Permissions {
  current_role: UserRole
  role_info: RoleInfo
  all_roles: UserRole[]
}

// API响应包装类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  code?: string
  error?: string
}


export interface AuthState {
  isAuthenticated: boolean
  user: UserInfo | null
  permissions: Permissions | null
  token: string | null
  refreshToken: string | null
}

export interface LoginRequest {
  account: string
  password: string
  role: 'admin' | 'user'
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: UserInfo
  permissions: Permissions
}

// 用户注册请求
export interface RegisterRequest {
  account: string
  username: string
  password: string
  email?: string
  phone?: string
  captcha?: string
  agreement_accepted: boolean
}

// 用户注册响应
export interface RegisterResponse {
  success: boolean
  message: string
  user?: UserInfo
  requires_verification?: boolean
  verification_method?: 'email' | 'phone'
}

// Token验证请求
export interface TokenVerifyRequest {
  token: string
}

// Token验证响应
export interface TokenVerifyResponse {
  valid: boolean
  expired: boolean
  user?: UserInfo
  permissions?: Permissions
  expires_at?: string
  error?: string
}

// Token刷新请求
export interface TokenRefreshRequest {
  refresh_token: string
}

// Token刷新响应
export interface TokenRefreshResponse {
  success: boolean
  access_token?: string
  refresh_token?: string
  expires_in?: number
  error?: string
}

// 密码重置请求
export interface PasswordResetRequest {
  account: string
  verification_method: 'email' | 'phone'
  captcha?: string
}

// 密码重置确认请求
export interface PasswordResetConfirmRequest {
  account: string
  verification_code: string
  new_password: string
  confirm_password: string
}

// 邮箱验证请求
export interface EmailVerifyRequest {
  email: string
}

// 邮箱验证确认请求
export interface EmailVerifyConfirmRequest {
  email: string
  code: string
}

// 手机验证请求
export interface PhoneVerifyRequest {
  phone: string
}

// 手机验证确认请求
export interface PhoneVerifyConfirmRequest {
  phone: string
  code: string
}

// 实际API返回的响应格式
export interface ApiLoginResponse {
  data: {
    status: string
    token: string
    user: {
      account: string
      id: number
      name: string
      role: string
    }
  }
  message: string
  success: boolean
}

export interface ApiError {
  code: string
  message: string
  details?: any
  isPermissionError?: boolean
  isNetworkError?: boolean
  isServerError?: boolean
  isValidationError?: boolean
  timestamp?: string
  context?: string
}

// 认证状态
export enum AuthStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  ERROR = 'error'
}

// 登录状态
export interface LoginState {
  status: AuthStatus
  user: UserInfo | null
  token: string | null
  error: ApiError | null
  loading: boolean
}

// 权限操作类型
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage'

// 权限资源类型
export type PermissionResource =
  | 'users'
  | 'content'
  | 'admin'
  | 'notifications'
  | 'system'
  | 'analytics'
  | 'settings'
  | 'reports'

// 细粒度权限
export interface FineGrainedPermission {
  resource: PermissionResource
  actions: PermissionAction[]
  conditions?: Record<string, any>
}

// 权限检查选项
export interface PermissionCheckOptions {
  strict?: boolean
  includeInherited?: boolean
  fallback?: boolean
}

export interface OperateRequest {
  table_name: string
  operate_type: 'add' | 'update' | 'delete' | 'query'
  kwargs: Record<string, any>
}

export interface PaginationParams {
  page: number
  page_size: number
  total?: number
}

export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// 文章相关类型
export interface Article {
  id: number
  title: string
  content: string
  author_id: number
  author_type: 'admin' | 'organization' | 'user'
  author_display: string
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
}

export interface CreateArticleData {
  title: string
  content: string
  status?: 'draft' | 'published'
}

export interface UpdateArticleData extends Partial<CreateArticleData> {
  id: number
}

// Token管理相关类型
export interface TokenInfo {
  accessToken: string
  refreshToken?: string
  tokenType?: string
  expiresIn?: number
  scope?: string
  issuedAt?: number
}

export interface TokenValidationResult {
  valid: boolean
  expired: boolean
  error?: string
  payload?: any
}

// 会话管理
export interface SessionInfo {
  id: string
  userId: number
  loginTime: Date
  lastActivity: Date
  ipAddress?: string
  userAgent?: string
  isActive: boolean
  expiresAt?: Date
}

// 密码策略
export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  preventCommonPasswords: boolean
  maxAge?: number
  historyCount?: number
}

// 登录尝试记录
export interface LoginAttempt {
  timestamp: Date
  ipAddress: string
  userAgent?: string
  success: boolean
  reason?: string
}

// 多因素认证
export interface MFAConfig {
  enabled: boolean
  method?: 'totp' | 'sms' | 'email' | 'push'
  secret?: string
  backupCodes?: string[]
  phone?: string
  email?: string
}

export interface MFAVerification {
  code: string
  method: string
  trustDevice?: boolean
}

// 审计日志
export interface AuditLog {
  id: string
  userId: number
  action: string
  resource: string
  details?: any
  ipAddress: string
  userAgent?: string
  timestamp: Date
  success: boolean
  errorMessage?: string
}

// 用户偏好设置
export interface UserPreferences {
  language: string
  theme: 'light' | 'dark' | 'auto'
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  privacy: {
    profileVisible: boolean
    showOnlineStatus: boolean
  }
}

// 设备管理
export interface DeviceInfo {
  id: string
  userId: number
  name: string
  type: 'desktop' | 'mobile' | 'tablet'
  platform: string
  browser?: string
  lastUsed: Date
  isTrusted: boolean
  createdAt: Date
}

// 安全事件
export interface SecurityEvent {
  id: string
  type: 'login_attempt' | 'password_change' | 'mfa_enabled' | 'account_locked' | 'suspicious_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: number
  details: Record<string, any>
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
  resolvedBy?: number
}