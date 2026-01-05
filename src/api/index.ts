import type { ApiResponse } from '@/composables/useApiCall'
import { request } from '@/utils/request'

// 通用参数类型
type QueryParams = Record<string, string | number | boolean | undefined>

// 通用响应数据类型（用于未知结构的响应）
export type UnknownResponse = Record<string, unknown>

// 科普文章相关类型
interface ScienceArticle {
  id: number
  title: string
  content: string
  author: string
  created_at: string
  updated_at: string
  // 其他字段...
}

// 活动相关类型
interface Activity {
  id: number
  title: string
  description: string
  start_time: string
  end_time: string
  location: string
  status: string
  // 其他字段...
}

interface BookingData {
  activity_id: number
  user_id?: number
  // 其他预订字段...
}

interface DiscussionData {
  activity_id: number
  content: string
  // 其他讨论字段...
}

interface CommentData {
  discussion_id: number
  content: string
  // 其他评论字段...
}

interface RatingData {
  activity_id: number
  rating: number
  comment?: string
  // 其他评分字段...
}

// 用户相关类型
interface UserData {
  id: number
  username: string
  email: string
  phone?: string
  avatar?: string
  // 其他用户字段...
}

// 管理员相关类型
interface AdminData {
  id: number
  username: string
  role: string
  permissions: string[]
  // 其他管理员字段...
}

// 论坛相关类型
interface PostData {
  title: string
  content: string
  category?: string
  // 其他帖子字段...
}

interface FloorData {
  post_id: number
  content: string
  // 其他楼层字段...
}

interface ReplyData {
  floor_id: number
  content: string
  // 其他回复字段...
}

interface LikeData {
  target_type: 'post' | 'floor' | 'reply'
  target_id: number
}

interface ReportData {
  target_type: 'post' | 'floor' | 'reply'
  target_id: number
  reason: string
  description?: string
}

// 批量审核数据类型
interface BatchReviewData {
  content_ids: number[]
  action: 'approve' | 'reject'
  reason?: string
}

// 用户管理操作数据类型
interface UserOperationData {
  action: 'ban' | 'unban' | 'reset_password'
  reason?: string
  new_password?: string
}

// 举报处理数据类型
interface ReportHandleData {
  report_id: number
  action: 'approve' | 'reject'
  punishment_type?: 'warning' | 'ban'
  reason?: string
}

// 批量帖子操作数据类型
interface BatchPostOperationData {
  post_ids: number[]
  action: 'delete' | 'hide' | 'pin' | 'unpin'
  reason?: string
}

// 公告相关类型
interface NoticeData {
  title: string
  content: string
  type: 'normal' | 'urgent' | 'system'
  status: 'draft' | 'published'
  is_pinned: boolean
  // 其他公告字段...
}

// 科普文章API接口
export const scienceApi = {
  // ========== 公开接口（无需认证） ==========

  // 获取科普文章列表（专用公开接口）
  getScienceList(params: QueryParams = {}): Promise<ApiResponse<ScienceArticle[]>> {
    return request.get('/api/public/science/articles', params)
  },

  // 获取科普文章详情（专用公开接口）
  getScienceDetail(articleId: number): Promise<ApiResponse<ScienceArticle>> {
    return request.get(`/api/public/science/articles/${articleId}`)
  },

  // ========== 认证接口（需要JWT Token） ==========

  // 获取科普文章详情（认证接口，返回点赞状态和详细浏览记录）
  getScienceDetailAuthenticated(articleId: number): Promise<ApiResponse<ScienceArticle>> {
    return request.get(`/api/public/science/articles/${articleId}`)
  },

  // 科普文章点赞（需要认证）
  likeScience(articleId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/science/like', { article_id: articleId })
  },

  // 记录科普文章浏览（需要认证）
  recordScienceVisit(articleId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/science/visit', { article_id: articleId })
  },

  // 获取科普文章点赞状态（需要认证）
  getScienceLikeStatus(articleIds: number[]): Promise<ApiResponse<UnknownResponse>> {
    return request.get('/api/science/like/status', { article_ids: articleIds.join(',') })
  },

  // ========== 用户科普文章管理 ==========

  // 获取我的科普文章列表
  getMyArticles(params: QueryParams = {}): Promise<ApiResponse<ScienceArticle[]>> {
    return request.get('/api/science/user/articles', params)
  },

  // 创建科普文章
  createArticle(articleData: Partial<ScienceArticle>): Promise<ApiResponse<ScienceArticle>> {
    return request.post('/api/science/user/articles', articleData)
  },

  // 更新科普文章
  updateArticle(articleId: number, articleData: Partial<ScienceArticle>): Promise<ApiResponse<ScienceArticle>> {
    return request.put(`/api/science/user/articles/${articleId}`, articleData)
  },

  // 删除科普文章
  deleteArticle(articleId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.delete(`/api/science/user/articles/${articleId}`)
  }
}

