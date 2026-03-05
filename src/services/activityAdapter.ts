/**
 * 活动 API 适配器
 * 根据配置自动切换 Mock API 和真实 API
 *
 * 使用方法：
 * 1. 开发环境下，可通过 localStorage.setItem('DEV_ENABLE_MOCK', 'true') 启用 Mock
 * 2. 或在控制台运行: setMockMode(true)
 * 3. 生产环境始终使用真实 API
 */

import { activityApi as realActivityApi } from '@/api'
import { activityMockApi } from '@/mock/activityMockApi'
import { shouldUseMock } from '@/utils/mockHelper'
import type {
  ActivityListParams,
  ActivityListResponse,
  ActivityCreateData,
  ActivityBookingData,
  ActivityRatingData
} from '@/types/activity'
import type {
  ActivityInterface,
  ActivityBookingInterface,
  ActivityRatingInterface,
  ActivityDiscussionInterface,
  DiscussCommentInterface
} from '@/types/activity'

/**
 * 活动 API 适配器
 * 统一接口，自动切换 Mock/Real
 */
export const activityAdapter = {
  // ========== 公开接口 ==========

  /**
   * 获取活动列表
   */
  async getPublicActivities(params?: ActivityListParams) {
    if (shouldUseMock()) {
      return activityMockApi.getPublicActivities(params)
    }
    return realActivityApi.getPublicActivities(params)
  },

  /**
   * 获取活动详情
   */
  async getPublicActivityDetail(activityId: number) {
    if (shouldUseMock()) {
      return activityMockApi.getPublicActivityDetail(activityId)
    }
    return realActivityApi.getPublicActivityDetail(activityId)
  },

  // ========== 认证接口 ==========

  /**
   * 创建活动
   */
  async createActivity(activityData: ActivityCreateData & { organizer_id: number }) {
    if (shouldUseMock()) {
      return activityMockApi.createActivity(activityData)
    }
    return realActivityApi.createActivity(activityData)
  },

  /**
   * 更新活动
   */
  async updateActivity(activityId: number, updates: Partial<ActivityInterface>) {
    if (shouldUseMock()) {
      return activityMockApi.updateActivity(activityId, updates)
    }
    return realActivityApi.updateActivity(activityId, updates)
  },

  /**
   * 删除活动
   */
  async deleteActivity(activityId: number) {
    if (shouldUseMock()) {
      return activityMockApi.deleteActivity(activityId)
    }
    return realActivityApi.cancelActivity(activityId)
  },

  /**
   * 活动预约
   */
  async bookActivity(activityId: number, bookingData?: ActivityBookingData) {
    if (shouldUseMock()) {
      return activityMockApi.bookActivity(activityId, bookingData || {})
    }
    return realActivityApi.bookActivity(activityId)
  },

  /**
   * 取消预约
   */
  async cancelBooking(activityId: number, userId?: number) {
    if (shouldUseMock()) {
      return activityMockApi.cancelBooking(activityId, userId || 0)
    }
    return realActivityApi.cancelBooking(activityId)
  },

  /**
   * 获取我的预约记录
   */
  async getMyBookings(userId: number, params?: { page?: number; size?: number; status?: string }) {
    if (shouldUseMock()) {
      return activityMockApi.getMyBookings(userId, params)
    }
    return realActivityApi.getMyBookings(params)
  },

  /**
   * 获取我创建的活动
   */
  async getMyActivities(organizerId: number, params?: { page?: number; size?: number }) {
    if (shouldUseMock()) {
      return activityMockApi.getMyActivities(organizerId, params)
    }
    return realActivityApi.getMyActivities(params)
  },

  // ========== 讨论功能 ==========

  /**
   * 创建活动讨论
   */
  async createDiscussion(
    activityId: number,
    discussionData: {
      user_id?: number
      user_display_name?: string
      user_avatar?: string
      title?: string
      content: string
      images?: string[]
    }
  ) {
    if (shouldUseMock()) {
      // Mock 模式下需要补充当前用户信息
      const storedUser = localStorage.getItem('auth_user')
      const currentUser = storedUser ? JSON.parse(storedUser) : null

      if (currentUser && !discussionData.user_id) {
        // 添加用户信息到讨论数据
        const discussionDataWithUser = {
          ...discussionData,
          user_id: currentUser.id,
          user_display_name: currentUser.username || currentUser.nickname || '匿名用户',
          user_avatar: currentUser.avatar || '',
          title: discussionData.title || '讨论'
        }
        return activityMockApi.createDiscussion(activityId, discussionDataWithUser)
      }

      return activityMockApi.createDiscussion(activityId, discussionData)
    }
    return realActivityApi.createDiscussion(activityId, {
      activity_id: activityId,
      content: discussionData.content
    })
  },

  /**
   * 获取活动讨论列表
   */
  async getDiscussions(activityId: number, params?: { page?: number; size?: number }) {
    if (shouldUseMock()) {
      return activityMockApi.getDiscussions(activityId, params)
    }
    return realActivityApi.getDiscussions(activityId, params)
  },

  /**
   * 创建讨论留言
   */
  async createComment(
    discussId: number,
    commentData: {
      user_id: number
      user_display_name: string
      user_avatar?: string
      content: string
    }
  ) {
    if (shouldUseMock()) {
      return activityMockApi.createComment(discussId, commentData)
    }
    return realActivityApi.createDiscussionComment(discussId, {
      discussion_id: discussId,
      content: commentData.content
    })
  },

  /**
   * 获取讨论留言列表
   */
  async getComments(discussId: number, params?: { page?: number; size?: number }) {
    if (shouldUseMock()) {
      return activityMockApi.getComments(discussId, params)
    }
    return realActivityApi.getPublicDiscussionComments(discussId, params)
  },

  // ========== 评分功能 ==========

  /**
   * 活动评分
   */
  async rateActivity(
    activityId: number,
    ratingData: ActivityRatingData & {
      user_id?: number
      user_display_name?: string
      user_avatar?: string
    }
  ) {
    if (shouldUseMock()) {
      // Mock 模式下需要补充当前用户信息
      const storedUser = localStorage.getItem('auth_user')
      const currentUser = storedUser ? JSON.parse(storedUser) : null

      if (currentUser && !ratingData.user_id) {
        // 添加用户信息到评分数据
        const ratingDataWithUser = {
          ...ratingData,
          user_id: currentUser.id,
          user_display_name: currentUser.username || currentUser.nickname || '匿名用户',
          user_avatar: currentUser.avatar || ''
        }
        return activityMockApi.rateActivity(activityId, ratingDataWithUser)
      }

      return activityMockApi.rateActivity(activityId, ratingData)
    }
    return realActivityApi.rateActivity(activityId, {
      rating: ratingData.rating,
      comment: ratingData.comment
    })
  },

  /**
   * 获取活动评分列表
   */
  async getRatings(activityId: number, params?: { page?: number; size?: number }) {
    if (shouldUseMock()) {
      return activityMockApi.getRatings(activityId, params)
    }
    return realActivityApi.getActivityRatingsDetail(activityId, params)
  },

  // ========== 统计功能 ==========

  /**
   * 获取活动统计
   */
  async getActivityStats(activityId: number) {
    if (shouldUseMock()) {
      return activityMockApi.getActivityStats(activityId)
    }
    return realActivityApi.getUserActivityStats()
  },

  // ========== 缺失的接口（为了完整覆盖 activityApi） ==========

  /**
   * 获取活动详情（认证接口）
   */
  async getActivityDetail(activityId: number) {
    if (shouldUseMock()) {
      return activityMockApi.getPublicActivityDetail(activityId)
    }
    return realActivityApi.getActivityDetail(activityId)
  },

  /**
   * 获取活动评分（公开接口）
   */
  async getActivityRatings(activityId: number, params?: any) {
    if (shouldUseMock()) {
      return activityMockApi.getRatings(activityId, params)
    }
    return realActivityApi.getActivityRatings(activityId, params)
  },

  /**
   * 获取活动评分详情（认证接口）
   */
  async getActivityRatingsDetail(activityId: number, params?: any) {
    if (shouldUseMock()) {
      return activityMockApi.getRatings(activityId, params)
    }
    return realActivityApi.getActivityRatingsDetail(activityId, params)
  },

  /**
   * 创建讨论留言（别名方法）
   */
  async createDiscussionComment(discussionId: number, commentData: any) {
    if (shouldUseMock()) {
      // Mock 模式下需要补充当前用户信息
      const storedUser = localStorage.getItem('auth_user')
      const currentUser = storedUser ? JSON.parse(storedUser) : null

      if (currentUser) {
        // 添加用户信息到评论数据
        const commentDataWithUser = {
          ...commentData,
          user_id: currentUser.id,
          user_display_name: currentUser.username || currentUser.nickname || '匿名用户',
          user_avatar: currentUser.avatar || ''
        }
        return activityMockApi.createComment(discussionId, commentDataWithUser)
      }

      return activityMockApi.createComment(discussionId, commentData)
    }
    return realActivityApi.createDiscussionComment(discussionId, commentData)
  },

  /**
   * 获取讨论留言（认证接口）
   */
  async getDiscussionComments(discussionId: number, params?: any) {
    if (shouldUseMock()) {
      return activityMockApi.getComments(discussionId, params)
    }
    return realActivityApi.getDiscussionComments(discussionId, params)
  },

  /**
   * 获取讨论留言（公开接口）
   */
  async getPublicDiscussionComments(discussionId: number, params?: any) {
    if (shouldUseMock()) {
      return activityMockApi.getComments(discussionId, params)
    }
    return realActivityApi.getPublicDiscussionComments(discussionId, params)
  },

  /**
   * 删除讨论留言
   */
  async deleteDiscussionComment(commentId: number) {
    // Mock API 没有删除评论的方法，临时实现
    if (shouldUseMock()) {
      return { success: true, message: '删除成功（Mock）' }
    }
    return realActivityApi.deleteDiscussionComment(commentId)
  },

  /**
   * 取消活动
   */
  async cancelActivity(activityId: number) {
    if (shouldUseMock()) {
      return activityMockApi.deleteActivity(activityId)
    }
    return realActivityApi.cancelActivity(activityId)
  },

  /**
   * 获取用户活动列表
   */
  async getUserActivities(params?: any) {
    if (shouldUseMock()) {
      // Mock API 需要 organizerId，使用默认值 1
      return activityMockApi.getMyActivities(1, params)
    }
    return realActivityApi.getUserActivitiesList(params)
  }
}

/**
 * 获取当前使用的 API 类型
 */
export function getCurrentApiType(): 'mock' | 'real' {
  return shouldUseMock() ? 'mock' : 'real'
}

/**
 * 显示当前 API 模式提示（开发环境）
 */
export function showApiModeTip(): void {
  if (import.meta.env.DEV) {
    const mode = getCurrentApiType()
    console.log(
      `%c[API] 当前使用 ${mode.toUpperCase()} API`,
      `color: ${mode === 'mock' ? '#e6a23c' : '#67c23a'}; font-weight: bold; font-size: 12px;`
    )
    if (mode === 'mock') {
      console.log(
        '%c[API] 切换到真实 API: setMockMode(false)',
        'color: #909399; font-size: 11px;'
      )
    } else {
      console.log(
        '%c[API] 切换到 Mock API: setMockMode(true)',
        'color: #909399; font-size: 11px;'
      )
    }
  }
}

export default activityAdapter

