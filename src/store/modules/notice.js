import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNoticeStore = defineStore('notice', () => {
  const notices = ref([])
  const currentNotice = ref(null)
  const loading = ref(false)

  // 获取公告列表
  const fetchNotices = async (params = {}) => {
    loading.value = true
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await fetch(`/api/notices?${queryString}`)

      if (response.ok) {
        const data = await response.json()
        notices.value = data.notices
        return { success: true, data }
      } else {
        return { success: false, error: '获取公告失败' }
      }
    } catch (error) {
      console.error('Fetch notices error:', error)
      return { success: false, error: '网络错误' }
    } finally {
      loading.value = false
    }
  }

  // 获取单个公告
  const fetchNotice = async (id) => {
    loading.value = true
    try {
      const response = await fetch(`/api/notices/${id}`)

      if (response.ok) {
        const data = await response.json()
        currentNotice.value = data.notice
        return { success: true, data }
      } else {
        return { success: false, error: '获取公告详情失败' }
      }
    } catch (error) {
      console.error('Fetch notice error:', error)
      return { success: false, error: '网络错误' }
    } finally {
      loading.value = false
    }
  }

  // 创建公告（管理员功能）
  const createNotice = async (noticeData) => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch('/api/admin/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(noticeData)
      })

      if (response.ok) {
        const data = await response.json()
        notices.value.unshift(data.notice)
        return { success: true, data }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.message || '创建公告失败' }
      }
    } catch (error) {
      console.error('Create notice error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 更新公告（管理员功能）
  const updateNotice = async (id, noticeData) => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch(`/api/admin/notices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(noticeData)
      })

      if (response.ok) {
        const data = await response.json()
        const index = notices.value.findIndex(notice => notice.id === id)
        if (index !== -1) {
          notices.value[index] = data.notice
        }
        if (currentNotice.value?.id === id) {
          currentNotice.value = data.notice
        }
        return { success: true, data }
      } else {
        return { success: false, error: '更新公告失败' }
      }
    } catch (error) {
      console.error('Update notice error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 删除公告（管理员功能）
  const deleteNotice = async (id) => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch(`/api/admin/notices/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        notices.value = notices.value.filter(notice => notice.id !== id)
        if (currentNotice.value?.id === id) {
          currentNotice.value = null
        }
        return { success: true }
      } else {
        return { success: false, error: '删除公告失败' }
      }
    } catch (error) {
      console.error('Delete notice error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 审核公告（管理员功能）
  const reviewNotice = async (id, reviewData) => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch(`/api/admin/notices/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      })

      if (response.ok) {
        const data = await response.json()
        const index = notices.value.findIndex(notice => notice.id === id)
        if (index !== -1) {
          notices.value[index] = data.notice
        }
        if (currentNotice.value?.id === id) {
          currentNotice.value = data.notice
        }
        return { success: true, data }
      } else {
        return { success: false, error: '审核失败' }
      }
    } catch (error) {
      console.error('Review notice error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 获取待审核公告（管理员功能）
  const fetchPendingNotices = async () => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch('/api/admin/notices/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        return { success: true, data }
      } else {
        return { success: false, error: '获取待审核公告失败' }
      }
    } catch (error) {
      console.error('Fetch pending notices error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  return {
    notices,
    currentNotice,
    loading,
    fetchNotices,
    fetchNotice,
    createNotice,
    updateNotice,
    deleteNotice,
    reviewNotice,
    fetchPendingNotices
  }
})