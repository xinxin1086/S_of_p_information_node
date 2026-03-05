/**
 * 扩展API接口 - 补充缺失的功能
 * 包含用户注册、Token验证、论坛功能等接口
 */

import {
  USER_AUTH_API,
  FORUM_API
} from '@/config/api'
import type {
  RegisterRequest,
  RegisterResponse,
  TokenVerifyRequest,
  TokenVerifyResponse,
  TokenRefreshRequest,
  TokenRefreshResponse,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  EmailVerifyRequest,
  EmailVerifyConfirmRequest,
  PhoneVerifyRequest,
  PhoneVerifyConfirmRequest
} from '@/types/auth'
import type {
  ForumPost,
  CreateForumPostRequest,
  UpdateForumPostRequest,
  ForumPostListParams,
  ForumPostListResponse,
  ForumFloor,
  CreateForumFloorRequest,
  ForumFloorListResponse,
  ForumReply,
  CreateForumReplyRequest,
  ForumReplyListResponse,
  ForumLikeRequest,
  ForumLikeStatusRequest,
  ForumLikeStatusResponse,
  ForumVisit,
  ForumStatistics,
  HotPostsParams,
  ForumCategoryStats,
  ForumSearchParams,
  UserForumStats,
  ForumNotification,
  ForumNotificationType,
  CreateForumReportRequest,
  HandleForumReportRequest
} from '@/types/forum'
import { request } from '@/utils/request'
import { tokenManager } from '@/utils/tokenManager'

// ========== 用户认证扩展接口 ==========

export const authExtendedApi = {
  /**
   * 用户注册
   * 接口路径: POST /api/user/auth/register
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await request.post<RegisterResponse>(USER_AUTH_API.REGISTER, userData)
      return response
    } catch (error) {
      console.error('用户注册失败:', error)
      throw error
    }
  },

  /**
   * Token验证
   * 接口路径: POST /api/user/auth/verify
   */
  async verifyToken(data: TokenVerifyRequest): Promise<TokenVerifyResponse> {
    try {
      const response = await request.post<TokenVerifyResponse>(USER_AUTH_API.VERIFY, data)
      return response
    } catch (error) {
      console.error('Token验证失败:', error)
      throw error
    }
  },

  /**
   * 刷新Token
   * 接口路径: POST /api/user/auth/refresh
   */
  async refreshToken(data: TokenRefreshRequest): Promise<TokenRefreshResponse> {
    try {
      const response = await request.post<TokenRefreshResponse>(USER_AUTH_API.REFRESH, data)
      return response
    } catch (error) {
      console.error('Token刷新失败:', error)
      throw error
    }
  },

  /**
   * 发送密码重置验证码
   * 接口路径: POST /api/user/auth/password/reset
   */
  async sendPasswordReset(data: PasswordResetRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await request.post<{ success: boolean; message: string }>(USER_AUTH_API.PASSWORD_RESET, data)
      return response
    } catch (error) {
      console.error('发送密码重置验证码失败:', error)
      throw error
    }
  },

  /**
   * 确认密码重置
   * 接口路径: POST /api/user/auth/password/reset/confirm
   */
  async confirmPasswordReset(data: PasswordResetConfirmRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await request.post<{ success: boolean; message: string }>(USER_AUTH_API.PASSWORD_RESET_CONFIRM, data)
      return response
    } catch (error) {
      console.error('密码重置失败:', error)
      throw error
    }
  },

  /**
   * 发送邮箱验证码
   * 接口路径: POST /api/user/auth/email/verify
   */
  async sendEmailVerification(data: EmailVerifyRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await request.post<{ success: boolean; message: string }>(USER_AUTH_API.EMAIL_VERIFY, data)
      return response
    } catch (error) {
      console.error('发送邮箱验证码失败:', error)
      throw error
    }
  },

  /**
   * 确认邮箱验证
   * 接口路径: POST /api/user/auth/email/verify/confirm
   */
  async confirmEmailVerification(data: EmailVerifyConfirmRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await request.post<{ success: boolean; message: string }>(USER_AUTH_API.EMAIL_VERIFY_CONFIRM, data)
      return response
    } catch (error) {
      console.error('邮箱验证失败:', error)
      throw error
    }
  },

  /**
   * 发送手机验证码
   * 接口路径: POST /api/user/auth/phone/verify
   */
  async sendPhoneVerification(data: PhoneVerifyRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await request.post<{ success: boolean; message: string }>(USER_AUTH_API.PHONE_VERIFY, data)
      return response
    } catch (error) {
      console.error('发送手机验证码失败:', error)
      throw error
    }
  },

  /**
   * 确认手机验证
   * 接口路径: POST /api/user/auth/phone/verify/confirm
   */
  async confirmPhoneVerification(data: PhoneVerifyConfirmRequest): Promise<{ success: boolean; message: string }> {
    try {
      const response = await request.post<{ success: boolean; message: string }>(USER_AUTH_API.PHONE_VERIFY_CONFIRM, data)
      return response
    } catch (error) {
      console.error('手机验证失败:', error)
      throw error
    }
  }
}

