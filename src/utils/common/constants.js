/**
 * 常量定义文件
 */

// 用户角色
export const USER_ROLES = {
  ADMIN: 'admin',
  ORGANIZATION: 'organization',
  USER: 'user',
  GUEST: 'guest'
}

// 用户角色名称
export const USER_ROLE_NAMES = {
  [USER_ROLES.ADMIN]: '管理员',
  [USER_ROLES.ORGANIZATION]: '组织用户',
  [USER_ROLES.USER]: '普通用户',
  [USER_ROLES.GUEST]: '访客'
}

// 帖子状态
export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  DELETED: 'deleted',
  PINNED: 'pinned'
}

// 帖子状态名称
export const POST_STATUS_NAMES = {
  [POST_STATUS.DRAFT]: '草稿',
  [POST_STATUS.PUBLISHED]: '已发布',
  [POST_STATUS.DELETED]: '已删除',
  [POST_STATUS.PINNED]: '已置顶'
}

// 审核状态
export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

// 审核状态名称
export const REVIEW_STATUS_NAMES = {
  [REVIEW_STATUS.PENDING]: '待审核',
  [REVIEW_STATUS.APPROVED]: '已通过',
  [REVIEW_STATUS.REJECTED]: '已拒绝'
}

// 活动状态
export const ACTIVITY_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

// 活动状态名称
export const ACTIVITY_STATUS_NAMES = {
  [ACTIVITY_STATUS.DRAFT]: '草稿',
  [ACTIVITY_STATUS.PUBLISHED]: '已发布',
  [ACTIVITY_STATUS.ONGOING]: '进行中',
  [ACTIVITY_STATUS.COMPLETED]: '已结束',
  [ACTIVITY_STATUS.CANCELLED]: '已取消'
}

// 预约状态
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
}

// 预约状态名称
export const BOOKING_STATUS_NAMES = {
  [BOOKING_STATUS.PENDING]: '待确认',
  [BOOKING_STATUS.CONFIRMED]: '已确认',
  [BOOKING_STATUS.CANCELLED]: '已取消',
  [BOOKING_STATUS.COMPLETED]: '已完成'
}

// 通知类型
export const NOTICE_TYPES = {
  SYSTEM: 'system',
  ANNOUNCEMENT: 'announcement',
  REMINDER: 'reminder',
  WARNING: 'warning'
}

// 通知类型名称
export const NOTICE_TYPE_NAMES = {
  [NOTICE_TYPES.SYSTEM]: '系统通知',
  [NOTICE_TYPES.ANNOUNCEMENT]: '公告通知',
  [NOTICE_TYPES.REMINDER]: '提醒通知',
  [NOTICE_TYPES.WARNING]: '警告通知'
}

// 文件上传类型
export const FILE_TYPES = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  VIDEO: 'video',
  AUDIO: 'audio'
}

// 支持的图片格式
export const SUPPORTED_IMAGE_TYPES = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'
]

// 支持的文档格式
export const SUPPORTED_DOCUMENT_TYPES = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'
]

// 支持的视频格式
export const SUPPORTED_VIDEO_TYPES = [
  'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'
]

// 支持的音频格式
export const SUPPORTED_AUDIO_TYPES = [
  'mp3', 'wav', 'ogg', 'aac', 'flac'
]

// 文件大小限制（KB）
export const FILE_SIZE_LIMITS = {
  AVATAR: 2048, // 2MB
  IMAGE: 5120, // 5MB
  DOCUMENT: 10240, // 10MB
  VIDEO: 51200, // 50MB
  AUDIO: 20480 // 20MB
}

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  DEFAULT_PAGE: 1
}

// 日期格式
export const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DATE_TIME: 'YYYY-MM-DD HH:mm',
  MONTH: 'YYYY-MM',
  YEAR: 'YYYY'
}

// 主题配置
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
}

// 主题颜色
export const THEME_COLORS = {
  [THEMES.LIGHT]: {
    primary: '#409EFF',
    success: '#67C23A',
    warning: '#E6A23C',
    danger: '#F56C6C',
    info: '#909399'
  },
  [THEMES.DARK]: {
    primary: '#409EFF',
    success: '#67C23A',
    warning: '#E6A23C',
    danger: '#F56C6C',
    info: '#909399'
  }
}

// API错误码
export const ERROR_CODES = {
  SUCCESS: 0,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  NETWORK_ERROR: -1
}

