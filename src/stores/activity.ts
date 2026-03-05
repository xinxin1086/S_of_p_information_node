import { defineStore } from 'pinia'
import { ref } from 'vue'

import { activityApi, adminApi } from '@/api'
import { activityAdapter } from '@/services/activityAdapter'
import { useApiCall } from '@/composables/useApiCall'
import { getStatusesByFilter } from '@/config/activityStatus'
import { useAuthStore } from '@/stores/auth'
import { tokenManager } from '@/utils/tokenManager'

export const useActivityStore = defineStore('activity', () => {
  const activities = ref([])
  const currentActivity = ref(null)
  const myBookings = ref([])
  const myActivities = ref([])

  // 获取活动列表（公开接口）- 使用 activityAdapter 支持 Mock 切换
  const { execute: _fetchPublicActivities, loading } = useApiCall(
    (params: any) => activityAdapter.getPublicActivities?.(params) || Promise.resolve({ success: true, data: { items: [], total: 0 } }),
    {
      requireAuth: false, // 公开接口不需要认证
      onSuccess: (data) => {
        const items = data?.items || data || []
        activities.value = items
      }
    }
  )
  const fetchPublicActivities = async (params = {}) => await _fetchPublicActivities(params)

  // 获取活动列表（认证接口）
  const { execute: _fetchActivities } = useApiCall(
    (params: any) => activityAdapter.getPublicActivities?.(params) || Promise.resolve({ success: true, data: { items: [], total: 0 } }),
    {
      requireAuth: false, // 活动列表不需要认证
      onSuccess: (data) => {
        const items = data?.items || data || []
        activities.value = items
      }
    }
  )
  const fetchActivities = async (params = {}) => await _fetchActivities(params)

  // 根据筛选条件获取活动列表
  const fetchActivitiesByFilter = async (filter = 'all', otherParams = {}) => {
    const statuses = getStatusesByFilter(filter)
    return await fetchActivities({
      ...otherParams,
      status: statuses.join(',') // 如果API支持多状态查询
    })
  }

  // 获取单个活动（公开接口）- 使用 activityAdapter 支持 Mock 切换
  const { execute: _fetchPublicActivity } = useApiCall(
    (id: number) => activityAdapter.getPublicActivityDetail?.(id) || Promise.resolve({ success: false, message: 'Activity adapter not found' }),
    {
      requireAuth: false, // 公开接口不需要认证
      onSuccess: (data) => {
        currentActivity.value = data
      }
    }
  )
  const fetchPublicActivity = async (id) => await _fetchPublicActivity(id)

  // 获取单个活动（认证接口）- 保持原有逻辑，先公开接口，后认证接口
  const fetchActivity = async (id) => {
    // 先尝试用公开接口获取
    let result = await _fetchPublicActivity(id)
    if (result.success) {
      return result
    }

    // 如果公开接口失败，尝试用认证接口
    const { execute: _fetchActivityDetail } = useApiCall(
      (id: number) => activityAdapter.getActivityDetail?.(id) || Promise.resolve({ success: false }),
      {
        onSuccess: (data) => {
          currentActivity.value = data
        }
      }
    )
    result = await _fetchActivityDetail(id)
    return result
  }

  // 创建活动（组织者功能）
  const { execute: _createActivity } = useApiCall(
    (data: any) => activityAdapter.createActivity?.(data) || Promise.resolve({ success: false }),
    {
      onSuccess: (data) => {
        if (data) {
          activities.value.unshift(data)
          myActivities.value.unshift(data)
        }
      }
    }
  )
  const createActivity = async (activityData) => await _createActivity(activityData)

  // 更新活动（组织者功能）
  const { execute: _updateActivity } = useApiCall(
    (id: number, data: any) => activityAdapter.updateActivity?.(id, data) || Promise.resolve({ success: false }),
    {
      onSuccess: (data) => {
        if (data) {
          const index = activities.value.findIndex(activity => activity.id === data.id)
          if (index !== -1) {
            activities.value[index] = data
          }
          const myIndex = myActivities.value.findIndex(activity => activity.id === data.id)
          if (myIndex !== -1) {
            myActivities.value[myIndex] = data
          }
          if (currentActivity.value?.id === data.id) {
            currentActivity.value = data
          }
        }
      }
    }
  )
  const updateActivity = async (id, activityData) => await _updateActivity(id, activityData)

  // 删除活动（管理员功能）
  const deleteActivity = async (id) => {
    const { execute } = useApiCall(adminApi.activity.delete, {
      onSuccess: () => {
        activities.value = activities.value.filter(activity => activity.id !== id)
        myActivities.value = myActivities.value.filter(activity => activity.id !== id)
        if (currentActivity.value?.id === id) {
          currentActivity.value = null
        }
      }
    })
    return await execute(id)
  }

  // 预约活动
  const bookActivity = async (id) => {
    // 检查用户身份 - 管理员不能报名活动
    const authStore = useAuthStore()
    if (authStore.user?.role === 'ADMIN' || authStore.user?.role === 'SUPER_ADMIN') {
      return { success: false, error: '管理员账号无法报名参加活动' }
    }

    // 传递 user_id 到 bookingData
    const bookingData = {
      user_id: authStore.user?.id,
      notes: ''
    }

    console.log('[DEBUG activityStore.bookActivity] 预约活动，activityId:', id, 'bookingData:', bookingData)

    const { execute } = useApiCall((id: number, data?: ActivityBookingData) => activityAdapter.bookActivity?.(id, data) || Promise.resolve({ success: false }))
    return await execute(id, bookingData)
  }

  // 取消预约
  const { execute: _cancelBooking } = useApiCall(
    (id: number) => activityAdapter.cancelBooking?.(id) || Promise.resolve({ success: false })
  )
  const cancelBooking = async (activityId) => await _cancelBooking(activityId)

  // 获取我的预约
  const { execute: _fetchMyBookings } = useApiCall(
    (params: any) => activityAdapter.getMyBookings?.(1, params) || Promise.resolve({ success: true, data: { items: [] } }),
    {
      onSuccess: (data) => {
        const items = data?.items || data || []
        myBookings.value = items
      }
    }
  )
  const fetchMyBookings = async (params = {}) => await _fetchMyBookings(params)

  // 获取我的活动（组织者功能）
  const { execute: _fetchMyActivities } = useApiCall(
    (params: any) => activityAdapter.getMyActivities?.(1, params) || Promise.resolve({ success: true, data: { items: [] } }),
    {
      onSuccess: (data) => {
        const items = data?.items || data || []
        myActivities.value = items
      }
    }
  )
  const fetchMyActivities = async (params = {}) => await _fetchMyActivities(params)

  // 获取活动统计（组织者功能）
  const fetchActivityStats = async () => {
    try {
      const token = tokenManager.getAccessToken()
      const response = await fetch('/api/user/activities/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        return { success: true, data }
      } else {
        return { success: false, error: '获取统计数据失败' }
      }
    } catch (error) {
      console.error('Fetch activity stats error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 添加评论
  const createDiscussion = async (activityId, discussionData) => {
    const { execute } = useApiCall(
      (id: number, data: any) => activityAdapter.createDiscussion?.(id, data) || Promise.resolve({ success: false }),
      {
        onSuccess: (data) => {
          if (currentActivity.value?.id === activityId && currentActivity.value.discussions) {
            currentActivity.value.discussions.push(data)
          }
        }
      }
    )
    return await execute(activityId, discussionData)
  }

  // 讨论留言功能

  // 创建讨论留言（回复讨论）
  const { execute: _createDiscussionComment } = useApiCall(
    (id: number, data: any) => activityAdapter.createDiscussionComment?.(id, data) || Promise.resolve({ success: false })
  )
  const createDiscussionComment = async (discussionId, commentData) =>
    await _createDiscussionComment(discussionId, commentData)

  // 获取讨论留言列表（需要登录）
  const { execute: _fetchDiscussionComments } = useApiCall(
    (id: number, params?: any) => activityAdapter.getDiscussionComments?.(id, params) || Promise.resolve({ success: true, data: { items: [] } }),
    {
      onSuccess: (data) => {
        const items = data?.items || data || []
        return items
      }
    }
  )
  const fetchDiscussionComments = async (discussionId, params = {}) =>
    await _fetchDiscussionComments(discussionId, params)

  // 访客获取讨论留言列表（无需登录）
  const { execute: _fetchPublicDiscussionComments } = useApiCall(
    (id: number, params?: any) => activityAdapter.getPublicDiscussionComments?.(id, params) || Promise.resolve({ success: true, data: { items: [] } }),
    {
      onSuccess: (data) => {
        const items = data?.items || data || []
        return items
      }
    }
  )
  const fetchPublicDiscussionComments = async (discussionId, params = {}) =>
    await _fetchPublicDiscussionComments(discussionId, params)

  // 删除讨论留言
  const { execute: _deleteDiscussionComment } = useApiCall(
    (id: number) => activityAdapter.deleteDiscussionComment?.(id) || Promise.resolve({ success: true })
  )
  const deleteDiscussionComment = async (commentId) =>
    await _deleteDiscussionComment(commentId)

  // 活动评分
  const { execute: _rateActivity } = useApiCall(
    (id: number, data: any) => activityAdapter.rateActivity?.(id, data) || Promise.resolve({ success: false })
  )
  const rateActivity = async (activityId, ratingData) =>
    await _rateActivity(activityId, ratingData)

  // 取消活动
  const { execute: _cancelActivity } = useApiCall(
    (id: number) => activityAdapter.cancelActivity?.(id) || Promise.resolve({ success: false })
  )
  const cancelActivity = async (activityId) => await _cancelActivity(activityId)

  // 获取活动评分（认证接口）- 注意：获取的是评分数据，不是评论数据
  const { execute: _fetchActivityRatingsData } = useApiCall(
    (id: number, params?: any) => activityAdapter.getActivityRatings?.(id, params) || Promise.resolve({ success: true, data: { items: [] } }),
    {
      onSuccess: (data) => {
        const items = data?.items || data || []
        return items
      }
    }
  )
  const fetchActivityRatingsData = async (activityId, params = {}) =>
    await _fetchActivityRatingsData(activityId, params)

  // 获取活动讨论
  const { execute: _fetchDiscussions } = useApiCall(
    (id: number, params?: any) => activityAdapter.getDiscussions?.(id, params) || Promise.resolve({ success: true, data: { items: [] } }),
    {
      onSuccess: (data) => {
        const items = data?.items || data || []
        return items
      }
    }
  )
  const fetchDiscussions = async (activityId, params = {}) =>
    await _fetchDiscussions(activityId, params)

  // 获取用户活动统计
  const { execute: _fetchUserActivityStats } = useApiCall(
    () => activityAdapter.getActivityStats?.(1) || Promise.resolve({ success: true, data: {} })
  )
  const fetchUserActivityStats = async () => await _fetchUserActivityStats()

  // 获取用户活动列表
  const { execute: _fetchUserActivities } = useApiCall(
    (params?: any) => activityAdapter.getUserActivities?.(params) || Promise.resolve({ success: true, data: { items: [] } }),
    {
      onSuccess: (data) => {
        const items = data?.items || data || []
        return items
      }
    }
  )
  const fetchUserActivities = async (params = {}) => await _fetchUserActivities(params)

  // fetchUserInfo 函数已移除 - 直接使用讨论数据中的 author_display 和 author_avatar

  // 获取活动详细评分列表
  const { execute: _fetchActivityRatingsDetail } = useApiCall(
    (id: number, params?: any) => activityAdapter.getActivityRatingsDetail?.(id, params) || Promise.resolve({ success: true, data: { items: [] } }),
    {
      onSuccess: (data) => {
        const items = data?.items || data || []
        return items
      }
    }
  )
  const fetchActivityRatingsDetail = async (activityId, params = {}) =>
    await _fetchActivityRatingsDetail(activityId, params)

  return {
    activities,
    currentActivity,
    myBookings,
    myActivities,
    loading,
    fetchPublicActivities,
    fetchActivities,
    fetchActivitiesByFilter,
    fetchPublicActivity,
    fetchActivity,
    createActivity,
    updateActivity,
    deleteActivity,
    bookActivity,
    cancelBooking,
    fetchMyBookings,
    fetchMyActivities,
    fetchActivityStats,
      rateActivity,
    cancelActivity,
    fetchActivityRatingsData,
    fetchDiscussions,
    createDiscussion,
    createDiscussionComment,
    fetchDiscussionComments,
    fetchPublicDiscussionComments,
    deleteDiscussionComment,
    fetchUserActivityStats,
    fetchUserActivities,
    fetchActivityRatingsDetail
  }
})