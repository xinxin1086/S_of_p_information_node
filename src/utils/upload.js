// ./src/utils/admin/upload.js
import axios from 'axios'
import { BASE_URL } from '@/config.js'; // 引入公共域名
/**
 * 上传图片到服务器并返回图片URL
 * @param {File} file - 要上传的图片文件
 * @returns {Promise<string>} 图片的服务器URL
 * @throws {Error} 上传失败时抛出错误信息
 */
export const uploadImage = async (file) => {
    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('image', file)

    const response = await axios.post(
        `${BASE_URL}/api/common/upload/image`,
        formData,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        }
    )

    if (!response.data.success) {
        throw new Error(response.data.message || '图片上传失败')
    }

    return response.data.data.image_url
}
export const avatarUrl = (avatar) => {
    return `${BASE_URL}/${avatar}`;
}

export const handleImageError = (event) => {
    event.target.onerror = null; // 防止重复触发
    event.target.src = ''; // 或者设置为一个默认错误图片的URL
    console.error('图片加载失败：', event.target.src);
}