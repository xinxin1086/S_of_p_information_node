import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useForumStore = defineStore('forum', () => {
  const posts = ref([])
  const categories = ref([])
  const tags = ref([])
  const currentPost = ref(null)
  const loading = ref(false)

  // 获取帖子列表
  const fetchPosts = async (params = {}) => {
    loading.value = true
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await fetch(`/api/forum/posts?${queryString}`)

      if (response.ok) {
        const data = await response.json()
        posts.value = data.posts
        return { success: true, data }
      } else {
        return { success: false, error: '获取帖子失败' }
      }
    } catch (error) {
      console.error('Fetch posts error:', error)
      return { success: false, error: '网络错误' }
    } finally {
      loading.value = false
    }
  }

  // 获取单个帖子
  const fetchPost = async (id) => {
    loading.value = true
    try {
      const response = await fetch(`/api/forum/posts/${id}`)

      if (response.ok) {
        const data = await response.json()
        currentPost.value = data.post
        return { success: true, data }
      } else {
        return { success: false, error: '获取帖子详情失败' }
      }
    } catch (error) {
      console.error('Fetch post error:', error)
      return { success: false, error: '网络错误' }
    } finally {
      loading.value = false
    }
  }

  // 创建帖子
  const createPost = async (postData) => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      })

      if (response.ok) {
        const data = await response.json()
        posts.value.unshift(data.post)
        return { success: true, data }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.message || '发布失败' }
      }
    } catch (error) {
      console.error('Create post error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 更新帖子
  const updatePost = async (id, postData) => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch(`/api/forum/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      })

      if (response.ok) {
        const data = await response.json()
        const index = posts.value.findIndex(post => post.id === id)
        if (index !== -1) {
          posts.value[index] = data.post
        }
        if (currentPost.value?.id === id) {
          currentPost.value = data.post
        }
        return { success: true, data }
      } else {
        return { success: false, error: '更新失败' }
      }
    } catch (error) {
      console.error('Update post error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 删除帖子
  const deletePost = async (id) => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch(`/api/forum/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        posts.value = posts.value.filter(post => post.id !== id)
        if (currentPost.value?.id === id) {
          currentPost.value = null
        }
        return { success: true }
      } else {
        return { success: false, error: '删除失败' }
      }
    } catch (error) {
      console.error('Delete post error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 添加评论
  const addComment = async (postId, commentData) => {
    try {
      const token = localStorage.getItem('user_token')
      const response = await fetch(`/api/forum/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(commentData)
      })

      if (response.ok) {
        const data = await response.json()
        if (currentPost.value?.id === postId) {
          currentPost.value.comments.push(data.comment)
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

  // 获取分类
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/forum/categories')

      if (response.ok) {
        const data = await response.json()
        categories.value = data.categories
        return { success: true, data }
      } else {
        return { success: false, error: '获取分类失败' }
      }
    } catch (error) {
      console.error('Fetch categories error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 获取标签
  const fetchTags = async () => {
    try {
      const response = await fetch('/api/forum/tags')

      if (response.ok) {
        const data = await response.json()
        tags.value = data.tags
        return { success: true, data }
      } else {
        return { success: false, error: '获取标签失败' }
      }
    } catch (error) {
      console.error('Fetch tags error:', error)
      return { success: false, error: '网络错误' }
    }
  }

  // 搜索帖子
  const searchPosts = async (keyword) => {
    loading.value = true
    try {
      const response = await fetch(`/api/forum/search?q=${encodeURIComponent(keyword)}`)

      if (response.ok) {
        const data = await response.json()
        posts.value = data.posts
        return { success: true, data }
      } else {
        return { success: false, error: '搜索失败' }
      }
    } catch (error) {
      console.error('Search posts error:', error)
      return { success: false, error: '网络错误' }
    } finally {
      loading.value = false
    }
  }

  return {
    posts,
    categories,
    tags,
    currentPost,
    loading,
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    addComment,
    fetchCategories,
    fetchTags,
    searchPosts
  }
})