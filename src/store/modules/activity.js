import { defineStore } from 'pinia'
import { ref } from 'vue'

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
      const queryString = new URLSearchParams(params).toString()
      const response = await fetch(`/api/activities?${queryString}`)

      if (response.ok) {
        const data = await response.json()
        activities.value = data.activities
        return { success: true, data }
      } else {
        return { success: false, error: '获取活动失败' }
      }
    } catch (error) {
      console.error('Fetch activities error:', error)
      return { success: false, error: '网络错误' }
    } finally {
      loading.value = false
    }
  }

  // 获取单个活动
  const fetchActivity = async (id) => {
    loading.value = true
    try {
      const response = await fetch(`/api/activities/${id}`)

      if (response.ok) {
        const data = await response.json()
        currentActivity.value = data.activity
        return { success: true, data }
      } else {
        return { success: false, error: '获取活动详情失败' }
      }
    } catch (error) {
      console.error('Fetch activity error:', error)
      return { success: false, error: '网络错误' }
    } finally {
      loading.value = false
    }
  }

  // 创建活动（捕鱼者功能）
  const createActivity = async (activityData) => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(activityData)
      })

      if (response.ok) {
        const data = await response.json()
        activities.value.unshift(data.activity)
        myActivities.value.unshift(data.activity)
        return { success: true, data }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.message || '创建活动失败' }
      }
    } catch (error) {
      console.error('Create activity error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 更新活动（捕鱼者功能）
  const updateActivity = async (id, activityData) => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch(`/api/activities/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(activityData)
      })

      if (response.ok) {
        const data = await response.json()
        const index = activities.value.findIndex(activity => activity.id === id)
        if (index !== -1) {
          activities.value[index] = data.activity
        }
        const myIndex = myActivities.value.findIndex(activity => activity.id === id)
        if (myIndex !== -1) {
          myActivities.value[myIndex] = data.activity
        }
        if (currentActivity.value?.id === id) {
          currentActivity.value = data.activity
        }
        return { success: true, data }
      } else {
        return { success: false, error: '更新活动失败' }
      }
    } catch (error) {
      console.error('Update activity error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 删除活动（捕鱼者功能）
  const deleteActivity = async (id) => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch(`/api/activities/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        activities.value = activities.value.filter(activity => activity.id !== id)
        myActivities.value = myActivities.value.filter(activity => activity.id !== id)
        if (currentActivity.value?.id === id) {
          currentActivity.value = null
        }
        return { success: true }
      } else {
        return { success: false, error: '删除活动失败' }
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