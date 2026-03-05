/**
 * 公告 Mock API
 * 模拟后端公告相关接口
 */

import mockNotices, { NoticeInterface, getNoticeStats } from './noticeMockData'

// 存储键
const NOTICE_STORAGE_KEY = 'mock_data_notices'
const NOTICE_INITIALIZED_KEY = 'mock_data_notices_initialized'

/**
 * 通用存储操作类
 */
class NoticeStorage {
  /**
   * 获取所有公告
   */
  getAll(): NoticeInterface[] {
    if (typeof window === 'undefined') return mockNotices
    const data = localStorage.getItem(NOTICE_STORAGE_KEY)
    return data ? JSON.parse(data) : mockNotices
  }

  /**
   * 保存所有公告
   */
  saveAll(items: NoticeInterface[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(NOTICE_STORAGE_KEY, JSON.stringify(items))
  }

  /**
   * 根据 ID 查找公告
   */
  findById(id: number): NoticeInterface | undefined {
    const items = this.getAll()
    return items.find(item => item.id === id)
  }

  /**
   * 添加新公告
   */
  add(item: NoticeInterface): NoticeInterface {
    const items = this.getAll()
    items.push(item)
    this.saveAll(items)
    return item
  }

  /**
   * 更新公告
   */
  update(id: number, updates: Partial<NoticeInterface>): NoticeInterface | undefined {
    const items = this.getAll()
    const index = items.findIndex(item => item.id === id)
    if (index !== -1) {
      items[index] = { ...items[index], ...updates }
      this.saveAll(items)
      return items[index]
    }
    return undefined
  }

  /**
   * 删除公告（软删除）
   */
  delete(id: number): boolean {
    const items = this.getAll()
    const index = items.findIndex(item => item.id === id)
    if (index !== -1) {
      items[index].is_deleted = true
      this.saveAll(items)
      return true
    }
    return false
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(NOTICE_STORAGE_KEY)
    localStorage.removeItem(NOTICE_INITIALIZED_KEY)
  }
}

// 创建存储实例
const noticeStorage = new NoticeStorage()

/**
 * 初始化公告持久化数据
 */
function initializeNoticeStorage(): void {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(NOTICE_INITIALIZED_KEY)) {
    return
  }
  // 初始化时将原始数据保存到 localStorage
  noticeStorage.saveAll(mockNotices)
  localStorage.setItem(NOTICE_INITIALIZED_KEY, 'true')
  console.log('[NoticeMock] 公告持久化存储已初始化')
}

// 立即初始化
if (typeof window !== 'undefined') {
  initializeNoticeStorage()
}

/**
 * 模拟网络延迟
 */
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms))

async function mockDelay(): Promise<void> {
  await delay(300 + Math.random() * 500)
}

/**
 * 公告 Mock API
 */
