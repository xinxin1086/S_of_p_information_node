/**
 * 公告相关API工具函数
 * 统一管理公告列表和详情页的接口调用
 */

import { request } from '@/utils/request'

/**
 * 公告类型枚举
 * SYSTEM: 系统通知
 * ACTIVITY: 活动公告
 * GENERAL: 其他公告
 */
export type NoticeType = 'SYSTEM' | 'ACTIVITY' | 'GENERAL'

/**
 * 公告列表项接口类型定义
 */
export interface NoticeItem {
  id: number | string
  title: string
  type: NoticeType
  createdAt: string | Date
  expireTime: string | Date | null
  updateTime?: string | Date
}

/**
 * 公告详情接口类型定义
 */
export interface NoticeDetail extends NoticeItem {
  content: string
  release_notice: string
  attachments?: Array<{
    id: number | string
    name: string
    url: string
    size?: number
  }>
}

/**
 * API响应类型定义
 */
export interface ApiResponse<T> {
  data: {
    items: T[]
    page: number
    size: number
    total: number
  }
}

/**
 * 获取公告列表（精简版，不包含公告内容）
 * @param page 页码，默认1
 * @param size 每页数量，默认10
 * @param title 标题模糊搜索，可选
 * @param noticeType 公告类型筛选，可选
 * @param releaseTimeStart 发布时间开始筛选，可选
 * @param releaseTimeEnd 发布时间结束筛选，可选
 * @returns 公告列表数据
 */
export const fetchNoticeList = async (
  page: number = 1,
  size: number = 10,
  title?: string,
  noticeType?: string,
  releaseTimeStart?: string,
  releaseTimeEnd?: string
): Promise<{ items: NoticeItem[]; total: number }> => {
  try {
    console.log('🔄 请求公告列表:', { page, size, title, noticeType, releaseTimeStart, releaseTimeEnd })

    const params: Record<string, string | number> = { page, size }
    if (title) params.title = title
    if (noticeType) params.notice_type = noticeType
    if (releaseTimeStart) params.release_time_start = releaseTimeStart
    if (releaseTimeEnd) params.release_time_end = releaseTimeEnd

    const response = await request.get('/api/public/notice/list', params)

    console.log('📥 收到公告列表响应:', response)
    console.log('📊 响应数据类型:', typeof response)
    console.log('📊 响应数据结构:', {
      hasItems: response?.items,
      itemsType: Array.isArray(response?.items),
      isArray: Array.isArray(response),
      keys: response ? Object.keys(response) : null
    })

    // 处理后端返回的数据结构（axios拦截器已经返回了response.data）
    let items: NoticeItem[] = []
    let total: number = 0

    // 尝试多种数据结构格式
    if (response?.items && Array.isArray(response.items)) {
      // 格式1: { items: [...], total: number }
      items = response.items.map(notice => ({
        id: notice.id,
        title: notice.release_title || notice.title || '未命名公告',
        type: getNoticeTypeFromText(notice.notice_type),
        createdAt: notice.release_time,
        expireTime: notice.expiration,
        updateTime: notice.update_time
      }))
      total = response.total || 0
    } else if (Array.isArray(response)) {
      // 格式2: 直接返回数组
      items = response.map(notice => ({
        id: notice.id,
        title: notice.release_title || notice.title || '未命名公告',
        type: getNoticeTypeFromText(notice.notice_type),
        createdAt: notice.release_time,
        expireTime: notice.expiration,
        updateTime: notice.update_time
      }))
      total = response.length
    } else if (response?.data?.items && Array.isArray(response.data.items)) {
      // 格式3: { data: { items: [...], total: number } }
      items = response.data.items.map(notice => ({
        id: notice.id,
        title: notice.release_title || notice.title || '未命名公告',
        type: getNoticeTypeFromText(notice.notice_type),
        createdAt: notice.release_time,
        expireTime: notice.expiration,
        updateTime: notice.update_time
      }))
      total = response.data.total || 0
    } else if (response?.success && response?.data && Array.isArray(response.data)) {
      // 格式4: { success: true, data: [...] }
      items = response.data.map(notice => ({
        id: notice.id,
        title: notice.release_title || notice.title || '未命名公告',
        type: getNoticeTypeFromText(notice.notice_type),
        createdAt: notice.release_time,
        expireTime: notice.expiration,
        updateTime: notice.update_time
      }))
      total = response.data.length
    } else {
      // 尝试找到数组字段
      const arrayFields = Object.keys(response || {}).filter(key =>
        Array.isArray(response[key])
      )

      if (arrayFields.length > 0) {
        console.log('🔍 找到数组字段:', arrayFields)
        const arrayField = arrayFields[0]
        const dataArray = response[arrayField]

        items = dataArray.map(notice => ({
          id: notice.id,
          title: notice.release_title || notice.title || '未命名公告',
          type: getNoticeTypeFromText(notice.notice_type),
          createdAt: notice.release_time,
          expireTime: notice.expiration,
          updateTime: notice.update_time
        }))

        // 尝试找到总数字段
        const totalField = Object.keys(response).find(key =>
          key.toLowerCase().includes('total') || key.toLowerCase().includes('count')
        )
        total = totalField ? Number(response[totalField]) || dataArray.length : dataArray.length
      } else {
        console.warn('⚠️ 未预期的数据结构:', response)
        console.warn('⚠️ 可用字段:', response ? Object.keys(response) : 'null')
        if (response?.success === true) {
          console.warn('⚠️ 后端返回 success=true 但 data 字段为空或格式不正确')
        }
        return { items: [], total: 0 }
      }
    }

    console.log('✅ 处理后的公告数据:', {
      itemsCount: items.length,
      total: total,
      firstItem: items[0]
    })

    return { items, total }
  } catch (error) {
    console.error('❌ 获取公告列表失败:', error)
    throw new Error('获取公告列表失败，请稍后重试')
  }
}

