/**
 * 论坛相关类型定义
 * 基于后端接口文档设计
 */

import { PaginatedResponse, PaginationParams } from './api'

// 论坛帖子状态
export type ForumPostStatus = 'active' | 'hidden' | 'deleted'

// 论坛帖子分类
export type ForumPostCategory =
  | 'announcement'
  | 'discussion'
  | 'question'
  | 'sharing'
  | 'feedback'
  | 'other'

// 基础用户信息（论坛显示用）
export interface ForumUserInfo {
  id: number
  account: string
  username?: string
  avatar?: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  display_name?: string
}

// 论坛帖子
export interface ForumPost {
  id: number
  title: string
  content: string
  author_id: number
  author_info: ForumUserInfo
  category: ForumPostCategory
  status: ForumPostStatus
  view_count: number
  like_count: number
  reply_count: number
  floor_count: number
  last_reply_at?: string
  last_reply_by?: string
  created_at: string
  updated_at: string
  is_pinned?: boolean
  is_locked?: boolean
  tags?: string[]
}

// 创建帖子请求
export interface CreateForumPostRequest {
  title: string
  content: string
  category: ForumPostCategory
  tags?: string[]
}

// 更新帖子请求
export interface UpdateForumPostRequest {
  title?: string
  content?: string
  category?: ForumPostCategory
  tags?: string[]
}

// 帖子列表查询参数
export interface ForumPostListParams extends Omit<PaginationParams, 'page'> {
  page?: number // 覆盖 PaginationParams 的必填 page，改为可选
  category?: ForumPostCategory
  status?: ForumPostStatus
  author_id?: number
  keyword?: string
  sort_by?: 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'reply_count'
  sort_order?: 'asc' | 'desc'
  is_pinned?: boolean
}

// 论坛楼层
export interface ForumFloor {
  id: number
  post_id: number
  floor_number: number
  content: string
  author_id: number
  author_info: ForumUserInfo
  like_count: number
  reply_count: number
  created_at: string
  updated_at: string
  is_deleted?: boolean
}

// 创建楼层请求
export interface CreateForumFloorRequest {
  post_id: number
  content: string
}

// 论坛回复
export interface ForumReply {
  id: number
  floor_id: number
  post_id: number
  content: string
  author_id: number
  author_info: ForumUserInfo
  parent_reply_id?: number
  like_count: number
  created_at: string
  updated_at: string
  is_deleted?: boolean
  replies?: ForumReply[] // 子回复
}

// 创建回复请求
export interface CreateForumReplyRequest {
  floor_id: number
  content: string
  parent_reply_id?: number
}

// 论坛访问记录
export interface ForumVisit {
  id: number
  user_id: number
  post_id: number
  visited_at: string
  ip_address?: string
  user_agent?: string
}

// 论坛点赞记录
export interface ForumLike {
  id: number
  user_id: number
  target_type: 'post' | 'floor' | 'reply'
  target_id: number
  created_at: string
}

// 点赞操作请求
export interface ForumLikeRequest {
  target_type: 'post' | 'floor' | 'reply'
  target_id: number
}

// 获取点赞状态请求
export interface ForumLikeStatusRequest {
  target_type: 'post' | 'floor' | 'reply'
  target_ids: number[]
}

// 点赞状态响应
export interface ForumLikeStatusResponse {
  [target_id: string]: boolean
}

// 论坛统计信息
export interface ForumStatistics {
  total_posts: number
  active_posts: number
  total_replies: number
  total_users: number
  today_posts: number
  today_replies: number
  popular_posts: ForumPost[]
  active_users: ForumUserInfo[]
}

// 热门帖子参数
export interface HotPostsParams {
  days?: number // 默认7天
  limit?: number // 默认10
}

// 帖子分类统计
export interface ForumCategoryStats {
  category: ForumPostCategory
  count: number
  description?: string
}

// 搜索参数
export interface ForumSearchParams extends PaginationParams {
  keyword: string
  category?: ForumPostCategory
  author_id?: number
  date_from?: string
  date_to?: string
}

// 批量操作请求
export interface ForumBatchOperationRequest {
  action: 'delete' | 'hide' | 'pin' | 'unpin'
  post_ids: number[]
  reason?: string
}

// 用户论坛统计
export interface UserForumStats {
  user_id: number
  total_posts: number
  total_replies: number
  total_likes_given: number
  total_likes_received: number
  reputation_score: number
  join_date: string
  last_activity: string
}

// 论坛通知类型
export type ForumNotificationType =
  | 'post_replied'
  | 'reply_replied'
  | 'post_liked'
  | 'reply_liked'
  | 'post_mentioned'
  | 'reply_mentioned'
  | 'post_pinned'
  | 'post_locked'

// 论坛通知
export interface ForumNotification {
  id: number
  user_id: number
  type: ForumNotificationType
  title: string
  content: string
  related_id: number // 相关的帖子或回复ID
  related_type: 'post' | 'reply'
  trigger_user_id: number
  trigger_user_info: ForumUserInfo
  is_read: boolean
  created_at: string
}

// API响应类型
export type ForumPostListResponse = PaginatedResponse<ForumPost>
export type ForumFloorListResponse = PaginatedResponse<ForumFloor>
export type ForumReplyListResponse = PaginatedResponse<ForumReply>

// 管理员专用类型
export interface ForumAdminStats {
  total_posts: number
  pending_posts: number
  hidden_posts: number
  deleted_posts: number
  total_reports: number
  pending_reports: number
  active_users: number
  banned_users: number
}

// 论坛举报类型
export type ForumReportType =
  | 'spam'
  | 'inappropriate'
  | 'harassment'
  | 'copyright'
  | 'misinformation'
  | 'other'

// 论坛举报
export interface ForumReport {
  id: number
  reporter_id: number
  target_type: 'post' | 'floor' | 'reply'
  target_id: number
  report_type: ForumReportType
  reason: string
  description?: string
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  reviewed_by?: number
  reviewed_at?: string
  resolution_note?: string
  created_at: string
}

// 创建举报请求
export interface CreateForumReportRequest {
  target_type: 'post' | 'floor' | 'reply'
  target_id: number
  report_type: ForumReportType
  reason: string
  description?: string
}

// 举报处理请求
export interface HandleForumReportRequest {
  report_id: number
  action: 'resolve' | 'dismiss'
  resolution_note?: string
  target_action?: 'delete' | 'hide' | 'ignore' // 对被举报内容的处理
}