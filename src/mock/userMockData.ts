/**
 * 用户管理模块虚拟数据
 * 基于后端用户数据模型生成
 */

import type { UserInfo } from '@/types/auth'

// ============== 普通用户数据 ==============

export const mockUsers: UserInfo[] = [
  {
    id: 101,
    account: 'user001',
    username: '张三',
    role: 'USER',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    nickname: '张三',
    created_at: '2024-01-15T08:30:00',
    updated_at: '2024-03-10T14:20:00',
    status: 'active',
    all_roles: ['USER'],
    name: '张三',
    head_pic: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    profile_image: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  },
  {
    id: 102,
    account: 'user002',
    username: '李四',
    role: 'USER',
    email: 'lisi@example.com',
    phone: '13800138002',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    nickname: '李四',
    created_at: '2024-01-20T10:15:00',
    updated_at: '2024-03-12T09:45:00',
    status: 'active',
    all_roles: ['USER'],
    name: '李四',
    head_pic: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    profile_image: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  },
  {
    id: 103,
    account: 'wangwu',
    username: '王五',
    role: 'USER',
    email: 'wangwu@example.com',
    phone: '13800138003',
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    nickname: '王五',
    created_at: '2024-02-01T14:20:00',
    updated_at: '2024-03-08T16:30:00',
    status: 'active',
    all_roles: ['USER'],
    name: '王五',
    head_pic: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    profile_image: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
  },
  {
    id: 104,
    account: 'zhaoliu',
    username: '赵六',
    role: 'USER',
    email: 'zhaoliu@example.com',
    phone: '13800138004',
    avatar: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.png',
    nickname: '赵六',
    created_at: '2024-02-10T09:00:00',
    updated_at: '2024-03-15T11:20:00',
    status: 'active',
    all_roles: ['USER'],
    name: '赵六',
    head_pic: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.png',
    profile_image: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.png'
  },
  {
    id: 105,
    account: 'sunqi',
    username: '孙七',
    role: 'USER',
    email: 'sunqi@example.com',
    phone: '13800138005',
    avatar: 'https://cube.elemecdn.com/9/5a/d74261bed5bef6c0f0a8eb85c0f9jpeg.png',
    nickname: '孙七',
    created_at: '2024-02-15T11:30:00',
    updated_at: '2024-03-11T13:40:00',
    status: 'active',
    all_roles: ['USER'],
    name: '孙七',
    head_pic: 'https://cube.elemecdn.com/9/5a/d74261bed5bef6c0f0a8eb85c0f9jpeg.png',
    profile_image: 'https://cube.elemecdn.com/9/5a/d74261bed5bef6c0f0a8eb85c0f9jpeg.png'
  },
  {
    id: 106,
    account: 'zhouba',
    username: '周八',
    role: 'USER',
    email: 'zhouba@example.com',
    phone: '13800138006',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    nickname: '周八',
    created_at: '2024-02-20T15:45:00',
    updated_at: '2024-03-09T10:10:00',
    status: 'active',
    all_roles: ['USER'],
    name: '周八',
    head_pic: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    profile_image: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  },
  {
    id: 107,
    account: 'wujiu',
    username: '吴九',
    role: 'USER',
    email: 'wujiu@example.com',
    phone: '13800138007',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    nickname: '吴九',
    created_at: '2024-02-25T16:20:00',
    updated_at: '2024-03-14T12:30:00',
    status: 'active',
    all_roles: ['USER'],
    name: '吴九',
    head_pic: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    profile_image: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  },
  {
    id: 108,
    account: 'zhengshi',
    username: '郑十',
    role: 'USER',
    email: 'zhengshi@example.com',
    phone: '13800138008',
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    nickname: '郑十',
    created_at: '2024-03-01T08:50:00',
    updated_at: '2024-03-16T15:00:00',
    status: 'active',
    all_roles: ['USER'],
    name: '郑十',
    head_pic: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    profile_image: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
  }
]

// ============== 组织用户数据 ==============

