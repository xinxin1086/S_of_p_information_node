import { defineStore } from 'pinia'
import { ref } from 'vue'
import { activityApi, adminApi } from '@/api'
import { getStatusesByFilter } from '@/config/activityStatus'

export const useActivityStore = defineStore('activity', () => {
  const activities = ref([])
  const currentActivity = ref(null)
  const myBookings = ref([])
  const myActivities = ref([])
  const loading = ref(false)

  // 获取活动列表
  const fetchActivities = async (params = {}) => {
    loading.value = true
    try {
      const response = await activityApi.getActivityList(params)

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

  // 获取单个活动
  const fetchActivity = async (id) => {
    loading.value = true
    try {
      const response = await activityApi.getActivityDetail(id)

      if (response.success) {
        currentActivity.value = response.data
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message || '获取活动详情失败' }
      }
    } catch (error) {
      console.error('Fetch activity error:', error)
      return { success: false, error: '网络错误' }
    } finally {
      loading.value = false
    }
  }

  // 创建活动（管理员功能）
  const createActivity = async (activityData) => {
    try {
      const response = await adminApi.activity.create(activityData)

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

  // 更新活动（管理员功能）
  const updateActivity = async (id, activityData) => {
    try {
      const response = await adminApi.activity.update(id, activityData)

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
  const bookActivity = async (id, bookingData) => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch(`/api/activities/${id}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      })

      if (response.ok) {
        const data = await response.json()
        return { success: true, data }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.message || '预约失败' }
      }
    } catch (error) {
      console.error('Book activity error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 取消预约
  const cancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        return { success: true, data }
      } else {
        return { success: false, error: '取消预约失败' }
      }
    } catch (error) {
      console.error('Cancel booking error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 获取我的预约
  const fetchMyBookings = async () => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch('/api/user/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        myBookings.value = data.bookings
        return { success: true, data }
      } else {
        return { success: false, error: '获取预约记录失败' }
      }
    } catch (error) {
      console.error('Fetch my bookings error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 获取我的活动（捕鱼者功能）
  const fetchMyActivities = async () => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch('/api/user/activities', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        myActivities.value = data.activities
        return { success: true, data }
      } else {
        return { success: false, error: '获取我的活动失败' }
      }
    } catch (error) {
      console.error('Fetch my activities error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 获取活动统计（捕鱼者功能）
  const fetchActivityStats = async () => {
    try {
      const token = localStorage.getItem('user_token')
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
  const addComment = async (activityId, commentData) => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch(`/api/activities/${activityId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(commentData)
      })

      if (response.ok) {
        const data = await response.json()
        if (currentActivity.value?.id === activityId) {
          currentActivity.value.comments.push(data.comment)
        }
        return { success: true, data }
      } else {
        return { success: false, error: '评论失败' }
      }
    } catch (error) {
      console.error('Add comment error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  return {
    activities,
    currentActivity,
    myBookings,
    myActivities,
    loading,
    fetchActivities,
    fetchActivitiesByFilter,
    fetchActivity,
    createActivity,
    updateActivity,
    deleteActivity,
    bookActivity,
    cancelBooking,
    fetchMyBookings,
    fetchMyActivities,
    fetchActivityStats,
    addComment
  }
})