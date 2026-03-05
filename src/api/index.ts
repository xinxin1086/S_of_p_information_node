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
    return request.get('/api/public/science/articles', { params })
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
    return request.get('/api/science/like/status', { params: { article_ids: articleIds.join(',') } })
  },

  // ========== 用户科普文章管理 ==========

  // 获取我的科普文章列表
  getMyArticles(params: QueryParams = {}): Promise<ApiResponse<ScienceArticle[]>> {
    return request.get('/api/science/user/articles', { params })
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
    return request.get('/api/public/activities/activities', { params })
  },

  // 获取活动详情（专用公开接口）
  getPublicActivityDetail(activityId: number): Promise<ApiResponse<Activity>> {
    return request.get(`/api/public/activities/activities/${activityId}`)
  },

  // 获取活动评分（公开接口）
  getActivityRatings(activityId: number, params: QueryParams = {}): Promise<ApiResponse<UnknownResponse>> {
    return request.get(`/api/public/activities/activities/${activityId}/ratings`, { params })
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
    return request.get('/api/activities/my-bookings', { params })
  },

  // ========== 组织者专属功能 ==========

  // 获取我创建的活动
  getMyActivities(params: QueryParams = {}): Promise<ApiResponse<Activity[]>> {
    return request.get('/api/activities/my-activities', { params })
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
    return request.get(`/api/activities/${activityId}/discussion`, { params })
  },

  // 创建讨论留言
  createDiscussionComment(discussionId: number, commentData: CommentData): Promise<ApiResponse<UnknownResponse>> {
    return request.post(`/api/activities/discussion/${discussionId}/comment`, commentData)
  },

  // 获取讨论留言列表（需要登录）
  getDiscussionComments(discussionId: number, params: QueryParams = {}): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get(`/api/activities/discussion/${discussionId}/comment`, { params })
  },

  // 获取讨论留言列表（公开接口，无需登录）
  // 使用新接口路径: /api/activities/discussion/:id/comment
  getPublicDiscussionComments(discussionId: number, params: QueryParams = {}): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get(`/api/activities/discussion/${discussionId}/comment`, { params })
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
    return request.get(`/api/activities/${activityId}/rating`, { params })
  },

  // ========== 用户活动统计 ==========

  // 获取用户活动统计
  getUserActivityStats(): Promise<ApiResponse<UnknownResponse>> {
    return request.get('/api/user/activities/stats')
  },

  // 获取用户活动列表
  getUserActivitiesList(params: QueryParams = {}): Promise<ApiResponse<Activity[]>> {
    return request.get('/api/activities/user/activities', { params })
  }
}

