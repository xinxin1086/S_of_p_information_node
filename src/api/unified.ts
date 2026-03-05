/**
 * 统一 API 调度模块
 * 根据配置自动在 Mock API 和真实 API 之间切换
 *
 * 这是项目唯一的 API 入口，所有组件都应该使用这个模块调用 API
 */

import { activityAdapter } from '@/services/activityAdapter'
import { userAdapter } from '@/services/userAdapter'
import { noticeAdapter } from '@/services/noticeAdapter'
import { adminApi as realAdminApi, noticeApi as realNoticeApi } from './index'
import { shouldUseMock } from '@/utils/mockHelper'
import { activityMockApi } from '@/mock/activityMockApi'
import { userMockApi } from '@/mock/userMockApi'
import { noticeMockApi } from '@/mock/noticeMockApi'
import { scienceMockApi } from '@/mock/scienceMockApi'

// 导出适配器
export { activityAdapter } from '@/services/activityAdapter'
export { userAdapter } from '@/services/userAdapter'
export { noticeAdapter } from '@/services/noticeAdapter'

// 为了向后兼容，导出原始 API（通过适配器）
export { activityAdapter as activityApi } from '@/services/activityAdapter'
export { userAdapter as userApi } from '@/services/userAdapter'

/**
 * 判断是否使用 Mock 模式
 */
function isMockMode(): boolean {
  return shouldUseMock()
}

/**
 * 创建统一的 adminApi（支持 Mock 切换）
 * 这个函数会根据模式自动选择使用真实 API 或 Mock API
 */
