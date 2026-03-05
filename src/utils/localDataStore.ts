/**
 * 本地数据存储管理器
 * 用于替代后端 API，在前端存储用户数据
 */

import type { UserInfo, UserRole, LoginRequest, RegisterRequest } from '@/types/auth'
import { mockAllUsers } from '@/mock/userMockData'

interface StoredUser {
  id: string
  account: string
  password: string
  username: string
  phone: string
  email: string
  role: UserRole
  avatar: string
  created_at: string
  updated_at: string
  status: string
}

const STORAGE_KEY = 'app_users'
const MOCK_USERS_INITIALIZED_KEY = 'app_mock_users_initialized'

/**
 * 获取所有用户
 */
function getAllUsers(): StoredUser[] {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

/**
 * 保存所有用户
 */
function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

/**
 * 初始化所有用户数据（包括 Mock 数据中的用户和管理员）
 * 这样用户和管理员就可以使用同一个登录接口
 */
export function initializeDefaultAdmin(): void {
  const initialized = localStorage.getItem(MOCK_USERS_INITIALIZED_KEY)
  if (initialized) return

  const users = getAllUsers()

  // 如果已有用户数据，不再重复初始化
  if (users.length > 0) {
    localStorage.setItem(MOCK_USERS_INITIALIZED_KEY, 'true')
    return
  }

  // 将 mockAllUsers 转换为 StoredUser 格式并存储
  // 默认密码统一为 123456（开发环境）
  const defaultPassword = '123456'

  const mockUsersStored: StoredUser[] = mockAllUsers.map(user => ({
    id: user.id.toString(),
    account: user.account,
    password: defaultPassword,
    username: user.username,
    phone: user.phone,
    email: user.email || '',
    role: user.role,
    avatar: user.avatar || '',
    created_at: user.created_at,
    updated_at: user.updated_at,
    status: user.status || 'active'
  }))

  // 保存所有用户到 localStorage
  saveUsers(mockUsersStored)
  localStorage.setItem(MOCK_USERS_INITIALIZED_KEY, 'true')

  console.log(`[LocalDataStore] 已初始化 ${mockUsersStored.length} 个用户（包括用户和管理员）`)
}

/**
 * 用户登录验证
 */
export function loginUser(credentials: LoginRequest): { success: boolean; user?: UserInfo; message?: string } {
  const users = getAllUsers()
  const user = users.find(u => u.account === credentials.account && u.password === credentials.password)

  if (!user) {
    return {
      success: false,
      message: '账号或密码错误'
    }
  }

  // 转换为 UserInfo 格式
  // 注意：id 需要转换为 number 类型以匹配 Mock 数据
  const userInfo: UserInfo = {
    id: parseInt(user.id, 10),
    account: user.account,
    username: user.username,
    role: user.role,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    nickname: user.username,
    created_at: user.created_at,
    updated_at: user.updated_at,
    status: user.status,
    all_roles: [user.role],
    name: user.username,
    head_pic: user.avatar,
    profile_image: user.avatar
  }

  return {
    success: true,
    user: userInfo
  }
}

/**
 * 用户注册
 */
export function registerUser(userData: RegisterRequest): { success: boolean; user?: UserInfo; message?: string } {
  const users = getAllUsers()

  // 检查账号是否已存在
  if (users.some(u => u.account === userData.username || u.phone === userData.phone)) {
    return {
      success: false,
      message: '账号或手机号已存在'
    }
  }

  // 创建新用户
  const newUser: StoredUser = {
    id: Date.now().toString(),
    account: userData.username,
    password: userData.password,
    username: userData.username,
    phone: userData.phone,
    email: userData.email || '',
    role: userData.role === 'organization' ? 'USER' : 'USER', // 都作为普通用户
    avatar: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'active'
  }

  users.push(newUser)
  saveUsers(users)

  const userInfo: UserInfo = {
    id: parseInt(newUser.id, 10),
    account: newUser.account,
    username: newUser.username,
    role: newUser.role,
    email: newUser.email,
    phone: newUser.phone,
    avatar: newUser.avatar,
    nickname: newUser.username,
    created_at: newUser.created_at,
    updated_at: newUser.updated_at,
    status: newUser.status,
    all_roles: [newUser.role],
    name: newUser.username,
    head_pic: newUser.avatar,
    profile_image: newUser.avatar
  }

  return {
    success: true,
    user: userInfo
  }
}

/**
 * 获取所有用户列表（管理员功能）
 */
export function getAllUserList(): UserInfo[] {
  const users = getAllUsers()
  return users.map(u => ({
    id: parseInt(u.id, 10),
    account: u.account,
    username: u.username,
    role: u.role,
    email: u.email,
    phone: u.phone,
    avatar: u.avatar,
    nickname: u.username,
    created_at: u.created_at,
    updated_at: u.updated_at,
    status: u.status,
    all_roles: [u.role],
    name: u.username,
    head_pic: u.avatar,
    profile_image: u.avatar
  }))
}

// 初始化时创建默认管理员
if (typeof window !== 'undefined') {
  initializeDefaultAdmin()
}

export default {
  initializeDefaultAdmin,
  loginUser,
  registerUser,
  getAllUserList
}