// 活动API接口
export const activityApi = {
  // ========== 公开接口（无需认证） ==========

  // 获取活动列表（专用公开接口）
  getPublicActivities(params: QueryParams = {}): Promise<ApiResponse<Activity[]>> {
    return request.get('/api/public/activities/activities', params)
  },

  // 获取活动详情（专用公开接口）
  getPublicActivityDetail(activityId: number): Promise<ApiResponse<Activity>> {
    return request.get(`/api/public/activities/activities/${activityId}`)
  },

  // 获取活动评分（公开接口）
  getActivityRatings(activityId: number, params: QueryParams = {}): Promise<ApiResponse<UnknownResponse>> {
    return request.get(`/api/public/activities/activities/${activityId}`, params)
  },

  // ========== 认证接口（需要JWT Token） ==========

  // 创建活动
  createActivity(activityData: Partial<Activity>): Promise<ApiResponse<Activity>> {
    return request.post('/api/activities/', activityData)
  },

  // 获取活动详情（认证接口，可获取更多信息）
  getActivityDetail(activityId: number): Promise<ApiResponse<Activity>> {
    return request.get(`/api/activities/${activityId}`)
  },

  // 活动预约
  bookActivity(activityId: number): Promise<ApiResponse<BookingData>> {
    return request.post(`/api/activities/${activityId}/booking`, {})
  },

  // 取消活动预约
  cancelBooking(activityId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.delete(`/api/activities/${activityId}/booking`)
  },

  // 获取我的预约记录
  getMyBookings(params: QueryParams = {}): Promise<ApiResponse<BookingData[]>> {
    return request.get('/api/activities/my-bookings', params)
  },

  // ========== 组织者专属功能 ==========

  // 获取我创建的活动
  getMyActivities(params: QueryParams = {}): Promise<ApiResponse<Activity[]>> {
    return request.get('/api/activities/my-activities', params)
  },

  // 更新活动信息
  updateActivity(activityId: number, activityData: Partial<Activity>): Promise<ApiResponse<Activity>> {
    return request.put(`/api/activities/${activityId}`, activityData)
  },

  // 取消活动
  cancelActivity(activityId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.post(`/api/activities/${activityId}/cancel`, {})
  },

  // ========== 讨论功能 ==========

  // 创建活动讨论
  createDiscussion(activityId: number, discussionData: DiscussionData): Promise<ApiResponse<UnknownResponse>> {
    return request.post(`/api/activities/${activityId}/discussion`, discussionData)
  },

  // 获取活动讨论列表
  getDiscussions(activityId: number, params: QueryParams = {}): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get(`/api/activities/${activityId}/discussion`, params)
  },

  // 创建讨论留言
  createDiscussionComment(discussionId: number, commentData: CommentData): Promise<ApiResponse<UnknownResponse>> {
    return request.post(`/api/activities/discussion/${discussionId}/comment`, commentData)
  },

  // 获取讨论留言列表（需要登录）
  getDiscussionComments(discussionId: number, params: QueryParams = {}): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get(`/api/activities/discussion/${discussionId}/comment`, params)
  },

  // 获取讨论留言列表（公开接口，无需登录）
  // 使用新接口路径: /api/activities/discussion/:id/comment
  getPublicDiscussionComments(discussionId: number, params: QueryParams = {}): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get(`/api/activities/discussion/${discussionId}/comment`, params)
  },

  // 删除讨论留言
  deleteDiscussionComment(commentId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.delete(`/api/activities/discussion/comment/${commentId}`)
  },

  // ========== 评分功能 ==========

  // 活动评分
  rateActivity(activityId: number, ratingData: RatingData): Promise<ApiResponse<UnknownResponse>> {
    return request.post(`/api/activities/${activityId}/rating`, ratingData)
  },

  // 获取活动评分详情
  getActivityRatingsDetail(activityId: number, params: QueryParams = {}): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get(`/api/activities/${activityId}/rating`, params)
  },

  // ========== 用户活动统计 ==========

  // 获取用户活动统计
  getUserActivityStats(): Promise<ApiResponse<UnknownResponse>> {
    return request.get('/api/user/activities/stats')
  },

  // 获取用户活动列表
  getUserActivitiesList(params: QueryParams = {}): Promise<ApiResponse<Activity[]>> {
    return request.get('/api/activities/user/activities', params)
  }
}