export const mockOrgUsers: UserInfo[] = [
  {
    id: 201,
    account: 'org001',
    username: '环保志愿者协会',
    role: 'ORG_USER',
    email: 'org001@example.com',
    phone: '13900139001',
    avatar: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.png',
    nickname: '环保志愿者协会',
    created_at: '2024-01-10T09:00:00',
    updated_at: '2024-03-12T10:30:00',
    status: 'active',
    all_roles: ['ORG_USER'],
    name: '环保志愿者协会',
    head_pic: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.png',
    profile_image: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.png'
  },
  {
    id: 202,
    account: 'org002',
    username: '钓鱼俱乐部',
    role: 'ORG_USER',
    email: 'org002@example.com',
    phone: '13900139002',
    avatar: 'https://cube.elemecdn.com/9/5a/d74261bed5bef6c0f0a8eb85c0f9jpeg.png',
    nickname: '钓鱼俱乐部',
    created_at: '2024-01-12T14:20:00',
    updated_at: '2024-03-11T16:45:00',
    status: 'active',
    all_roles: ['ORG_USER'],
    name: '钓鱼俱乐部',
    head_pic: 'https://cube.elemecdn.com/9/5a/d74261bed5bef6c0f0a8eb85c0f9jpeg.png',
    profile_image: 'https://cube.elemecdn.com/9/5a/d74261bed5bef6c0f0a8eb85c0f9jpeg.png'
  },
  {
    id: 203,
    account: 'org003',
    username: '生态保护基金会',
    role: 'ORG_USER',
    email: 'org003@example.com',
    phone: '13900139003',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    nickname: '生态保护基金会',
    created_at: '2024-01-18T11:00:00',
    updated_at: '2024-03-13T09:15:00',
    status: 'active',
    all_roles: ['ORG_USER'],
    name: '生态保护基金会',
    head_pic: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    profile_image: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  },
  {
    id: 204,
    account: 'org004',
    username: '自然摄影协会',
    role: 'ORG_USER',
    email: 'org004@example.com',
    phone: '13900139004',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    nickname: '自然摄影协会',
    created_at: '2024-01-25T15:30:00',
    updated_at: '2024-03-10T14:20:00',
    status: 'active',
    all_roles: ['ORG_USER'],
    name: '自然摄影协会',
    head_pic: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    profile_image: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  }
]

// ============== 管理员用户（存在 User 表中的用户）==================
// 管理员也是用户，必须存在于 User 表中
// Admin 模型通过 user_id 关联到这些用户

export const mockAdminUsers: UserInfo[] = [
  {
    id: 301,
    account: 'admin',
    username: '系统管理员',
    role: 'SUPER_ADMIN',
    email: 'admin@example.com',
    phone: '13800138000',
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    nickname: '系统管理员',
    created_at: '2024-01-01T08:00:00',
    updated_at: '2024-03-15T09:00:00',
    status: 'active',
    all_roles: ['SUPER_ADMIN'],
    name: '系统管理员',
    head_pic: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    profile_image: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
  },
  {
    id: 302,
    account: 'admin002',
    username: '内容审核员',
    role: 'ADMIN',
    email: 'admin002@example.com',
    phone: '13600136002',
    avatar: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.png',
    nickname: '内容审核员',
    created_at: '2024-01-05T10:00:00',
    updated_at: '2024-03-14T11:30:00',
    status: 'active',
    all_roles: ['ADMIN'],
    name: '内容审核员',
    head_pic: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.png',
    profile_image: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.png'
  },
  {
    id: 303,
    account: 'admin003',
    username: '用户管理员',
    role: 'ADMIN',
    email: 'admin003@example.com',
    phone: '13600136003',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    nickname: '用户管理员',
    created_at: '2024-01-08T13:20:00',
    updated_at: '2024-03-13T15:45:00',
    status: 'active',
    all_roles: ['ADMIN'],
    name: '用户管理员',
    head_pic: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    profile_image: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  }
]

// ============== 管理员数据（Admin 模型 - 附属表）==================
// Admin 模型是 User 表的附属表，只包含：id, user_id, created_at, updated_at
// 所有其他字段（role, account, username, phone, email, avatar）通过关联的 User 对象获取
//
// 后端模型定义：
// - Admin.id: 管理员记录ID（主键，自增）
// - Admin.user_id: 关联的用户ID（外键，指向 User 表）
// - Admin.created_at: 管理员创建时间
// - Admin.updated_at: 管理员信息更新时间
// - Admin.role: 通过 @property 从 User.role 获取
// - Admin.account: 通过 @property 从 User.account 获取
// - Admin.username: 通过 @property 从 User.username 获取
// - Admin.phone: 通过 @property 从 User.phone 获取
// - Admin.email: 通过 @property 从 User.email 获取
// - Admin.avatar: 通过 @property 从 User.avatar 获取

/**
 * Admin 模型（附属表）
 * 只包含管理信息字段，登录凭证通过关联的 User 对象获取
 */
