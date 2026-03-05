/**
 * 科普文章 API 适配器
 * 根据配置自动切换 Mock API 和真实 API
 *
 * 使用方法：
 * 1. 开发环境下，可通过 localStorage.setItem('DEV_ENABLE_MOCK', 'true') 启用 Mock
 * 2. 或在控制台运行: setMockMode(true)
 * 3. 生产环境始终使用真实 API
 */

import { scienceApi as realScienceApi } from '@/api'
import { scienceMockApi } from '@/mock/scienceMockApi'
import { shouldUseMock } from '@/utils/mockHelper'
import { useAuthStore } from '@/stores'

/**
 * 科普文章 API 适配器
 * 统一接口，自动切换 Mock/Real
 */
export const scienceAdapter = {
  // ========== 公开接口 ==========

  /**
   * 获取科普文章列表
   * 返回格式：{ success: boolean, data: ScienceArticle[], total: number }
   */
  async getScienceList(params?: any) {
    if (shouldUseMock()) {
      const response = await scienceMockApi.getArticleList(params)
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.items || [],
          total: response.data.total || 0
        }
      }
      return { success: false, data: [], total: 0 }
    }
    // 真实 API 返回格式：{ success: true, data: ScienceArticle[] }
    // 需要适配分页信息
    const result = await realScienceApi.getScienceList(params)
    return {
      ...result,
      total: Array.isArray(result.data) ? result.data.length : 0
    }
  },

  /**
   * 获取科普文章详情
   */
  async getScienceDetail(articleId: number) {
    if (shouldUseMock()) {
      return scienceMockApi.getArticleDetail(articleId)
    }
    return realScienceApi.getScienceDetail(articleId)
  },

  // ========== 认证接口 ==========

  /**
   * 获取科普文章详情（认证接口）
   */
  async getScienceDetailAuthenticated(articleId: number) {
    if (shouldUseMock()) {
      return scienceMockApi.getArticleDetail(articleId)
    }
    return realScienceApi.getScienceDetailAuthenticated(articleId)
  },

  /**
   * 科普文章点赞
   */
  async likeScience(articleId: number) {
    if (shouldUseMock()) {
      // Mock 模式下，使用当前登录用户的 ID
      const authStore = useAuthStore()
      const userId = authStore.user?.id || 101
      return scienceMockApi.likeArticle(articleId, userId)
    }
    return realScienceApi.likeScience(articleId)
  },

  /**
   * 记录科普文章浏览
   */
  async recordScienceVisit(articleId: number) {
    if (shouldUseMock()) {
      return { success: true }  // Mock 模式下直接返回成功
    }
    return realScienceApi.recordScienceVisit(articleId)
  },

  /**
   * 获取科普文章点赞状态
   */
  async getScienceLikeStatus(articleIds: number[]) {
    if (shouldUseMock()) {
      return { success: true, data: {} }  // Mock 模式下返回空状态
    }
    return realScienceApi.getScienceLikeStatus({ article_ids: articleIds.join(',') })
  },

  // ========== 用户科普文章管理 ==========

  /**
   * 获取我的科普文章列表
   */
  async getMyArticles(params?: any) {
    if (shouldUseMock()) {
      return scienceMockApi.getArticleList(params)
    }
    return realScienceApi.getMyArticles(params)
  },

  /**
   * 创建科普文章
   */
  async createArticle(articleData: any) {
    if (shouldUseMock()) {
      return scienceMockApi.createArticle(articleData)
    }
    return realScienceApi.createArticle(articleData)
  },

  /**
   * 更新科普文章
   */
  async updateArticle(articleId: number, articleData: any) {
    if (shouldUseMock()) {
      return scienceMockApi.updateArticle(articleId, articleData)
    }
    return realScienceApi.updateArticle(articleId, articleData)
  },

  /**
   * 删除科普文章
   */
  async deleteArticle(articleId: number) {
    if (shouldUseMock()) {
      return scienceMockApi.deleteArticle(articleId)
    }
    return realScienceApi.deleteArticle(articleId)
  }
}

/**
 * 获取当前使用的 API 类型
 */
export function getCurrentApiType(): 'mock' | 'real' {
  return shouldUseMock() ? 'mock' : 'real'
}

/**
 * 显示当前 API 模式提示（开发环境）
 */
export function showApiModeTip(): void {
  if (import.meta.env.DEV) {
    const mode = getCurrentApiType()
    console.log(
      `%c[API] 科普文章 - 当前使用 ${mode.toUpperCase()} API`,
      `color: ${mode === 'mock' ? '#e6a23c' : '#67c23a'}; font-weight: bold; font-size: 12px;`
    )
  }
}

export default scienceAdapter
