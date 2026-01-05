// ./src/utils/admin/upload.js
import apiClient from '@/utils/request.js'
/**
 * 上传图片到服务器并返回图片URL
 * @param {File} file - 要上传的图片文件
 * @returns {Promise<string>} 图片的服务器URL
 * @throws {Error} 上传失败时抛出错误信息
 */
export const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('image', file)

    const response = await apiClient.post(
        `/api/common/upload/image`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    )

    // 响应拦截器已返回 response.data，所以这里直接访问 response 的属性
    if (!response?.success) {
        throw new Error(response?.message || '图片上传失败')
    }

    return response.data.image_url
}
export const avatarUrl = (avatar) => {
    return avatar ? `http://localhost:5000/${avatar}` : '';
};

export const handleImageError = (event) => {
    event.target.onerror = null; // 防止重复触发
    event.target.src = ''; // 或者设置为一个默认错误图片的URL
    console.error('图片加载失败：', event.target.src);
}