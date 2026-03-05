/**
 * Mock 数据持久化管理器
 * 用于将 Mock 数据保存到 LocalStorage，实现数据持久化
 */

import type {
  ActivityInterface,
  ActivityBookingInterface,
  ActivityRatingInterface,
  ActivityDiscussionInterface,
  DiscussCommentInterface
} from '@/types/activity'

// 存储键前缀
const STORAGE_PREFIX = 'mock_data_'

// 存储键定义
const STORAGE_KEYS = {
  ACTIVITIES: `${STORAGE_PREFIX}activities`,
  BOOKINGS: `${STORAGE_PREFIX}bookings`,
  RATINGS: `${STORAGE_PREFIX}ratings`,
  DISCUSSIONS: `${STORAGE_PREFIX}discussions`,
  COMMENTS: `${STORAGE_PREFIX}comments`,
  INITIALIZED: `${STORAGE_PREFIX}initialized`
}

/**
 * 通用存储操作类
 */
class MockStorage<T> {
  constructor(private key: string) {}

  /**
   * 获取所有数据
   */
  getAll(): T[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(this.key)
    return data ? JSON.parse(data) : []
  }

  /**
   * 保存所有数据
   */
  saveAll(items: T[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.key, JSON.stringify(items))
  }

  /**
   * 根据 ID 查找项
   */
  findById(id: number | string): T | undefined {
    const items = this.getAll()
    return items.find((item: any) => item.id === id)
  }

  /**
   * 添加新项
   */
  add(item: T): T {
    const items = this.getAll()
    items.push(item)
    this.saveAll(items)
    return item
  }

  /**
   * 更新项
   */
  update(id: number | string, updates: Partial<T>): T | undefined {
    const items = this.getAll()
    const index = items.findIndex((item: any) => item.id === id)
    if (index !== -1) {
      items[index] = { ...items[index], ...updates }
      this.saveAll(items)
      return items[index]
    }
    return undefined
  }

  /**
   * 删除项
   */
  delete(id: number | string): boolean {
    const items = this.getAll()
    const filtered = items.filter((item: any) => item.id !== id)
    if (filtered.length < items.length) {
      this.saveAll(filtered)
      return true
    }
    return false
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.key)
  }

  /**
   * 查询数据（支持自定义过滤函数）
   */
  query(predicate: (item: T) => boolean): T[] {
    const items = this.getAll()
    return items.filter(predicate)
  }
}

// 创建各模块的存储实例
export const activityStorage = new MockStorage<ActivityInterface>(STORAGE_KEYS.ACTIVITIES)
export const bookingStorage = new MockStorage<ActivityBookingInterface>(STORAGE_KEYS.BOOKINGS)
export const ratingStorage = new MockStorage<ActivityRatingInterface>(STORAGE_KEYS.RATINGS)
export const discussionStorage = new MockStorage<ActivityDiscussionInterface>(STORAGE_KEYS.DISCUSSIONS)
export const commentStorage = new MockStorage<DiscussCommentInterface>(STORAGE_KEYS.COMMENTS)

/**
 * 初始化 Mock 数据
 * 从初始数据加载到 LocalStorage（仅第一次或手动重置时）
 */
export function initializeMockData(initialData: {
  activities: ActivityInterface[]
  bookings: ActivityBookingInterface[]
  ratings: ActivityRatingInterface[]
  discussions: ActivityDiscussionInterface[]
  comments: DiscussCommentInterface[]
}): void {
  // 检查是否已初始化
  if (localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
    console.log('[MockStorage] 数据已初始化，跳过')
    return
  }

  console.log('[MockStorage] 初始化 Mock 数据...')
  activityStorage.saveAll(initialData.activities)
  bookingStorage.saveAll(initialData.bookings)
  ratingStorage.saveAll(initialData.ratings)
  discussionStorage.saveAll(initialData.discussions)
  commentStorage.saveAll(initialData.comments)

  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true')
  console.log('[MockStorage] Mock 数据初始化完成')
}

/**
 * 重置 Mock 数据
 * 清除所有 Mock 数据并重新初始化
 */
export function resetMockData(initialData: {
  activities: ActivityInterface[]
  bookings: ActivityBookingInterface[]
  ratings: ActivityRatingInterface[]
  discussions: ActivityDiscussionInterface[]
  comments: DiscussCommentInterface[]
}): void {
  console.log('[MockStorage] 重置 Mock 数据...')
  activityStorage.clear()
  bookingStorage.clear()
  ratingStorage.clear()
  discussionStorage.clear()
  commentStorage.clear()
  localStorage.removeItem(STORAGE_KEYS.INITIALIZED)

  initializeMockData(initialData)
  console.log('[MockStorage] Mock 数据重置完成')
}

/**
 * 清空所有 Mock 数据
 */
export function clearMockData(): void {
  console.log('[MockStorage] 清空所有 Mock 数据...')
  activityStorage.clear()
  bookingStorage.clear()
  ratingStorage.clear()
  discussionStorage.clear()
  commentStorage.clear()
  localStorage.removeItem(STORAGE_KEYS.INITIALIZED)
  console.log('[MockStorage] Mock 数据已清空')
}

/**
 * 获取 Mock 数据统计信息
 */
export function getMockDataStats() {
  return {
    activities: activityStorage.getAll().length,
    bookings: bookingStorage.getAll().length,
    ratings: ratingStorage.getAll().length,
    discussions: discussionStorage.getAll().length,
    comments: commentStorage.getAll().length
  }
}

/**
 * 导出 Mock 数据为 JSON
 */
export function exportMockData(): string {
  const data = {
    activities: activityStorage.getAll(),
    bookings: bookingStorage.getAll(),
    ratings: ratingStorage.getAll(),
    discussions: discussionStorage.getAll(),
    comments: commentStorage.getAll(),
    exportedAt: new Date().toISOString()
  }
  return JSON.stringify(data, null, 2)
}

/**
 * 从 JSON 导入 Mock 数据
 */
export function importMockData(jsonString: string): void {
  try {
    const data = JSON.parse(jsonString)
    if (data.activities) activityStorage.saveAll(data.activities)
    if (data.bookings) bookingStorage.saveAll(data.bookings)
    if (data.ratings) ratingStorage.saveAll(data.ratings)
    if (data.discussions) discussionStorage.saveAll(data.discussions)
    if (data.comments) commentStorage.saveAll(data.comments)
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true')
    console.log('[MockStorage] Mock 数据导入成功')
  } catch (error) {
    console.error('[MockStorage] 导入失败:', error)
    throw new Error('导入数据格式错误')
  }
}

export default {
  activityStorage,
  bookingStorage,
  ratingStorage,
  discussionStorage,
  commentStorage,
  initializeMockData,
  resetMockData,
  clearMockData,
  getMockDataStats,
  exportMockData,
  importMockData
}
