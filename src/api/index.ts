import { api } from '@/utils/common/request'
import { tokenManager } from '@/utils/tokenManager'

// 通用参数类型
interface QueryParams {
  [key: string]: any
}

interface ApiResponse<T = any> {
  data: T
  success: boolean
  message: string
}

interface PaginatedResponse<T = any> {
  list: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

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
    return api.get('/api/public/science/articles', params)
  },

  // 获取科普文章详情（专用公开接口）
  getScienceDetail(articleId: number): Promise<ApiResponse<ScienceArticle>> {
    return api.get(`/api/public/science/articles/${articleId}`)
  },

  // ========== 认证接口（需要JWT Token） ==========

  // 获取科普文章详情（认证接口，返回点赞状态和详细浏览记录）
  getScienceDetailAuthenticated(articleId: number): Promise<ApiResponse<ScienceArticle>> {
    const token = tokenManager.getAccessToken()
    return api.get(`/api/public/science/articles/${articleId}`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 科普文章点赞（需要认证）
  likeScience(articleId: number): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post('/api/science/like', { article_id: articleId }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 记录科普文章浏览（需要认证）
  recordScienceVisit(articleId: number): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post('/api/science/visit', { article_id: articleId }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 获取科普文章点赞状态（需要认证）
  getScienceLikeStatus(articleIds: number[]): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.get('/api/science/like/status', { article_ids: articleIds.join(',') }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // ========== 用户科普文章管理 ==========

  // 获取我的科普文章列表
  getMyArticles(params: QueryParams = {}): Promise<ApiResponse<ScienceArticle[]>> {
    const token = tokenManager.getAccessToken()
    return api.get('/api/science/user/articles', params, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 创建科普文章
  createArticle(articleData: Partial<ScienceArticle>): Promise<ApiResponse<ScienceArticle>> {
    const token = tokenManager.getAccessToken()
    return api.post('/api/science/user/articles', articleData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 更新科普文章
  updateArticle(articleId: number, articleData: Partial<ScienceArticle>): Promise<ApiResponse<ScienceArticle>> {
    const token = tokenManager.getAccessToken()
    return api.put(`/api/science/user/articles/${articleId}`, articleData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 删除科普文章
  deleteArticle(articleId: number): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.delete(`/api/science/user/articles/${articleId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }
}

// 活动API接口
export const activityApi = {
  // ========== 公开接口（无需认证） ==========

  // 获取活动列表（专用公开接口）
  getPublicActivities(params: QueryParams = {}): Promise<ApiResponse<Activity[]>> {
    return api.get('/api/public/activities/activities', params)
  },

  // 获取活动详情（专用公开接口）
  getPublicActivityDetail(activityId: number): Promise<ApiResponse<Activity>> {
    return api.get(`/api/public/activities/activities/${activityId}`)
  },

  // 获取活动评分（公开接口）
  getActivityRatings(activityId: number, params: QueryParams = {}): Promise<ApiResponse<any>> {
    return api.get(`/api/public/activities/activities/${activityId}`, params)
  },

  // ========== 认证接口（需要JWT Token） ==========

  // 创建活动
  createActivity(activityData: Partial<Activity>): Promise<ApiResponse<Activity>> {
    const token = tokenManager.getAccessToken()
    return api.post('/api/activities/', activityData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 获取活动详情（认证接口，可获取更多信息）
  getActivityDetail(activityId: number): Promise<ApiResponse<Activity>> {
    const token = tokenManager.getAccessToken()
    return api.get(`/api/activities/${activityId}`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 活动预约
  bookActivity(activityId: number): Promise<ApiResponse<BookingData>> {
    const token = tokenManager.getAccessToken()
    return api.post(`/api/activities/${activityId}/booking`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 取消活动预约
  cancelBooking(activityId: number): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.delete(`/api/activities/${activityId}/booking`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 获取我的预约记录
  getMyBookings(params: QueryParams = {}): Promise<ApiResponse<BookingData[]>> {
    const token = tokenManager.getAccessToken()
    return api.get('/api/activities/my-bookings', params, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // ========== 组织者专属功能 ==========

  // 获取我创建的活动
  getMyActivities(params: QueryParams = {}): Promise<ApiResponse<Activity[]>> {
    const token = tokenManager.getAccessToken()
    return api.get('/api/activities/my-activities', params, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 更新活动信息
  updateActivity(activityId: number, activityData: Partial<Activity>): Promise<ApiResponse<Activity>> {
    const token = tokenManager.getAccessToken()
    return api.put(`/api/activities/${activityId}`, activityData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 取消活动
  cancelActivity(activityId: number): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post(`/api/activities/${activityId}/cancel`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // ========== 讨论功能 ==========

  // 创建活动讨论
  createDiscussion(activityId: number, discussionData: DiscussionData): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post(`/api/activities/${activityId}/discussion`, discussionData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 获取活动讨论列表
  getDiscussions(activityId: number, params: QueryParams = {}): Promise<ApiResponse<any[]>> {
    return api.get(`/api/activities/${activityId}/discussion`, params)
  },

  // 创建讨论留言
  createDiscussionComment(discussionId: number, commentData: CommentData): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post(`/api/activities/discussion/${discussionId}/comment`, commentData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 获取讨论留言列表（需要登录）
  getDiscussionComments(discussionId: number, params: QueryParams = {}): Promise<ApiResponse<any[]>> {
    const token = tokenManager.getAccessToken()
    return api.get(`/api/activities/discussion/${discussionId}/comment`, params, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 获取讨论留言列表（公开接口，无需登录）
  // 使用新接口路径: /api/activities/discussion/:id/comment
  getPublicDiscussionComments(discussionId: number, params: QueryParams = {}): Promise<ApiResponse<any[]>> {
    return api.get(`/api/activities/discussion/${discussionId}/comment`, params)
  },

  // 删除讨论留言
  deleteDiscussionComment(commentId: number): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.delete(`/api/activities/discussion/comment/${commentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // ========== 评分功能 ==========

  // 活动评分
  rateActivity(activityId: number, ratingData: RatingData): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post(`/api/activities/${activityId}/rating`, ratingData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 获取活动评分详情
  getActivityRatingsDetail(activityId: number, params: QueryParams = {}): Promise<ApiResponse<any[]>> {
    return api.get(`/api/activities/${activityId}/rating`, params)
  },

  // ========== 用户活动统计 ==========

  // 获取用户活动统计
  getUserActivityStats(): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.get('/api/user/activities/stats', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 获取用户活动列表
  getUserActivitiesList(params: QueryParams = {}): Promise<ApiResponse<Activity[]>> {
    const token = tokenManager.getAccessToken()
    return api.get('/api/activities/user/activities', params, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }
}

// 用户API接口
export const userApi = {
  // 获取用户个人信息
  getUserInfo(): Promise<ApiResponse<UserData>> {
    const token = tokenManager.getAccessToken()
    return api.get('/api/user/user/info', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 更新用户个人信息
  updateProfile(profileData: Partial<UserData>): Promise<ApiResponse<UserData>> {
    const token = tokenManager.getAccessToken()
    return api.post('/api/user/user/update', profileData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 上传头像
  uploadAvatar(file: File): Promise<ApiResponse<{ avatar_url: string }>> {
    const token = tokenManager.getAccessToken()
    const formData = new FormData()
    formData.append('avatar', file)

    return api.post('/api/user/user/avatar', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

// 管理员API接口（重构版 - 使用规范的RESTful API）
export const adminApi = {
  // ========== 管理员认证相关 ==========

  // 注意：管理员使用统一的登录接口 /api/user/auth/login
  // 登录成功后，根据返回的 user_type 字段区分用户和管理员

  // 管理员登出
  logout(): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post('/api/user/auth/logout', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 获取管理员信息
  getInfo(): Promise<ApiResponse<AdminData>> {
    const token = tokenManager.getAccessToken()
    return api.get('/api/admin/info', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 获取管理员权限
  getPermissions(): Promise<ApiResponse<{ permissions: string[] }>> {
    const token = tokenManager.getAccessToken()
    return api.get('/api/admin/permissions', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // ========== 内容审核管理 ==========

  // 获取待审核内容
  getPendingContent(params: QueryParams = {}): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.get('/api/admin/content/pending/all', params, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 批量审核内容
  batchReview(reviewData: any): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post('/api/admin/content/batch-review', reviewData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 获取内容详情
  getContentDetail(module: string, contentId: number): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.get(`/api/admin/content/detail/${module}/${contentId}`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 导出内容
  exportContent(params: QueryParams = {}): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.get('/api/admin/content/export', params, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 获取内容统计
  getContentStatistics(): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.get('/api/admin/content/statistics', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // ========== 用户管理 ==========

  // 获取用户列表
  getUserList(params: QueryParams = {}): Promise<ApiResponse<UserData[]>> {
    const token = tokenManager.getAccessToken()
    return api.get('/api/user/admin/users', params, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 管理用户
  manageUser(userId: number, operationData: any): Promise<ApiResponse<UserData>> {
    const token = tokenManager.getAccessToken()
    return api.put(`/api/user/admin/users/${userId}`, operationData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 删除用户
  deleteUser(userId: number): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.delete(`/api/user/admin/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 获取管理员统计
  getAdminStatistics(): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.get('/api/user/admin/statistics', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 创建管理员
  createAdmin(adminData: Partial<AdminData>): Promise<ApiResponse<AdminData>> {
    const token = tokenManager.getAccessToken()
    return api.post('/api/user/admin/create-admin', adminData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 降低管理员权限
  demoteAdmin(adminId: number): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post(`/api/user/admin/demote/${adminId}`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 批量降低管理员权限
  batchDemoteAdmins(adminIds: number[]): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post('/api/user/admin/demote/batch', { admin_ids: adminIds }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // ========== 科普文章管理（专用接口） ==========

  science: {
    // 创建科普文章（专用接口）
    create(data: Partial<ScienceArticle>): Promise<ApiResponse<ScienceArticle>> {
      const token = tokenManager.getAccessToken()
      return api.post('/api/admin/science/articles', data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    },

    // 更新科普文章（专用接口）
    update(id: number, data: Partial<ScienceArticle>): Promise<ApiResponse<ScienceArticle>> {
      const token = tokenManager.getAccessToken()
      return api.put(`/api/admin/science/articles/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    },

    // 删除科普文章（专用接口）
    delete(id: number): Promise<ApiResponse<any>> {
      const token = tokenManager.getAccessToken()
      return api.delete(`/api/admin/science/articles/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    },

    // 获取科普文章列表（专用接口）
    list(params: QueryParams = {}): Promise<ApiResponse<ScienceArticle[]>> {
      const token = tokenManager.getAccessToken()
      return api.get('/api/admin/science/articles', params, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    }
  },

  // ========== 活动管理（专用接口） ==========

  activity: {
    // 创建活动（专用接口）
    create(data: Partial<Activity>): Promise<ApiResponse<Activity>> {
      const token = tokenManager.getAccessToken()
      return api.post('/api/activities/create', data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    },

    // 更新活动（专用接口）
    update(id: number, data: Partial<Activity>): Promise<ApiResponse<Activity>> {
      const token = tokenManager.getAccessToken()
      return api.put(`/api/activities/update/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    },

    // 删除活动（专用接口）
    delete(id: number): Promise<ApiResponse<any>> {
      const token = tokenManager.getAccessToken()
      return api.delete(`/api/activities/delete/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    },

    // 批量删除活动（专用接口）
    batchDelete(ids: number[]): Promise<ApiResponse<any>> {
      const token = tokenManager.getAccessToken()
      return api.post('/api/activities/batch-delete', { ids }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    },

    // 获取活动列表（专用接口）
    // 临时使用公开接口，直到后端实现管理员专用接口
    list(params: QueryParams = {}): Promise<ApiResponse<Activity[]>> {
      return api.get('/api/public/activities/activities', params)
    },

    // 更新用户显示信息
    updateUserDisplays(): Promise<ApiResponse<any>> {
      const token = tokenManager.getAccessToken()
      return api.post('/api/admin/activity/update-user-displays', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
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
  login(credentials: { account: string; password: string }): Promise<ApiResponse<any>> {
    // 用户和管理员都使用统一的登录接口
    return api.post('/api/user/auth/login', credentials)
  },

  /**
   * 统一登出接口
   * 支持用户和管理员登出
   */
  logout(): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post('/api/user/auth/logout', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  /**
   * 获取管理员信息
   */
  getAdminInfo(): Promise<ApiResponse<AdminData>> {
    const token = tokenManager.getAccessToken()
    return api.get('/api/admin/info', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  /**
   * 获取管理员权限
   */
  getAdminPermissions(): Promise<ApiResponse<{ permissions: string[] }>> {
    const token = tokenManager.getAccessToken()
    return api.get('/api/admin/permissions', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }
}

// 论坛API接口
export const forumApi = {
  // ========== 帖子管理 ==========

  // 获取帖子列表
  getPostList(params: QueryParams = {}): Promise<ApiResponse<any[]>> {
    return api.get('/api/forum/post', params)
  },

  // 获取帖子详情
  getPostDetail(postId: number): Promise<ApiResponse<any>> {
    return api.get(`/api/forum/post/${postId}`)
  },

  // 创建帖子
  createPost(postData: PostData): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post('/api/forum/post', postData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 更新帖子
  updatePost(postId: number, postData: Partial<PostData>): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.put(`/api/forum/post/${postId}`, postData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 删除帖子
  deletePost(postId: number): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.delete(`/api/forum/post/${postId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 获取热门帖子
  getHotPosts(params: QueryParams = {}): Promise<ApiResponse<any[]>> {
    return api.get('/api/forum/post/hot', params)
  },

  // 获取帖子分类
  getCategories(): Promise<ApiResponse<any[]>> {
    return api.get('/api/forum/post/categories')
  },

  // 搜索帖子
  searchPosts(params: QueryParams): Promise<ApiResponse<any[]>> {
    return api.get('/api/forum/post/search', params)
  },

  // ========== 楼层管理 ==========

  // 获取帖子楼层列表
  getFloorList(postId: number, params: QueryParams = {}): Promise<ApiResponse<any[]>> {
    return api.get(`/api/forum/floor/post/${postId}`, params)
  },

  // 创建楼层回复
  createFloor(floorData: FloorData): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post('/api/forum/floor', floorData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // ========== 回复管理 ==========

  // 获取楼层回复列表
  getReplyList(floorId: number, params: QueryParams = {}): Promise<ApiResponse<any[]>> {
    return api.get(`/api/forum/reply/floor/${floorId}`, params)
  },

  // 创建回复
  createReply(replyData: ReplyData): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post('/api/forum/reply', replyData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // ========== 点赞功能 ==========

  // 点赞/取消点赞
  toggleLike(likeData: LikeData): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post('/api/forum/like', likeData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 获取点赞状态
  getLikeStatus(request: QueryParams): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.get('/api/forum/like/status', request, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // ========== 访问记录 ==========

  // 记录帖子访问
  recordVisit(postId: number): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post('/api/forum/visit', { post_id: postId }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // ========== 统计信息 ==========

  // 获取论坛统计信息
  getStatistics(): Promise<ApiResponse<any>> {
    return api.get('/api/forum/statistics')
  },

  // 获取用户论坛统计
  getUserStats(userId?: number): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    const url = userId ? `/api/forum/user/stats/${userId}` : '/api/forum/user/stats'
    return api.get(url, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // ========== 通知系统 ==========

  // 获取论坛通知列表
  getNotifications(params: QueryParams = {}): Promise<ApiResponse<any[]>> {
    const token = tokenManager.getAccessToken()
    return api.get('/api/forum/notifications', params, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 标记通知为已读
  markNotificationAsRead(notificationId: number): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post(`/api/forum/notifications/${notificationId}/read`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 批量标记通知为已读
  markAllNotificationsAsRead(): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post('/api/forum/notifications/mark-all-read', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // ========== 举报系统 ==========

  // 创建举报
  createReport(reportData: ReportData): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post('/api/forum/report', reportData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }
}

// 管理员论坛接口
export const forumAdminApi = {
  // 处理举报
  handleReport(reportData: any): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post('/api/forum/admin/report/handle', reportData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 批量操作帖子
  batchOperatePosts(operationData: any): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post('/api/forum/admin/posts/batch', operationData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  }
}

// 公告API接口
export const noticeApi = {
  // ========== 公开接口（无需认证） ==========

  // 获取公告列表（专用公开接口）
  getPublicNotices(params: QueryParams = {}): Promise<ApiResponse<any[]>> {
    return api.get('/api/public/notice/list', params)
  },

  // 获取公告详情（专用公开接口）
  getPublicNoticeDetail(noticeId: number): Promise<ApiResponse<any>> {
    return api.get(`/api/public/notice/detail/${noticeId}`)
  },

  // 获取最新公告（公开接口）
  getLatestNotices(params: QueryParams = {}): Promise<ApiResponse<any[]>> {
    return api.get('/api/public/notice/list', { ...params, size: 5 })
  },

  // 获取置顶公告（公开接口）
  get pinnedNotices(): Promise<ApiResponse<any[]>> {
    return api.get('/api/public/notice/list', { is_pinned: true })
  },

  // 获取公告类型（公开接口）
  getNoticeTypes(): Promise<ApiResponse<any[]>> {
    return api.get('/api/public/notice/types')
  },

  // 获取公告统计（公开接口）
  getNoticeStatistics(): Promise<ApiResponse<any>> {
    return api.get('/api/public/notice/statistics')
  },

  // ========== 管理员接口（需要认证） ==========

  // 获取管理员公告列表（完整功能）
  getAdminNotices(params: QueryParams = {}): Promise<ApiResponse<any[]>> {
    const token = tokenManager.getAccessToken()
    return api.get('/api/admin/notices', params, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 获取管理员公告详情
  getAdminNoticeDetail(noticeId: number): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.get(`/api/admin/notices/${noticeId}`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 创建公告
  createNotice(noticeData: NoticeData): Promise<ApiResponse<NoticeData>> {
    const token = tokenManager.getAccessToken()
    return api.post('/api/admin/notices', noticeData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 更新公告
  updateNotice(noticeId: number, noticeData: Partial<NoticeData>): Promise<ApiResponse<NoticeData>> {
    const token = tokenManager.getAccessToken()
    return api.put(`/api/admin/notices/${noticeId}`, noticeData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 删除公告
  deleteNotice(noticeId: number): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.delete(`/api/admin/notices/${noticeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 批量删除公告
  batchDeleteNotices(noticeIds: number[]): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post('/api/admin/notices/batch-delete', { notice_ids: noticeIds }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 发布公告（将状态改为已发布）
  publishNotice(noticeId: number): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post(`/api/admin/notices/${noticeId}/publish`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 撤回公告（将状态改为草稿）
  unpublishNotice(noticeId: number): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post(`/api/admin/notices/${noticeId}/unpublish`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 置顶公告
  pinNotice(noticeId: number): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post(`/api/admin/notices/${noticeId}/pin`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 取消置顶公告
  unpinNotice(noticeId: number): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.post(`/api/admin/notices/${noticeId}/unpin`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 获取公告统计信息
  getNoticeStats(): Promise<ApiResponse<any>> {
    const token = tokenManager.getAccessToken()
    return api.get('/api/admin/notices/stats', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
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