export interface AdminModel {
  id: number
  user_id: number  // 关联的用户ID（外键，指向 User 表）
  created_at: string
  updated_at: string
}

// Admin 表的数据：id 是独立的主键，user_id 指向 User 表中的用户 ID
export const mockAdminModels: AdminModel[] = [
  {
    id: 1,      // Admin 记录 ID（主键，自增）
    user_id: 301,  // 关联到 mockAdminUsers 中的系统管理员（User 表中的 ID）
    created_at: '2024-01-01T08:00:00',
    updated_at: '2024-03-15T09:00:00'
  },
  {
    id: 2,      // Admin 记录 ID（主键，自增）
    user_id: 302,  // 关联到 mockAdminUsers 中的内容审核员（User 表中的 ID）
    created_at: '2024-01-05T10:00:00',
    updated_at: '2024-03-14T11:30:00'
  },
  {
    id: 3,      // Admin 记录 ID（主键，自增）
    user_id: 303,  // 关联到 mockAdminUsers 中的用户管理员（User 表中的 ID）
    created_at: '2024-01-08T13:20:00',
    updated_at: '2024-03-13T15:45:00'
  }
]

// 兼容性：保留原有的 mockAdmins 引用，指向实际的管理员用户
export const mockAdmins: UserInfo[] = mockAdminUsers

/**
 * 从 Admin 模型和关联的 User 对象生成完整的 UserInfo
 * 模拟后端的 @property 装饰器方法
 *
 * 后端模型通过 @property 装饰器获取 User 表字段：
 * - admin.role => admin.user.role
 * - admin.account => admin.user.account
 * - admin.username => admin.user.username
 * - admin.phone => admin.user.phone
 * - admin.email => admin.user.email
 * - admin.avatar => admin.user.avatar
 */
export function getAdminUserInfo(adminModel: AdminModel, users: UserInfo[]): UserInfo | undefined {
  const user = users.find(u => u.id === adminModel.user_id)
  if (!user) return undefined

  // role 从 User 对象获取（后端：return self.user.role if self.user else None）
  return {
    ...user,
    // Admin 特有字段
    admin_id: adminModel.id,  // Admin 记录 ID
    user_id: adminModel.user_id,  // 关联的用户 ID（外键）
    // role 从 User 对象获取，不覆盖
    created_at: adminModel.created_at,
    updated_at: adminModel.updated_at
  }
}

// ============== 测试用户数据 ==============

export const mockTestUsers: UserInfo[] = [
  {
    id: 1,
    account: 'admin',
    username: '系统管理员',
    role: 'SUPER_ADMIN',
    email: 'admin@example.com',
    phone: '13800138000',
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    nickname: '系统管理员',
    created_at: '2024-01-01T00:00:00',
    updated_at: '2024-03-15T00:00:00',
    status: 'active',
    all_roles: ['SUPER_ADMIN'],
    name: '系统管理员',
    head_pic: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    profile_image: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
  },
  {
    id: 2,
    account: 'test',
    username: '测试用户',
    role: 'USER',
    email: 'test@example.com',
    phone: '13800138999',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    nickname: '测试用户',
    created_at: '2024-01-01T00:00:00',
    updated_at: '2024-03-15T00:00:00',
    status: 'active',
    all_roles: ['USER'],
    name: '测试用户',
    head_pic: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    profile_image: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  }
]

// ============== 所有用户合并列表 ==============

export const mockAllUsers: UserInfo[] = [
  ...mockTestUsers,
  ...mockUsers,
  ...mockOrgUsers,
  ...mockAdminUsers  // 管理员用户也必须包含在用户表中
]

// ============== 已注销用户记录数据 ==============

export interface DeletedUserRecord {
  id: number
  original_user_id: number
  original_account: string
  original_phone: string
  delete_time: string
}

export const mockDeletedUsers: DeletedUserRecord[] = [
  {
    id: 1,
    original_user_id: 999,
    original_account: 'olduser001',
    original_phone: '13700137001',
    delete_time: '2024-02-01T10:30:00'
  },
  {
    id: 2,
    original_user_id: 998,
    original_account: 'oldorg001',
    original_phone: '13700137002',
    delete_time: '2024-02-15T14:20:00'
  }
]

// ============== 辅助函数 ==============

/**
 * 根据用户ID获取用户信息
 */
export function getUserById(id: number): UserInfo | undefined {
  return mockAllUsers.find((user) => user.id === id)
}

/**
 * 根据账号获取用户信息
 */
