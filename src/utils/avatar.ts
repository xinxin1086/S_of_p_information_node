/**
 * 头像URL处理工具
 * 统一处理头像路径的拼接逻辑
 */

import { BASE_URL } from '@/config'

/**
 * 获取完整的头像URL
 * @param avatarPath 头像路径（可以是相对路径、绝对路径或完整URL）
 * @returns 完整的头像URL
 */
export const getAvatarUrl = (avatarPath: string | null | undefined): string | null => {
  if (!avatarPath || avatarPath.trim() === '') return null

  const trimmedPath = avatarPath.trim()

  // 如果已经是完整URL，直接返回
  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
    return trimmedPath
  }

  // 如果是base64数据，直接返回
  if (trimmedPath.startsWith('data:image/')) {
    return trimmedPath
  }

  // 如果是blob URL，直接返回
  if (trimmedPath.startsWith('blob:')) {
    return trimmedPath
  }

  // 如果是相对路径，拼接基础URL
  return `${BASE_URL}${trimmedPath.startsWith('/') ? '' : '/'}${trimmedPath}`
}

/**
 * 默认头像URL
 */
export const DEFAULT_AVATAR: string = `${BASE_URL}/static/images/default-avatar.png`

/**
 * 获取头像URL或默认头像
 * @param avatarPath 头像路径
 * @returns 头像URL（如果为空则返回默认头像）
 */
export const getAvatarUrlOrDefault = (avatarPath: string | null | undefined): string => {
  return getAvatarUrl(avatarPath) || DEFAULT_AVATAR
}
