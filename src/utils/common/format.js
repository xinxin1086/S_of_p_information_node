// ./src/utils/admin/format.js
// 工具函数（放在utils/format.js）
import { BASE_URL } from '@/config.js';

export const formatAvatarUrl = (avatarPath) => {
    // 1. 空值返回空字符串
    if (!avatarPath || avatarPath === '无' || avatarPath.trim() === '') {
        return '';
    }
    // 2. Blob URL 直接返回（浏览器临时地址，无需拼接）
    if (avatarPath.startsWith('blob:')) {
        return avatarPath;
    }
    // 3. HTTP/HTTPS 链接直接返回
    if (avatarPath.startsWith('http')) {
        return avatarPath;
    }
    // 4. 后端相对路径拼接 BASE_URL
    return `${BASE_URL}${avatarPath}`;
};