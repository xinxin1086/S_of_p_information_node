<template>
  <!-- 活动讨论和评分 -->
  <div class="comments-reviews-section" v-if="activity">
    <el-card class="detail-card">
      <template #header>
        <div class="comments-reviews-header">
          <h3>活动讨论和评分</h3>
        </div>
      </template>

      <!-- 选项切换 -->
      <div class="tab-switcher">
        <div class="tab-buttons">
          <button
            @click="activeTab = 'discussion'"
            :class="['tab-button', { active: activeTab === 'discussion' }]"
          >
            活动讨论
          </button>
          <button
            @click="activeTab = 'reviews'"
            :class="['tab-button', { active: activeTab === 'reviews' }]"
          >
            活动评分评语
          </button>
        </div>
      </div>

      <!-- 活动讨论模块 -->
      <div v-if="activeTab === 'discussion'" class="tab-content">
        <!-- 权限提示 -->
        <div v-if="!canComment" class="auth-prompt">
          <el-alert
            v-if="!authStore.isAuthenticated"
            title="请先登录"
            description="登录后才能参与活动讨论"
            type="info"
            show-icon
            :closable="false"
          />
          <el-alert
            v-else-if="authStore.user?.role === 'ADMIN' || authStore.user?.role === 'SUPER_ADMIN'"
            title="管理员账号"
            description="管理员账号不能参与讨论，请使用普通用户账号登录"
            type="warning"
            show-icon
            :closable="false"
          />
        </div>

        <div class="discussion-section">
          <!-- 发表评论按钮 -->
          <div class="section-header">
            <h4>活动讨论</h4>
            <el-button
              type="primary"
              size="small"
              @click="showCommentForm = !showCommentForm"
              v-if="canComment"
            >
              {{ showCommentForm ? '收起' : '发表讨论' }}
            </el-button>
          </div>

          <!-- 评论表单 -->
          <div v-if="showCommentForm && canComment" class="comment-form">
            <el-form :model="commentForm" label-width="0">
              <el-form-item>
                <el-input
                  v-model="commentForm.content"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入您的讨论..."
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  @click="submitComment"
                  :loading="submitting"
                  :disabled="!commentForm.content.trim()"
                >
                  发表讨论
                </el-button>
                <el-button @click="cancelComment">取消</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 讨论列表 -->
          <div v-if="comments.length > 0" class="discussions-list">
            <div
              v-for="discussion in comments"
              :key="discussion.id"
              class="discussion-item"
            >
              <!-- 主讨论区域 -->
              <div class="discussion-main">
                <!-- 用户头像 -->
                <div class="user-avatar">
                  <el-avatar
                    :size="32"
                    :src="getAvatarUrl(discussion.author_avatar)"
                  >
                    {{ discussion.author_display?.charAt(0) || '用' }}
                  </el-avatar>
                </div>

                <!-- 讨论内容区域 -->
                <div class="discussion-content">
                  <!-- 用户信息 -->
                  <div class="user-info">
                    <span class="username">{{ discussion.author_display || '匿名用户' }}</span>
                    <span class="publish-time">{{ formatRelativeTime(discussion.create_time) }}</span>
                  </div>

                  <!-- 讨论内容 -->
                  <div class="discussion-text">{{ discussion.content }}</div>

                  <!-- 操作按钮 -->
                  <div class="action-buttons">
                    <el-button
                      type="text"
                      size="small"
                      class="reply-btn"
                      @click="replyToComment(discussion)"
                      v-if="!shouldHideMainDiscussionReplyBtn(discussion) && canComment"
                    >
                      回复讨论
                    </el-button>
                    <el-button
                      type="text"
                      size="small"
                      class="reply-btn"
                      @click="loadDiscussionReplies(discussion.id)"
                      v-if="!discussion.replies || discussion.replies.length === 0"
                    >
                      查看回复
                    </el-button>
                  </div>
                </div>
              </div>

  
              <!-- 子回复区域 - 使用递归组件 -->
              <div v-if="discussion.replies && discussion.replies.length > 0" class="replies-section">
                <CommentReply
                  v-for="reply in discussion.replies"
                  :key="reply.id"
                  :reply="reply"
                  :replying-to="replyingTo"
                  @reply-to-comment="replyToComment"
                  @delete-comment="handleDeleteComment"
                />
              </div>

              <!-- 回复表单 - 直接显示在讨论下方，无论是否有回复 -->
              <div v-if="replyingTo && isReplyingToDiscussion(discussion)" class="reply-form-container">
                <div class="reply-form">
                  <div class="reply-avatar">
                    <el-avatar :size="32">
                      我
                    </el-avatar>
                  </div>
                  <div class="reply-input-area">
                    <div class="reply-to-info">
                      <span class="reply-prefix">回复</span>
                      <span class="reply-user">@{{ replyingTo.author_display || '用户' + replyingTo.author_user_id }}</span>
                    </div>
                    <el-input
                      ref="replyTextareaRef"
                      v-model="replyContent"
                      type="textarea"
                      :rows="2"
                      :placeholder="`回复 @${replyingTo.author_display || '用户' + replyingTo.author_user_id}...`"
                      maxlength="200"
                      show-word-limit
                      class="reply-textarea"
                      resize="none"
                    />
                    <div class="reply-actions">
                      <el-button
                        type="primary"
                        size="small"
                        @click="submitReply"
                        :loading="submitting"
                        class="submit-reply-btn"
                      >
                        回复
                      </el-button>
                      <el-button size="small" @click="cancelReply" class="cancel-reply-btn">
                        取消
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 无讨论时的提示 -->
          <div v-else class="no-comments">
            <el-empty description="暂无讨论，快来发表第一条讨论吧！" />
          </div>
        </div>
      </div>

      <!-- 活动评分模块 -->
      <div v-if="activeTab === 'reviews'" class="tab-content">
        <!-- 权限提示 -->
        <div v-if="!canRate" class="auth-prompt">
          <el-alert
            v-if="!authStore.isAuthenticated"
            title="请先登录"
            description="登录后才能为活动评分"
            type="info"
            show-icon
            :closable="false"
          />
          <el-alert
            v-else-if="authStore.user?.role === 'ADMIN' || authStore.user?.role === 'SUPER_ADMIN'"
            title="管理员账号"
            description="管理员账号不能为活动评分，请使用普通用户账号登录"
            type="warning"
            show-icon
            :closable="false"
          />
        </div>

        <div class="reviews-section">
          <div class="section-header">
            <h4>活动评分评语</h4>
          </div>

          <div class="rating-content">
            <!-- 活动评分统计 -->
            <div class="activity-rating-summary" v-if="totalRatings > 0">
              <div class="rating-summary-header">
                <h4>活动评分统计</h4>
              </div>
              <div class="rating-summary-content">
                <div class="rating-overview">
                  <div class="average-rating">
                    <div class="average-score">{{ averageRating.toFixed(1) }}</div>
                    <el-rate
                      v-model="averageRating"
                      disabled
                      show-score
                      text-color="#ff9900"
                      score-template=""
                      :max="5"
                      :precision="1"
                      size="large"
                    />
                    <div class="rating-count">{{ totalRatings }} 人评价</div>
                  </div>
                </div>

                <div class="rating-distribution" v-if="hasDetailedRatings">
                  <div class="distribution-item" v-for="(count, stars) in ratingDistribution" :key="stars">
                    <span class="stars-label">{{ stars }}星</span>
                    <div class="progress-bar">
                      <div
                        class="progress-fill"
                        :style="{ width: totalRatings > 0 ? (count / totalRatings * 100) + '%' : '0%' }"
                      ></div>
                    </div>
                    <span class="stars-count">{{ count }}</span>
                  </div>
                </div>

                <!-- 当没有详细评分数据时显示提示 -->
                <div class="rating-distribution-placeholder" v-else-if="totalRatings > 0">
                  <div class="placeholder-content">
                    <p>详细的评分分布数据需要从服务器获取</p>
                    <el-button type="text" size="small" @click="loadDetailedRatings">
                      查看详细评分分布
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 评分信息列表 -->
            <div class="rating-list" v-if="ratings.length > 0">
              <div
                v-for="rating in ratings"
                :key="rating.id"
                class="rating-item"
              >
                <div class="rating-header">
                  <el-avatar
                    :size="40"
                    :src="getAvatarUrl(rating.rater_avatar || rating.user_avatar)"
                  >
                    {{ (rating.user_display_name || '匿').charAt(0) }}
                  </el-avatar>
                  <div class="rating-info">
                    <div class="rating-user">{{ rating.user_display_name || '匿名用户' }}</div>
                    <div class="rating-time">{{ formatDateTime(rating.created_at) }}</div>
                  </div>
                  <el-rate
                    :model-value="rating.rating || rating.score"
                    disabled
                    size="small"
                  />
                </div>
                <div class="rating-comment" v-if="rating.comment">
                  {{ rating.comment }}
                </div>
              </div>
            </div>

            <div v-else-if="hasRated" class="rated-message">
              <el-empty description="您已经评价过这个活动了" />
            </div>

            <div v-else class="no-ratings">
              <el-empty description="暂无评分，成为第一个评价的人吧！" />
            </div>

            <!-- 填写评分表单 -->
            <div class="rating-form" v-if="!hasRated && canRate">
              <div class="rating-form-header">
                <h4>为活动打分</h4>
                <p>分享您的活动体验和感受</p>
              </div>
              <div class="rating-stars">
                <el-rate
                  v-model="ratingForm.rating"
                  :colors="['#F7BA2A', '#F7BA2A', '#F7BA2A']"
                  :texts="['很差', '较差', '一般', '满意', '非常满意']"
                  show-text
                  size="large"
                />
              </div>
              <div class="rating-comment-section">
                <el-input
                  v-model="ratingForm.comment"
                  type="textarea"
                  :rows="4"
                  placeholder="分享您的活动体验..."
                  maxlength="300"
                  show-word-limit
                  class="rating-comment-input"
                  resize="none"
                />
              </div>
              <div class="rating-submit-section">
                <el-button
                  type="primary"
                  @click="submitRating"
                  :loading="ratingSubmitting"
                  :disabled="ratingForm.rating === 0"
                  class="submit-rating-btn"
                  :style="buttonStyle"
                >
                  提交评分
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { ref, computed, nextTick } from 'vue'

