/**
 * 用户信息格式化工具
 * 统一处理用户名、头像等字段的显示逻辑
 */

/**
 * 格式化用户名显示
 * 优先级：nickname > username > name > account > '未知用户'
 * @param user 用户信息对象
 * @returns 格式化后的用户名
 */
export const formatUserDisplayName = (user) => {
  if (!user) return '未知用户'

  return user.nickname || user.username || user.name || user.account || '未知用户'
}

/**
 * 获取用户头像字段
 * 支持多种头像字段名：avatar > head_pic > profile_image
 * @param user 用户信息对象
 * @returns 头像URL或空字符串
 */
export const getUserAvatarField = (user) => {
  if (!user) return ''

  return user.avatar || user.head_pic || user.profile_image || ''
}

/**
 * 格式化用户邮箱显示
 * @param user 用户信息对象
 * @returns 格式化后的邮箱或'未设置'
 */
export const formatUserEmail = (user) => {
  if (!user) return '未设置'

  const email = user.email || user.email_address
  return email && email.trim() !== '' ? email : '未设置'
}

/**
 * 格式化用户手机号显示
 * @param user 用户信息对象
 * @returns 格式化后的手机号或'未设置'
 */
export const formatUserPhone = (user) => {
  if (!user) return '未设置'

  const phone = user.phone || user.mobile || user.phone_number
  return phone && phone.trim() !== '' ? phone : '未设置'
}

/**
 * 格式化用户角色显示
 * @param user 用户信息对象
 * @returns 格式化后的角色名称
 */
export const formatUserRole = (user) => {
  if (!user) return '未知角色'

  const roleMap = {
    admin: '管理员',
    user: '普通用户',
    organization: '组织用户',
    moderator: '版主',
    guest: '游客'
  }

  return roleMap[user.role] || user.role || '未知角色'
}

/**
 * 格式化注册时间显示
 * @param user 用户信息对象
 * @returns 格式化后的注册时间或'未知'
 */
export const formatUserRegistrationTime = (user) => {
  if (!user) return '未知'

  const time = user.created_at || user.createdAt || user.registration_time
  if (!time) return '未知'

  try {
    const date = new Date(time)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    console.warn('日期格式化失败:', error)
    return time
  }
}