export function getUserByAccount(account: string): UserInfo | undefined {
  return mockAllUsers.find((user) => user.account === account)
}

/**
 * 根据角色获取用户列表
 */
export function getUsersByRole(role: string): UserInfo[] {
  return mockAllUsers.filter((user) => user.role === role)
}

/**
 * 根据 Admin ID 获取 Admin 模型
 */
export function getAdminModelById(adminId: number): AdminModel | undefined {
  return mockAdminModels.find((admin) => admin.id === adminId)
}

/**
 * 根据 User ID 获取关联的 Admin 模型
 */
export function getAdminModelByUserId(userId: number): AdminModel | undefined {
  return mockAdminModels.find((admin) => admin.user_id === userId)
}

/**
 * 获取所有管理员用户（直接从 mockAdminUsers 获取）
 */
export function getAdminUsers(): UserInfo[] {
  return mockAdminUsers
}

/**
 * 搜索用户（按用户名或账号）
 */
export function searchUsers(keyword: string): UserInfo[] {
  const lowerKeyword = keyword.toLowerCase()
  return mockAllUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(lowerKeyword) ||
      user.account.toLowerCase().includes(lowerKeyword) ||
      user.phone.includes(keyword)
  )
}

/**
 * 获取用户统计信息
 */
export function getUserStats() {
  const activeUsers = mockAllUsers.filter(u => u.status === 'active')
  const bannedUsers = mockAllUsers.filter(u => u.status === 'banned')

  return {
    total_users: mockAllUsers.length,
    normal_users: mockUsers.length + mockTestUsers.length, // 包含测试用户
    org_users: mockOrgUsers.length,
    admins: mockAdmins.length,
    deleted_users: mockDeletedUsers.length,
    active_users: activeUsers.length,
    banned_users: bannedUsers.length
  }
}

/**
 * 获取单个用户的统计信息
 * @param userId 用户ID（支持 number 或 string 类型）
 * @returns 用户统计数据
 *
 * 注意：此函数从实际的 mock 数据中统计，包括：
 * - 活动预约数：从 activityMockData 的 getBookingsByUserId 获取
 * - 评论数：从 forumMockData 的楼层和回复数据统计
 * - 收藏数：暂为 0（系统暂无收藏功能）
 *
 * 此函数是异步的，使用动态 import 避免 Vite 环境下的 require 错误
 */
