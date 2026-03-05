/**
 * Mock 数据初始化
 * 在 main.ts 中导入此文件即可初始化 Mock 数据系统
 */

import { showApiModeTip } from '@/services/activityAdapter'
import { initializeMockData, getMockDataStats } from '@/mock/mockStorage'
import mockActivityData from '@/mock/activityMockData'
import { mockAllUsers, getUserStats, initializeMockUsersForLogin } from '@/mock/userMockData'
import { getNoticeStats } from '@/mock/noticeMockData'
import { getScienceArticleStats } from '@/mock/scienceMockData'
import { getForumStats } from '@/mock/forumMockData'

/**
 * 初始化 Mock 数据系统
 */
export function initMockSystem() {
  // 仅在开发环境初始化
  if (!import.meta.env.DEV) {
    return
  }

  // 自动启用 Mock 模式（开发环境）
  if (typeof window !== 'undefined' && !localStorage.getItem('DEV_ENABLE_MOCK')) {
    localStorage.setItem('DEV_ENABLE_MOCK', 'true')
    console.log('%c[Mock] 已自动启用 Mock 模式', 'color: #e6a23c; font-weight: bold;')
  }

  // 初始化 Mock 用户数据（用于登录）
  initializeMockUsersForLogin()

  // 初始化 Mock 数据
  initializeMockData(mockActivityData)

  // 显示当前 API 模式提示
  showApiModeTip()

  // 显示数据统计
  const stats = getMockDataStats()
  console.log(
    '%c[Mock] 活动数据统计:',
    'color: #409eff; font-weight: bold;',
    stats
  )

  // 显示用户数据统计
  const userStats = getUserStats()
  console.log(
    '%c[Mock] 用户数据统计:',
    'color: #67c23a; font-weight: bold;',
    userStats
  )

  // 显示公告数据统计
  const noticeStats = getNoticeStats()
  console.log(
    '%c[Mock] 公告数据统计:',
    'color: #e6a23c; font-weight: bold;',
    noticeStats
  )

  // 显示科普文章数据统计
  const scienceStats = getScienceArticleStats()
  console.log(
    '%c[Mock] 科普文章数据统计:',
    'color: #909399; font-weight: bold;',
    scienceStats
  )

  // 显示论坛数据统计
  const forumStats = getForumStats()
  console.log(
    '%c[Mock] 论坛数据统计:',
    'color: #f56c6c; font-weight: bold;',
    forumStats
  )

  // 提供全局访问方法（开发调试用）
  if (typeof window !== 'undefined') {
    ;(window as any).mockSystem = {
      getStats: () => getMockDataStats(),
      getUserStats: () => getUserStats(),
      getNoticeStats: () => getNoticeStats(),
      getScienceStats: () => getScienceArticleStats(),
      getForumStats: () => getForumStats(),
      getActivities: () => import('./mockStorage').then((m) => m.activityStorage.getAll()),
      getUsers: () => import('./userMockData').then((m) => m.mockAllUsers),
      getNotices: () => import('./noticeMockData').then((m) => m.mockNotices),
      getScienceArticles: () => import('./scienceMockData').then((m) => m.mockScienceArticles),
      getForumPosts: () => import('./forumMockData').then((m) => m.mockForumPosts),
      reset: () => {
        import('./mockStorage').then((m) => m.resetMockData(mockActivityData))
        window.location.reload()
      },
      clear: () => {
        import('./mockStorage').then((m) => m.clearMockData())
        window.location.reload()
      }
    }

    console.log(
      '%c[Mock] 开发工具已挂载到 window.mockSystem',
      'color: #67c23a; font-size: 11px;'
    )
  }
}

// 自动初始化（如果导入此文件）
initMockSystem()

export default initMockSystem
