/**
 * 科普文章 Mock 数据持久化管理器
 * 用于将科普文章点赞和浏览数据保存到 LocalStorage，实现数据持久化
 */

import type { ScienceArticleLikeInterface, ScienceArticleVisitInterface } from './scienceMockData'

// 存储键定义
const SCIENCE_STORAGE_KEYS = {
  LIKES: 'mock_data_science_article_likes',
  VISITS: 'mock_data_science_article_visits'
}

/**
 * 保存点赞数据到 localStorage
 */
export function saveScienceArticleLikes(likes: ScienceArticleLikeInterface[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SCIENCE_STORAGE_KEYS.LIKES, JSON.stringify(likes))
    console.log('[ScienceStorage] 点赞数据已保存，总数:', likes.length)
  } catch (error) {
    console.error('[ScienceStorage] 保存点赞失败:', error)
  }
}

/**
 * 获取所有点赞数据（优先从 localStorage 读取）
 */
export function getScienceArticleLikes(): ScienceArticleLikeInterface[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(SCIENCE_STORAGE_KEYS.LIKES)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.warn('[ScienceStorage] 读取点赞失败，将返回空数组:', error)
  }

  return []
}

/**
 * 添加新点赞记录
 */
export function addScienceArticleLike(like: ScienceArticleLikeInterface): ScienceArticleLikeInterface {
  const allLikes = getScienceArticleLikes()
  allLikes.push(like)
  saveScienceArticleLikes(allLikes)
  return like
}

/**
 * 根据 user_id 和 article_id 检查是否已点赞
 */
export function hasUserLikedArticle(userId: number, articleId: number): boolean {
  const allLikes = getScienceArticleLikes()
  return allLikes.some(like => like.user_id === userId && like.article_id === articleId)
}

/**
 * 保存浏览数据到 localStorage
 */
export function saveScienceArticleVisits(visits: ScienceArticleVisitInterface[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SCIENCE_STORAGE_KEYS.VISITS, JSON.stringify(visits))
    console.log('[ScienceStorage] 浏览数据已保存，总数:', visits.length)
  } catch (error) {
    console.error('[ScienceStorage] 保存浏览失败:', error)
  }
}

/**
 * 获取所有浏览数据（优先从 localStorage 读取）
 */
export function getScienceArticleVisits(): ScienceArticleVisitInterface[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(SCIENCE_STORAGE_KEYS.VISITS)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.warn('[ScienceStorage] 读取浏览失败，将返回空数组:', error)
  }

  return []
}

/**
 * 添加或更新浏览记录
 */
export function addOrUpdateScienceArticleVisit(visit: ScienceArticleVisitInterface): ScienceArticleVisitInterface {
  const allVisits = getScienceArticleVisits()
  const existingIndex = allVisits.findIndex(v => v.user_id === visit.user_id && v.article_id === visit.article_id)

  if (existingIndex >= 0) {
    // 更新已有记录的 last_visit_at
    allVisits[existingIndex].last_visit_at = visit.last_visit_at
    saveScienceArticleVisits(allVisits)
    return allVisits[existingIndex]
  } else {
    // 添加新记录
    allVisits.push(visit)
    saveScienceArticleVisits(allVisits)
    return visit
  }
}

/**
 * 获取用户对某篇文章的浏览记录
 */
export function getUserArticleVisit(userId: number, articleId: number): ScienceArticleVisitInterface | null {
  const allVisits = getScienceArticleVisits()
  return allVisits.find(v => v.user_id === userId && v.article_id === articleId) || null
}

/**
 * 清空所有科普数据（仅 localStorage，不影响初始 mock 数据）
 */
export function clearScienceData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SCIENCE_STORAGE_KEYS.LIKES)
  localStorage.removeItem(SCIENCE_STORAGE_KEYS.VISITS)
  console.log('[ScienceStorage] 科普数据已清空')
}

/**
 * 获取科普数据统计信息
 */
export function getScienceDataStats() {
  return {
    likes: getScienceArticleLikes().length,
    visits: getScienceArticleVisits().length
  }
}

export default {
  saveScienceArticleLikes,
  getScienceArticleLikes,
  addScienceArticleLike,
  hasUserLikedArticle,
  saveScienceArticleVisits,
  getScienceArticleVisits,
  addOrUpdateScienceArticleVisit,
  getUserArticleVisit,
  clearScienceData,
  getScienceDataStats
}