export const noticeMockApi = {
  /**
   * 获取公告列表（公开接口）
   */
  async getNoticeList(params?: {
    page?: number
    size?: number
    title?: string
    notice_type?: string
    release_time_start?: string
    release_time_end?: string
  }): Promise<{
    success: boolean
    data: {
      items: NoticeInterface[]
      total: number
      page: number
      size: number
    }
  }> {
    await mockDelay()

    let notices = noticeStorage.getAll().filter(n => !n.is_deleted)

    // 标题模糊搜索
    if (params?.title) {
      notices = notices.filter(n =>
        n.release_title.toLowerCase().includes(params.title!.toLowerCase())
      )
    }

    // 类型筛选
    if (params?.notice_type) {
      notices = notices.filter(n => n.notice_type === params.notice_type)
    }

    // 时间范围筛选
    if (params?.release_time_start) {
      const startTime = new Date(params.release_time_start)
      notices = notices.filter(n => new Date(n.release_time) >= startTime)
    }

    if (params?.release_time_end) {
      const endTime = new Date(params.release_time_end)
      notices = notices.filter(n => new Date(n.release_time) <= endTime)
    }

    // 排序：最新发布的在前
    notices.sort((a, b) => new Date(b.release_time).getTime() - new Date(a.release_time).getTime())

    const total = notices.length
    const page = params?.page || 1
    const size = params?.size || 10
    const start = (page - 1) * size
    const items = notices.slice(start, start + size)

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
   * 获取公告详情（公开接口）
   */
  async getNoticeDetail(id: number): Promise<{
    success: boolean
    data: NoticeInterface | null
  }> {
    await mockDelay()

    const notice = noticeStorage.getAll().find(n => n.id === id && !n.is_deleted)

    if (!notice) {
      return {
        success: false,
        data: null
      }
    }

    return {
      success: true,
      data: notice
    }
  },

  /**
   * 管理员获取公告列表
   */
  async getAdminNoticeList(params?: {
    page?: number
    size?: number
    title?: string
    notice_type?: string
    expiration?: string
  }): Promise<{
    success: boolean
    data: {
      items: NoticeInterface[]
      total: number
      page: number
      size: number
    }
  }> {
    await mockDelay()

    let notices = noticeStorage.getAll().filter(n => !n.is_deleted)

    // 标题搜索
    if (params?.title) {
      notices = notices.filter(n =>
        n.release_title.toLowerCase().includes(params.title!.toLowerCase())
      )
    }

    // 类型筛选
    if (params?.notice_type) {
      notices = notices.filter(n => n.notice_type === params.notice_type)
    }

    // 到期时间筛选
    if (params?.expiration) {
      const expirationDate = new Date(params.expiration)
      notices = notices.filter(n => {
        if (!n.expiration) return false
        return new Date(n.expiration) <= expirationDate
      })
    }

    const total = notices.length
    const page = params?.page || 1
    const size = params?.size || 10
    const start = (page - 1) * size
    const items = notices.slice(start, start + size)

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
   * 管理员创建公告
   */
  async createNotice(data: Partial<NoticeInterface>): Promise<{
    success: boolean
    message: string
    data?: NoticeInterface
  }> {
    await mockDelay()

    const allNotices = noticeStorage.getAll()
    const newId = allNotices.length > 0 ? Math.max(...allNotices.map(n => n.id)) + 1 : 1
    const newNotice: NoticeInterface = {
      id: newId,
      release_title: data.release_title || data.title || '新公告',  // 支持 title 和 release_title 字段
      notice_type: data.notice_type || '其他公告',
      content: data.content || '',
      release_time: data.release_time || new Date().toISOString(),
      expiration: data.expiration || null,
      update_time: new Date().toISOString(),
      is_deleted: false,
      created_by: data.created_by || 1,
      attachments: data.attachments || []
    }

    noticeStorage.add(newNotice)

    return {
      success: true,
      message: '创建成功',
      data: newNotice
    }
  },

  /**
   * 管理员更新公告
   */
  async updateNotice(
    id: number,
    data: Partial<NoticeInterface>
  ): Promise<{
    success: boolean
    message: string
    data?: NoticeInterface
  }> {
    await mockDelay()

    const notice = noticeStorage.findById(id)

    if (!notice || notice.is_deleted) {
      return {
        success: false,
        message: '公告不存在或已删除'
      }
    }

    // 字段映射：支持 title 和 release_title
    const updateData = {
      ...data,
      release_title: data.release_title || data.title || notice.release_title
    }

    const updatedNotice = noticeStorage.update(id, {
      ...updateData,
      update_time: new Date().toISOString()
    })

    return {
      success: true,
      message: '更新成功',
      data: updatedNotice
    }
  },

  /**
   * 管理员删除公告
   */
  async deleteNotice(id: number): Promise<{
    success: boolean
    message: string
  }> {
    await mockDelay()

    const success = noticeStorage.delete(id)

    if (!success) {
      return {
        success: false,
        message: '公告不存在'
      }
    }

    return {
      success: true,
      message: '删除成功'
    }
  },

  /**
   * 获取公告统计数据
   */
  async getNoticeStats(): Promise<{
    success: boolean
    data: ReturnType<typeof getNoticeStats>
  }> {
    await mockDelay()

    return {
      success: true,
      data: getNoticeStats()
    }
  }
}

export default noticeMockApi
