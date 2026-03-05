/**
 * 活动 Mock API 服务
 * 模拟后端 API 接口，在开发环境中替代真实 API
 */

import type {
  ActivityInterface,
  ActivityBookingInterface,
  ActivityRatingInterface,
  ActivityDiscussionInterface,
  DiscussCommentInterface
} from '@/types/activity'
import type {
  ActivityListParams,
  ActivityListResponse,
  ActivityCreateData,
  ActivityBookingData,
  ActivityRatingData
} from '@/types/activity'
import { activityStorage, bookingStorage, ratingStorage, discussionStorage, commentStorage, initializeMockData } from './mockStorage'
import { mockActivities, mockBookings, mockRatings, mockDiscussions, mockDiscussComments } from './activityMockData'

// 模拟网络延迟
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 确保 Mock 数据已初始化
 * 如果 localStorage 中没有数据，则从初始数据加载
 */
function ensureMockDataInitialized() {
  const activities = activityStorage.getAll()
  if (activities.length === 0) {
    // 没有活动数据，需要初始化
    initializeMockData({
      activities: mockActivities,
      bookings: mockBookings,
      ratings: mockRatings,
      discussions: mockDiscussions,
      comments: mockDiscussComments
    })
    console.log('[Mock] 活动数据已从初始数据加载到 localStorage')
  }
}

/**
 * 分页辅助函数
 */
function paginate<T>(items: T[], page: number = 1, size: number = 10): {
  items: T[]
  total: number
  page: number
  size: number
  total_pages: number
} {
  const total = items.length
  const total_pages = Math.ceil(total / size)
  const start = (page - 1) * size
  const paginatedItems = items.slice(start, start + size)

  return {
    items: paginatedItems,
    total,
    page,
    size,
    total_pages
  }
}

/**
 * 生成新 ID
 */
function generateId(items: any[]): number {
  if (items.length === 0) return 1
  const maxId = Math.max(...items.map((item) => item.id))
  return maxId + 1
}

/**
 * 活动 Mock API
 */