// 错误信息
export const ERROR_MESSAGES = {
  [ERROR_CODES.UNAUTHORIZED]: '未授权，请先登录',
  [ERROR_CODES.FORBIDDEN]: '权限不足',
  [ERROR_CODES.NOT_FOUND]: '资源不存在',
  [ERROR_CODES.SERVER_ERROR]: '服务器内部错误',
  [ERROR_CODES.NETWORK_ERROR]: '网络连接失败'
}

// 表单验证规则
export const VALIDATION_RULES = {
  USERNAME_MIN_LENGTH: 4,
  USERNAME_MAX_LENGTH: 20,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 20,
  TITLE_MAX_LENGTH: 100,
  CONTENT_MAX_LENGTH: 10000,
  DESCRIPTION_MAX_LENGTH: 500
}

// 缓存时间配置（毫秒）
export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5分钟
  MEDIUM: 30 * 60 * 1000, // 30分钟
  LONG: 60 * 60 * 1000, // 1小时
  VERY_LONG: 24 * 60 * 60 * 1000 // 24小时
}

// 路由名称
export const ROUTE_NAMES = {
  HOME: 'home',
  LOGIN: 'login',
  REGISTER: 'register',
  ADMIN_DASHBOARD: 'adminDashboard',
  USER_DASHBOARD: 'userDashboard',
  FORUM_HOME: 'forumHome',
  ACTIVITY_HOME: 'activityHome',
  PROFILE: 'profile',
  SETTINGS: 'settings'
}

// 本地存储键名（新认证系统使用tokenManager）
export const STORAGE_KEYS = {
  TOKEN: 'access_token', // tokenManager 使用 access_token
  REFRESH_TOKEN: 'refresh_token', // tokenManager 使用 refresh_token
  USER_INFO: 'user_info',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
  LAST_LOGIN_TIME: 'last_login_time'
}

// 正则表达式
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^1[3-9]\d{9}$/,
  USERNAME: /^[a-zA-Z0-9_]{4,20}$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,20}$/,
  ID_CARD: /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
  URL: /^https?:\/\/.+/
}

// 性能配置
export const PERFORMANCE = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  TOAST_DURATION: 3000,
  LOADING_MIN_DURATION: 500
}

// 地图配置
export const MAP_CONFIG = {
  DEFAULT_CENTER: [116.397428, 39.90923], // 北京天安门
  DEFAULT_ZOOM: 11,
  MAX_ZOOM: 18,
  MIN_ZOOM: 3
}

// 富文本编辑器配置
export const EDITOR_CONFIG = {
  TOOLBAR: [
    'undo redo | bold italic underline strikethrough | \
    fontselect fontsizeselect formatselect | \
    alignleft aligncenter alignright alignjustify | \
    outdent indent |  numlist bullist checklist | \
    forecolor backcolor casechange permanentpen formatpainter removeformat | \
    pagebreak | charmap emoticons | fullscreen  preview save print | \
    insertfile image media template link anchor codesample | a11ycheck ltr rtl | \
    showcomments addcomment'
  ],
  PLUGINS: [
    'advlist autolink autosave save directionality emoticons fullscreen hr image',
    'insertdatetime link media nonbreaking pagebreak preview', 'searchreplace wordcount textpattern',
    'noneditable help charmap quickbars emoticons'
  ]
}

export default {
  USER_ROLES,
  USER_ROLE_NAMES,
  POST_STATUS,
  POST_STATUS_NAMES,
  REVIEW_STATUS,
  REVIEW_STATUS_NAMES,
  ACTIVITY_STATUS,
  ACTIVITY_STATUS_NAMES,
  BOOKING_STATUS,
  BOOKING_STATUS_NAMES,
  NOTICE_TYPES,
  NOTICE_TYPE_NAMES,
  FILE_TYPES,
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_DOCUMENT_TYPES,
  SUPPORTED_VIDEO_TYPES,
  SUPPORTED_AUDIO_TYPES,
  FILE_SIZE_LIMITS,
  PAGINATION,
  DATE_FORMATS,
  THEMES,
  THEME_COLORS,
  ERROR_CODES,
  ERROR_MESSAGES,
  VALIDATION_RULES,
  CACHE_TTL,
  ROUTE_NAMES,
  STORAGE_KEYS,
  REGEX_PATTERNS,
  PERFORMANCE,
  MAP_CONFIG,
  EDITOR_CONFIG
}