import { api } from '@/utils/common/request'

// 科普文章API接口
export const scienceApi = {
  // 获取科普文章列表（公开接口）
  getScienceList(params = {}) {
    return api.get('/api/common/science/list', params)
  },

  // 获取科普文章详情（公开接口）
  getScienceDetail(articleId) {
    return api.get(`/api/common/science/detail/${articleId}`)
  }
}

// 活动API接口
export const activityApi = {
  // ========== 公开接口（无需认证） ==========

  // 获取活动列表（公开接口）
  getPublicActivities(params = {}) {
    return api.get('/api/visit/activities', params)
  },

  // 获取活动详情（公开接口）
  getPublicActivityDetail(activityId) {
    return api.get(`/api/visit/activities/${activityId}`)
  },

  // 获取活动评分（公开接口）- 注意：这个接口返回的是评分数据，不是评论数据
  getActivityRatings(activityId, params = {}) {
    return api.get(`/api/visit/activities/${activityId}/comments`, params)
  },

  // ========== 认证接口（需要JWT Token） ==========

  // 创建活动
  createActivity(activityData) {
    const token = localStorage.getItem('user_token')
    return api.post('/api/activities/', activityData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 获取活动详情（认证接口，可获取更多信息）
  getActivityDetail(activityId) {
    const token = localStorage.getItem('user_token')
    return api.get(`/api/activities/${activityId}`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 活动预约
  bookActivity(activityId) {
    const token = localStorage.getItem('user_token')
    return api.post(`/api/activities/${activityId}/booking`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 取消活动预约
  cancelBooking(activityId) {
    const token = localStorage.getItem('user_token')
    return api.delete(`/api/activities/${activityId}/booking`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 获取我的预约记录
  getMyBookings(params = {}) {
    const token = localStorage.getItem('user_token')
    return api.get('/api/activities/my-bookings', params, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 添加活动评论
  addComment(activityId, commentData) {
    const token = localStorage.getItem('user_token')
    return api.post(`/api/activities/${activityId}/comments`, commentData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 活动评分
  rateActivity(activityId, ratingData) {
    const token = localStorage.getItem('user_token')
    return api.post(`/api/activities/${activityId}/ratings`, ratingData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 获取活动评分详情列表（公开接口）- 注意：此接口返回详细的评分信息，与上面的comments接口不同
  getActivityRatingsDetail(activityId, params = {}) {
    return api.get(`/api/visit/activities/${activityId}/ratings`, params)
  },

  // 获取活动讨论列表（公开接口）
  getActivityDiscussions(activityId, params = {}) {
    return api.get(`/api/visit/activities/${activityId}/discussions`, params)
  },

  // ========== 组织者专属功能 ==========

  // 获取我创建的活动
  getMyActivities(params = {}) {
    const token = localStorage.getItem('user_token')
    return api.get('/api/activities/my-activities', params, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 更新活动信息
  updateActivity(activityId, activityData) {
    const token = localStorage.getItem('user_token')
    return api.put(`/api/activities/${activityId}`, activityData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 取消活动
  cancelActivity(activityId) {
    const token = localStorage.getItem('user_token')
    return api.post(`/api/activities/${activityId}/cancel`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 活动讨论功能（获取使用公开接口，创建使用认证接口）
  getDiscussions(activityId, params = {}) {
    return api.get(`/api/visit/activities/${activityId}/discussions`, params)
  },

  createDiscussion(activityId, discussionData) {
    const token = localStorage.getItem('user_token')
    return api.post(`/api/activities/${activityId}/discussions`, discussionData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 讨论留言功能

  // 创建讨论留言（回复讨论）
  createDiscussionComment(discussionId, commentData) {
    const token = localStorage.getItem('user_token')
    return api.post(`/api/activities/discussions/${discussionId}/comments`, commentData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 获取讨论留言列表
  getDiscussionComments(discussionId, params = {}) {
    const token = localStorage.getItem('user_token')
    return api.get(`/api/activities/discussions/${discussionId}/comments`, params, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 访客获取讨论留言列表（无需登录）
  getPublicDiscussionComments(discussionId, params = {}) {
    return api.get(`/api/visit/discussions/${discussionId}/comments`, params)
  },

  // 删除讨论留言
  deleteDiscussionComment(commentId) {
    const token = localStorage.getItem('user_token')
    console.log('🔵 API: 开始调用删除接口, commentId:', commentId)
    console.log('🔵 API: 请求URL:', `/api/activities/discussions/comments/${commentId}`)
    console.log('🔵 API: Token存在:', !!token)

    return api.delete(`/api/activities/discussions/comments/${commentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(response => {
      console.log('🔵 API: 删除接口响应成功:', response)
      return response
    }).catch(error => {
      console.error('🔵 API: 删除接口响应失败:', error)
      console.error('🔵 API: 错误详情:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      })
      throw error
    })
  },

  // 用户活动统计
  getUserActivityStats() {
    const token = localStorage.getItem('user_token')
    return api.get('/api/user/activities/stats', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // 用户活动相关
  getUserActivities(params = {}) {
    const token = localStorage.getItem('user_token')
    return api.get('/api/user/activities', params, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  },

  // getUserInfo 接口已移除 - 讨论数据中已包含 author_display 和 author_avatar
}

// 管理员API接口
export const adminApi = {
  // 通用操作接口
  operate(operationData) {
    return api.post('/api/admin/operate', operationData)
  },

  // 管理员查询接口
  getList(params = {}) {
    return api.get('/api/admin/list', params)
  },

  // 科普文章管理
  science: {
    // 创建科普文章
    create(data) {
      return adminApi.operate({
        table: 'science_articles',
        operation: 'create',
        data
      })
    },

    // 更新科普文章
    update(id, data) {
      return adminApi.operate({
        table: 'science_articles',
        operation: 'update',
        id,
        data
      })
    },

    // 删除科普文章
    delete(id) {
      return adminApi.operate({
        table: 'science_articles',
        operation: 'delete',
        id
      })
    },

    // 获取科普文章列表
    list(params = {}) {
      return adminApi.getList({
        ...params,
        table: 'science_articles'
      })
    }
  },

  // 公告管理
  notice: {
    // 获取公告列表
    list(params = {}) {
      return adminApi.operate({
        table_name: 'notice',
        operate_type: 'list',
        page: params.page || 1,
        size: params.size || 10,
        kwargs: params.kwargs || {}
      })
    },

    // 获取公告详情（通过列表获取单个详情）
    detail(id) {
      return adminApi.operate({
        table_name: 'notice',
        operate_type: 'list',
        page: 1,
        size: 1000, // 获取大量数据来查找特定ID
        kwargs: { id }
      })
    },

    // 创建公告
    create(data) {
      return adminApi.operate({
        table_name: 'notice',
        operate_type: 'create',
        kwargs: data
      })
    },

    // 更新公告
    update(id, data) {
      return adminApi.operate({
        table_name: 'notice',
        operate_type: 'update',
        kwargs: {
          id,
          ...data
        }
      })
    },

    // 删除公告
    delete(id) {
      return adminApi.operate({
        table_name: 'notice',
        operate_type: 'delete',
        kwargs: { id }
      })
    },

    // 批量删除公告
    batchDelete(ids) {
      return adminApi.operate({
        table_name: 'notice',
        operate_type: 'batch_delete',
        kwargs: { ids }
      })
    }
  },

  // 活动管理
  activity: {
    // 创建活动
    create(data) {
      return adminApi.operate({
        table: 'activities',
        operation: 'create',
        data
      })
    },

    // 更新活动
    update(id, data) {
      return adminApi.operate({
        table: 'activities',
        operation: 'update',
        id,
        data
      })
    },

    // 删除活动
    delete(id) {
      return adminApi.operate({
        table: 'activities',
        operation: 'delete',
        id
      })
    },

    // 获取活动列表
    list(params = {}) {
      return adminApi.getList({
        ...params,
        table: 'activities'
      })
    },

    // 批量更新用户显示信息
    updateUserDisplays() {
      return api.post('/api/admin/activity/update-user-displays')
    }
  },

  // 活动评分管理
  activityRating: {
    // 获取评分列表
    list(params = {}) {
      return adminApi.operate({
        table_name: 'activity_rating',
        operate_type: 'list',
        page: params.page || 1,
        size: params.size || 10,
        kwargs: params.kwargs || {}
      })
    },

    // 删除评分
    delete(id) {
      return adminApi.operate({
        table_name: 'activity_rating',
        operate_type: 'delete',
        kwargs: { id }
      })
    }
  },

  // 活动讨论管理
  activityDiscussion: {
    // 获取讨论列表
    list(params = {}) {
      return adminApi.operate({
        table_name: 'activity_discuss',
        operate_type: 'list',
        page: params.page || 1,
        size: params.size || 10,
        kwargs: params.kwargs || {}
      })
    },

    // 删除讨论
    delete(id) {
      return adminApi.operate({
        table_name: 'activity_discuss',
        operate_type: 'delete',
        kwargs: { id }
      })
    }
  },

  // 讨论留言管理
  discussComment: {
    // 获取留言列表
    list(params = {}) {
      return adminApi.operate({
        table_name: 'activity_discuss_comment',
        operate_type: 'list',
        page: params.page || 1,
        size: params.size || 10,
        kwargs: params.kwargs || {}
      })
    },

    // 删除留言
    delete(id) {
      return adminApi.operate({
        table_name: 'activity_discuss_comment',
        operate_type: 'delete',
        kwargs: { id }
      })
    }
  }
}

export default {
  scienceApi,
  activityApi,
  adminApi
}