/**
 * 活动状态配置文件
 * 统一管理活动状态的映射关系和业务逻辑
 */

// 活动状态枚举（后端存储的英文状态）
export const ACTIVITY_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

export type ActivityStatus = typeof ACTIVITY_STATUS[keyof typeof ACTIVITY_STATUS]

// 状态中文翻译映射
export const STATUS_TRANSLATIONS: Record<ActivityStatus, string> = {
  [ACTIVITY_STATUS.DRAFT]: '草稿',
  [ACTIVITY_STATUS.PUBLISHED]: '已发布',
  [ACTIVITY_STATUS.ONGOING]: '正在进行',
  [ACTIVITY_STATUS.COMPLETED]: '完成',
  [ACTIVITY_STATUS.CANCELLED]: '取消'
}

// 状态在筛选条件中的显示文本
export const STATUS_FILTER_LABELS: Record<string, string> = {
  all: '全部活动',
  upcoming: '即将开始',
  ongoing: '进行中',
  completed: '已结束'
}

// Element Plus 标签类型映射
export const STATUS_TAG_TYPES: Record<ActivityStatus, string> = {
  [ACTIVITY_STATUS.DRAFT]: 'info',
  [ACTIVITY_STATUS.PUBLISHED]: 'primary',
  [ACTIVITY_STATUS.ONGOING]: 'success',
  [ACTIVITY_STATUS.COMPLETED]: 'warning',
  [ACTIVITY_STATUS.CANCELLED]: 'danger'
}

// 状态CSS类名映射（用于卡片状态显示）
export const STATUS_CLASS_MAP: Record<ActivityStatus, string> = {
  [ACTIVITY_STATUS.DRAFT]: 'status-draft',
  [ACTIVITY_STATUS.PUBLISHED]: 'status-published',
  [ACTIVITY_STATUS.ONGOING]: 'status-ongoing',
  [ACTIVITY_STATUS.COMPLETED]: 'status-completed',
  [ACTIVITY_STATUS.CANCELLED]: 'status-cancelled'
}

// 状态选项类型定义
export interface StatusOption {
  label: string
  value: string
}

/**
 * 获取状态的中文显示文本
 * @param status - 状态值
 * @returns 中文显示文本
 */
export function getStatusText(status: string): string {
  return STATUS_TRANSLATIONS[status as ActivityStatus] || '未知状态'
}

/**
 * 获取状态对应的Element Plus标签类型
 * @param status - 状态值
 * @returns 标签类型
 */
export function getStatusTagType(status: string): string {
  return STATUS_TAG_TYPES[status as ActivityStatus] || 'info'
}

/**
 * 获取状态对应的CSS类名
 * @param status - 状态值
 * @returns CSS类名
 */
export function getStatusClass(status: string): string {
  return STATUS_CLASS_MAP[status as ActivityStatus] || 'status-draft'
}

/**
 * 根据筛选条件获取对应的状态列表
 * @param filter - 筛选条件：all, upcoming, ongoing, completed
 * @returns 符合条件的状态数组
 */
export function getStatusesByFilter(filter: string): ActivityStatus[] {
  switch (filter) {
    case 'all':
      // 全部活动仅显示"已发布"、"正在进行"、"完成"状态的活动
      return [
        ACTIVITY_STATUS.PUBLISHED,
        ACTIVITY_STATUS.ONGOING,
        ACTIVITY_STATUS.COMPLETED
      ]
    case 'upcoming':
      // 即将开始仅显示已发布活动
      return [ACTIVITY_STATUS.PUBLISHED]
    case 'ongoing':
      // 进行中仅显示正在进行活动
      return [ACTIVITY_STATUS.ONGOING]
    case 'completed':
      // 已结束仅显示完成活动
      return [ACTIVITY_STATUS.COMPLETED]
    default:
      return []
  }
}

/**
 * 检查状态是否为有效状态
 * @param status - 状态值
 * @returns 是否为有效状态
 */
export function isValidStatus(status: string): boolean {
  return Object.values(ACTIVITY_STATUS).includes(status as ActivityStatus)
}

/**
 * 获取所有可用状态的选项（用于管理员下拉选择）
 * 包含草稿状态用于管理
 * @returns 状态选项数组
 */
export function getAllStatusOptions(): StatusOption[] {
  return Object.entries(STATUS_TRANSLATIONS).map(([value, label]) => ({
    label,
    value
  }))
}

/**
 * 获取用于活动列表页面的状态选项（不包含草稿状态）
 * @returns 状态选项数组
 */
export function getPublicStatusOptions(): StatusOption[] {
  return Object.entries(STATUS_TRANSLATIONS)
    .filter(([status]) => status !== ACTIVITY_STATUS.DRAFT)
    .map(([value, label]) => ({
      label,
      value
    }))
}