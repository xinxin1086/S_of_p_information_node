import { defineStore } from 'pinia'
import { ref } from 'vue'
import { activityApi, adminApi } from '@/api'
import { getStatusesByFilter } from '@/config/activityStatus'
import { useAuthStore } from '@/stores/auth'
import { tokenManager } from '@/utils/tokenManager'

export const useActivityStore = defineStore('activity', () => {
  const activities = ref([])
  const currentActivity = ref(null)
  const myBookings = ref([])
  const myActivities = ref([])
  const loading = ref(false)

  // 获取活动列表（公开接口）
  const fetchPublicActivities = async (params = {}) => {
    loading.value = true
    try {
      const response = await activityApi.getPublicActivities(params)

      if (response.success) {
        // 处理可能的嵌套数据结构
        const items = response.data?.items || response.data || []
        activities.value = items
        return { success: true, data: items }
      } else {
        return { success: false, error: response.message || '获取活动失败' }
      }
    } catch (error) {
      console.error('获取公开活动列表失败:', error)
      // 详细的错误信息处理
      let errorMessage = '网络错误'
      if (error.response?.status === 500) {
        errorMessage = '服务器内部错误，活动列表暂时无法访问'
      } else if (error.response?.status === 404) {
        errorMessage = '活动列表接口不存在'
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = '网络连接失败，请检查网络设置'
      }
      return { success: false, error: errorMessage, details: error.message }
    } finally {
      loading.value = false
    }
  }

  // 获取活动列表（认证接口）
  const fetchActivities = async (params = {}) => {
    loading.value = true
    try {
      const response = await activityApi.getPublicActivities(params)

      if (response.success) {
        // 处理可能的嵌套数据结构
        const items = response.data?.items || response.data || []
        activities.value = items
        return { success: true, data: items }
      } else {
        return { success: false, error: response.message || '获取活动失败' }
      }
    } catch (error) {
      console.error('Fetch activities error:', error)
      // 详细的错误信息处理
      let errorMessage = '网络错误'
      if (error.response?.status === 500) {
        errorMessage = '服务器内部错误，活动列表暂时无法访问'
      } else if (error.response?.status === 404) {
        errorMessage = '活动列表接口不存在'
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = '网络连接失败，请检查网络设置'
      }
      return { success: false, error: errorMessage, details: error.message }
    } finally {
      loading.value = false
    }
  }

  // 根据筛选条件获取活动列表
  const fetchActivitiesByFilter = async (filter = 'all', otherParams = {}) => {
    const statuses = getStatusesByFilter(filter)
    return await fetchActivities({
      ...otherParams,
      status: statuses.join(',') // 如果API支持多状态查询
    })
  }

  // 获取单个活动（公开接口）
  const fetchPublicActivity = async (id) => {
    loading.value = true
    try {
      const response = await activityApi.getPublicActivityDetail(id)

      if (response.success) {
        currentActivity.value = response.data
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message || '获取活动详情失败' }
      }
    } catch (error) {
      console.error('Fetch public activity error:', error)
      return { success: false, error: '网络错误' }
    } finally {
      loading.value = false
    }
  }

  // 获取单个活动（认证接口）
  const fetchActivity = async (id) => {
    loading.value = true
    try {
      // 先尝试用公开接口获取
      let response = await activityApi.getPublicActivityDetail(id)

      if (response.success) {
        currentActivity.value = response.data
        return { success: true, data: response.data }
      } else {
        // 如果公开接口失败，尝试用认证接口
        response = await activityApi.getActivityDetail(id)
        if (response.success) {
          currentActivity.value = response.data
          return { success: true, data: response.data }
        } else {
          return { success: false, error: response.message || '获取活动详情失败' }
        }
      }
    } catch (error) {
      console.error('Fetch activity error:', error)
      return { success: false, error: '网络错误' }
    } finally {
      loading.value = false
    }
  }

  // 创建活动（组织者功能）
  const createActivity = async (activityData) => {
    try {
      const response = await activityApi.createActivity(activityData)

      if (response.success) {
        if (response.data) {
          activities.value.unshift(response.data)
          myActivities.value.unshift(response.data)
        }
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message || '创建活动失败' }
      }
    } catch (error) {
      console.error('Create activity error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 更新活动（组织者功能）
  const updateActivity = async (id, activityData) => {
    try {
      const response = await activityApi.updateActivity(id, activityData)

      if (response.success) {
        if (response.data) {
          const index = activities.value.findIndex(activity => activity.id === id)
          if (index !== -1) {
            activities.value[index] = response.data
          }
          const myIndex = myActivities.value.findIndex(activity => activity.id === id)
          if (myIndex !== -1) {
            myActivities.value[myIndex] = response.data
          }
          if (currentActivity.value?.id === id) {
            currentActivity.value = response.data
          }
        }
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message || '更新活动失败' }
      }
    } catch (error) {
      console.error('Update activity error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 删除活动（管理员功能）
  const deleteActivity = async (id) => {
    try {
      const response = await adminApi.activity.delete(id)

      if (response.success) {
        activities.value = activities.value.filter(activity => activity.id !== id)
        myActivities.value = myActivities.value.filter(activity => activity.id !== id)
        if (currentActivity.value?.id === id) {
          currentActivity.value = null
        }
        return { success: true }
      } else {
        return { success: false, error: response.message || '删除活动失败' }
      }
    } catch (error) {
      console.error('Delete activity error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 预约活动
  const bookActivity = async (id) => {
    try {
      // 检查用户身份 - 管理员不能报名活动
      const authStore = useAuthStore()
      if (authStore.user?.role === 'admin') {
        return { success: false, error: '管理员账号无法报名参加活动' }
      }

      const response = await activityApi.bookActivity(id)

      if (response.success) {
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message || '预约失败' }
      }
    } catch (error) {
      console.error('Book activity error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 取消预约
  const cancelBooking = async (activityId) => {
    try {
      const response = await activityApi.cancelBooking(activityId)

      if (response.success) {
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message || '取消预约失败' }
      }
    } catch (error) {
      console.error('Cancel booking error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 获取我的预约
  const fetchMyBookings = async (params = {}) => {
    try {
      const response = await activityApi.getMyBookings(params)

      if (response.success) {
        const items = response.data?.items || response.data || []
        myBookings.value = items
        return { success: true, data: items }
      } else {
        return { success: false, error: response.message || '获取预约记录失败' }
      }
    } catch (error) {
      console.error('Fetch my bookings error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 获取我的活动（组织者功能）
  const fetchMyActivities = async (params = {}) => {
    try {
      const response = await activityApi.getMyActivities(params)

      if (response.success) {
        const items = response.data?.items || response.data || []
        myActivities.value = items
        return { success: true, data: items }
      } else {
        return { success: false, error: response.message || '获取我的活动失败' }
      }
    } catch (error) {
      console.error('Fetch my activities error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 获取活动统计（捕鱼者功能）
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
    try {
      const response = await activityApi.createDiscussion(activityId, discussionData)

      if (response.success) {
        if (currentActivity.value?.id === activityId && currentActivity.value.discussions) {
          currentActivity.value.discussions.push(response.data)
        }
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message || '讨论创建失败' }
      }
    } catch (error) {
      console.error('Create discussion error:', error)
      // 提供更详细的错误信息
      const status = error.response?.status
      let errorMessage = '网络错误'

      if (status === 500) {
        errorMessage = '服务器内部错误，请稍后再试'
      } else if (status === 401) {
        errorMessage = '请先登录后再发表讨论'
      } else if (status === 403) {
        errorMessage = '没有权限发表讨论'
      } else if (status === 404) {
        errorMessage = '活动不存在或讨论功能不可用'
      } else if (status >= 500) {
        errorMessage = '服务器暂时不可用，请稍后再试'
      }

      return { success: false, error: errorMessage }
    }
  }

  // 讨论留言功能

  // 创建讨论留言（回复讨论）
  const createDiscussionComment = async (discussionId, commentData) => {
    try {
      const response = await activityApi.createDiscussionComment(discussionId, commentData)

      if (response.success) {
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message || '留言创建失败' }
      }
    } catch (error) {
      console.error('Create discussion comment error:', error)
      const status = error.response?.status
      let errorMessage = '网络错误'

      if (status === 500) {
        errorMessage = '服务器内部错误，请稍后再试'
      } else if (status === 401) {
        errorMessage = '请先登录后再留言'
      } else if (status === 403) {
        errorMessage = '没有权限留言'
      } else if (status === 404) {
        errorMessage = '讨论不存在或留言功能不可用'
      }

      return { success: false, error: errorMessage }
    }
  }

  // 获取讨论留言列表（需要登录）
  const fetchDiscussionComments = async (discussionId, params = {}) => {
    try {
      const response = await activityApi.getDiscussionComments(discussionId, params)

      if (response.success) {
        const items = response.data?.items || response.data || []
        return { success: true, data: items }
      } else {
        return { success: false, error: response.message || '获取留言失败' }
      }
    } catch (error) {
      console.error('Fetch discussion comments error:', error)
      const status = error.response?.status
      let errorMessage = '网络错误'

      if (status === 500) {
        errorMessage = '服务器内部错误，请稍后再试'
      } else if (status === 401) {
        errorMessage = '请先登录后再查看留言'
      } else if (status === 403) {
        errorMessage = '没有权限查看留言'
      } else if (status === 404) {
        errorMessage = '讨论不存在或留言列表不可用'
      }

      return { success: false, error: errorMessage }
    }
  }

  // 访客获取讨论留言列表（无需登录）
  const fetchPublicDiscussionComments = async (discussionId, params = {}) => {
    try {
      const response = await activityApi.getPublicDiscussionComments(discussionId, params)

      if (response.success) {
        const items = response.data?.items || response.data || []
        return { success: true, data: items }
      } else {
        return { success: false, error: response.message || '获取留言失败' }
      }
    } catch (error) {
      console.error('Fetch public discussion comments error:', error)
      const status = error.response?.status
      let errorMessage = '网络错误'

      if (status === 500) {
        errorMessage = '服务器内部错误，请稍后再试'
      } else if (status === 404) {
        errorMessage = '讨论不存在或留言列表不可用'
      }

      return { success: false, error: errorMessage }
    }
  }

  // 删除讨论留言
  const deleteDiscussionComment = async (commentId) => {
    console.log('🟢 Store: 开始删除讨论留言, commentId:', commentId)

    try {
      console.log('🟢 Store: 调用 activityApi.deleteDiscussionComment...')
      const response = await activityApi.deleteDiscussionComment(commentId)
      console.log('🟢 Store: API 返回结果:', response)

      if (response.success) {
        console.log('✅ Store: API 调用成功')
        return { success: true, data: response.data }
      } else {
        console.error('❌ Store: API 调用失败:', response.message)
        return { success: false, error: response.message || '删除留言失败' }
      }
    } catch (error) {
      console.error('❌ Store: 删除讨论留言异常:', error)
      console.error('❌ Store: 错误详情:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
      const status = error.response?.status
      let errorMessage = '网络错误'

      if (status === 500) {
        errorMessage = '服务器内部错误，请稍后再试'
      } else if (status === 401) {
        errorMessage = '请先登录后再删除留言'
      } else if (status === 403) {
        errorMessage = '没有权限删除此留言'
      } else if (status === 404) {
        errorMessage = '留言不存在或已被删除'
      }

      return { success: false, error: errorMessage }
    }
  }

  // 活动评分
  const rateActivity = async (activityId, ratingData) => {
    try {
      const response = await activityApi.rateActivity(activityId, ratingData)

      if (response.success) {
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message || '评分失败' }
      }
    } catch (error) {
      console.error('Rate activity error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 取消活动
  const cancelActivity = async (activityId) => {
    try {
      const response = await activityApi.cancelActivity(activityId)

      if (response.success) {
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message || '取消活动失败' }
      }
    } catch (error) {
      console.error('Cancel activity error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 获取活动评分（认证接口）- 注意：获取的是评分数据，不是评论数据
  const fetchActivityRatingsData = async (activityId, params = {}) => {
    try {
      const response = await activityApi.getActivityRatings(activityId, params)

      if (response.success) {
        const items = response.data?.items || response.data || []
        return { success: true, data: items }
      } else {
        return { success: false, error: response.message || '获取评分数据失败' }
      }
    } catch (error) {
      console.error('Fetch activity ratings error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 获取活动讨论
  const fetchDiscussions = async (activityId, params = {}) => {
    try {
      const response = await activityApi.getDiscussions(activityId, params)

      if (response.success) {
        const items = response.data?.items || response.data || []
        return { success: true, data: items }
      } else {
        return { success: false, error: response.message || '获取讨论失败' }
      }
    } catch (error) {
      console.error('Fetch discussions error:', error)
      // 提供更详细的错误信息
      const status = error.response?.status
      let errorMessage = '网络错误'

      if (status === 500) {
        errorMessage = '服务器内部错误，请稍后再试'
      } else if (status === 404) {
        errorMessage = '活动不存在或评论功能不可用'
      } else if (status >= 500) {
        errorMessage = '服务器暂时不可用，请稍后再试'
      }

      return { success: false, error: errorMessage }
    }
  }

  // 获取用户活动统计
  const fetchUserActivityStats = async () => {
    try {
      const response = await activityApi.getUserActivityStats()

      if (response.success) {
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message || '获取统计数据失败' }
      }
    } catch (error) {
      console.error('Fetch user activity stats error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 获取用户活动列表
  const fetchUserActivities = async (params = {}) => {
    try {
      const response = await activityApi.getUserActivities(params)

      if (response.success) {
        const items = response.data?.items || response.data || []
        return { success: true, data: items }
      } else {
        return { success: false, error: response.message || '获取用户活动失败' }
      }
    } catch (error) {
      console.error('Fetch user activities error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // fetchUserInfo 函数已移除 - 直接使用讨论数据中的 author_display 和 author_avatar

  // 获取活动详细评分列表
  const fetchActivityRatingsDetail = async (activityId, params = {}) => {
    try {
      const response = await activityApi.getActivityRatingsDetail(activityId, params)

      if (response.success) {
        const items = response.data?.items || response.data || []
        return { success: true, data: items }
      } else {
        return { success: false, error: response.message || '获取详细评分失败' }
      }
    } catch (error) {
      console.error('Fetch activity ratings detail error:', error)
      return { success: false, error: '网络错误' }
    }
  }

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