function createAdminApi() {
  return {
    // ========== 活动管理 ==========
    activity: {
      // 获取活动列表
      list: (params?: any) => {
        if (isMockMode()) {
          return activityMockApi.getPublicActivities?.(params) || Promise.resolve({ success: true, data: { items: [], total: 0 } })
        }
        return realAdminApi.activity.list(params)
      },

      // 获取活动详情
      get: (id: number, params?: any) => {
        if (isMockMode()) {
          return activityMockApi.getPublicActivityDetail?.(id) || Promise.resolve({ success: true, data: null })
        }
        return realAdminApi.activity.detail?.(id) || Promise.resolve({ success: true, data: null })
      },

      // 创建活动
      create: (data: any) => {
        if (isMockMode()) {
          return activityMockApi.createActivity?.(data) || Promise.resolve({ success: true, data: null })
        }
        return realAdminApi.activity.create(data)
      },

      // 更新活动
      update: (id: number, data: any) => {
        if (isMockMode()) {
          return activityMockApi.updateActivity?.(id, data) || Promise.resolve({ success: true, data: null })
        }
        return realAdminApi.activity.update(id, data)
      },

      // 删除活动
      delete: (id: number) => {
        if (isMockMode()) {
          return activityMockApi.deleteActivity?.(id) || Promise.resolve({ success: true, message: '删除成功' })
        }
        return realAdminApi.activity.delete(id)
      },

      // 批量删除
      batchDelete: (ids: number[]) => {
        if (isMockMode()) {
          return Promise.all(ids.map(id => activityMockApi.deleteActivity?.(id)))
        }
        return realAdminApi.activity.batchDelete?.(ids) || Promise.resolve({ success: true, message: '批量删除成功' })
      }
    },

    // ========== 活动讨论管理 ==========
    activityDiscussion: {
      // 获取讨论列表
      list: (params?: any) => {
        if (isMockMode()) {
          return activityMockApi.getDiscussionList?.(params) || Promise.resolve({ success: true, data: { list: [], total: 0 } })
        }
        return realAdminApi.activityDiscussion?.list?.(params) || Promise.resolve({ success: true, data: { list: [], total: 0 } })
      },

      // 删除讨论
      delete: (id: number | string) => {
        if (isMockMode()) {
          return activityMockApi.deleteDiscussion?.(id) || Promise.resolve({ success: true, message: '删除成功' })
        }
        return realAdminApi.activityDiscussion?.delete?.(id) || Promise.resolve({ success: true, message: '删除成功' })
      },

      // 批量删除讨论
      batchDelete: (ids: number[]) => {
        if (isMockMode()) {
          return activityMockApi.batchDeleteDiscussions?.(ids) || Promise.resolve({ success: true, message: '批量删除成功' })
        }
        return realAdminApi.activityDiscussion?.batchDelete?.(ids) || Promise.resolve({ success: true, message: '批量删除成功' })
      }
    },

    // ========== 活动评分管理 ==========
    activityRating: {
      // 获取评分列表
      list: (params?: any) => {
        if (isMockMode()) {
          return activityMockApi.getRatingList?.(params) || Promise.resolve({ success: true, data: { list: [], total: 0 } })
        }
        return realAdminApi.activityRating?.list?.(params) || Promise.resolve({ success: true, data: { list: [], total: 0 } })
      },

      // 删除评分
      delete: (id: number | string) => {
        if (isMockMode()) {
          return activityMockApi.deleteRating?.(id) || Promise.resolve({ success: true, message: '删除成功' })
        }
        return realAdminApi.activityRating?.delete?.(id) || Promise.resolve({ success: true, message: '删除成功' })
      },

      // 批量删除评分
      batchDelete: (ids: number[]) => {
        if (isMockMode()) {
          return activityMockApi.batchDeleteRatings?.(ids) || Promise.resolve({ success: true, message: '批量删除成功' })
        }
        return realAdminApi.activityRating?.batchDelete?.(ids) || Promise.resolve({ success: true, message: '批量删除成功' })
      }
    },

    // ========== 用户管理 ==========
    user: {
      // 获取用户列表
      list: (params?: any) => {
        if (isMockMode()) {
          return userMockApi.getUserList?.(params) || Promise.resolve({ success: true, data: { items: [], total: 0 } })
        }
        return realAdminApi.getUserList(params)
      },

      // 获取用户详情
      get: (id: number) => {
        if (isMockMode()) {
          return userMockApi.getUserDetail?.(id) || Promise.resolve({ success: true, data: null })
        }
        return realAdminApi.getUserList?.({ keyword: String(id) })
      },

      // 更新用户
      update: (id: number, data: any) => {
        if (isMockMode()) {
          return userMockApi.updateUser?.(id, data) || Promise.resolve({ success: true, data: null })
        }
        return realAdminApi.manageUser(id, { ...data, action: 'update' })
      },

      // 删除用户
      delete: (id: number) => {
        if (isMockMode()) {
          return userMockApi.deleteUser?.(id) || Promise.resolve({ success: true, message: '删除成功' })
        }
        return realAdminApi.deleteUser(id)
      },

      // 管理用户操作
      manage: (id: number, data: any) => {
        if (isMockMode()) {
          if (data.action === 'ban') {
            return userMockApi.toggleUserStatus?.(id, 'ban') || Promise.resolve({ success: true, message: '已封禁' })
          } else if (data.action === 'unban') {
            return userMockApi.toggleUserStatus?.(id, 'unban') || Promise.resolve({ success: true, message: '已解封' })
          }
          return Promise.resolve({ success: false, message: '不支持的操作' })
        }
        return realAdminApi.manageUser(id, data)
      }
    },

    // ========== 内容管理 ==========
    content: {
      // 获取待审核内容
      getPending: (params?: any) => realAdminApi.getPendingContent?.(params) || Promise.resolve({ success: true, data: [] }),

      // 批量审核
      batchReview: (data: any) => realAdminApi.batchReview?.(data) || Promise.resolve({ success: true, message: '审核完成' })
    },

    // ========== 科普管理 ==========
    science: {
      // 获取科普文章列表
      list: (params?: any) => {
        if (isMockMode()) {
          return scienceMockApi.getAdminArticleList?.(params) || Promise.resolve({ success: true, data: { items: [], total: 0 } })
        }
        return realAdminApi.science?.list?.(params) || Promise.resolve({ success: true, data: { items: [], total: 0 } })
      },

      // 获取科普文章详情
      get: (id: number) => {
        if (isMockMode()) {
          return scienceMockApi.getArticleDetail?.(id) || Promise.resolve({ success: true, data: null })
        }
        return realAdminApi.science?.detail?.(id) || Promise.resolve({ success: true, data: null })
      },

      // 创建科普文章
      create: (data: any) => {
        if (isMockMode()) {
          return scienceMockApi.createArticle?.(data) || Promise.resolve({ success: true, message: '创建成功' })
        }
        return realAdminApi.science?.create?.(data) || Promise.resolve({ success: true, message: '创建成功' })
      },

      // 更新科普文章
      update: (id: number, data: any) => {
        if (isMockMode()) {
          return scienceMockApi.updateArticle?.(id, data) || Promise.resolve({ success: true, message: '更新成功' })
        }
        return realAdminApi.science?.update?.(id, data) || Promise.resolve({ success: true, message: '更新成功' })
      },

      // 删除科普文章
      delete: (id: number) => {
        if (isMockMode()) {
          return scienceMockApi.deleteArticle?.(id) || Promise.resolve({ success: true, message: '删除成功' })
        }
        return realAdminApi.science?.delete?.(id) || Promise.resolve({ success: true, message: '删除成功' })
      },

      // 批量删除科普文章
      batchDelete: (ids: number[]) => {
        if (isMockMode()) {
          return Promise.all(ids.map(id => scienceMockApi.deleteArticle?.(id)))
            .then(() => ({ success: true, message: `成功删除 ${ids.length} 篇文章` }))
        }
        return realAdminApi.science?.batchDelete?.(ids) || Promise.resolve({ success: true, message: '批量删除成功' })
      },

      // 批量更新状态（发布/下架）
      batchStatus: (data: { article_ids: number[], action: string }) => {
        if (isMockMode()) {
          // Mock 模式下模拟批量状态更新
          return Promise.resolve({ success: true, message: `批量${data.action === 'publish' ? '发布' : '下架'}成功` })
        }
        return realAdminApi.science?.batchStatus?.(data) || Promise.resolve({ success: true, message: '操作成功' })
      },

      // 获取统计数据
      statistics: () => {
        if (isMockMode()) {
          return scienceMockApi.getArticleStats?.() || Promise.resolve({ success: true, data: {} })
        }
        return realAdminApi.science?.statistics?.() || Promise.resolve({ success: true, data: {} })
      }
    }
  }
}

