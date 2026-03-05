/**
 * 公告 API 适配器
 * 自动在 Mock API 和真实 API 之间切换
 */

import { shouldUseMock } from '@/utils/mockHelper'
import { noticeMockApi } from '@/mock/noticeMockApi'
import {
  fetchNoticeList as realFetchNoticeList,
  fetchNoticeDetail as realFetchNoticeDetail,
  fetchAdminNoticeList as realFetchAdminNoticeList,
  createAdminNotice as realCreateAdminNotice,
  updateAdminNotice as realUpdateAdminNotice,
  deleteAdminNotice as realDeleteAdminNotice
} from '@/utils/notice'
import type { NoticeItem, NoticeDetail } from '@/utils/notice'

/**
 * 公告适配器
 */
export const noticeAdapter = {
  /**
   * 获取公告列表（公开接口）
   * 返回格式：{ success: boolean, data: { items: NoticeItem[], total: number } }
   */
  async getNoticeList(params?: {
    page?: number
    size?: number
    title?: string
    notice_type?: string
    release_time_start?: string
    release_time_end?: string
  }): Promise<{ success: boolean; data: { items: NoticeItem[]; total: number } }> {
    if (shouldUseMock()) {
      const response = await noticeMockApi.getNoticeList(params)
      if (response.success && response.data) {
        // Mock API 返回 { success, data: { items, total } }
        // 需要转换为与 useApiCall 兼容的格式
        return {
          success: true,
          data: {
            items: response.data.items.map(notice => ({
              id: notice.id,
              title: notice.release_title || notice.title || '未命名公告',
              type: this.getNoticeTypeFromText(notice.notice_type),
              createdAt: notice.release_time,
              expireTime: notice.expiration,
              updateTime: notice.update_time
            })),
            total: response.data.total
          }
        }
      }
      return { success: false, data: { items: [], total: 0 } }
    }

    // 真实 API 直接返回 { items, total }，需要包装成 { success, data }
    try {
      const result = await realFetchNoticeList(
        params?.page,
        params?.size,
        params?.title,
        params?.notice_type,
        params?.release_time_start,
        params?.release_time_end
      )
      return {
        success: true,
        data: result
      }
    } catch (error) {
      console.error('获取公告列表失败:', error)
      return { success: false, data: { items: [], total: 0 } }
    }
  },

  /**
   * 获取公告详情（公开接口）
   * 返回格式：{ success: boolean, data?: NoticeDetail }
   */
  async getNoticeDetail(noticeId: number | string): Promise<{ success: boolean; data?: NoticeDetail; message?: string }> {
    if (shouldUseMock()) {
      const response = await noticeMockApi.getNoticeDetail(Number(noticeId))
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data as NoticeDetail
        }
      }
      return {
        success: false,
        message: '公告不存在或已删除'
      }
    }

    try {
      const result = await realFetchNoticeDetail(noticeId)
      return {
        success: true,
        data: result
      }
    } catch (error) {
      console.error('获取公告详情失败:', error)
      return {
        success: false,
        message: '获取公告详情失败'
      }
    }
  },

  /**
   * 管理员获取公告列表
   * 返回格式：{ success: boolean, data: { items: NoticeDetail[], total: number } }
   */
  async getAdminNoticeList(params?: {
    page?: number
    size?: number
    title?: string
    notice_type?: string
    expirationStart?: string
  }): Promise<{ success: boolean; data: { items: NoticeDetail[]; total: number } }> {
    if (shouldUseMock()) {
      const response = await noticeMockApi.getAdminNoticeList(params)
      if (response.success && response.data) {
        return {
          success: true,
          data: {
            items: response.data.items as NoticeDetail[],
            total: response.data.total
          }
        }
      }
      return { success: false, data: { items: [], total: 0 } }
    }

    try {
      const result = await realFetchAdminNoticeList(
        params?.page,
        params?.size,
        params?.title,
        params?.notice_type,
        params?.expirationStart
      )
      return {
        success: true,
        data: result
      }
    } catch (error) {
      console.error('获取管理员公告列表失败:', error)
      return { success: false, data: { items: [], total: 0 } }
    }
  },

  /**
   * 管理员创建公告
   */
  async createNotice(noticeData: Partial<NoticeDetail>): Promise<any> {
    if (shouldUseMock()) {
      return noticeMockApi.createNotice(noticeData)
    }

    return realCreateAdminNotice(noticeData)
  },

  /**
   * 管理员更新公告
   */
  async updateNotice(noticeId: number | string, noticeData: Partial<NoticeDetail>): Promise<any> {
    if (shouldUseMock()) {
      return noticeMockApi.updateNotice(Number(noticeId), noticeData)
    }

    return realUpdateAdminNotice(noticeId, noticeData)
  },

  /**
   * 管理员删除公告
   */
  async deleteNotice(noticeId: number | string): Promise<any> {
    if (shouldUseMock()) {
      return noticeMockApi.deleteNotice(Number(noticeId))
    }

    return realDeleteAdminNotice(noticeId)
  },

  // ========== 方法别名（为了兼容 Store 调用） ==========

  /**
   * 获取公开公告列表（别名）
   */
  async getPublicNotices(params?: any) {
    return this.getNoticeList(params)
  },

  /**
   * 获取公开公告详情（别名）
   */
  async getPublicNoticeDetail(noticeId: number | string) {
    return this.getNoticeDetail(noticeId)
  },

  /**
   * 获取管理员公告列表（别名）
   */
  async getAdminNotices(params?: any) {
    return this.getAdminNoticeList(params)
  },

  /**
   * 置顶/取消置顶（别名）
   */
  async togglePinNotice(noticeId: number | string, currentPinnedState: boolean) {
    // Mock API 没有置顶方法，临时实现
    if (shouldUseMock()) {
      return { success: true, message: '置顶成功（Mock）' }
    }
    // TODO: 调用真实的置顶接口
    return { success: true, message: '置顶成功' }
  },

  /**
   * 将中文公告类型转换为英文类型
   */
  getNoticeTypeFromText(typeText: string): 'SYSTEM' | 'ACTIVITY' | 'GENERAL' {
    const typeMap: Record<string, 'SYSTEM' | 'ACTIVITY' | 'GENERAL'> = {
      '系统通知': 'SYSTEM',
      '活动公告': 'ACTIVITY',
      '其他公告': 'GENERAL'
    }
    return typeMap[typeText] || 'SYSTEM'
  },

  /**
   * 获取公告类型标签样式
   */
  getNoticeTypeTag(type: 'SYSTEM' | 'ACTIVITY' | 'GENERAL'): string {
    const typeMap: Record<string, string> = {
      SYSTEM: 'danger',
      ACTIVITY: 'warning',
      GENERAL: 'info'
    }
    return typeMap[type] || 'info'
  },

  /**
   * 获取公告类型中文文本
   */
  getNoticeTypeText(type: 'SYSTEM' | 'ACTIVITY' | 'GENERAL'): string {
    const typeMap: Record<string, string> = {
      SYSTEM: '系统通知',
      ACTIVITY: '活动公告',
      GENERAL: '其他公告'
    }
    return typeMap[type] || '公告'
  }
}

export default noticeAdapter