// 用户API接口
export const userApi = {
  // 获取用户个人信息
  getUserInfo(): Promise<ApiResponse<UserData>> {
    return request.get('/api/user/user/info')
  },

  // 更新用户个人信息
  updateProfile(profileData: Partial<UserData>): Promise<ApiResponse<UserData>> {
    return request.post('/api/user/user/update', profileData)
  },

  // 上传头像
  uploadAvatar(file: File): Promise<ApiResponse<{ avatar_url: string }>> {
    const formData = new FormData()
    formData.append('avatar', file)

    return request.post('/api/user/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // ========== 隐私设置 ==========

  /**
   * 获取隐私设置
   */
  getPrivacySettings(): Promise<ApiResponse<UnknownResponse>> {
    return request.get('/api/user/user/privacy-settings')
  },

  /**
   * 更新隐私设置
   */
  updatePrivacySettings(settings: {
    email_visible?: boolean
    phone_visible?: boolean
    birthday_visible?: 'public' | 'month_day' | 'private'
    location_visible?: boolean
    allow_messages?: boolean
    show_online_status?: boolean
    comment_notification?: boolean
    like_notification?: boolean
  }): Promise<ApiResponse<UnknownResponse>> {
    return request.put('/api/user/user/privacy-settings', settings)
  },

  // ========== 密码管理 ==========

  /**
   * 修改密码
   */
  changePassword(data: {
    current_password: string
    new_password: string
  }): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/user/user/change-password', data)
  },

  // ========== 登录设备管理 ==========

  /**
   * 获取登录设备列表
   */
  getLoginDevices(): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get('/api/user/user/login-devices')
  },

  /**
   * 移除登录设备
   */
  removeLoginDevice(deviceId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.delete(`/api/user/user/login-devices/${deviceId}`)
  },

  /**
   * 移除所有其他设备（保留当前设备）
   */
  removeAllOtherDevices(): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/user/user/login-devices/remove-all', {})
  },

  // ========== 账户安全 ==========

  /**
   * 发送邮箱验证码
   */
  sendEmailVerification(): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/user/user/verify-email', {})
  },

  /**
   * 发送手机验证码
   */
  sendPhoneVerification(): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/user/user/verify-phone', {})
  },

  /**
   * 验证邮箱
   */
  verifyEmail(code: string): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/user/user/verify-email/confirm', { code })
  },

  /**
   * 验证手机
   */
  verifyPhone(code: string): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/user/user/verify-phone/confirm', { code })
  },

  // ========== 账户注销 ==========

  /**
   * 申请注销账户
   */
  deactivateAccount(data: {
    reason: string
    other_reason?: string
    password: string
  }): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/user/user/deactivate', data)
  },

  /**
   * 取消账户注销申请
   */
  cancelDeactivation(): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/user/user/deactivate/cancel', {})
  },

  /**
   * 获取账户注销状态
   */
  getDeactivationStatus(): Promise<ApiResponse<UnknownResponse>> {
    return request.get('/api/user/user/deactivate/status')
  },

  // ========== 通知管理 ==========

  /**
   * 获取通知列表
   */
  getNotifications(params: {
    page?: number
    page_size?: number
    type?: 'all' | 'reply' | 'like' | 'system'
    is_read?: boolean
  }): Promise<ApiResponse<UnknownResponse>> {
    return request.get('/api/user/user/notifications', params)
  },

  /**
   * 获取未读通知数量
   */
  getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return request.get('/api/user/user/notifications/unread-count')
  },

  /**
   * 标记通知为已读
   */
  markNotificationAsRead(notificationId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.post(`/api/user/user/notifications/${notificationId}/read`, {})
  },

  /**
   * 批量标记通知为已读
   */
  markNotificationsAsRead(notificationIds: number[]): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/user/user/notifications/batch-read', { notification_ids: notificationIds })
  },

  /**
   * 标记所有通知为已读
   */
  markAllNotificationsAsRead(): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/user/user/notifications/mark-all-read', {})
  },

  /**
   * 删除通知
   */
  deleteNotification(notificationId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.delete(`/api/user/user/notifications/${notificationId}`)
  },

  /**
   * 清空所有通知
   */
  clearAllNotifications(): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/user/user/notifications/clear-all', {})
  }
}