/**
 * 创建统一的 noticeApi（支持 Mock 切换）
 */
function createNoticeApi() {
  return {
    // 获取公开公告列表
    getPublicNotices: (params?: any) => {
      if (isMockMode()) {
        return noticeMockApi.getNoticeList(params)
      }
      return realNoticeApi.getPublicNotices(params)
    },

    // 获取公开公告详情
    getPublicNoticeDetail: (id: number) => {
      if (isMockMode()) {
        return noticeMockApi.getNoticeDetail(id)
      }
      return realNoticeApi.getPublicNoticeDetail(id)
    },

    // 获取最新公告
    getLatestNotices: (params?: any) => {
      if (isMockMode()) {
        return noticeMockApi.getNoticeList({ ...params, size: 5 })
      }
      return realNoticeApi.getLatestNotices(params)
    },

    // 获取置顶公告
    get pinnedNotices() {
      if (isMockMode()) {
        return noticeMockApi.getNoticeList({ is_pinned: true })
      }
      return realNoticeApi.pinnedNotices
    },

    // 获取管理员公告列表
    getAdminNotices: (params?: any) => {
      if (isMockMode()) {
        return noticeMockApi.getAdminNoticeList(params)
      }
      return realNoticeApi.getAdminNotices(params)
    },

    // 创建公告
    createNotice: (data: any) => {
      if (isMockMode()) {
        return noticeMockApi.createNotice(data)
      }
      return realNoticeApi.createNotice(data)
    },

    // 更新公告
    updateNotice: (id: number, data: any) => {
      if (isMockMode()) {
        return noticeMockApi.updateNotice(id, data)
      }
      return realNoticeApi.updateNotice(id, data)
    },

    // 删除公告
    deleteNotice: (id: number) => {
      if (isMockMode()) {
        return noticeMockApi.deleteNotice(id)
      }
      return realNoticeApi.deleteNotice(id)
    }
  }
}

// 创建 adminApi 实例
export const adminApi = createAdminApi()

// 创建 noticeApi 实例
export const noticeApi = createNoticeApi()

// 默认导出（向后兼容）
const api = {
  activity: activityAdapter,
  user: userAdapter,
  notice: noticeAdapter,
  admin: adminApi
}

export default api

// 导出工具函数
export { getCurrentApiType, showApiModeTip, shouldUseMock } from '@/utils/mockHelper'