export async function getUserIndividualStats(userId: number | string): Promise<{
  activity_count: number
  comment_count: number
  favorite_count: number
}> {
  // 将 userId 统一转换为 number 类型（因为 Mock 数据中的 user_id 都是 number）
  const userIdNum = typeof userId === 'number' ? userId : parseInt(userId, 10)

  console.log('[DEBUG getUserIndividualStats] 开始计算用户统计，原始userId:', userId, 'type:', typeof userId, '转换后:', userIdNum)

  try {
    // 使用动态导入避免循环依赖（Vite 环境不支持 require）
    console.log('[DEBUG getUserIndividualStats] 正在导入 activityMockData...')
    const activityModule = await import('./activityMockData')
    console.log('[DEBUG getUserIndividualStats] activityMockData 导入成功，getBookingsByUserId:', typeof activityModule.getBookingsByUserId)

    const bookings = activityModule.getBookingsByUserId ? activityModule.getBookingsByUserId(userIdNum) : []
    console.log('[DEBUG getUserIndividualStats] 预约记录:', bookings)

    const activity_count = bookings.filter((b: any) => b.status === 'confirmed' || b.status === 'attended').length
    console.log('[DEBUG getUserIndividualStats] 有效预约数 (confirmed/attended):', activity_count)

    // 动态导入论坛数据
    console.log('[DEBUG getUserIndividualStats] 正在导入 forumMockData...')
    const forumModule = await import('./forumMockData')
    const staticForumFloors = forumModule.mockForumFloors || []
    const staticForumReplies = forumModule.mockForumReplies || []

    // 尝试从 localStorage 读取动态数据（如果有的话）
    let dynamicForumFloors: any[] = []
    let dynamicForumReplies: any[] = []

    if (typeof window !== 'undefined') {
      try {
        const storedFloors = localStorage.getItem('mock_data_forum_floors')
        const storedReplies = localStorage.getItem('mock_data_forum_replies')

        if (storedFloors) {
          dynamicForumFloors = JSON.parse(storedFloors)
          console.log('[DEBUG getUserIndividualStats] 从 localStorage 读取到动态楼层数据，数量:', dynamicForumFloors.length)
          console.log('[DEBUG getUserIndividualStats] 动态楼层数据详情:', dynamicForumFloors)
        } else {
          console.log('[DEBUG getUserIndividualStats] localStorage 中没有楼层数据')
        }

        if (storedReplies) {
          dynamicForumReplies = JSON.parse(storedReplies)
          console.log('[DEBUG getUserIndividualStats] 从 localStorage 读取到动态回复数据，数量:', dynamicForumReplies.length)
          console.log('[DEBUG getUserIndividualStats] 动态回复数据详情:', dynamicForumReplies)
        } else {
          console.log('[DEBUG getUserIndividualStats] localStorage 中没有回复数据')
        }
      } catch (error) {
        console.warn('[DEBUG getUserIndividualStats] 读取 localStorage 论坛数据失败:', error)
      }
    }

    // 合并静态数据和动态数据（去重）
    const allFloors = [...staticForumFloors]
    const allReplies = [...staticForumReplies]

    // 添加动态数据（排除已存在于静态数据的ID）
    dynamicForumFloors.forEach((floor: any) => {
      if (!allFloors.some((f: any) => f.id === floor.id)) {
        allFloors.push(floor)
      }
    })

    dynamicForumReplies.forEach((reply: any) => {
      if (!allReplies.some((r: any) => r.id === reply.id)) {
        allReplies.push(reply)
      }
    })

    // 统计评论数（论坛楼层 + 回复）- 使用转换后的 userIdNum
    // 注意：需要同时比较 number 和 string 类型，因为 localStorage 中的数据类型可能不一致
    const floorCount = allFloors.filter((f: any) => {
      const authorId = f.author_user_id
      // 支持 number 和 string 类型的比较
      return authorId === userIdNum || authorId === String(userIdNum) || (typeof authorId === 'string' && parseInt(authorId, 10) === userIdNum)
    }).length
    const replyCount = allReplies.filter((r: any) => {
      const authorId = r.author_user_id
      // 支持 number 和 string 类型的比较
      return authorId === userIdNum || authorId === String(userIdNum) || (typeof authorId === 'string' && parseInt(authorId, 10) === userIdNum)
    }).length
    const comment_count = floorCount + replyCount

    console.log('[DEBUG getUserIndividualStats] 楼层数:', floorCount, '回复数:', replyCount, '总评论数:', comment_count)

    // 收藏数暂时设为 0（系统暂无收藏功能）
    const favorite_count = 0

    console.log('[DEBUG getUserIndividualStats] 最终统计 - 用户ID:', userIdNum, '活动数:', activity_count, '评论数:', comment_count, '楼层:', floorCount, '回复:', replyCount)

    return {
      activity_count,
      comment_count,
      favorite_count
    }
  } catch (error) {
    // 如果模块未加载，返回默认值
    console.error('[DEBUG getUserIndividualStats] 无法加载相关模块，返回默认值', error)
    const seed = userIdNum % 100
    return {
      activity_count: (seed % 20) + 5,      // 5-25 个活动
      comment_count: (seed % 50) + 10,      // 10-60 条评论
      favorite_count: (seed % 30) + 5       // 5-35 个收藏
    }
  }
}

/**
 * 获取单个用户的统计信息（同步版本，仅用于兼容性）
 * @deprecated 请使用异步版本 getUserIndividualStats
 */
export function getUserIndividualStatsSync(userId: number | string): {
  activity_count: number
  comment_count: number
  favorite_count: number
} {
  // 将 userId 统一转换为 number 类型
  const userIdNum = typeof userId === 'number' ? userId : parseInt(userId, 10)

  // 同步版本直接返回默认值，避免在 Vite 环境下使用 require
  const seed = userIdNum % 100
  return {
    activity_count: (seed % 20) + 5,
    comment_count: (seed % 50) + 10,
    favorite_count: (seed % 30) + 5
  }
}

// ============== 导出所有数据 ==============

export const mockUserData = {
  users: mockUsers,
  orgUsers: mockOrgUsers,
  adminUsers: mockAdminUsers,  // 管理员用户（在 User 表中）
  admins: mockAdmins,  // 兼容性字段，指向 mockAdminUsers
  adminModels: mockAdminModels,  // 精简的 Admin 模型
  allUsers: mockAllUsers,
  deletedUsers: mockDeletedUsers
}

/**
 * 初始化 Mock 用户数据到 localStorage
 * 使这些用户账号可以用于登录验证
 *
 * 注意：Admin 模型重构后，登录凭证存储在 User 表中
 * Admin 表只包含：id, user_id, role, created_at, updated_at
 */