// 用户API接口
export const userApi = {
  // 获取用户个人信息
  getUserInfo(): Promise<ApiResponse<UserData>> {
    return request.get('/api/user/user/info')
  },

  // 获取用户统计数据
  getUserStats(): Promise<ApiResponse<UnknownResponse>> {
    return request.get('/api/public/user/statistics')
  },

  // 获取最近活动
  getRecentActivities(params: QueryParams = {}): Promise<ApiResponse<Activity[]>> {
    return request.get('/api/user/recent-activities', { params })
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
    return request.get('/api/user/user/notifications', { params })
  },

  /**
   * 获取未读通知数量
   */
  getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return request.get('/api/user/notifications/unread-count')
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
    return request.get('/api/admin/content/pending/all', { params })
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
    return request.get('/api/admin/content/export', { params })
  },

  // 获取内容统计
  getContentStatistics(): Promise<ApiResponse<UnknownResponse>> {
    return request.get('/api/admin/content/statistics')
  },

  // ========== 用户管理 ==========

  // 获取用户列表
  getUserList(params: QueryParams = {}): Promise<ApiResponse<UserData[]>> {
    return request.get('/api/user/admin/users', { params })
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
    // 获取所有文章列表（分页、筛选）
    list(params: {
      page?: number
      size?: number
      category?: string
      status?: 'published' | 'draft' | 'archived'
      keyword?: string
    } = {}): Promise<ApiResponse<{
      items: ScienceArticle[]
      total: number
      page: number
      size: number
    }>> {
      return request.get('/api/science/admin/articles', { params })
    },

    // 获取文章详情
    detail(id: number): Promise<ApiResponse<ScienceArticle>> {
      return request.get(`/api/science/admin/articles/${id}`)
    },

    // 创建科普文章
    create(data: Partial<ScienceArticle>): Promise<ApiResponse<ScienceArticle>> {
      return request.post('/api/science/admin/articles', data)
    },

    // 更新科普文章
    update(id: number, data: Partial<ScienceArticle>): Promise<ApiResponse<ScienceArticle>> {
      return request.put(`/api/science/admin/articles/${id}`, data)
    },

    // 删除科普文章
    delete(id: number): Promise<ApiResponse<UnknownResponse>> {
      return request.delete(`/api/science/admin/articles/${id}`)
    },

    // 批量删除文章
    batchDelete(ids: number[]): Promise<ApiResponse<UnknownResponse>> {
      return request.post('/api/science/admin/articles/batch-delete', { article_ids: ids })
    },

    // 审核通过
    approve(id: number): Promise<ApiResponse<UnknownResponse>> {
      return request.post(`/api/science/admin/articles/${id}/approve`)
    },

    // 审核驳回
    reject(id: number, reason?: string): Promise<ApiResponse<UnknownResponse>> {
      return request.post(`/api/science/admin/articles/${id}/reject`, { reason })
    },

    // 批量更新状态（发布、下架等）
    batchStatus(data: {
      article_ids: number[]
      action: 'publish' | 'archive' | 'draft'
    }): Promise<ApiResponse<UnknownResponse>> {
      return request.post('/api/science/admin/articles/batch-status', data)
    },

    // 获取管理员统计数据
    statistics(): Promise<ApiResponse<{
      total: number
      published: number
      draft: number
      archived: number
      pending_review: number
    }>> {
      return request.get('/api/science/admin/articles/statistics')
    }
  },

  // ========== 活动管理（专用接口） ==========

  activity: {
    // 创建活动（专用接口）
    create(data: Partial<Activity>): Promise<ApiResponse<Activity>> {
      return request.post('/api/activities/admin/activities', data)
    },

    // 更新活动（专用接口）
    update(id: number, data: Partial<Activity>): Promise<ApiResponse<Activity>> {
      return request.put(`/api/activities/admin/activities/${id}`, data)
    },

    // 删除活动（软删除） 匹配后端：DELETE /api/activities/admin/activities/{id}
    delete(id: number): Promise<ApiResponse<UnknownResponse>> {
      return request.delete(`/api/activities/admin/activities/${id}`);
    },

    // 批量删除活动  后端无独立批量接口 → 前端循环调用单删（兼容业务）
    batchDelete(ids: number[]): Promise<ApiResponse<UnknownResponse>> {
      // 并发执行批量删除，统一返回结果（后端仅支持单条软删除）
      const promiseArr = ids.map(id => request.delete(`/api/activities/admin/activities/${id}`));
      return Promise.all(promiseArr).then((): ApiResponse<UnknownResponse> => {
        return { success: true, message: '批量删除成功', data: null };
      });
    },

    // 获取活动列表  替换为管理员专用接口：GET /api/activities/admin/activities
    list(params: QueryParams = {}): Promise<ApiResponse<{
      total: number;
      page: number;
      size: number;
      items: Activity[];
    }>> {
      return request.get('/api/activities/admin/activities', { params });
    },

    // ========== 新增：后端已实现的管理员专属接口（前端必加，完整覆盖业务） ==========
    // 获取单活动详情  匹配后端：GET /api/activities/admin/activities/{id}
    detail(id: number): Promise<ApiResponse<Activity>> {
      return request.get(`/api/activities/admin/activities/${id}`);
    },

    // 获取活动预约列表  匹配后端：GET /api/activities/admin/activities/{id}/bookings
    getBookings(activityId: number, params: QueryParams = {}): Promise<ApiResponse<{
      total: number;
      page: number;
      size: number;
      items: UnknownResponse[]; // 预约列表项
    }>> {
      return request.get(`/api/activities/admin/activities/${activityId}/bookings`, { params });
    },

    // 更新预约状态  匹配后端：PUT /api/activities/admin/activities/{aid}/bookings/{bid}/status
    updateBookingStatus(activityId: number, bookingId: number, data: {
      status: 'booked' | 'cancelled' | 'attended' | 'absent';
      notes?: string;
    }): Promise<ApiResponse<UnknownResponse>> {
      return request.put(
        `/api/activities/admin/activities/${activityId}/bookings/${bookingId}/status`,
        data
      );
    },

    // 批量更新预约状态  匹配后端：POST /api/activities/admin/activities/{id}/bookings/batch
    batchUpdateBookings(activityId: number, data: {
      operation: 'confirm_attendance' | 'mark_absent' | 'cancel';
      booking_ids: number[];
    }): Promise<ApiResponse<UnknownResponse>> {
      return request.post(
        `/api/activities/admin/activities/${activityId}/bookings/batch`,
        data
      );
    },

    // 获取活动统计数据  匹配后端：GET /api/activities/admin/activities/{id}/statistics
    getStatistics(activityId: number): Promise<ApiResponse<UnknownResponse>> {
      return request.get(`/api/activities/admin/activities/${activityId}/statistics`);
    },

    // 获取活动汇总数据  匹配后端：GET /api/activities/admin/activities/summary
    getSummary(): Promise<ApiResponse<UnknownResponse>> {
      return request.get('/api/activities/admin/activities/summary');
    }
  },

  // ========== 活动评分管理 ==========

  activityRating: {
    // 获取活动评分列表
    list(params: QueryParams = {}): Promise<ApiResponse<{
      list: unknown[];
      total: number;
    }>> {
      return request.get('/api/activities/admin/ratings', { params });
    },

    // 删除活动评分
    delete(id: number): Promise<ApiResponse<UnknownResponse>> {
      return request.delete(`/api/activities/admin/ratings/${id}`);
    },

    // 批量删除评分
    batchDelete(ids: number[]): Promise<ApiResponse<UnknownResponse>> {
      return request.post('/api/activities/admin/ratings/batch-delete', { rating_ids: ids });
    }
  },

  // ========== 活动讨论管理 ==========

  activityDiscussion: {
    // 获取活动讨论列表
    list(params: QueryParams = {}): Promise<ApiResponse<{
      list: unknown[];
      total: number;
    }>> {
      return request.get('/api/activities/admin/discussions', { params });
    },

    // 删除活动讨论
    delete(id: number): Promise<ApiResponse<UnknownResponse>> {
      return request.delete(`/api/activities/admin/discussions/${id}`);
    },

    // 批量删除讨论
    batchDelete(ids: number[]): Promise<ApiResponse<UnknownResponse>> {
      return request.post('/api/activities/admin/discussions/batch-delete', { discussion_ids: ids });
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

// 公告API接口
export const noticeApi = {
  // ========== 公开接口（无需认证） ==========

  // 获取公告列表（专用公开接口）
  getPublicNotices(params: QueryParams = {}): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get('/api/public/notice/list', { params })
  },

  // 获取公告详情（专用公开接口）
  getPublicNoticeDetail(noticeId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.get(`/api/public/notice/detail/${noticeId}`)
  },

  // 获取最新公告（公开接口）
  getLatestNotices(params: QueryParams = {}): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get('/api/public/notice/list', { params: { ...params, size: 5 } })
  },

  // 获取置顶公告（公开接口）
  get pinnedNotices(): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get('/api/public/notice/list', { params: { is_pinned: true } })
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
  // 蓝图路由前缀: /api/notice/admin

  // 获取管理员公告列表（GET/POST /api/notice/admin/list）
  getAdminNotices(params: QueryParams = {}): Promise<ApiResponse<UnknownResponse[]>> {
    return request.get('/api/notice/admin/list', { params })
  },

  // 获取管理员公告详情
  getAdminNoticeDetail(noticeId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.get(`/api/notice/admin/detail/${noticeId}`)
  },

  // 创建公告（POST /api/notice/admin/create）
  createNotice(noticeData: NoticeData): Promise<ApiResponse<NoticeData>> {
    return request.post('/api/notice/admin/create', noticeData)
  },

  // 更新公告（PUT /api/notice/admin/update/<notice_id>）
  updateNotice(noticeId: number, noticeData: Partial<NoticeData>): Promise<ApiResponse<NoticeData>> {
    return request.put(`/api/notice/admin/update/${noticeId}`, noticeData)
  },

  // 删除公告（DELETE /api/notice/admin/delete/<notice_id>）
  deleteNotice(noticeId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.delete(`/api/notice/admin/delete/${noticeId}`)
  },

  // 置顶切换（POST /api/notice/admin/top/<notice_id>）
  // 需要传递 is_top 参数指定目标状态
  togglePinNotice(noticeId: number, currentPinnedState: boolean): Promise<ApiResponse<UnknownResponse>> {
    // 切换状态：如果当前是置顶，则取消置顶；如果当前未置顶，则置顶
    return request.post(`/api/notice/admin/top/${noticeId}`, { is_top: !currentPinnedState })
  },

  // 置顶公告（POST /api/notice/admin/top/<notice_id>）
  pinNotice(noticeId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.post(`/api/notice/admin/top/${noticeId}`, { is_top: true })
  },

  // 取消置顶公告（POST /api/notice/admin/top/<notice_id>）
  unpinNotice(noticeId: number): Promise<ApiResponse<UnknownResponse>> {
    return request.post(`/api/notice/admin/top/${noticeId}`, { is_top: false })
  },

  // 获取公告统计信息（GET /api/notice/admin/statistics）
  getNoticeStats(): Promise<ApiResponse<UnknownResponse>> {
    return request.get('/api/notice/admin/statistics')
  }
}

export default {
  scienceApi,
  activityApi,
  adminApi,
  userApi,
  authApi,
  noticeApi
}