// 管理员API接口（重构版 - 使用规范的RESTful API）
export const adminApi = {
  // ========== 管理员认证相关 ==========

  // 注意：管理员使用统一的登录接口 /api/user/auth/login
  // 登录成功后，根据返回的 user_type 字段区分用户和管理员

  // 管理员登出
  logout(): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/user/auth/logout', {})
  },

  // 获取管理员信息
  getInfo(): Promise<ApiResponse<AdminData>> {
    return request.get('/api/admin/info')
  },

  // 获取管理员权限
  getPermissions(): Promise<ApiResponse<{ permissions: string[] }>> {
    return request.get('/api/admin/permissions')
  },

  // ========== 内容审核管理 ==========

  // 获取待审核内容
  getPendingContent(params: QueryParams = {}): Promise<ApiResponse<UnknownResponse>> {
    return request.get('/api/admin/content/pending/all', params)
  },

  // 批量审核内容
  batchReview(reviewData: BatchReviewData): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/admin/content/batch-review', reviewData)
  },

  // 获取内容详情
  getContentDetail(module: string, contentId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.get(`/api/admin/content/detail/${module}/${contentId}`)
  },

  // 导出内容
  exportContent(params: QueryParams = {}): Promise<ApiResponse<UnknownResponse>> {
    return request.get('/api/admin/content/export', params)
  },

  // 获取内容统计
  getContentStatistics(): Promise<ApiResponse<UnknownResponse>> {
    return request.get('/api/admin/content/statistics')
  },

  // ========== 用户管理 ==========

  // 获取用户列表
  getUserList(params: QueryParams = {}): Promise<ApiResponse<UserData[]>> {
    return request.get('/api/user/admin/users', params)
  },

  // 管理用户
  manageUser(userId: number, operationData: UserOperationData): Promise<ApiResponse<UserData>> {
    return request.put(`/api/user/admin/users/${userId}`, operationData)
  },

  // 删除用户
  deleteUser(userId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.delete(`/api/user/admin/users/${userId}`)
  },

  // 获取管理员统计
  getAdminStatistics(): Promise<ApiResponse<UnknownResponse>> {
    return request.get('/api/user/admin/statistics')
  },

  // 创建管理员
  createAdmin(adminData: Partial<AdminData>): Promise<ApiResponse<AdminData>> {
    return request.post('/api/user/admin/create-admin', adminData)
  },

  // 降低管理员权限
  demoteAdmin(adminId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.post(`/api/user/admin/demote/${adminId}`, {})
  },

  // 批量降低管理员权限
  batchDemoteAdmins(adminIds: number[]): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/user/admin/demote/batch', { admin_ids: adminIds })
  },

  // ========== 科普文章管理（专用接口） ==========

  science: {
    // 创建科普文章（专用接口）
    create(data: Partial<ScienceArticle>): Promise<ApiResponse<ScienceArticle>> {
      return request.post('/api/admin/science/articles', data)
    },

    // 更新科普文章（专用接口）
    update(id: number, data: Partial<ScienceArticle>): Promise<ApiResponse<ScienceArticle>> {
      return request.put(`/api/admin/science/articles/${id}`, data)
    },

    // 删除科普文章（专用接口）
    delete(id: number): Promise<ApiResponse<UnknownResponse>> {
      return request.delete(`/api/admin/science/articles/${id}`)
    },

    // 获取科普文章列表（专用接口）
    list(params: QueryParams = {}): Promise<ApiResponse<ScienceArticle[]>> {
      return request.get('/api/admin/science/articles', params)
    }
  },

  // ========== 活动管理（专用接口） ==========

  activity: {
    // 创建活动（专用接口）
    create(data: Partial<Activity>): Promise<ApiResponse<Activity>> {
      return request.post('/api/activities/create', data)
    },

    // 更新活动（专用接口）
    update(id: number, data: Partial<Activity>): Promise<ApiResponse<Activity>> {
      return request.put(`/api/activities/update/${id}`, data)
    },

    // 删除活动（专用接口）
    delete(id: number): Promise<ApiResponse<UnknownResponse>> {
      return request.delete(`/api/activities/delete/${id}`)
    },

    // 批量删除活动（专用接口）
    batchDelete(ids: number[]): Promise<ApiResponse<UnknownResponse>> {
      return request.post('/api/activities/batch-delete', { ids })
    },

    // 获取活动列表（专用接口）
    // 临时使用公开接口，直到后端实现管理员专用接口
    list(params: QueryParams = {}): Promise<ApiResponse<Activity[]>> {
      return request.get('/api/public/activities/activities', params)
    },

    // 更新用户显示信息
    updateUserDisplays(): Promise<ApiResponse<UnknownResponse>> {
      return request.post('/api/admin/activity/update-user-displays', {})
    }
  }
}