export function initializeMockUsersForLogin(): void {
  // 仅在开发环境初始化
  if (!import.meta.env.DEV) {
    return
  }

  const STORAGE_KEY = 'app_users'
  const INIT_KEY = 'mock_users_initialized'
  const ADMIN_MODELS_KEY = 'app_admin_models'

  // 检查是否已经初始化过
  if (localStorage.getItem(INIT_KEY)) {
    return
  }

  // 获取现有的用户数据
  const existingUsers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')

  // Mock 用户密码映射（统一密码，方便测试）
  const mockPasswords: Record<string, string> = {
    // 普通用户密码：123456
    '101': '123456', '102': '123456', '103': '123456', '104': '123456',
    '105': '123456', '106': '123456', '107': '123456', '108': '123456',
    // 组织用户密码：123456
    '201': '123456', '202': '123456', '203': '123456', '204': '123456',
    // 管理员密码：admin123
    '301': 'admin123', '302': 'admin123', '303': 'admin123',
    // 测试用户密码：123456
    '1': '123456', '2': '123456'
  }

  // 转换 Mock 用户为 localStorage 格式
  const mockUsersForStorage = mockAllUsers.map(user => ({
    id: String(user.id),
    account: user.account,
    password: mockPasswords[String(user.id)] || '123456',
    username: user.username,
    phone: user.phone,
    email: user.email,
    role: user.role,
    avatar: user.avatar || '',
    created_at: user.created_at,
    updated_at: user.updated_at,
    status: user.status || 'active',
    // 管理员特有字段
    user_id: user.user_id ? String(user.user_id) : undefined
  }))

  // 合并现有用户和 Mock 用户（去重）
  const existingAccounts = new Set(existingUsers.map((u: any) => u.account))
  const newUsers = mockUsersForStorage.filter((u: any) => !existingAccounts.has(u.account))

  const allUsers = [...existingUsers, ...newUsers]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allUsers))

  // 保存 Admin 模型数据（精简版）
  localStorage.setItem(ADMIN_MODELS_KEY, JSON.stringify(mockAdminModels))

  // 标记已初始化
  localStorage.setItem(INIT_KEY, 'true')

  // 输出登录账号信息到控制台
  console.log(
    '%c[Mock] 测试账号已初始化（Admin 模型已重构）',
    'color: #409eff; font-weight: bold; font-size: 14px;'
  )
  console.log(
    '%c测试账号 (密码: 123456)',
    'color: #909399; font-weight: bold;'
  )
  console.table(
    mockTestUsers.map(u => ({
      账号: u.account,
      用户名: u.username,
      密码: '123456'
    }))
  )
  console.log(
    '%c普通用户 (密码: 123456)',
    'color: #67c23a; font-weight: bold;'
  )
  console.table(
    mockUsers.map(u => ({
      账号: u.account,
      用户名: u.username,
      密码: '123456'
    }))
  )
  console.log(
    '%c组织用户 (密码: 123456)',
    'color: #e6a23c; font-weight: bold;'
  )
  console.table(
    mockOrgUsers.map(u => ({
      账号: u.account,
      用户名: u.username,
      密码: '123456'
    }))
  )
  console.log(
    '%c管理员 (密码: admin123)',
    'color: #f56c6c; font-weight: bold;'
  )
  console.table(
    mockAdmins.map((u, index) => ({
      账号: u.account,
      用户名: u.username,
      密码: 'admin123',
      'Admin ID': index + 1,  // Admin 表的 ID（1-3）
      'User ID': u.id  // User 表的 ID（301-303）
    }))
  )
  console.log(
    '%c提示：上述账号均可用于登录测试',
    'color: #909399; font-size: 12px;'
  )
  console.log(
    '%cAdmin 模型说明：Admin 表只包含 id, user_id, created_at, updated_at',
    'color: #e6a23c; font-size: 12px;'
  )
  console.log(
    '%cAdmin ID ≠ User ID：Admin 表的 id 是独立主键，user_id 是外键',
    'color: #e6a23c; font-size: 12px;'
  )
}

/**
 * 重置 Mock 用户数据（开发调试用）
 */
export function resetMockUsers(): void {
  localStorage.removeItem('app_users')
  localStorage.removeItem('mock_users_initialized')
  localStorage.removeItem('app_admin_models')
  initializeMockUsersForLogin()
}

export default mockUserData
