import { defineStore } from 'pinia'
import { ref } from 'vue'
import { scienceApi, adminApi } from '@/api'
import { ElMessage } from 'element-plus'
import { tokenManager } from '@/utils/tokenManager'

export const useScienceStore = defineStore('science', () => {
  const sciences = ref([])
  const currentScience = ref(null)
  const loading = ref(false)

  // 获取科普列表
  const fetchSciences = async (params = {}) => {
    loading.value = true
    try {
      const response = await scienceApi.getScienceList(params)

      if (response.success) {
        // 处理嵌套的数据结构：{data: {items: [...], total: 2}}
        const items = response.data?.items || []
        sciences.value = items
        return { success: true, data: items }
      } else {
        return { success: false, error: response.message || '获取科普内容失败' }
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
      const response = await scienceApi.getScienceDetail(id)

      if (response.success) {
        currentScience.value = response.data
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message || '获取科普详情失败' }
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
      const response = await adminApi.science.create(scienceData)

      if (response.success) {
        if (response.data) {
          sciences.value.unshift(response.data)
        }
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message || '创建科普内容失败' }
      }
    } catch (error) {
      console.error('Create science error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 更新科普内容（管理员功能）
  const updateScience = async (id, scienceData) => {
    try {
      const response = await adminApi.science.update(id, scienceData)

      if (response.success) {
        if (response.data) {
          const index = sciences.value.findIndex(science => science.id === id)
          if (index !== -1) {
            sciences.value[index] = response.data
          }
          if (currentScience.value?.id === id) {
            currentScience.value = response.data
          }
        }
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message || '更新科普内容失败' }
      }
    } catch (error) {
      console.error('Update science error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 删除科普内容（管理员功能）
  const deleteScience = async (id) => {
    try {
      const response = await adminApi.science.delete(id)

      if (response.success) {
        sciences.value = sciences.value.filter(science => science.id !== id)
        if (currentScience.value?.id === id) {
          currentScience.value = null
        }
        return { success: true }
      } else {
        return { success: false, error: response.message || '删除科普内容失败' }
      }
    } catch (error) {
      console.error('Delete science error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 审核科普内容（管理员功能）
  const reviewScience = async (id, reviewData) => {
    try {
      const token = tokenManager.getAccessToken()
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
      const token = tokenManager.getAccessToken()
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
      // 检查是否已登录
      const token = tokenManager.getAccessToken()
      if (!token) {
        ElMessage.warning('请先登录后再点赞')
        return { success: false, error: '用户未登录' }
      }

      // 使用新的API接口
      const response = await scienceApi.likeScience(id)

      if (response.success) {
        // 更新本地状态
        const index = sciences.value.findIndex(science => science.id === id)
        if (index !== -1) {
          sciences.value[index].like_count = response.data.like_count
        }
        if (currentScience.value?.id === id) {
          currentScience.value.like_count = response.data.like_count
          currentScience.value.is_liked = response.data.is_liked
        }
        ElMessage.success(response.data.action === '点赞' ? '点赞成功' : '取消点赞成功')
        return { success: true, data: response.data }
      } else {
        ElMessage.error(response.message || '点赞失败')
        return { success: false, error: response.message || '点赞失败' }
      }
    } catch (error) {
      console.error('Like science error:', error)
      ElMessage.error('网络错误，请稍后重试')
      return { success: false, error: '网络错误' }
    }
  }

  // 获取科普文章详情（认证版本）
  const fetchScienceAuthenticated = async (id) => {
    loading.value = true
    try {
      // 检查是否已登录
      const token = tokenManager.getAccessToken()
      if (!token) {
        // 未登录则使用公开接口
        return await fetchScience(id)
      }

      const response = await scienceApi.getScienceDetailAuthenticated(id)

      if (response.success) {
        currentScience.value = response.data
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message || '获取科普详情失败' }
      }
    } catch (error) {
      console.error('Fetch science authenticated error:', error)
      return { success: false, error: '网络错误' }
    } finally {
      loading.value = false
    }
  }

  // 记录浏览
  const recordVisit = async (id) => {
    try {
      const token = tokenManager.getAccessToken()
      if (!token) {
        return { success: false, error: '用户未登录' }
      }

      const response = await scienceApi.recordScienceVisit(id)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Record visit error:', error)
      return { success: false, error: '记录浏览失败' }
    }
  }

  // 获取点赞状态
  const getLikeStatus = async (articleIds) => {
    try {
      const token = tokenManager.getAccessToken()
      if (!token) {
        return { success: false, error: '用户未登录' }
      }

      const response = await scienceApi.getScienceLikeStatus(articleIds.join(','))
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Get like status error:', error)
      return { success: false, error: '获取点赞状态失败' }
    }
  }

  return {
    sciences,
    currentScience,
    loading,
    fetchSciences,
    fetchScience,
    fetchScienceAuthenticated,
    createScience,
    updateScience,
    deleteScience,
    reviewScience,
    fetchPendingSciences,
    searchSciences,
    likeScience,
    recordVisit,
    getLikeStatus
  }
})