import CommentReply from './CommentReply.vue'

import { useAuthStore } from '@/stores'
import { getAvatarUrl } from '@/utils/avatar.js'


interface Activity {
  id: number | string
  avgScore?: number
  ratingCount?: number
  [key: string]: unknown
}

interface Comment {
  id: number | string
  content: string
  author_display?: string
  author_avatar?: string
  author_user_id?: number | string
  create_time: string
  replies?: Comment[]
  [key: string]: unknown
}

interface Rating {
  id: number | string
  rating?: number
  score?: number
  comment?: string
  user?: {
    username?: string
    avatar?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

// Props
interface Props {
  /** 活动数据 */
  activity: Activity
  /** 评论列表 */
  comments?: Comment[]
  /** 评分列表 */
  ratings?: Rating[]
  /** 是否已评分 */
  hasRated?: boolean
  /** 评论提交中 */
  submitting?: boolean
  /** 评分提交中 */
  ratingSubmitting?: boolean
  /** 按钮主题色 */
  buttonColor?: string
  /** 用户是否已登录 */
  isAuthenticated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  comments: () => [],
  ratings: () => [],
  hasRated: false,
  submitting: false,
  ratingSubmitting: false,
  buttonColor: '#409eff',
  isAuthenticated: false
})

// Emits
interface Emits {
  /** 提交评论 */
  'submit-comment': [content: string]
  /** 提交回复 */
  'submit-reply': [commentId: number | string, content: string, parentId?: number | string]
  /** 提交评分 */
  'submit-rating': [rating: number, comment: string]
  /** 回复评论 */
  'reply-comment': [comment: Comment]
  /** 取消回复 */
  'cancel-reply': []
  /** 更新评分列表 */
  'update:ratings': [ratings: Rating[]]
  /** 加载回复 */
  'load-replies': [commentId: number | string]
  /** 删除评论 */
  'delete-comment': [commentId: number | string]
}

const emit = defineEmits<Emits>()

const activeTab = ref('discussion')
const showCommentForm = ref(false)
const commentForm = ref({ content: '' })
const replyingTo = ref(null)
const replyContent = ref('')
const replyTextareaRef = ref(null)
const ratingForm = ref({
  rating: 0,
  comment: ''
})

// 用户信息相关
const authStore = useAuthStore()

// 权限控制计算属性
const canComment = computed(() => {
  // 必须已登录且不是管理员
  return authStore.isAuthenticated && authStore.user?.role !== 'ADMIN' && authStore.user?.role !== 'SUPER_ADMIN'
})

const canRate = computed(() => {
  // 必须已登录且不是管理员
  return authStore.isAuthenticated && authStore.user?.role !== 'ADMIN' && authStore.user?.role !== 'SUPER_ADMIN'
})

// 用户信息缓存相关变量已移除 - 直接使用讨论数据中的 author_display 和 author_avatar

// 计算属性
const averageRating = computed(() => {
  if (props.activity?.avgScore > 0) {
    return props.activity.avgScore
  }
  if (props.ratings.length === 0) return 0
  const sum = props.ratings.reduce((acc, rating) => acc + (rating.rating || rating.score || 0), 0)
  return sum / props.ratings.length
})

const totalRatings = computed(() => {
  if (props.activity?.ratingCount > 0) {
    return props.activity.ratingCount
  }
  return props.ratings.length
})

const ratingDistribution = computed(() => {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

  // 优先使用真实的评分数据进行统计
  if (props.ratings && props.ratings.length > 0) {
    props.ratings.forEach(rating => {
      const ratingValue = Math.floor(rating.rating || rating.score || 0)
      if (ratingValue >= 1 && ratingValue <= 5) {
        distribution[ratingValue]++
      }
    })
  } else if (props.activity?.avgScore > 0 && props.activity?.ratingCount > 0) {
    // 如果没有详细评分数据，但有平均分和总评分数，显示提示信息
    // 不再使用估算算法，避免误导用户
    // 用户可以点击"查看全部评分"按钮查看真实数据
  }

  return distribution
})

// 判断是否有详细的评分数据
const hasDetailedRatings = computed(() => {
  return props.ratings && props.ratings.length > 0
})

// 判断是否在当前讨论下显示回复表单
const isReplyingToDiscussion = (discussion) => {
  if (!replyingTo.value) return false

  // 如果回复的是主讨论，显示表单
  if (replyingTo.value.id === discussion.id) return true

  // 如果回复的是该讨论下的某个回复，也显示表单
  if (discussion.replies && Array.isArray(discussion.replies)) {
    return discussion.replies.some(reply => reply.id === replyingTo.value.id)
  }

  return false
}

// 判断是否应该隐藏主讨论的回复按钮
const shouldHideMainDiscussionReplyBtn = (discussion) => {
  return replyingTo.value &&
         replyingTo.value.id === discussion.id &&
         replyingTo.value.parent_comment_id === undefined
}

// 加载详细评分数据的方法
const loadDetailedRatings = async () => {
  if (!props.activity?.id) return

  try {
    const { activityApi } = await import('@/api/index.js')
    const response = await activityApi.getActivityRatingsDetail(props.activity.id)
    if (response.success && response.data?.ratings) {
      // 通过emit通知父组件更新评分数据
      emit('update:ratings', response.data.ratings)
    }
  } catch (error) {
    console.error('加载详细评分数据失败:', error)
  }
}

const buttonStyle = computed(() => ({
  backgroundColor: props.buttonColor,
  borderColor: props.buttonColor
}))


// loadUserInfoForComment 和 preloadUserInfos 函数已移除 - 不再需要额外的用户信息获取

// 方法
const submitComment = () => {
  if (!commentForm.value.content.trim()) {
    ElMessage.warning('请输入讨论内容')
    return
  }

  emit('submit-comment', {
    content: commentForm.value.content.trim()
  })
}

const cancelComment = () => {
  commentForm.value.content = ''
  showCommentForm.value = false
}

const replyToComment = (comment) => {
  replyingTo.value = comment
  replyContent.value = ''
  emit('reply-comment', comment)

  // 自动聚焦到回复输入框
  nextTick(() => {
    if (replyTextareaRef.value) {
      const textarea = replyTextareaRef.value.textarea || replyTextareaRef.value.$el?.querySelector('textarea')
      if (textarea) {
        textarea.focus()
      }
    }
  })
}

const submitReply = () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  // 构建回复内容，在前面加上 @用户名
  const replyToUser = replyingTo.value.author_display || '用户' + replyingTo.value.author_user_id
  const contentWithMention = `@${replyToUser} ${replyContent.value.trim()}`

