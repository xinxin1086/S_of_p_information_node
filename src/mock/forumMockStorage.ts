/**
 * 论坛 Mock 数据持久化管理器
 * 用于将论坛评论和回复数据保存到 LocalStorage，实现数据持久化
 */

import type { ForumFloorInterface, ForumReplyInterface, ForumPostInterface } from './forumMockData'

// 存储键定义
const FORUM_STORAGE_KEYS = {
  POSTS: 'mock_data_forum_posts',
  FLOORS: 'mock_data_forum_floors',
  REPLIES: 'mock_data_forum_replies'
}

/**
 * 保存帖子到 localStorage
 */
export function saveForumPosts(posts: ForumPostInterface[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(FORUM_STORAGE_KEYS.POSTS, JSON.stringify(posts))
    console.log('[ForumStorage] 帖子数据已保存，总数:', posts.length)
  } catch (error) {
    console.error('[ForumStorage] 保存帖子失败:', error)
  }
}

/**
 * 获取所有帖子（优先从 localStorage 读取）
 */
export function getForumPosts(): ForumPostInterface[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(FORUM_STORAGE_KEYS.POSTS)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.warn('[ForumStorage] 读取帖子失败，将返回空数组:', error)
  }

  return []
}

/**
 * 添加新帖子
 */
export function addForumPost(post: ForumPostInterface): ForumPostInterface {
  const allPosts = getForumPosts()
  allPosts.push(post)
  saveForumPosts(allPosts)
  return post
}

/**
 * 保存楼层到 localStorage
 */
export function saveForumFloors(floors: ForumFloorInterface[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(FORUM_STORAGE_KEYS.FLOORS, JSON.stringify(floors))
    console.log('[ForumStorage] 楼层数据已保存，总数:', floors.length)
  } catch (error) {
    console.error('[ForumStorage] 保存楼层失败:', error)
  }
}

/**
 * 获取所有楼层（优先从 localStorage 读取）
 */
export function getForumFloors(): ForumFloorInterface[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(FORUM_STORAGE_KEYS.FLOORS)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.warn('[ForumStorage] 读取楼层失败，将返回空数组:', error)
  }

  return []
}

/**
 * 根据帖子ID获取楼层列表（优先从 localStorage 读取）
 */
export function getFloorsByPostId(postId: number): ForumFloorInterface[] {
  const allFloors = getForumFloors()
  return allFloors.filter(floor => floor.post_id === postId)
}

/**
 * 添加新楼层
 */
export function addForumFloor(floor: ForumFloorInterface): ForumFloorInterface {
  const allFloors = getForumFloors()
  allFloors.push(floor)
  saveForumFloors(allFloors)
  return floor
}

/**
 * 保存回复到 localStorage
 */
export function saveForumReplies(replies: ForumReplyInterface[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(FORUM_STORAGE_KEYS.REPLIES, JSON.stringify(replies))
    console.log('[ForumStorage] 回复数据已保存，总数:', replies.length)
  } catch (error) {
    console.error('[ForumStorage] 保存回复失败:', error)
  }
}

/**
 * 获取所有回复（优先从 localStorage 读取）
 */
export function getForumReplies(): ForumReplyInterface[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(FORUM_STORAGE_KEYS.REPLIES)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.warn('[ForumStorage] 读取回复失败，将返回空数组:', error)
  }

  return []
}

/**
 * 根据楼层ID获取回复列表（优先从 localStorage 读取）
 */
export function getRepliesByFloorId(floorId: number): ForumReplyInterface[] {
  const allReplies = getForumReplies()
  return allReplies.filter(reply => reply.floor_id === floorId)
}

/**
 * 添加新回复
 */
export function addForumReply(reply: ForumReplyInterface): ForumReplyInterface {
  const allReplies = getForumReplies()
  allReplies.push(reply)
  saveForumReplies(allReplies)
  return reply
}

/**
 * 清空所有论坛数据（仅 localStorage，不影响初始 mock 数据）
 */
export function clearForumData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(FORUM_STORAGE_KEYS.FLOORS)
  localStorage.removeItem(FORUM_STORAGE_KEYS.REPLIES)
  console.log('[ForumStorage] 论坛数据已清空')
}

/**
 * 获取论坛数据统计信息
 */
export function getForumDataStats() {
  return {
    floors: getForumFloors().length,
    replies: getForumReplies().length
  }
}

export default {
  saveForumPosts,
  getForumPosts,
  addForumPost,
  saveForumFloors,
  getForumFloors,
  getFloorsByPostId,
  addForumFloor,
  saveForumReplies,
  getForumReplies,
  getRepliesByFloorId,
  addForumReply,
  clearForumData,
  getForumDataStats
}
