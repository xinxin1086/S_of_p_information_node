import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import { ref } from 'vue'

import { scienceApi, adminApi } from '@/api'
import { useApiCall } from '@/composables/useApiCall'

export const useScienceStore = defineStore('science', () => {
  const sciences = ref([])
  const currentScience = ref(null)

  // 获取科普列表 - 使用 useApiCall
  const { execute: fetchSciences, loading: listLoading } = useApiCall(
    scienceApi.getScienceList,
    {
      onSuccess: (data) => {
        const items = data?.items || []
        sciences.value = items
      }
    }
  )

  // 获取单个科普 - 使用 useApiCall
  const { execute: fetchScience } = useApiCall(
    scienceApi.getScienceDetail,
    {
      onSuccess: (data) => {
        currentScience.value = data
      }
    }
  )

  // 创建科普内容（管理员功能）
  const { execute: createScience } = useApiCall(
    adminApi.science.create,
    {
      onSuccess: (data) => {
        if (data) {
          sciences.value.unshift(data)
        }
      }
    }
  )

  // 更新科普内容（管理员功能）
  const { execute: _updateScience } = useApiCall(
    adminApi.science.update,
    {
      onSuccess: (data, args) => {
        if (data) {
          const [id] = args
          const index = sciences.value.findIndex(science => science.id === id)
          if (index !== -1) {
            sciences.value[index] = data
          }
          if (currentScience.value?.id === id) {
            currentScience.value = data
          }
        }
      }
    }
  )

  const updateScience = async (id, scienceData) => {
    return await _updateScience(id, scienceData)
  }

  // 删除科普内容（管理员功能）
  const { execute: _deleteScience } = useApiCall(
    adminApi.science.delete,
    {
      onSuccess: (_, args) => {
        const [id] = args
        sciences.value = sciences.value.filter(science => science.id !== id)
        if (currentScience.value?.id === id) {
          currentScience.value = null
        }
      }
    }
  )

  const deleteScience = async (id) => {
    return await _deleteScience(id)
  }

  // 点赞科普内容 - 使用 useApiCall
  const { execute: _likeScience } = useApiCall(
    scienceApi.likeScience,
    {
      onSuccess: (data, args) => {
        const [id] = args
        // 更新本地状态
        const index = sciences.value.findIndex(science => science.id === id)
        if (index !== -1) {
          sciences.value[index].like_count = data.like_count
        }
        if (currentScience.value?.id === id) {
          currentScience.value.like_count = data.like_count
          currentScience.value.is_liked = data.is_liked
        }
        ElMessage.success(data.action === '点赞' ? '点赞成功' : '取消点赞成功')
      }
    }
  )

  const likeScience = async (id) => {
    return await _likeScience(id)
  }

  // 获取科普文章详情（认证版本）
  const { execute: fetchScienceAuthenticated } = useApiCall(
    scienceApi.getScienceDetailAuthenticated,
    {
      onSuccess: (data) => {
        currentScience.value = data
      }
    }
  )

  // 记录浏览 - 使用 useApiCall
  const { execute: recordVisit } = useApiCall(
    scienceApi.recordScienceVisit,
    { showError: false }
  )

  // 获取点赞状态 - 使用 useApiCall
  const { execute: _getLikeStatus } = useApiCall(
    scienceApi.getScienceLikeStatus,
    { showError: false }
  )

  const getLikeStatus = async (articleIds) => {
    return await _getLikeStatus(articleIds.join(','))
  }

  // 搜索科普内容（保留原实现，因为没有对应的 API 方法）
  const searchSciences = async (keyword) => {
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
    }
  }

  // 审核科普内容（管理员功能）- 保留原实现，因为没有对应的 API 方法
  const reviewScience = async (id, reviewData) => {
    try {
      const token = localStorage.getItem('token')
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

  // 获取待审核科普内容（管理员功能）- 保留原实现，因为没有对应的 API 方法
  const fetchPendingSciences = async () => {
    try {
      const token = localStorage.getItem('token')
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

  return {
    sciences,
    currentScience,
    loading: listLoading,
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