  // 根据API返回的数据结构，每个评论对象都包含了discuss_id字段
  // 直接使用replyingTo对象中的discuss_id即可
  const discussionId = replyingTo.value.discuss_id

  emit('submit-reply', {
    content: contentWithMention,
    discussion_id: discussionId, // 传递正确的讨论ID
    parent_comment_id: replyingTo.value.id, // 被回复的评论ID
    reply_to_user: replyToUser // 添加被回复用户信息，便于后端存储
  })
}

const cancelReply = () => {
  replyingTo.value = null
  replyContent.value = ''
  emit('cancel-reply')
}

const submitRating = () => {
  if (ratingForm.value.rating === 0) {
    ElMessage.warning('请选择评分')
    return
  }

  emit('submit-rating', {
    rating: ratingForm.value.rating,
    comment: ratingForm.value.comment.trim()
  })
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatRelativeTime = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 10) {
    return '刚刚'
  } else if (diffSeconds < 60) {
    return `${diffSeconds}秒前`
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    // 超过一周显示具体日期
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

// 加载讨论回复
const loadDiscussionReplies = async (discussionId) => {
  try {
    emit('load-replies', discussionId)
  } catch (error) {
    console.error('Load discussion replies error:', error)
  }
}

// 删除评论处理方法
const handleDeleteComment = async (commentId) => {
  console.log('🟠 ActivityCommentsReviews: 接收到删除请求, commentId:', commentId)
  try {
    // 直接调用父组件提供的删除方法
    emit('delete-comment', commentId)
    console.log('🟠 ActivityCommentsReviews: 已触发父组件删除事件')
  } catch (error) {
    console.error('🟠 ActivityCommentsReviews: 删除处理异常:', error)
  }
}

// 暴露方法供父组件调用
defineExpose({
  resetCommentForm: () => {
    commentForm.value.content = ''
    showCommentForm.value = false
  },
  resetReplyForm: () => {
    replyingTo.value = null
    replyContent.value = ''
  },
  resetRatingForm: () => {
    ratingForm.value = { rating: 0, comment: '' }
  }
})

// 监听评论和评分变化，预加载用户信息
// 用户信息预加载监听器已移除 - 讨论数据中已包含完整的用户信息
</script>

<style scoped>
/* 评论评分相关样式 */
.comments-reviews-section {
  margin-top: 30px;
}

.comments-reviews-header h3 {
  margin: 0;
  color: #606266;
  font-size: 18px;
  font-weight: 500;
}

.auth-prompt {
  margin-bottom: 20px;
}

.auth-prompt .el-alert {
  margin-bottom: 10px;
}

.auth-prompt .el-alert:last-child {
  margin-bottom: 0;
}

.tab-switcher {
  margin-bottom: 25px;
}

.tab-buttons {
  display: flex;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 4px;
  width: fit-content;
}

.tab-button {
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.tab-button:hover {
  color: #606266;
}

.tab-button.active {
  background: #b3d4fc;
  color: white;
  box-shadow: none;
}

.tab-content {
  padding-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h4 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.comment-form {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

/* 讨论列表样式 */
.discussions-list {
  margin-top: 20px;
}

/* 主讨论项样式 */
.discussion-item {
  margin-bottom: 20px;
  padding: 0;
  background: transparent;
}

.discussion-main {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.user-avatar {
  flex-shrink: 0;
}

.discussion-content {
  flex: 1;
  min-width: 0;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.username {
  font-weight: 600;
  color: #212121;
  font-size: 14px;
  line-height: 1.2;
}

.publish-time {
  color: #9e9e9e;
  font-size: 12px;
  line-height: 1.2;
}

/* 讨论内容样式 */
.discussion-text {
  color: #212121;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
  word-break: break-word;
  white-space: pre-wrap;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 16px;
  align-items: center;
}

.reply-btn {
  color: #00a1d6 !important;
  font-size: 13px !important;
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
  min-height: auto !important;
  cursor: pointer;
}

.reply-btn:hover {
  color: #0084b9 !important;
  background: rgba(0, 161, 214, 0.1) !important;
}

/* 回复表单样式 */
.reply-form-container {
  margin-top: 16px;
  padding-left: 44px;
}

.reply-form {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.reply-avatar {
  flex-shrink: 0;
}

.reply-input-area {
  flex: 1;
  min-width: 0;
}

.reply-to-info {
  margin-bottom: 8px;
  font-size: 13px;
  color: #666;
}

.reply-prefix {
  color: #999;
  margin-right: 4px;
}

.reply-user {
  color: #409eff;
  font-weight: 500;
}


.reply-textarea :deep(.el-textarea__inner) {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  color: #212121;
  line-height: 1.5;
  resize: none;
  transition: all 0.3s ease;
}

.reply-textarea :deep(.el-textarea__inner):focus {
  border-color: #00a1d6;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(0, 161, 214, 0.2);
}

.reply-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.submit-reply-btn {
  background: #00a1d6 !important;
  border-color: #00a1d6 !important;
  font-size: 13px !important;
  padding: 6px 16px !important;
}

.submit-reply-btn:hover {
  background: #0084b9 !important;
  border-color: #0084b9 !important;
}

.cancel-reply-btn {
  font-size: 13px !important;
  padding: 6px 16px !important;
  color: #757575 !important;
  background: transparent !important;
  border: 1px solid #e0e0e0 !important;
}

.cancel-reply-btn:hover {
  background: #f5f5f5 !important;
  border-color: #bdbdbd !important;
  color: #424242 !important;
}

/* 子回复区域样式 - 简化版本，大部分样式移到CommentReply组件 */
.replies-section {
  margin-top: 12px;
  padding-left: 44px;
  border-left: 2px solid #f0f0f0;
  background: #fafafa;
  border-radius: 0 4px 4px 0;
  padding: 12px 12px 12px 16px;
}

.no-comments {
  padding: 40px 0;
  text-align: center;
}

/* 评分相关样式 */
.rating-content {
  padding: 10px 0;
}

/* 活动评分统计样式 */
.activity-rating-summary {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
  overflow: hidden;
}

.rating-summary-header {
  background: #f8f9fa;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.rating-summary-header h4 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.rating-summary-content {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 40px;
}

.rating-overview {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.average-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.average-score {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.rating-count {
  font-size: 13px;
  color: #909399;
  text-align: center;
}

.rating-distribution {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.distribution-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stars-label {
  min-width: 35px;
  font-size: 13px;
  color: #606266;
  text-align: right;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background-color: #f5f7fa;
  border-radius: 3px;
  overflow: hidden;
  min-width: 80px;
  max-width: 150px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff9900 0%, #ff6600 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.stars-count {
  min-width: 25px;
  font-size: 13px;
  color: #606266;
  text-align: center;
}

.rating-distribution-placeholder {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
}

.placeholder-content {
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.placeholder-content p {
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.rating-form {
  padding: 25px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 30px;
  text-align: center;
}

.rating-form-header {
  margin-bottom: 20px;
}

.rating-form-header h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.rating-form-header p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.rating-stars {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.rating-stars :deep(.el-rate) {
  height: auto;
}

.rating-stars :deep(.el-rate__item) {
  margin-right: 6px;
}

.rating-stars :deep(.el-rate__icon) {
  font-size: 28px;
}

.rating-comment-section {
  margin: 20px 0;
}

.rating-comment-input :deep(.el-textarea__inner) {
  border: 1px solid #aaaaaa;
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  color: #606266;
  resize: none;
  transition: border-color 0.3s ease;
}

.rating-comment-input :deep(.el-textarea__inner):focus {
  border-color: #b3d4fc;
  box-shadow: 0 0 0 2px rgba(179, 212, 252, 0.2);
}

.rating-comment-input :deep(.el-input__count) {
  color: #909399;
  font-size: 12px;
}

.rating-submit-section {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.submit-rating-btn {
  min-width: 120px;
  color: #ffffff !important;
  font-size: 14px;
  font-weight: 600;
  border-radius: 6px;
  padding: 10px 24px;
  transition: all 0.3s ease;
}

.submit-rating-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(179, 212, 252, 0.3);
}

.submit-rating-btn:active {
  transform: translateY(0);
}

.rating-list {
  margin-top: 20px;
}

.rating-item {
  padding: 20px 0;
  border-bottom: 1px solid #e4e7ed;
}

.rating-item:last-child {
  border-bottom: none;
}

.rating-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.rating-info {
  flex: 1;
}

.rating-user {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
  margin-bottom: 4px;
}

.rating-time {
  color: #909399;
  font-size: 12px;
}

.rating-comment {
  margin-top: 10px;
  padding: 10px 0 0 52px;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.rated-message,
.no-ratings {
  padding: 40px 0;
  text-align: center;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .tab-buttons {
    width: 100%;
    justify-content: center;
  }

  .tab-button {
    flex: 1;
    padding: 12px 16px;
    font-size: 13px;
  }

  .comment-form {
    padding: 15px;
  }

  /* 讨论相关移动端样式 */
  .discussion-main {
    gap: 10px;
  }

  .user-info {
    gap: 6px;
    margin-bottom: 6px;
  }

  .username {
    font-size: 13px;
  }

  .publish-time {
    font-size: 11px;
  }

  .discussion-text {
    font-size: 13px;
    margin-bottom: 10px;
  }

  .reply-form-container {
    padding-left: 42px;
  }

  .reply-form {
    gap: 10px;
  }

  .reply-textarea :deep(.el-textarea__inner) {
    font-size: 13px;
    padding: 6px 10px;
  }

  .replies-section {
    padding-left: 42px;
    padding: 10px 10px 10px 14px;
  }

  .rating-form {
    padding: 20px 15px;
  }

  .rating-stars :deep(.el-rate__icon) {
    font-size: 24px;
  }

  .rating-comment-input :deep(.el-textarea__inner) {
    font-size: 16px;
  }

  .submit-rating-btn {
    min-width: 100px;
    padding: 12px 20px;
  }
}
</style>