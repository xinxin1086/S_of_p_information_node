/**
 * 上传相关工具函数
 * 提供图片上传和URL处理功能
 */

import { BASE_URL } from '@/config'

/**
 * 上传图片到服务器并返回图片URL
 * @param file 要上传的图片文件
 * @returns 图片的服务器URL
 * @throws 上传失败时抛出错误信息
 */
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('image', file)

  try {
    const response = await fetch(`${BASE_URL}/api/common/upload/image`, {
      method: 'POST',
      headers: {
        // 不设置 Content-Type，让浏览器自动设置 multipart/form-data 边界
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`上传失败: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message || '图片上传失败')
    }

    return result.data.image_url
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '图片上传失败'
    throw new Error(errorMessage)
  }
}

/**
 * 生成头像URL
 * @param avatar 头像路径
 * @returns 完整的头像URL或空字符串
 */
export const avatarUrl = (avatar: string | null): string => {
  return avatar ? `${BASE_URL}/${avatar}` : ''
}

/**
 * 处理图片加载错误
 * @param event 图片错误事件
 */
export const handleImageError = (event: Event): void => {
  const target = event.target as HTMLImageElement
  target.onerror = null // 防止重复触发
  target.src = '' // 清空src，或者可以设置为一个默认错误图片的URL
  console.error('图片加载失败：', target.src)
}
