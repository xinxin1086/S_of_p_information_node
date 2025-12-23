/**
 * 统一的API路径配置
 * 根据后端接口文档定义的路径
 */

// API基础路径
export const API_BASE_PATH = '/api'

// ========== 用户认证模块 (/api/user/auth) ==========
export const USER_AUTH_API = {
  LOGIN: `${API_BASE_PATH}/user/auth/login`,
  REGISTER: `${API_BASE_PATH}/user/auth/register`,
  VERIFY: `${API_BASE_PATH}/user/auth/verify`,
  REFRESH: `${API_BASE_PATH}/user/auth/refresh`,
  PASSWORD_RESET: `${API_BASE_PATH}/user/auth/password/reset`,
  PASSWORD_RESET_CONFIRM: `${API_BASE_PATH}/user/auth/password/reset/confirm`,
  EMAIL_VERIFY: `${API_BASE_PATH}/user/auth/email/verify`,
  EMAIL_VERIFY_CONFIRM: `${API_BASE_PATH}/user/auth/email/verify/confirm`,
  PHONE_VERIFY: `${API_BASE_PATH}/user/auth/phone/verify`,
  PHONE_VERIFY_CONFIRM: `${API_BASE_PATH}/user/auth/phone/verify/confirm`
}

// ========== 用户管理模块 (/api/user) ==========
export const USER_API = {
  INFO: `${API_BASE_PATH}/user/user/info`,
  UPDATE: `${API_BASE_PATH}/user/user/update`,
  DELETE_ACCOUNT: `${API_BASE_PATH}/user/user/delete-account`,
  AVATAR_UPLOAD: `${API_BASE_PATH}/user/user/avatar`,
  AVATAR_DELETE: `${API_BASE_PATH}/user/user/avatar`,
  STATISTICS: `${API_BASE_PATH}/user/user/statistics`,
  ACTIVITIES: `${API_BASE_PATH}/user/user/activities`
}

// ========== 管理员用户管理模块 (/api/user/admin) ==========
export const USER_ADMIN_API = {
  USERS: `${API_BASE_PATH}/user/admin/users`,
  USER_MANAGE: `${API_BASE_PATH}/user/admin/users`,
  USER_DELETE: (userId: number) => `${API_BASE_PATH}/user/admin/users/${userId}`,
  DEMOTE: (adminId: number) => `${API_BASE_PATH}/user/admin/demote/${adminId}`,
  DEMOTE_BATCH: `${API_BASE_PATH}/user/admin/demote/batch`,
  CREATE_ADMIN: `${API_BASE_PATH}/user/admin/create-admin`,
  STATISTICS: `${API_BASE_PATH}/user/admin/statistics`
}

// ========== 管理员模块 (/api/admin) ==========
export const ADMIN_API = {
  // 注意：管理员登录使用统一的用户认证接口 /api/user/auth/login
  // 登录成功后，根据返回的 user_type 字段区分用户和管理员

  // 认证相关
  LOGOUT: `${API_BASE_PATH}/user/auth/logout`,
  INFO: `${API_BASE_PATH}/admin/info`,
  PERMISSIONS: `${API_BASE_PATH}/admin/permissions`,

  // 内容审核管理
  CONTENT_PENDING_ALL: `${API_BASE_PATH}/admin/content/pending/all`,
  BATCH_REVIEW: `${API_BASE_PATH}/admin/content/batch-review`,
  CONTENT_DETAIL: (module: string, contentId: number) => `${API_BASE_PATH}/admin/content/detail/${module}/${contentId}`,
  CONTENT_EXPORT: `${API_BASE_PATH}/admin/content/export`,
  CONTENT_STATISTICS: `${API_BASE_PATH}/admin/content/statistics`,
  UPDATE_USER_DISPLAYS: `${API_BASE_PATH}/admin/content/update-user-displays`,

  // 科普文章管理（专用接口）
  SCIENCE_ARTICLES: `${API_BASE_PATH}/admin/science/articles`,
  SCIENCE_ARTICLE_DETAIL: (id: number) => `${API_BASE_PATH}/admin/science/articles/${id}`,

  // 活动管理（专用接口）
  ACTIVITIES: `${API_BASE_PATH}/admin/activities`,
  ACTIVITY_DETAIL: (id: number) => `${API_BASE_PATH}/admin/activities/${id}`,

  // 论坛管理（专用接口）
  FORUM_POSTS: `${API_BASE_PATH}/admin/forum/posts`,
  FORUM_REPORTS: `${API_BASE_PATH}/admin/forum/reports`,
  FORUM_REPORT_HANDLE: `${API_BASE_PATH}/admin/forum/report/handle`,
  FORUM_POSTS_BATCH: `${API_BASE_PATH}/admin/forum/posts/batch`,

  // 公告管理（专用接口）
  NOTICES: `${API_BASE_PATH}/admin/notices`,
  NOTICE_DETAIL: (id: number) => `${API_BASE_PATH}/admin/notices/${id}`,
  NOTICE_STATS: `${API_BASE_PATH}/admin/notices/stats`,
  NOTICE_BATCH_DELETE: `${API_BASE_PATH}/admin/notices/batch-delete`,
  NOTICE_PUBLISH: (id: number) => `${API_BASE_PATH}/admin/notices/${id}/publish`,
  NOTICE_UNPUBLISH: (id: number) => `${API_BASE_PATH}/admin/notices/${id}/unpublish`,
  NOTICE_PIN: (id: number) => `${API_BASE_PATH}/admin/notices/${id}/pin`,
  NOTICE_UNPIN: (id: number) => `${API_BASE_PATH}/admin/notices/${id}/unpin`
}