// 用户认证API接口
export const authApi = {
  /**
   * 统一登录接口
   * 支持用户和管理员登录
   * 后端根据账号自动识别用户类型，返回 user_type 字段 ('user' | 'admin')
   */
  login(credentials: { account: string; password: string }): Promise<ApiResponse<UnknownResponse>> {
    // 用户和管理员都使用统一的登录接口
    return request.post('/api/user/auth/login', credentials)
  },

  /**
   * 统一登出接口
   * 支持用户和管理员登出
   */
  logout(): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/user/auth/logout', {})
  },

  /**
   * 获取管理员信息
   */
  getAdminInfo(): Promise<ApiResponse<AdminData>> {
    return request.get('/api/admin/info')
  },

  /**
   * 获取管理员权限
   */
  getAdminPermissions(): Promise<ApiResponse<{ permissions: string[] }>> {
    return request.get('/api/admin/permissions')
  }
}

// 论坛API接口
export const forumApi = {
  // ========== 帖子管理 ==========

  // 获取帖子列表
  getPostList(params: QueryParams = {}): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get('/api/forum/post', params)
  },

  // 获取帖子详情
  getPostDetail(postId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.get(`/api/forum/post/${postId}`)
  },

  // 创建帖子
  createPost(postData: PostData): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/forum/post', postData)
  },

  // 更新帖子
  updatePost(postId: number, postData: Partial<PostData>): Promise<ApiResponse<UnknownResponse>> {
    return request.put(`/api/forum/post/${postId}`, postData)
  },

  // 删除帖子
  deletePost(postId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.delete(`/api/forum/post/${postId}`)
  },

  // 获取热门帖子
  getHotPosts(params: QueryParams = {}): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get('/api/forum/post/hot', params)
  },

  // 获取帖子分类
  getCategories(): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get('/api/forum/post/categories')
  },

  // 搜索帖子
  searchPosts(params: QueryParams): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get('/api/forum/post/search', params)
  },

  // ========== 楼层管理 ==========

  // 获取帖子楼层列表
  getFloorList(postId: number, params: QueryParams = {}): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get(`/api/forum/floor/post/${postId}`, params)
  },

  // 创建楼层回复
  createFloor(floorData: FloorData): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/forum/floor', floorData)
  },

  // ========== 回复管理 ==========

  // 获取楼层回复列表
  getReplyList(floorId: number, params: QueryParams = {}): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get(`/api/forum/reply/floor/${floorId}`, params)
  },

  // 创建回复
  createReply(replyData: ReplyData): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/forum/reply', replyData)
  },

  // ========== 点赞功能 ==========

  // 点赞/取消点赞
  toggleLike(likeData: LikeData): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/forum/like', likeData)
  },

  // 获取点赞状态
  getLikeStatus(request: QueryParams): Promise<ApiResponse<UnknownResponse>> {
    return request.get('/api/forum/like/status', request)
  },

  // ========== 访问记录 ==========

  // 记录帖子访问
  recordVisit(postId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/forum/visit', { post_id: postId })
  },

  // ========== 统计信息 ==========

  // 获取论坛统计信息
  getStatistics(): Promise<ApiResponse<UnknownResponse>> {
    return request.get('/api/forum/statistics')
  },

  // 获取用户论坛统计
  getUserStats(userId?: number): Promise<ApiResponse<UnknownResponse>> {
    const url = userId ? `/api/forum/user/stats/${userId}` : '/api/forum/user/stats'
    return request.get(url)
  },

  // ========== 通知系统 ==========

  // 获取论坛通知列表
  getNotifications(params: QueryParams = {}): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get('/api/forum/notifications', params)
  },

  // 标记通知为已读
  markNotificationAsRead(notificationId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.post(`/api/forum/notifications/${notificationId}/read`, {})
  },

  // 批量标记通知为已读
  markAllNotificationsAsRead(): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/forum/notifications/mark-all-read', {})
  },

  // ========== 举报系统 ==========

  // 创建举报
  createReport(reportData: ReportData): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/forum/report', reportData)
  }
}