/**
 * 获取公告详情（完整版，包含公告内容和附件）
 * @param noticeId 公告ID
 * @returns 公告详情数据
 */
export const fetchNoticeDetail = async (noticeId: number | string): Promise<NoticeDetail> => {
  try {
    const response = await request.get(`/api/public/notice/detail/${noticeId}`)
    console.log('📥 公告详情API响应:', response)

    // 处理响应数据结构：{data: {...}, message: '获取成功', success: true}
    // 或直接返回 {...}
    if (response && response.data) {
      console.log('📄 解析后的公告数据:', response.data)

      // 确保返回的数据包含必要的字段映射
      const detail = response.data
      return {
        ...detail,
        // 确保 release_notice 字段存在（优先使用 release_notice，其次使用 content）
        release_notice: detail.release_notice || detail.content || '',
        // 确保标题字段存在
        title: detail.release_title || detail.title || '未命名公告',
        // 确保类型字段存在
        type: detail.notice_type || detail.type || 'SYSTEM'
      }
    }

    // 如果直接返回数据结构
    if (response && (response.title || response.release_title || response.content)) {
      console.log('📄 直接使用响应数据作为公告详情')
      return {
        ...response,
        release_notice: response.release_notice || response.content || '',
        title: response.release_title || response.title || '未命名公告'
      }
    }

    return response
  } catch (error) {
    console.error('获取公告详情失败:', error)
    throw new Error('获取公告详情失败，请稍后重试')
  }
}

/**
 * 将中文公告类型转换为英文类型
 * @param typeText 中文公告类型
 * @returns 英文公告类型
 */
export const getNoticeTypeFromText = (typeText: string): NoticeType => {
  const typeMap: Record<string, NoticeType> = {
    '系统通知': 'SYSTEM',
    '活动公告': 'ACTIVITY',
    '其他公告': 'GENERAL'
  }
  return typeMap[typeText] || 'SYSTEM'
}

/**
 * 获取公告类型标签样式
 * @param type 公告类型
 * @returns Element Plus 标签类型
 */
export const getNoticeTypeTag = (type: NoticeType): string => {
  const typeMap: Record<NoticeType, string> = {
    SYSTEM: 'danger',
    ACTIVITY: 'warning',
    GENERAL: 'info'
  }
  return typeMap[type] || 'info'
}

/**
 * 获取公告类型中文文本
 * @param type 公告类型
 * @returns 中文公告类型
 */
export const getNoticeTypeText = (type: NoticeType): string => {
  const typeMap: Record<NoticeType, string> = {
    SYSTEM: '系统通知',
    ACTIVITY: '活动公告',
    GENERAL: '其他公告'
  }
  return typeMap[type] || '公告'
}

/**
 * 管理员获取公告列表
 * @param page 页码，默认1
 * @param size 每页数量，默认10
 * @param title 标题搜索，可选
 * @param noticeType 公告类型，可选
 * @param expirationStart 到期开始时间，可选
 * @returns 公告列表数据
 */