// ========== 公共接口模块 (/api/common) ==========
// 注意: 此模块只保留纯公共功能(文件上传、附件管理等)
// 业务相关的公开接口已迁移至 /api/public/* 路径
export const COMMON_API = {
  // 文件管理
  UPLOAD_IMAGE: `${API_BASE_PATH}/common/upload/image`,
  DELETE_IMAGE: `${API_BASE_PATH}/common/delete/image`,
  UPLOAD_AVATAR: `${API_BASE_PATH}/common/upload/avatar`,

  // 附件管理
  ATTACHMENT: `${API_BASE_PATH}/common/attachment`,
  ATTACHMENT_DELETE: (attachmentId: number) => `${API_BASE_PATH}/common/attachment/${attachmentId}`,
  ATTACHMENTS: `${API_BASE_PATH}/common/attachments`,
  ATTACHMENT_DETAIL: (attachmentId: number) => `${API_BASE_PATH}/common/attachment/${attachmentId}`
}

// ========== 科普文章模块 (/api/science) ==========
export const SCIENCE_API = {
  USER: `${API_BASE_PATH}/science/user`,
  ADMIN: `${API_BASE_PATH}/science/admin`,
  CATEGORY: `${API_BASE_PATH}/science/category`,
  PUBLIC: `${API_BASE_PATH}/science/public`
}

// ========== 活动模块 (/api/activities) ==========
export const ACTIVITIES_API = {
  USER: `${API_BASE_PATH}/activities/user`,
  ADMIN: `${API_BASE_PATH}/activities/admin`,
  BOOKING: `${API_BASE_PATH}/activities/booking`,
  DISCUSSION: `${API_BASE_PATH}/activities/discussion`,

  // 具体接口
  LIST: `${API_BASE_PATH}/activities`,
  DETAIL: (activityId: number) => `${API_BASE_PATH}/activities/${activityId}`,
  CREATE: `${API_BASE_PATH}/activities/`,
  UPDATE: (activityId: number) => `${API_BASE_PATH}/activities/${activityId}`,
  DELETE: (activityId: number) => `${API_BASE_PATH}/activities/${activityId}`,
  BOOKING_CREATE: (activityId: number) => `${API_BASE_PATH}/activities/${activityId}/booking`,
  BOOKING_CANCEL: (activityId: number) => `${API_BASE_PATH}/activities/${activityId}/booking`,
  MY_BOOKINGS: `${API_BASE_PATH}/activities/my-bookings`,
  MY_ACTIVITIES: `${API_BASE_PATH}/activities/my-activities`,
  CANCEL: (activityId: number) => `${API_BASE_PATH}/activities/${activityId}/cancel`,
  USER_STATS: `${API_BASE_PATH}/user/activities/stats`,

  // 讨论功能接口
  DISCUSSION_CREATE: (activityId: number) => `${API_BASE_PATH}/activities/${activityId}/discussion`,
  DISCUSSION_LIST: (activityId: number) => `${API_BASE_PATH}/activities/${activityId}/discussion`,
  DISCUSSION_COMMENT_CREATE: (discussionId: number) => `${API_BASE_PATH}/activities/discussion/${discussionId}/comment`,
  DISCUSSION_COMMENT_LIST: (discussionId: number) => `${API_BASE_PATH}/activities/discussion/${discussionId}/comment`,
  DISCUSSION_COMMENT_DELETE: (commentId: number) => `${API_BASE_PATH}/activities/discussion/comment/${commentId}`,
  DISCUSSION_COMMENT_PUBLIC: (discussionId: number) => `${API_BASE_PATH}/common/activity/discussion/${discussionId}/comment`,

  // 评分功能接口
  RATING_CREATE: (activityId: number) => `${API_BASE_PATH}/activities/${activityId}/rating`,
  RATING_LIST: (activityId: number) => `${API_BASE_PATH}/activities/${activityId}/rating`,

  // 用户活动接口
  USER_ACTIVITIES: `${API_BASE_PATH}/user/activities`
}