// ========== 论坛API接口 ==========

export const forumApi = {
  /**
   * 获取帖子列表
   * 接口路径: GET /api/forum/post
   */
  async getPostList(params: ForumPostListParams = {}): Promise<ForumPostListResponse> {
    try {
      const response = await request.get<ForumPostListResponse>(FORUM_API.POST, { params })
      return response
    } catch (error) {
      console.error('获取帖子列表失败:', error)
      throw error
    }
  },

  /**
   * 获取帖子详情
   * 接口路径: GET /api/forum/post/:id
   */
  async getPostDetail(postId: number): Promise<ForumPost> {
    try {
      const response = await request.get<ForumPost>(FORUM_API.POST_DETAIL(postId))
      // 如果用户已登录，记录访问
      if (tokenManager.isLoggedIn()) {
        await this.recordVisit(postId)
      }
      return response
    } catch (error) {
      console.error('获取帖子详情失败:', error)
      throw error
    }
  },

  /**
   * 创建帖子
   * 接口路径: POST /api/forum/post
   */
  async createPost(postData: CreateForumPostRequest): Promise<ForumPost> {
    try {
      const token = tokenManager.getAccessToken()
      const response = await request.post<ForumPost>(FORUM_API.POST, postData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response
    } catch (error) {
      console.error('创建帖子失败:', error)
      throw error
    }
  },

  /**
   * 更新帖子
   * 接口路径: PUT /api/forum/post/:id
   */
  async updatePost(postId: number, postData: UpdateForumPostRequest): Promise<ForumPost> {
    try {
      const token = tokenManager.getAccessToken()
      const response = await request.put<ForumPost>(FORUM_API.POST_DETAIL(postId), postData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response
    } catch (error) {
      console.error('更新帖子失败:', error)
      throw error
    }
  },

  /**
   * 删除帖子
   * 接口路径: DELETE /api/forum/post/:id
   */
  async deletePost(postId: number): Promise<{ success: boolean; message: string }> {
    try {
      const token = tokenManager.getAccessToken()
      const response = await request.delete<{ success: boolean; message: string }>(FORUM_API.POST_DETAIL(postId), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response
    } catch (error) {
      console.error('删除帖子失败:', error)
      throw error
    }
  },

  /**
   * 获取热门帖子
   * 接口路径: GET /api/forum/post/hot
   */
  async getHotPosts(params: HotPostsParams = {}): Promise<ForumPost[]> {
    try {
      const response = await request.get<ForumPost[]>(FORUM_API.POST_HOT, { params })
      return response
    } catch (error) {
      console.error('获取热门帖子失败:', error)
      throw error
    }
  },

  /**
   * 获取帖子分类
   * 接口路径: GET /api/forum/post/categories
   */
  async getCategories(): Promise<ForumCategoryStats[]> {
    try {
      const response = await request.get<ForumCategoryStats[]>(FORUM_API.POST_CATEGORIES)
      return response
    } catch (error) {
      console.error('获取帖子分类失败:', error)
      throw error
    }
  },

  /**
   * 搜索帖子
   * 接口路径: GET /api/forum/post/search
   */
  async searchPosts(params: ForumSearchParams): Promise<ForumPostListResponse> {
    try {
      const response = await request.get<ForumPostListResponse>(FORUM_API.POST_SEARCH, { params })
      return response
    } catch (error) {
      console.error('搜索帖子失败:', error)
      throw error
    }
  },

  // ========== 楼层管理 ==========

  /**
   * 获取帖子楼层列表
   * 接口路径: GET /api/forum/floor/post/:postId
   */
  async getFloorList(postId: number, params: { page?: number; page_size?: number } = {}): Promise<ForumFloorListResponse> {
    try {
      const response = await request.get<ForumFloorListResponse>(`/api/forum/floor/post/${postId}`, { params })
      return response
    } catch (error) {
      console.error('获取楼层列表失败:', error)
      throw error
    }
  },

  /**
   * 创建楼层回复
   * 接口路径: POST /api/forum/floor
   */
  async createFloor(floorData: CreateForumFloorRequest): Promise<ForumFloor> {
    try {
      const token = tokenManager.getAccessToken()
      const response = await request.post<ForumFloor>('/api/forum/floor', floorData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response
    } catch (error) {
      console.error('创建楼层失败:', error)
      throw error
    }
  },

  // ========== 回复管理 ==========

  /**
   * 获取楼层回复列表
   * 接口路径: GET /api/forum/reply/floor/:floorId
   */
  async getReplyList(floorId: number, params: { page?: number; page_size?: number } = {}): Promise<ForumReplyListResponse> {
    try {
      const response = await request.get<ForumReplyListResponse>(`/api/forum/reply/floor/${floorId}`, { params })
      return response
    } catch (error) {
      console.error('获取回复列表失败:', error)
      throw error
    }
  },

  /**
   * 创建回复
   * 接口路径: POST /api/forum/reply
   */
  async createReply(replyData: CreateForumReplyRequest): Promise<ForumReply> {
    try {
      const token = tokenManager.getAccessToken()
      const response = await request.post<ForumReply>('/api/forum/reply', replyData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response
    } catch (error) {
      console.error('创建回复失败:', error)
      throw error
    }
  },

  // ========== 点赞功能 ==========

  /**
   * 点赞/取消点赞
   * 接口路径: POST /api/forum/like
   */
  async toggleLike(likeData: ForumLikeRequest): Promise<{ success: boolean; liked: boolean; message: string }> {
    try {
      const token = tokenManager.getAccessToken()
      const response = await request.post<{ success: boolean; liked: boolean; message: string }>('/api/forum/like', likeData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response
    } catch (error) {
      console.error('点赞操作失败:', error)
      throw error
    }
  },

  /**
   * 获取点赞状态
   * 接口路径: GET /api/forum/like/status
   */
  async getLikeStatus(data: ForumLikeStatusRequest): Promise<ForumLikeStatusResponse> {
    try {
      const token = tokenManager.getAccessToken()
      const response = await request.get<ForumLikeStatusResponse>('/api/forum/like/status', {
        params: data,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response
    } catch (error) {
      console.error('获取点赞状态失败:', error)
      throw error
    }
  },

  // ========== 访问记录 ==========

  /**
   * 记录帖子访问
   * 接口路径: POST /api/forum/visit
   */
  async recordVisit(postId: number): Promise<ForumVisit> {
    try {
      const token = tokenManager.getAccessToken()
      const response = await request.post<ForumVisit>('/api/forum/visit', { post_id: postId }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response
    } catch (error) {
      console.error('记录访问失败:', error)
      throw error
    }
  },

  // ========== 统计信息 ==========

  /**
   * 获取论坛统计信息
   * 接口路径: GET /api/forum/statistics
   */
  async getStatistics(): Promise<ForumStatistics> {
    try {
      const response = await request.get<ForumStatistics>('/api/forum/statistics')
      return response
    } catch (error) {
      console.error('获取论坛统计失败:', error)
      throw error
    }
  },

  /**
   * 获取用户论坛统计
   * 接口路径: GET /api/forum/user/stats
   */
  async getUserStats(userId?: number): Promise<UserForumStats> {
    try {
      const token = tokenManager.getAccessToken()
      const url = userId ? `/api/forum/user/stats/${userId}` : '/api/forum/user/stats'
      const response = await request.get<UserForumStats>(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response
    } catch (error) {
      console.error('获取用户论坛统计失败:', error)
      throw error
    }
  },

  // ========== 通知系统 ==========

  /**
   * 获取论坛通知列表
   * 接口路径: GET /api/forum/notifications
   */
  async getNotifications(params: {
    type?: ForumNotificationType
    is_read?: boolean
    page?: number
    page_size?: number
  } = {}): Promise<{ list: ForumNotification[]; total: number; unread_count: number }> {
    try {
      const token = tokenManager.getAccessToken()
      const response = await request.get<{ list: ForumNotification[]; total: number; unread_count: number }>('/api/forum/notifications', {
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response
    } catch (error) {
      console.error('获取论坛通知失败:', error)
      throw error
    }
  },

  /**
   * 标记通知为已读
   * 接口路径: POST /api/forum/notifications/:id/read
   */
  async markNotificationAsRead(notificationId: number): Promise<{ success: boolean }> {
    try {
      const token = tokenManager.getAccessToken()
      const response = await request.post<{ success: boolean }>(`/api/forum/notifications/${notificationId}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response
    } catch (error) {
      console.error('标记通知已读失败:', error)
      throw error
    }
  },

  /**
   * 批量标记通知为已读
   * 接口路径: POST /api/forum/notifications/mark-all-read
   */
  async markAllNotificationsAsRead(): Promise<{ success: boolean; marked_count: number }> {
    try {
      const token = tokenManager.getAccessToken()
      const response = await request.post<{ success: boolean; marked_count: number }>('/api/forum/notifications/mark-all-read', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response
    } catch (error) {
      console.error('批量标记通知已读失败:', error)
      throw error
    }
  },

  // ========== 举报系统 ==========

  /**
   * 创建举报
   * 接口路径: POST /api/forum/report
   */
  async createReport(reportData: CreateForumReportRequest): Promise<{ success: boolean; message: string }> {
    try {
      const token = tokenManager.getAccessToken()
      const response = await request.post<{ success: boolean; message: string }>('/api/forum/report', reportData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response
    } catch (error) {
      console.error('创建举报失败:', error)
      throw error
    }
  }
}

// ========== 管理员论坛接口 ==========

export const forumAdminApi = {
  /**
   * 处理举报
   * 接口路径: POST /api/forum/admin/report/handle
   */
  async handleReport(reportData: HandleForumReportRequest): Promise<{ success: boolean; message: string }> {
    try {
      const token = tokenManager.getAccessToken()
      const response = await request.post<{ success: boolean; message: string }>('/api/forum/admin/report/handle', reportData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response
    } catch (error) {
      console.error('处理举报失败:', error)
      throw error
    }
  },

  /**
   * 批量操作帖子
   * 接口路径: POST /api/forum/admin/posts/batch
   */
  async batchOperatePosts(operationData: {
    action: 'delete' | 'hide' | 'pin' | 'unpin'
    post_ids: number[]
    reason?: string
  }): Promise<{ success: boolean; message: string; affected_count: number }> {
    try {
      const token = tokenManager.getAccessToken()
      const response = await request.post<{ success: boolean; message: string; affected_count: number }>('/api/forum/admin/posts/batch', operationData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response
    } catch (error) {
      console.error('批量操作帖子失败:', error)
      throw error
    }
  }
}

export default {
  authExtendedApi,
  forumApi,
  forumAdminApi
}