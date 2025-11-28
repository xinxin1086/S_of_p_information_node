import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useScienceStore = defineStore('science', () => {
  const sciences = ref([])
  const currentScience = ref(null)
  const loading = ref(false)

  // 获取科普列表
  const fetchSciences = async (params = {}) => {
    loading.value = true
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await fetch(`/api/sciences?${queryString}`)

      if (response.ok) {
        const data = await response.json()
        sciences.value = data.sciences
        return { success: true, data }
      } else {
        return { success: false, error: '获取科普内容失败' }
      }
    } catch (error) {
      console.error('Fetch sciences error:', error)
      return { success: false, error: '网络错误' }
    } finally {
      loading.value = false
    }
  }

  // 获取单个科普
  const fetchScience = async (id) => {
    loading.value = true
    try {
      const response = await fetch(`/api/sciences/${id}`)

      if (response.ok) {
        const data = await response.json()
        currentScience.value = data.science
        return { success: true, data }
      } else {
        return { success: false, error: '获取科普详情失败' }
      }
    } catch (error) {
      console.error('Fetch science error:', error)
      return { success: false, error: '网络错误' }
    } finally {
      loading.value = false
    }
  }

  // 创建科普内容（管理员功能）
  const createScience = async (scienceData) => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch('/api/admin/sciences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scienceData)
      })

      if (response.ok) {
        const data = await response.json()
        sciences.value.unshift(data.science)
        return { success: true, data }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.message || '创建科普内容失败' }
      }
    } catch (error) {
      console.error('Create science error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 更新科普内容（管理员功能）
  const updateScience = async (id, scienceData) => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch(`/api/admin/sciences/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scienceData)
      })

      if (response.ok) {
        const data = await response.json()
        const index = sciences.value.findIndex(science => science.id === id)
        if (index !== -1) {
          sciences.value[index] = data.science
        }
        if (currentScience.value?.id === id) {
          currentScience.value = data.science
        }
        return { success: true, data }
      } else {
        return { success: false, error: '更新科普内容失败' }
      }
    } catch (error) {
      console.error('Update science error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 删除科普内容（管理员功能）
  const deleteScience = async (id) => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch(`/api/admin/sciences/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        sciences.value = sciences.value.filter(science => science.id !== id)
        if (currentScience.value?.id === id) {
          currentScience.value = null
        }
        return { success: true }
      } else {
        return { success: false, error: '删除科普内容失败' }
      }
    } catch (error) {
      console.error('Delete science error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 审核科普内容（管理员功能）
  const reviewScience = async (id, reviewData) => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch(`/api/admin/sciences/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      })

      if (response.ok) {
        const data = await response.json()
        const index = sciences.value.findIndex(science => science.id === id)
        if (index !== -1) {
          sciences.value[index] = data.science
        }
        if (currentScience.value?.id === id) {
          currentScience.value = data.science
        }
        return { success: true, data }
      } else {
        return { success: false, error: '审核失败' }
      }
    } catch (error) {
      console.error('Review science error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 获取待审核科普内容（管理员功能）
  const fetchPendingSciences = async () => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch('/api/admin/sciences/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        return { success: true, data }
      } else {
        return { success: false, error: '获取待审核科普内容失败' }
      }
    } catch (error) {
      console.error('Fetch pending sciences error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 搜索科普内容
  const searchSciences = async (keyword) => {
    loading.value = true
    try {
      const response = await fetch(`/api/sciences/search?q=${encodeURIComponent(keyword)}`)

      if (response.ok) {
        const data = await response.json()
        sciences.value = data.sciences
        return { success: true, data }
      } else {
        return { success: false, error: '搜索失败' }
      }
    } catch (error) {
      console.error('Search sciences error:', error)
      return { success: false, error: '网络错误' }
    } finally {
      loading.value = false
    }
  }

  // 点赞科普内容
  const likeScience = async (id) => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch(`/api/sciences/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const index = sciences.value.findIndex(science => science.id === id)
        if (index !== -1) {
          sciences.value[index].likes = data.likes
        }
        if (currentScience.value?.id === id) {
          currentScience.value.likes = data.likes
        }
        return { success: true, data }
      } else {
        return { success: false, error: '点赞失败' }
      }
    } catch (error) {
      console.error('Like science error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  return {
    sciences,
    currentScience,
    loading,
    fetchSciences,
    fetchScience,
    createScience,
    updateScience,
    deleteScience,
    reviewScience,
    fetchPendingSciences,
    searchSciences,
    likeScience
  }
})