// ========== 论坛模块 (/api/forum) ==========
export const FORUM_API = {
  // 帖子管理
  POST: `${API_BASE_PATH}/forum/post`,
  POST_DETAIL: (postId: number) => `${API_BASE_PATH}/forum/post/${postId}`,
  POST_HOT: `${API_BASE_PATH}/forum/post/hot`,
  POST_CATEGORIES: `${API_BASE_PATH}/forum/post/categories`,
  POST_SEARCH: `${API_BASE_PATH}/forum/post/search`,

  // 楼层管理
  FLOOR_BY_POST: (postId: number) => `${API_BASE_PATH}/forum/floor/post/${postId}`,
  FLOOR_CREATE: `${API_BASE_PATH}/forum/floor`,

  // 回复管理
  REPLY_BY_FLOOR: (floorId: number) => `${API_BASE_PATH}/forum/reply/floor/${floorId}`,
  REPLY_CREATE: `${API_BASE_PATH}/forum/reply`,

  // 互动功能
  LIKE: `${API_BASE_PATH}/forum/like`,
  LIKE_STATUS: `${API_BASE_PATH}/forum/like/status`,
  VISIT: `${API_BASE_PATH}/forum/visit`,

  // 统计信息
  STATISTICS: `${API_BASE_PATH}/forum/statistics`,
  USER_STATS: `${API_BASE_PATH}/forum/user/stats`,
  USER_STATS_DETAIL: (userId: number) => `${API_BASE_PATH}/forum/user/stats/${userId}`,

  // 通知系统
  NOTIFICATIONS: `${API_BASE_PATH}/forum/notifications`,
  NOTIFICATION_READ: (notificationId: number) => `${API_BASE_PATH}/forum/notifications/${notificationId}/read`,
  NOTIFICATIONS_MARK_ALL_READ: `${API_BASE_PATH}/forum/notifications/mark-all-read`,

  // 举报系统
  REPORT: `${API_BASE_PATH}/forum/report`
}

// ========== 管理员论坛接口 (/api/forum/admin) ==========
export const FORUM_ADMIN_API = {
  REPORT_HANDLE: `${API_BASE_PATH}/forum/admin/report/handle`,
  POSTS_BATCH: `${API_BASE_PATH}/forum/admin/posts/batch`
}

// ========== 公告模块 (/api/notice) ==========
export const NOTICE_API = {
  // 公开接口
  PUBLIC_LIST: `${API_BASE_PATH}/notice/list`,
  PUBLIC_DETAIL: (noticeId: number) => `${API_BASE_PATH}/notice/detail/${noticeId}`,
  LATEST: `${API_BASE_PATH}/notice/latest`,
  PINNED: `${API_BASE_PATH}/notice/pinned`,

  // 管理员接口
  ADMIN_LIST: `${API_BASE_PATH}/admin/notices`,
  ADMIN_DETAIL: (noticeId: number) => `${API_BASE_PATH}/admin/notices/${noticeId}`,
  ADMIN_CREATE: `${API_BASE_PATH}/admin/notices`,
  ADMIN_UPDATE: (noticeId: number) => `${API_BASE_PATH}/admin/notices/${noticeId}`,
  ADMIN_DELETE: (noticeId: number) => `${API_BASE_PATH}/admin/notices/${noticeId}`,
  ADMIN_BATCH_DELETE: `${API_BASE_PATH}/admin/notices/batch-delete`,
  ADMIN_STATS: `${API_BASE_PATH}/admin/notices/stats`,

  // 公告操作接口
  PUBLISH: (noticeId: number) => `${API_BASE_PATH}/admin/notices/${noticeId}/publish`,
  UNPUBLISH: (noticeId: number) => `${API_BASE_PATH}/admin/notices/${noticeId}/unpublish`,
  PIN: (noticeId: number) => `${API_BASE_PATH}/admin/notices/${noticeId}/pin`,
  UNPIN: (noticeId: number) => `${API_BASE_PATH}/admin/notices/${noticeId}/unpin`,

  // 兼容旧接口
  LIST: `${API_BASE_PATH}/notice`,
  DETAIL: (noticeId: number) => `${API_BASE_PATH}/notice/${noticeId}`,
  CREATE: `${API_BASE_PATH}/notice`,
  UPDATE: (noticeId: number) => `${API_BASE_PATH}/notice/${noticeId}`,
  DELETE: (noticeId: number) => `${API_BASE_PATH}/notice/${noticeId}`,
  BATCH_DELETE: `${API_BASE_PATH}/notice/batch-delete`
}

