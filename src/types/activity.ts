/**
 * 活动相关的TypeScript类型定义
 */

// 活动状态枚举
export enum ActivityStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// 活动类型枚举
export enum ActivityType {
  SCIENCE_LECTURE = 'science_lecture',
  FISHING_COMPETITION = 'fishing_competition',
  ECOLOGY_TOUR = 'ecology_tour',
  WORKSHOP = 'workshop',
  EXHIBITION = 'exhibition',
  OTHER = 'other'
}

// 基础活动接口
export interface ActivityInterface {
  id: number
  title: string
  description: string
  content?: string
  type: ActivityType
  status: ActivityStatus
  start_time: string
  end_time: string
  location: string
  max_participants: number
  current_participants: number
  organizer_id: number
  organizer_name?: string
  organizer_display_name?: string
  created_at: string
  updated_at: string
  is_deleted: boolean
}

// 活动列表项
export interface ActivityListItem {
  id: number
  title: string
  description: string
  type: ActivityType
  status: ActivityStatus
  start_time: string
  end_time: string
  location: string
  max_participants: number
  current_participants: number
  organizer_name?: string
  organizer_display_name?: string
  created_at: string
}

// 活动详情
export interface ActivityDetail extends ActivityInterface {
  content?: string
  images?: string[]
  requirements?: string[]
  contact_info?: string
}

// 活动预约
export interface ActivityBookingInterface {
  id: number
  activity_id: number
  user_id: number
  booking_time: string
  status: 'confirmed' | 'cancelled' | 'attended'
  cancel_time?: string
  cancel_reason?: string
  created_at: string
  updated_at: string
}

// 活动评分
export interface ActivityRatingInterface {
  id: number
  activity_id: number
  user_id: number
  user_display_name?: string
  user_avatar?: string
  rating: number
  comment?: string
  created_at: string
  updated_at: string
}

// 活动讨论
export interface ActivityDiscussionInterface {
  id: number
  activity_id: number
  user_id: number
  user_display_name?: string
  user_avatar?: string
  title: string
  content: string
  images?: string[]
  like_count: number
  created_at: string
  updated_at: string
}

// 讨论留言
export interface DiscussCommentInterface {
  id: number
  discussion_id: number
  user_id: number
  user_display_name?: string
  user_avatar?: string
  content: string
  created_at: string
  updated_at: string
}

// API请求和响应类型
export interface ActivityListParams {
  page?: number
  size?: number
  search?: string
  type?: ActivityType
  status?: ActivityStatus
  start_date?: string
  end_date?: string
}

export interface ActivityListResponse {
  total: number
  items: ActivityListItem[]
  page: number
  size: number
  total_pages: number
}

export interface ActivityCreateData {
  title: string
  description: string
  content?: string
  type: ActivityType
  start_time: string
  end_time: string
  location: string
  max_participants: number
  images?: string[]
  requirements?: string[]
  contact_info?: string
}

export interface ActivityCommentData {
  content: string
  images?: string[]
}

export interface ActivityBookingData {
  user_id: number
  notes?: string
}

export interface ActivityRatingData {
  rating: number
  comment?: string
}

// 用户预约记录
export interface UserBooking {
  id: number
  activity: ActivityListItem
  booking_time: string
  status: 'confirmed' | 'cancelled' | 'attended'
  cancel_time?: string
  cancel_reason?: string
}