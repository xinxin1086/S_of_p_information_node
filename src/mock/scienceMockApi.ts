/**
 * 科普文章 Mock API
 * 模拟后端科普文章相关接口
 */

import mockScienceArticles, {
  ScienceArticleInterface,
  mockScienceArticleLikes,
  mockScienceArticleVisits,
  getScienceArticleStats
} from './scienceMockData'
import {
  getScienceArticleLikes,
  addScienceArticleLike,
  saveScienceArticleLikes,
  getScienceArticleVisits,
  addOrUpdateScienceArticleVisit,
  saveScienceArticleVisits
} from './scienceMockStorage'

/**
 * 模拟网络延迟
 */
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms))

async function mockDelay(): Promise<void> {
  await delay(300 + Math.random() * 500)
}

/**
 * 科普文章 Mock API
 */
export const scienceMockApi = {
  /**
   * 获取科普文章列表（公开接口）
   */
  async getArticleList(params?: {
    page?: number
    size?: number
    title?: string
    status?: string
    author_id?: number | string
  }): Promise<{
    success: boolean
    data: {
      items: ScienceArticleInterface[]
      total: number
      page: number
      size: number
    }
  }> {
    await mockDelay()

    let articles = [...mockScienceArticles].filter(a => !a.is_deleted)

    // 标题搜索
    if (params?.title) {
      articles = articles.filter(a =>
        a.title.toLowerCase().includes(params.title!.toLowerCase())
      )
    }

    // 状态筛选
    if (params?.status) {
      articles = articles.filter(a => a.status === params.status)
    }

    // 作者筛选（支持字符串和数字类型）
    if (params?.author_id) {
      const authorId = typeof params.author_id === 'string' ? parseInt(params.author_id, 10) : params.author_id
      articles = articles.filter(a => a.author_user_id === authorId)
    }

    // 排序：最新发布的在前
    articles.sort((a, b) => {
      const dateA = a.published_at ? new Date(a.published_at).getTime() : new Date(a.created_at).getTime()
      const dateB = b.published_at ? new Date(b.published_at).getTime() : new Date(b.created_at).getTime()
      return dateB - dateA
    })

    const total = articles.length
    const page = params?.page || 1
    const size = params?.size || 10
    const start = (page - 1) * size
    const items = articles.slice(start, start + size)

    return {
      success: true,
      data: {
        items,
        total,
        page,
        size
      }
    }
  },

  /**
   * 获取科普文章详情（公开接口）
   */
  async getArticleDetail(id: number | string): Promise<{
    success: boolean
    data: ScienceArticleInterface | null
    message?: string
  }> {
    await mockDelay()

    // 将 id 转换为数字（支持字符串和数字类型）
    const articleId = typeof id === 'string' ? parseInt(id, 10) : id

    const article = mockScienceArticles.find(a => a.id === articleId && !a.is_deleted)

    if (!article) {
      return {
        success: false,
        data: null,
        message: `文章不存在 (ID: ${articleId})`
      }
    }

    // 增加浏览次数
    article.view_count += 1

    return {
      success: true,
      data: article
    }
  },

  /**
   * 管理员获取文章列表
   */
  async getAdminArticleList(params?: {
    page?: number
    size?: number
    title?: string
    status?: string
  }): Promise<{
    success: boolean
    data: {
      items: ScienceArticleInterface[]
      total: number
      page: number
      size: number
    }
  }> {
    await mockDelay()

    let articles = [...mockScienceArticles].filter(a => !a.is_deleted)

    // 标题搜索
    if (params?.title) {
      articles = articles.filter(a =>
        a.title.toLowerCase().includes(params.title!.toLowerCase())
      )
    }

    // 状态筛选
    if (params?.status) {
      articles = articles.filter(a => a.status === params.status)
    }

    const total = articles.length
    const page = params?.page || 1
    const size = params?.size || 10
    const start = (page - 1) * size
    const items = articles.slice(start, start + size)

    return {
      success: true,
      data: {
        items,
        total,
        page,
        size
      }
    }
  },

  /**
   * 管理员创建文章
   */
  async createArticle(data: Partial<ScienceArticleInterface>): Promise<{
    success: boolean
    message: string
    data?: ScienceArticleInterface
  }> {
    await mockDelay()

    const newId = Math.max(...mockScienceArticles.map(a => a.id)) + 1
    const newArticle: ScienceArticleInterface = {
      id: newId,
      title: data.title || '新文章',
      content: data.content || '',
      cover_image: data.cover_image || null,
      status: data.status || 'draft',
      like_count: 0,
      view_count: 0,
      published_at: data.status === 'published' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author_user_id: data.author_user_id || 1,
      author_display: data.author_display || '管理员（管理员）',
      is_deleted: false
    }

    mockScienceArticles.push(newArticle)

    return {
      success: true,
      message: '创建成功',
      data: newArticle
    }
  },

  /**
   * 管理员更新文章
   */
  async updateArticle(
    id: number | string,
    data: Partial<ScienceArticleInterface>
  ): Promise<{
    success: boolean
    message: string
    data?: ScienceArticleInterface
  }> {
    await mockDelay()

    // 将 id 转换为数字（支持字符串和数字类型）
    const articleId = typeof id === 'string' ? parseInt(id, 10) : id

    const index = mockScienceArticles.findIndex(a => a.id === articleId && !a.is_deleted)

    if (index === -1) {
      return {
        success: false,
        message: '文章不存在或已删除'
      }
    }

    mockScienceArticles[index] = {
      ...mockScienceArticles[index],
      ...data,
      updated_at: new Date().toISOString()
    }

    return {
      success: true,
      message: '更新成功',
      data: mockScienceArticles[index]
    }
  },

  /**
   * 管理员删除文章
   */
  async deleteArticle(id: number | string): Promise<{
    success: boolean
    message: string
  }> {
    await mockDelay()

    // 将 id 转换为数字（支持字符串和数字类型）
    const articleId = typeof id === 'string' ? parseInt(id, 10) : id

    const index = mockScienceArticles.findIndex(a => a.id === articleId)

    if (index === -1) {
      return {
        success: false,
        message: '文章不存在'
      }
    }

    mockScienceArticles[index].is_deleted = true

    return {
      success: true,
      message: '删除成功'
    }
  },

  /**
   * 点赞文章
   */
  async likeArticle(articleId: number, userId: number): Promise<{
    success: boolean
    message: string
    data?: {
      like_count: number
      is_liked: boolean
      action: string
    }
  }> {
    await mockDelay()

    // 合并静态和动态点赞数据
    const dynamicLikes = getScienceArticleLikes()
    const allLikes = [...mockScienceArticleLikes]
    dynamicLikes.forEach(like => {
      if (!allLikes.some(l => l.id === like.id)) {
        allLikes.push(like)
      }
    })

    // 检查是否已点赞
    const existingLike = allLikes.find(
      l => l.article_id === articleId && l.user_id === userId
    )

    const article = mockScienceArticles.find(a => a.id === articleId)
    if (!article) {
      return {
        success: false,
        message: '文章不存在'
      }
    }

    if (existingLike) {
      // 已点赞，执行取消点赞操作
      // 从 localStorage 中移除
      const filteredLikes = dynamicLikes.filter(
        l => !(l.article_id === articleId && l.user_id === userId)
      )
      saveScienceArticleLikes(filteredLikes)

      // 减少点赞数
      if (article.like_count > 0) {
        article.like_count -= 1
      }

      return {
        success: true,
        message: '取消点赞成功',
        data: {
          like_count: article.like_count,
          is_liked: false,
          action: '取消点赞'
        }
      }
    }

    // 添加点赞记录到 localStorage
    const newLike = {
      id: Date.now(),
      user_id: userId,
      article_id: articleId,
      created_at: new Date().toISOString()
    }
    addScienceArticleLike(newLike)

    // 增加点赞数
    article.like_count += 1

    return {
      success: true,
      message: '点赞成功',
      data: {
        like_count: article.like_count,
        is_liked: true,
        action: '点赞'
      }
    }
  },

  /**
   * 取消点赞文章
   */
  async unlikeArticle(articleId: number, userId: number): Promise<{
    success: boolean
    message: string
  }> {
    await mockDelay()

    // 合并静态和动态点赞数据
    const dynamicLikes = getScienceArticleLikes()
    const allLikes = [...mockScienceArticleLikes]
    dynamicLikes.forEach(like => {
      if (!allLikes.some(l => l.id === like.id)) {
        allLikes.push(like)
      }
    })

    const index = allLikes.findIndex(
      l => l.article_id === articleId && l.user_id === userId
    )

    if (index === -1) {
      return {
        success: false,
        message: '未点赞过该文章'
      }
    }

    // 从 localStorage 中移除
    const filteredLikes = dynamicLikes.filter(
      l => !(l.article_id === articleId && l.user_id === userId)
    )
    saveScienceArticleLikes(filteredLikes)

    // 减少点赞数
    const article = mockScienceArticles.find(a => a.id === articleId)
    if (article && article.like_count > 0) {
      article.like_count -= 1
    }

    return {
      success: true,
      message: '取消点赞成功'
    }
  },

  /**
   * 获取文章统计数据
   */
  async getArticleStats(): Promise<{
    success: boolean
    data: ReturnType<typeof getScienceArticleStats>
  }> {
    await mockDelay()

    return {
      success: true,
      data: getScienceArticleStats()
    }
  }
}

export default scienceMockApi