// ========== 公开访问接口 (/api/public) ==========
export const PUBLIC_API = {
  // 用户公开接口
  USER_INFO: `${API_BASE_PATH}/public/user/info`,
  USER_INFO_BATCH: `${API_BASE_PATH}/public/user/info/batch`,
  USER_STATISTICS: `${API_BASE_PATH}/public/user/statistics`,

  // 科普文章公开接口
  SCIENCE_ARTICLES: `${API_BASE_PATH}/public/science/articles`,
  SCIENCE_ARTICLE_DETAIL: (articleId: number) => `${API_BASE_PATH}/public/science/articles/${articleId}`,
  SCIENCE_STATISTICS: `${API_BASE_PATH}/public/science/articles/statistics`,

  // 活动公开接口
  ACTIVITIES: `${API_BASE_PATH}/public/activities/activities`,
  ACTIVITY_DETAIL: (activityId: number) => `${API_BASE_PATH}/public/activities/activities/${activityId}`,
  ACTIVITIES_STATISTICS: `${API_BASE_PATH}/public/activities/activities/statistics`,

  // 公告公开接口
  NOTICE_LIST: `${API_BASE_PATH}/public/notice/list`,
  NOTICE_DETAIL: (noticeId: number) => `${API_BASE_PATH}/public/notice/detail/${noticeId}`,
  NOTICE_STATISTICS: `${API_BASE_PATH}/public/notice/statistics`,
  NOTICE_TYPES: `${API_BASE_PATH}/public/notice/types`,

  // 论坛公开接口
  FORUM_POSTS: `${API_BASE_PATH}/public/forum/posts`,
  FORUM_POST_DETAIL: (postId: number) => `${API_BASE_PATH}/public/forum/posts/${postId}`,
  FORUM_POST_FLOORS: (postId: number) => `${API_BASE_PATH}/public/forum/posts/${postId}/floors`,
  FORUM_CATEGORIES: `${API_BASE_PATH}/public/forum/categories`
}

// ========== 错误码定义 ==========
export const API_ERROR_CODES = {
  // 认证相关错误
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',

  // 验证相关错误
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',

  // 权限相关错误
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // 资源相关错误
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // 服务器相关错误
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // 业务相关错误
  INVALID_OPERATION: 'INVALID_OPERATION',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED'
} as const

// ========== HTTP状态码映射 ==========
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const

// ========== 请求方法配置 ==========
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS'
} as const

// ========== 内容类型定义 ==========
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
  HTML: 'text/html'
} as const

// ========== API响应格式定义 ==========
export const API_RESPONSE_FORMATS = {
  SUCCESS: {
    success: true,
    data: 'any',
    message: 'string'
  },
  ERROR: {
    success: false,
    error: 'string',
    message: 'string',
    code: 'string'
  },
  PAGINATED: {
    success: true,
    data: {
      list: 'array',
      total: 'number',
      page: 'number',
      page_size: 'number',
      total_pages: 'number'
    },
    message: 'string'
  }
} as const

// ========== 默认分页配置 ==========
export const DEFAULT_PAGINATION = {
  PAGE: 1,
  PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
} as const

// ========== 缓存配置 ==========
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5分钟
  SHORT_TTL: 1 * 60 * 1000,   // 1分钟
  LONG_TTL: 30 * 60 * 1000,   // 30分钟
  USER_INFO_TTL: 10 * 60 * 1000, // 10分钟
  STATIC_DATA_TTL: 60 * 60 * 1000 // 1小时
} as const

export default {
  API_BASE_PATH,
  USER_AUTH_API,
  USER_API,
  USER_ADMIN_API,
  ADMIN_API,
  COMMON_API,
  SCIENCE_API,
  ACTIVITIES_API,
  FORUM_API,
  FORUM_ADMIN_API,
  NOTICE_API,
  PUBLIC_API,
  API_ERROR_CODES,
  HTTP_STATUS,
  HTTP_METHODS,
  CONTENT_TYPES,
  API_RESPONSE_FORMATS,
  DEFAULT_PAGINATION,
  CACHE_CONFIG
}