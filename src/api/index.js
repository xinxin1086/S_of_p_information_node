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
  // 获取活动列表（公开接口）
  getActivityList(params = {}) {
    return api.get('/api/common/activity/list', params)
  },

  // 获取活动详情（公开接口）
  getActivityDetail(activityId) {
    return api.get(`/api/common/activity/detail/${activityId}`)
  }
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
    }
  }
}

export default {
  scienceApi,
  activityApi,
  adminApi
}