// 管理员论坛接口
export const forumAdminApi = {
  // 处理举报
  handleReport(reportData: ReportHandleData): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/forum/admin/report/handle', reportData)
  },

  // 批量操作帖子
  batchOperatePosts(operationData: BatchPostOperationData): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/forum/admin/posts/batch', operationData)
  }
}

// 公告API接口
export const noticeApi = {
  // ========== 公开接口（无需认证） ==========

  // 获取公告列表（专用公开接口）
  getPublicNotices(params: QueryParams = {}): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get('/api/public/notice/list', params)
  },

  // 获取公告详情（专用公开接口）
  getPublicNoticeDetail(noticeId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.get(`/api/public/notice/detail/${noticeId}`)
  },

  // 获取最新公告（公开接口）
  getLatestNotices(params: QueryParams = {}): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get('/api/public/notice/list', { ...params, size: 5 })
  },

  // 获取置顶公告（公开接口）
  get pinnedNotices(): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get('/api/public/notice/list', { is_pinned: true })
  },

  // 获取公告类型（公开接口）
  getNoticeTypes(): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get('/api/public/notice/types')
  },

  // 获取公告统计（公开接口）
  getNoticeStatistics(): Promise<ApiResponse<UnknownResponse>> {
    return request.get('/api/public/notice/statistics')
  },

  // ========== 管理员接口（需要认证） ==========

  // 获取管理员公告列表（完整功能）
  getAdminNotices(params: QueryParams = {}): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get('/api/admin/notices', params)
  },

  // 获取管理员公告详情
  getAdminNoticeDetail(noticeId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.get(`/api/admin/notices/${noticeId}`)
  },

  // 创建公告
  createNotice(noticeData: NoticeData): Promise<ApiResponse<NoticeData>> {
    return request.post('/api/admin/notices', noticeData)
  },

  // 更新公告
  updateNotice(noticeId: number, noticeData: Partial<NoticeData>): Promise<ApiResponse<NoticeData>> {
    return request.put(`/api/admin/notices/${noticeId}`, noticeData)
  },

  // 删除公告
  deleteNotice(noticeId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.delete(`/api/admin/notices/${noticeId}`)
  },

  // 批量删除公告
  batchDeleteNotices(noticeIds: number[]): Promise<ApiResponse<UnknownResponse>> {
    return request.post('/api/admin/notices/batch-delete', { notice_ids: noticeIds })
  },

  // 发布公告（将状态改为已发布）
  publishNotice(noticeId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.post(`/api/admin/notices/${noticeId}/publish`, {})
  },

  // 撤回公告（将状态改为草稿）
  unpublishNotice(noticeId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.post(`/api/admin/notices/${noticeId}/unpublish`, {})
  },

  // 置顶公告
  pinNotice(noticeId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.post(`/api/admin/notices/${noticeId}/pin`, {})
  },

  // 取消置顶公告
  unpinNotice(noticeId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.post(`/api/admin/notices/${noticeId}/unpin`, {})
  },

  // 获取公告统计信息
  getNoticeStats(): Promise<ApiResponse<UnknownResponse>> {
    return request.get('/api/admin/notices/stats')
  }
}

export default {
  scienceApi,
  activityApi,
  adminApi,
  userApi,
  authApi,
  forumApi,
  forumAdminApi,
  noticeApi
}