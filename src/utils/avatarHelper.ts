/**
 * 头像处理工具函数
 * 用于处理用户头像的显示、格式化和默认头像
 */

// 头像缓存，避免重复生成相同的SVG头像
const avatarCache = new Map<string, string>()

/**
 * 格式化头像URL
 * @param avatar 头像URL或路径
 * @returns 格式化后的完整头像URL
 */
export const formatAvatarUrl = (avatar: string | null | undefined): string => {
  if (!avatar) {
    return getDefaultAvatar()
  }

  // 如果已经是完整的URL，直接返回
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar
  }

  // 如果是相对路径，拼接基础URL
  if (avatar.startsWith('/')) {
    // 获取基础URL
    const baseUrl = getBaseUrl()
    return `${baseUrl}${avatar}`
  }

  // 其他情况，视为相对路径，拼接基础URL和/
  const baseUrl = getBaseUrl()
  return `${baseUrl}/${avatar}`
}

/**
 * 获取默认头像
 * @returns 默认头像URL
 */
export const getDefaultAvatar = (): string => {
  // 可以返回一个默认头像，或者使用SVG生成的头像
  return '/images/default-avatar.png'
}

/**
 * 生成基于用户名的头像
 * @param username 用户名
 * @returns SVG头像的data URL
 */
export const generateAvatarFromUsername = (username: string): string => {
  if (!username) return getDefaultAvatar()

  // 检查缓存
  if (avatarCache.has(username)) {
    return avatarCache.get(username)!
  }

  // 获取用户名首字符
  const firstChar = username.charAt(0).toUpperCase()

  // 基于用户名生成颜色
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]

  const colorIndex = username.charCodeAt(0) % colors.length
  const backgroundColor = colors[colorIndex]

  // 生成SVG头像
  const svg = `
    <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="60" fill="${backgroundColor}"/>
      <text x="60" y="60" text-anchor="middle" dominant-baseline="middle"
            font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white">
        ${firstChar}
      </text>
    </svg>
  `

  // 转换为data URL
  const encodedSvg = encodeURIComponent(svg)
  const avatarUrl = `data:image/svg+xml,${encodedSvg}`

  // 存入缓存
  avatarCache.set(username, avatarUrl)

  return avatarUrl
}

/**
 * 获取用户头像（支持多格式回退）
 * @param user 用户对象
 * @returns 头像URL
 */
export const getUserAvatar = (user: any): string => {
  if (!user) return getDefaultAvatar()

  // 优先级：avatar > head_pic > profile_image
  const avatar = user.avatar || user.head_pic || user.profile_image

  if (avatar) {
    return formatAvatarUrl(avatar)
  }

  // 如果没有头像，生成基于用户名的头像
  if (user.username || user.name || user.nickname) {
    const displayName = user.username || user.name || user.nickname
    return generateAvatarFromUsername(displayName)
  }

  return getDefaultAvatar()
}

/**
 * 获取基础URL
 * @returns 基础URL
 */
const getBaseUrl = (): string => {
  // 在开发环境中，可能需要配置基础URL
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  }

  // 在生产环境中，使用当前域名
  return window.location.origin
}

/**
 * 验证头像URL是否有效
 * @param url 头像URL
 * @returns Promise<boolean>
 */
export const validateAvatarUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok && response.headers.get('Content-Type')?.startsWith('image/')
  } catch {
    return false
  }
}

/**
 * 预加载头像
 * @param url 头像URL
 * @returns Promise<HTMLImageElement>
 */
export const preloadAvatar = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/**
 * 获取头像尺寸规格
 * @returns 不同尺寸的头像规格
 */
export const getAvatarSizes = () => ({
  small: { width: 24, height: 24 },
  medium: { width: 48, height: 48 },
  large: { width: 80, height: 80 },
  extraLarge: { width: 120, height: 120 }
})

export default {
  formatAvatarUrl,
  getDefaultAvatar,
  generateAvatarFromUsername,
  getUserAvatar,
  validateAvatarUrl,
  preloadAvatar,
  getAvatarSizes
}