export const activityMockApi = {
  // ========== 公开接口 ==========

  /**
   * 获取活动列表
   */
  async getPublicActivities(params: ActivityListParams = {}): Promise<{
    success: boolean
    data: ActivityListResponse
    message?: string
  }> {
    await delay()

    // 确保 Mock 数据已初始化
    ensureMockDataInitialized()

    let activities = activityStorage.getAll()

    // 过滤已删除的
    activities = activities.filter((a) => !a.is_deleted)

    // 公开接口默认只返回已发布的活动（除非明确指定要查看草稿）
    if (!params.status) {
      // 没有指定状态时，默认只显示已发布、正在进行、已完成的活动
      activities = activities.filter((a) =>
        a.status === 'published' || a.status === 'ongoing' || a.status === 'completed'
      )
    } else if (params.status !== 'all') {
      // 明确指定了状态且不是 'all'，则按指定状态过滤
      activities = activities.filter((a) => a.status === params.status)
    }
    // 如果 params.status === 'all'，则不过滤状态（显示所有非删除的活动，包括草稿）

    // 类型过滤
    if (params.type) {
      activities = activities.filter((a) => a.type === params.type)
    }

    // 搜索过滤
    if (params.search) {
      const searchLower = params.search.toLowerCase()
      activities = activities.filter(
        (a) =>
          a.title.toLowerCase().includes(searchLower) ||
          a.description.toLowerCase().includes(searchLower)
      )
    }

    // 日期范围过滤
    if (params.start_date) {
      activities = activities.filter((a) => a.start_time >= params.start_date!)
    }
    if (params.end_date) {
      activities = activities.filter((a) => a.end_time <= params.end_date!)
    }

    // 排序（默认按开始时间降序）
    activities.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())

    // 为每个活动添加评分统计信息
    const activitiesWithRatings = activities.map(activity => {
      // 查找该活动的所有评分
      const ratings = ratingStorage.getAll().filter(r => r.activity_id === activity.id)

      // 计算平均分和评分人数
      const rating_count = ratings.length
      const avg_score = rating_count > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / rating_count
        : 0

      return {
        ...activity,
        avg_score: Number(avg_score.toFixed(1)),
        rating_count
      }
    })

    // 分页
    const paginatedResult = paginate(activitiesWithRatings, params.page || 1, params.size || 10)

    return {
      success: true,
      data: paginatedResult
    }
  },

  /**
   * 获取活动详情
   */
  async getPublicActivityDetail(activityId: number): Promise<{
    success: boolean
    data?: ActivityInterface
    message?: string
  }> {
    await delay()

    const activity = activityStorage.findById(activityId)

    if (!activity || activity.is_deleted) {
      return {
        success: false,
        message: '活动不存在或已被删除'
      }
    }

    return {
      success: true,
      data: activity
    }
  },

  // ========== 认证接口 ==========

  /**
   * 创建活动
   */
  async createActivity(
    activityData: ActivityCreateData & { organizer_id: number }
  ): Promise<{
    success: boolean
    data?: ActivityInterface
    message?: string
  }> {
    await delay()

    const activities = activityStorage.getAll()
    const newId = generateId(activities)

    const newActivity: ActivityInterface = {
      id: newId,
      title: activityData.title,
      description: activityData.description,
      content: activityData.content,
      type: activityData.type,
      status: 'draft' as any,
      start_time: activityData.start_time,
      end_time: activityData.end_time,
      location: activityData.location,
      max_participants: activityData.max_participants,
      current_participants: 0,
      organizer_id: activityData.organizer_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false
    }

    activityStorage.add(newActivity)

    return {
      success: true,
      data: newActivity
    }
  },

  /**
   * 更新活动
   */
  async updateActivity(
    activityId: number,
    updates: Partial<ActivityInterface>
  ): Promise<{
    success: boolean
    data?: ActivityInterface
    message?: string
  }> {
    await delay()

    const activity = activityStorage.findById(activityId)
    if (!activity) {
      return {
        success: false,
        message: '活动不存在'
      }
    }

    const updatedActivity = activityStorage.update(activityId, {
      ...updates,
      updated_at: new Date().toISOString()
    })

    return {
      success: true,
      data: updatedActivity
    }
  },

  /**
   * 删除活动（软删除）
   */
  async deleteActivity(activityId: number): Promise<{
    success: boolean
    message?: string
  }> {
    await delay()

    const activity = activityStorage.findById(activityId)
    if (!activity) {
      return {
        success: false,
        message: '活动不存在'
      }
    }

    activityStorage.update(activityId, {
      is_deleted: true,
      updated_at: new Date().toISOString()
    })

    return {
      success: true,
      message: '删除成功'
    }
  },

  /**
   * 活动预约
   */
  async bookActivity(
    activityId: number,
    bookingData: ActivityBookingData
  ): Promise<{
    success: boolean
    data?: ActivityBookingInterface
    message?: string
  }> {
    await delay()

    const activity = activityStorage.findById(activityId)
    if (!activity || activity.is_deleted) {
      return {
        success: false,
        message: '活动不存在'
      }
    }

    // 检查是否已预约
    const existingBooking = bookingStorage
      .getAll()
      .find(
        (b) => b.activity_id === activityId && b.user_id === bookingData.user_id && b.status === 'confirmed'
      )

    if (existingBooking) {
      return {
        success: false,
        message: '您已预约该活动'
      }
    }

    // 检查人数限制
    if (activity.current_participants >= activity.max_participants) {
      return {
        success: false,
        message: '活动人数已满'
      }
    }

    const bookings = bookingStorage.getAll()
    // 确保 user_id 是 number 类型（与 Mock 数据保持一致）
    const userIdNum = typeof bookingData.user_id === 'number'
      ? bookingData.user_id
      : parseInt(bookingData.user_id as any, 10)

    // 验证 user_id 有效
    if (!userIdNum || isNaN(userIdNum)) {
      return {
        success: false,
        message: '用户ID无效'
      }
    }

    const newBooking: ActivityBookingInterface = {
      id: generateId(bookings),
      activity_id: activityId,
      user_id: userIdNum,  // 使用转换后的 number 类型
      booking_time: new Date().toISOString(),
      status: 'confirmed' as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('[DEBUG bookActivity] 创建预约记录:', {
      bookingId: newBooking.id,
      activity_id: newBooking.activity_id,
      user_id: newBooking.user_id,
      user_id_type: typeof newBooking.user_id,
      status: newBooking.status
    })

    bookingStorage.add(newBooking)

    // 更新活动参与人数
    activityStorage.update(activityId, {
      current_participants: activity.current_participants + 1
    })

    return {
      success: true,
      data: newBooking
    }
  },

  /**
   * 取消预约
   */
  async cancelBooking(
    activityId: number,
    userId: number
  ): Promise<{
    success: boolean
    message?: string
  }> {
    await delay()

    const booking = bookingStorage
      .getAll()
      .find(
        (b) => b.activity_id === activityId && b.user_id === userId && b.status === 'confirmed'
      )

    if (!booking) {
      return {
        success: false,
        message: '预约不存在'
      }
    }

    bookingStorage.update(booking.id, {
      status: 'cancelled' as any,
      cancel_time: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    // 更新活动参与人数
    const activity = activityStorage.findById(activityId)
    if (activity && activity.current_participants > 0) {
      activityStorage.update(activityId, {
        current_participants: activity.current_participants - 1
      })
    }

    return {
      success: true,
      message: '取消成功'
    }
  },

  /**
   * 获取我的预约记录
   */
  async getMyBookings(
    userId: number,
    params: { page?: number; size?: number; status?: string } = {}
  ): Promise<{
    success: boolean
    data?: {
      items: any[]
      total: number
      page: number
      size: number
    }
    message?: string
  }> {
    await delay()

    let bookings = bookingStorage.getAll().filter((b) => b.user_id === userId)

    if (params.status) {
      bookings = bookings.filter((b) => b.status === params.status)
    }

    // 按预约时间降序
    bookings.sort((a, b) => new Date(b.booking_time).getTime() - new Date(a.booking_time).getTime())

    const paginatedResult = paginate(bookings, params.page || 1, params.size || 10)

    return {
      success: true,
      data: paginatedResult
    }
  },

  /**
   * 获取我创建的活动
   */
  async getMyActivities(
    organizerId: number,
    params: { page?: number; size?: number } = {}
  ): Promise<{
    success: boolean
    data?: ActivityListResponse
    message?: string
  }> {
    await delay()

    let activities = activityStorage.getAll().filter(
      (a) => a.organizer_id === organizerId && !a.is_deleted
    )

    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const paginatedResult = paginate(activities, params.page || 1, params.size || 10)

    return {
      success: true,
      data: paginatedResult
    }
  },

  // ========== 讨论功能 ==========

  /**
   * 创建活动讨论
   */
  async createDiscussion(
    activityId: number,
    discussionData: {
      user_id: number
      user_display_name: string
      user_avatar?: string
      title: string
      content: string
      images?: string[]
    }
  ): Promise<{
    success: boolean
    data?: ActivityDiscussionInterface
    message?: string
  }> {
    await delay()

    const activity = activityStorage.findById(activityId)
    if (!activity || activity.is_deleted) {
      return {
        success: false,
        message: '活动不存在'
      }
    }

    const discussions = discussionStorage.getAll()
    const newDiscussion: ActivityDiscussionInterface = {
      id: generateId(discussions),
      activity_id: activityId,
      user_id: discussionData.user_id,
      user_display_name: discussionData.user_display_name,
      user_avatar: discussionData.user_avatar,
      title: discussionData.title,
      content: discussionData.content,
      images: discussionData.images,
      like_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    discussionStorage.add(newDiscussion)

    return {
      success: true,
      data: newDiscussion
    }
  },

  /**
   * 获取活动讨论列表
   */
  async getDiscussions(
    activityId: number,
    params: { page?: number; size?: number } = {}
  ): Promise<{
    success: boolean
    data?: {
      items: ActivityDiscussionInterface[]
      total: number
      page: number
      size: number
    }
    message?: string
  }> {
    await delay()

    let discussions = discussionStorage.getAll().filter((d) => d.activity_id === activityId)

    discussions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const paginatedResult = paginate(discussions, params.page || 1, params.size || 10)

    return {
      success: true,
      data: paginatedResult
    }
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
  ): Promise<{
    success: boolean
    data?: DiscussCommentInterface
    message?: string
  }> {
    await delay()

    const discussion = discussionStorage.findById(discussId)
    if (!discussion) {
      return {
        success: false,
        message: '讨论不存在'
      }
    }

    const comments = commentStorage.getAll()
    const newComment: DiscussCommentInterface = {
      id: generateId(comments),
      discussion_id: discussId,
      user_id: commentData.user_id,
      user_display_name: commentData.user_display_name,
      user_avatar: commentData.user_avatar,
      content: commentData.content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    commentStorage.add(newComment)

    return {
      success: true,
      data: newComment
    }
  },

  /**
   * 获取讨论留言列表
   */
  async getComments(
    discussId: number,
    params: { page?: number; size?: number } = {}
  ): Promise<{
    success: boolean
    data?: {
      items: DiscussCommentInterface[]
      total: number
      page: number
      size: number
    }
    message?: string
  }> {
    await delay()

    let comments = commentStorage.getAll().filter((c) => c.discussion_id === discussId)

    comments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    const paginatedResult = paginate(comments, params.page || 1, params.size || 50)

    return {
      success: true,
      data: paginatedResult
    }
  },

  // ========== 评分功能 ==========

  /**
   * 活动评分
   */
  async rateActivity(
    activityId: number,
    ratingData: ActivityRatingData & { user_id: number; user_display_name: string; user_avatar?: string }
  ): Promise<{
    success: boolean
    data?: ActivityRatingInterface
    message?: string
  }> {
    await delay()

    const activity = activityStorage.findById(activityId)
    if (!activity || activity.is_deleted) {
      return {
        success: false,
        message: '活动不存在'
      }
    }

    // 检查是否已评分
    const existingRating = ratingStorage.getAll().find(
      (r) => r.activity_id === activityId && r.user_id === ratingData.user_id
    )

    if (existingRating) {
      // 更新评分
      const updated = ratingStorage.update(existingRating.id, {
        rating: ratingData.rating,
        comment: ratingData.comment,
        updated_at: new Date().toISOString()
      })

      return {
        success: true,
        data: updated
      }
    }

    // 创建新评分
    const ratings = ratingStorage.getAll()
    const newRating: ActivityRatingInterface = {
      id: generateId(ratings),
      activity_id: activityId,
      user_id: ratingData.user_id,
      user_display_name: ratingData.user_display_name,
      user_avatar: ratingData.user_avatar,
      rating: ratingData.rating,
      comment: ratingData.comment,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    ratingStorage.add(newRating)

    return {
      success: true,
      data: newRating
    }
  },

  /**
   * 获取活动评分列表
   */
  async getRatings(
    activityId: number,
    params: { page?: number; size?: number } = {}
  ): Promise<{
    success: boolean
    data?: {
      ratings: ActivityRatingInterface[]
      statistics: {
        average_score: number
        total_count: number
      }
    }
    message?: string
  }> {
    await delay()

    let ratings = ratingStorage.getAll().filter((r) => r.activity_id === activityId)

    ratings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // 计算平均分
    const average =
      ratings.length > 0
        ? Number((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1))
        : 0

    const paginatedResult = paginate(ratings, params.page || 1, params.size || 10)

    return {
      success: true,
      data: {
        ratings: paginatedResult.items,
        statistics: {
          average_score: average,
          total_count: paginatedResult.total
        }
      }
    }
  },

  // ========== 统计功能 ==========

  /**
   * 获取活动统计
   */
  async getActivityStats(activityId: number): Promise<{
    success: boolean
    data?: {
      total_bookings: number
      confirmed_bookings: number
      cancelled_bookings: number
      attended_bookings: number
      total_ratings: number
      average_rating: number
      total_discussions: number
      total_comments: number
    }
    message?: string
  }> {
    await delay()

    const activity = activityStorage.findById(activityId)
    if (!activity) {
      return {
        success: false,
        message: '活动不存在'
      }
    }

    const bookings = bookingStorage.getAll().filter((b) => b.activity_id === activityId)
    const ratings = ratingStorage.getAll().filter((r) => r.activity_id === activityId)
    const discussions = discussionStorage.getAll().filter((d) => d.activity_id === activityId)

    const averageRating =
      ratings.length > 0
        ? Number((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1))
        : 0

    return {
      success: true,
      data: {
        total_bookings: bookings.length,
        confirmed_bookings: bookings.filter((b) => b.status === 'confirmed').length,
        cancelled_bookings: bookings.filter((b) => b.status === 'cancelled').length,
        attended_bookings: bookings.filter((b) => b.status === 'attended').length,
        total_ratings: ratings.length,
        average_rating: averageRating,
        total_discussions: discussions.length,
        total_comments: discussions.reduce((sum, d) => {
          return sum + commentStorage.getAll().filter((c) => c.discussion_id === d.id).length
        }, 0)
      }
    }
  },

  // ========== 管理员讨论管理 ==========

  /**
   * 管理员获取所有讨论列表（支持筛选）
   */
  async getDiscussionList(params?: {
    page?: number
    size?: number
    activity_id?: number | string
    user_display?: string
    content?: string
    kwargs?: Record<string, any>
  }): Promise<{
    success: boolean
    data?: {
      list: ActivityDiscussionInterface[]
      total: number
    }
    message?: string
  }> {
    await delay()

    let discussions = discussionStorage.getAll()

    // 从 kwargs 中获取筛选条件
    const filters = params?.kwargs || {}

    // 按活动ID筛选
    if (filters.activity_id) {
      const activityId = typeof filters.activity_id === 'string' ? parseInt(filters.activity_id, 10) : filters.activity_id
      discussions = discussions.filter((d) => d.activity_id === activityId)
    }

    // 按用户名筛选
    if (filters.user_display) {
      discussions = discussions.filter((d) =>
        d.user_display_name?.toLowerCase().includes(filters.user_display.toLowerCase())
      )
    }

    // 按内容筛选
    if (filters.content) {
      discussions = discussions.filter((d) =>
        d.content?.toLowerCase().includes(filters.content.toLowerCase()) ||
        d.title?.toLowerCase().includes(filters.content.toLowerCase())
      )
    }

    // 排序
    discussions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // 分页
    const page = params?.page || 1
    const size = params?.size || 10
    const total = discussions.length
    const start = (page - 1) * size
    const paginatedDiscussions = discussions.slice(start, start + size)

    return {
      success: true,
      data: {
        list: paginatedDiscussions,
        total
      }
    }
  },

  /**
   * 管理员删除讨论
   */
  async deleteDiscussion(discussionId: number | string): Promise<{
    success: boolean
    message?: string
  }> {
    await delay()

    const id = typeof discussionId === 'string' ? parseInt(discussionId, 10) : discussionId
    const discussion = discussionStorage.findById(id)

    if (!discussion) {
      return {
        success: false,
        message: '讨论不存在'
      }
    }

    // 删除讨论及其关联的评论
    discussionStorage.delete(id)

    // 删除该讨论的所有评论
    const comments = commentStorage.getAll().filter((c) => c.discussion_id === id)
    comments.forEach((comment) => {
      commentStorage.delete(comment.id)
    })

    return {
      success: true,
      message: '删除成功'
    }
  },

  /**
   * 管理员批量删除讨论
   */
  async batchDeleteDiscussions(discussionIds: number[]): Promise<{
    success: boolean
    message?: string
  }> {
    await delay()

    let deletedCount = 0

    for (const id of discussionIds) {
      const discussion = discussionStorage.findById(id)
      if (discussion) {
        // 删除讨论
        discussionStorage.delete(id)

        // 删除该讨论的所有评论
        const comments = commentStorage.getAll().filter((c) => c.discussion_id === id)
        comments.forEach((comment) => {
          commentStorage.delete(comment.id)
        })

        deletedCount++
      }
    }

    return {
      success: true,
      message: `成功删除 ${deletedCount} 条讨论`
    }
  },

  // ========== 管理员评分管理 ==========

  /**
   * 管理员获取所有评分列表（支持筛选）
   */
  async getRatingList(params?: {
    page?: number
    size?: number
    activity_id?: number | string
    user_display?: string
    rating?: string
    kwargs?: Record<string, any>
  }): Promise<{
    success: boolean
    data?: {
      list: ActivityRatingInterface[]
      total: number
    }
    message?: string
  }> {
    await delay()

    let ratings = ratingStorage.getAll()

    // 从 kwargs 中获取筛选条件
    const filters = params?.kwargs || {}

    // 按活动ID筛选
    if (filters.activity_id) {
      const activityId = typeof filters.activity_id === 'string' ? parseInt(filters.activity_id, 10) : filters.activity_id
      ratings = ratings.filter((r) => r.activity_id === activityId)
    }

    // 按用户名筛选
    if (filters.user_display) {
      ratings = ratings.filter((r) =>
        r.user_display_name?.toLowerCase().includes(filters.user_display.toLowerCase())
      )
    }

    // 按评分筛选
    if (filters.rating) {
      const rating = typeof filters.rating === 'string' ? parseInt(filters.rating, 10) : filters.rating
      ratings = ratings.filter((r) => r.rating === rating)
    }

    // 排序
    ratings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // 分页
    const page = params?.page || 1
    const size = params?.size || 10
    const total = ratings.length
    const start = (page - 1) * size
    const paginatedRatings = ratings.slice(start, start + size)

    return {
      success: true,
      data: {
        list: paginatedRatings,
        total
      }
    }
  },

  /**
   * 管理员删除评分
   */
  async deleteRating(ratingId: number | string): Promise<{
    success: boolean
    message?: string
  }> {
    await delay()

    const id = typeof ratingId === 'string' ? parseInt(ratingId, 10) : ratingId
    const rating = ratingStorage.findById(id)

    if (!rating) {
      return {
        success: false,
        message: '评分不存在'
      }
    }

    // 删除评分
    ratingStorage.delete(id)

    return {
      success: true,
      message: '删除成功'
    }
  },

  /**
   * 管理员批量删除评分
   */
  async batchDeleteRatings(ratingIds: number[]): Promise<{
    success: boolean
    message?: string
  }> {
    await delay()

    let deletedCount = 0

    for (const id of ratingIds) {
      const rating = ratingStorage.findById(id)
      if (rating) {
        ratingStorage.delete(id)
        deletedCount++
      }
    }

    return {
      success: true,
      message: `成功删除 ${deletedCount} 条评分`
    }
  }
}

export default activityMockApi