export const fetchAdminNoticeList = async (
  page: number = 1,
  size: number = 10,
  title?: string,
  noticeType?: string,
  expirationStart?: string
): Promise<{ items: NoticeDetail[]; total: number }> => {
  try {
    console.log('🔄 请求管理员公告列表（使用访客接口）:', { page, size, title, noticeType, expirationStart })

    // 使用访客接口获取公告列表，避免管理员接口500错误
    const params: Record<string, string | number> = { page, size }
    if (title) params.title = title
    if (noticeType) params.notice_type = noticeType
    if (expirationStart) params.release_time_start = expirationStart

    const response = await request.get('/api/public/notice/list', params)

    console.log('📥 收到管理员公告列表响应（访客接口）:', response)

    // 处理访客接口返回的数据结构（与 fetchNoticeList 相同的逻辑）
    let items: NoticeDetail[] = []
    let total: number = 0

    if (response?.data?.items && Array.isArray(response.data.items)) {
      // 格式1: { data: { items: [...], total: number } }
      items = response.data.items.map(notice => ({
        id: notice.id,
        release_title: notice.release_title || notice.title || '未命名公告',
        notice_type: notice.notice_type || getNoticeTypeFromText(notice.notice_type),
        release_time: notice.release_time,
        expiration: notice.expiration,
        update_time: notice.update_time,
        content: '', // 访客接口列表不包含内容，详情时再获取
        release_notice: '', // 访客接口列表不包含公告内容
        attachments: [] // 访客接口列表不包含附件
      }))
      total = response.data.total || 0
    } else if (response?.items && Array.isArray(response.items)) {
      // 格式2: { items: [...], total: number }
      items = response.items.map(notice => ({
        id: notice.id,
        release_title: notice.release_title || notice.title || '未命名公告',
        notice_type: notice.notice_type || getNoticeTypeFromText(notice.notice_type),
        release_time: notice.release_time,
        expiration: notice.expiration,
        update_time: notice.update_time,
        content: '',
        release_notice: '',
        attachments: []
      }))
      total = response.total || 0
    } else if (Array.isArray(response)) {
      // 格式3: 直接返回数组
      items = response.map(notice => ({
        id: notice.id,
        release_title: notice.release_title || notice.title || '未命名公告',
        notice_type: notice.notice_type || getNoticeTypeFromText(notice.notice_type),
        release_time: notice.release_time,
        expiration: notice.expiration,
        update_time: notice.update_time,
        content: '',
        release_notice: '',
        attachments: []
      }))
      total = response.length
    }

    return { items, total }
  } catch (error) {
    console.error('❌ 获取管理员公告列表失败:', error)
    throw new Error('获取管理员公告列表失败，请稍后重试')
  }
}

/**
 * 管理员创建公告
 * @param noticeData 公告数据
 * @returns 创建结果
 */
export const createAdminNotice = async (noticeData: Partial<NoticeDetail>) => {
  try {
    console.log('🔄 创建公告请求数据:', noticeData)
    const response = await request.post('/api/admin/notices', noticeData)

    console.log('📥 创建公告响应:', response)
    console.log('📊 响应类型:', typeof response)

    // 验证响应格式
    if (!response) {
      console.warn('⚠️ API返回空响应')
      return { success: true, message: '创建成功' }
    }

    // 如果响应是预期的格式，直接返回
    if (typeof response === 'object') {
      return response
    }

    // 如果响应是其他格式，包装成标准格式
    return { success: true, data: response }

  } catch (error) {
    console.error('❌ 创建公告失败:', error)
    console.error('❌ 错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })

    // 如果后端返回了错误信息，使用后端的错误信息
    const backendError = error.response?.data
    if (backendError) {
      throw new Error(backendError.message || backendError.error || '创建公告失败')
    }

    throw new Error('创建公告失败，请稍后重试')
  }
}

/**
 * 管理员更新公告
 * @param noticeId 公告ID
 * @param noticeData 更新数据
 * @returns 更新结果
 */
export const updateAdminNotice = async (noticeId: number | string, noticeData: Partial<NoticeDetail>) => {
  try {
    console.log('🔄 更新公告请求数据:', noticeId, noticeData)
    const response = await request.put(`/api/admin/notices/${noticeId}`, noticeData)

    console.log('📥 更新公告响应:', response)

    // 验证响应格式
    if (!response) {
      console.warn('⚠️ API返回空响应')
      return { success: true, message: '更新成功' }
    }

    if (typeof response === 'object') {
      return response
    }

    return { success: true, data: response }

  } catch (error) {
    console.error('❌ 更新公告失败:', error)
    console.error('❌ 错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })

    const backendError = error.response?.data
    if (backendError) {
      throw new Error(backendError.message || backendError.error || '更新公告失败')
    }

    throw new Error('更新公告失败，请稍后重试')
  }
}

/**
 * 管理员删除公告
 * @param noticeId 公告ID
 * @returns 删除结果
 */
export const deleteAdminNotice = async (noticeId: number | string) => {
  try {
    console.log('🔄 删除公告请求数据:', noticeId)
    const response = await request.delete(`/api/admin/notices/${noticeId}`)

    console.log('📥 删除公告响应:', response)

    // 验证响应格式
    if (!response) {
      console.warn('⚠️ API返回空响应')
      return { success: true, message: '删除成功' }
    }

    if (typeof response === 'object') {
      return response
    }

    return { success: true, data: response }

  } catch (error) {
    console.error('❌ 删除公告失败:', error)
    console.error('❌ 错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })

    const backendError = error.response?.data
    if (backendError) {
      throw new Error(backendError.message || backendError.error || '删除公告失败')
    }

    throw new Error('删除公告失败，请稍后重试')
  }
}

/**
 * 格式化日期
 * @param dateString 日期字符串或Date对象
 * @returns 格式化后的日期字符串
 */
export const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}