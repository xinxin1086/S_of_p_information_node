<template>
  <div class="comment-reply-item">
    <!-- 当前回复内容 -->
    <div class="reply-content-wrapper">
      <!-- 回复用户头像 -->
      <div class="reply-user-avatar">
        <el-avatar
          :size="28"
          :src="getAvatarUrl(reply.author_avatar)"
        >
          {{ reply.author_display?.charAt(0) || '用' }}
        </el-avatar>
      </div>

      <!-- 回复内容 -->
      <div class="reply-content">
        <div class="reply-user-info">
          <span class="reply-username">{{ reply.author_display || '匿名用户' }}</span>
          <span class="reply-time">{{ formatRelativeTime(reply.create_time) }}</span>
        </div>
        <div class="reply-text">{{ reply.content }}</div>

        <!-- 回复操作按钮 -->
        <div class="reply-action-buttons">
          <el-button
            type="link"
            size="small"
            class="reply-btn"
            @click="$emit('reply-to-comment', reply)"
            v-if="!shouldHideReplyBtn && canReply"
          >
            回复
          </el-button>

          <!-- 删除按钮 - 只对当前用户自己的回复显示 -->
          <el-button
            type="link"
            size="small"
            class="delete-btn"
            @click="handleDeleteReply"
            v-if="canDeleteReply"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 递归渲染子回复 -->
    <div
      v-if="reply.replies && reply.replies.length > 0"
      class="nested-replies-section"
    >
      <CommentReply
        v-for="nestedReply in reply.replies"
        :key="nestedReply.id"
        :reply="nestedReply"
        :replying-to="replyingTo"
        :max-nesting-level="maxNestingLevel"
        :current-nesting-level="currentNestingLevel + 1"
        @reply-to-comment="$emit('reply-to-comment', $event)"
        @delete-comment="(commentId) => {
          console.log('🔴 CommentReply (递归): 接收到子回复删除请求, commentId:', commentId, '当前层级:', currentNestingLevel)
          $emit('delete-comment', commentId)
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed } from 'vue'

import { useAuthStore } from '@/stores'
import { getAvatarUrl } from '@/utils/avatar.js'

interface Reply {
  id: number | string
  author_display?: string
  author_avatar?: string
  content: string
  create_time: string
  author_user_id?: number | string
  parent_comment_id?: number | string
  replies?: Reply[]
}

interface Props {
  /** 回复数据 */
  reply: Reply
  /** 正在回复的评论 */
  replyingTo?: Reply | null
  /** 最大嵌套层级 */
  maxNestingLevel?: number
  /** 当前嵌套层级 */
  currentNestingLevel?: number
}

const props = withDefaults(defineProps<Props>(), {
  replyingTo: null,
  maxNestingLevel: 5,
  currentNestingLevel: 1
})

interface Emits {
  /** 回复评论 */
  'reply-to-comment': [reply: Reply]
  /** 删除评论 */
  'delete-comment': [commentId: number | string]
}

const emit = defineEmits<Emits>()

// 用户认证状态
const authStore = useAuthStore()

// 计算属性
const shouldHideReplyBtn = computed(() => {
  return props.replyingTo &&
         props.replyingTo.id === props.reply.id &&
         props.reply.parent_comment_id !== undefined
})

// 判断当前用户是否可以回复
const canReply = computed(() => {
  return authStore.isAuthenticated && authStore.user?.role !== 'ADMIN' && authStore.user?.role !== 'SUPER_ADMIN'
})

// 判断当前用户是否可以删除此回复
const canDeleteReply = computed(() => {
  // 管理员不能删除回复，只有作者本人可以删除自己的回复
  return authStore.isAuthenticated &&
         authStore.user?.role !== 'ADMIN' &&
         authStore.user?.role !== 'SUPER_ADMIN' &&
         props.reply.author_user_id === authStore.user.id
})

// 工具方法
const formatRelativeTime = (dateString: string): string => {
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

// 删除回复方法
const handleDeleteReply = async () => {
  console.log('🔴 CommentReply: 开始处理删除回复, reply.id:', props.reply.id)

  try {
    // 确认删除
    console.log('🔴 CommentReply: 显示确认对话框')
    await ElMessageBox.confirm(
      '确定要删除这条回复吗？删除后无法恢复。',
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    console.log('🔴 CommentReply: 用户确认删除，触发 delete-comment 事件')
    // 触发删除事件，并等待父组件处理完成
    emit('delete-comment', props.reply.id)
    console.log('🔴 CommentReply: 删除事件已触发，等待父组件处理...')
  } catch (error) {
    // 用户取消删除或其他错误
    if (error !== 'cancel') {
      console.error('🔴 CommentReply: 删除回复失败:', error)
      ElMessage.error('删除失败，请稍后再试')
    } else {
      console.log('🔴 CommentReply: 用户取消删除')
    }
  }
}
</script>

<style scoped>
.comment-reply-item {
  margin-bottom: 12px;
}

.reply-content-wrapper {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.reply-user-avatar {
  flex-shrink: 0;
}

.reply-content {
  flex: 1;
  min-width: 0;
}

.reply-user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.reply-username {
  font-weight: 500;
  color: #212121;
  font-size: 13px;
  line-height: 1.2;
}

.reply-time {
  color: #9e9e9e;
  font-size: 11px;
  line-height: 1.2;
}

.reply-text {
  color: #424242;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 8px;
  word-break: break-word;
  white-space: pre-wrap;
}

.reply-action-buttons {
  display: flex;
  gap: 12px;
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

.delete-btn {
  color: #f56c6c !important;
  font-size: 13px !important;
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
  min-height: auto !important;
  cursor: pointer;
}

.delete-btn:hover {
  color: #e64242 !important;
  background: rgba(245, 108, 108, 0.1) !important;
}

/* 嵌套回复样式 */
.nested-replies-section {
  margin-top: 12px;
  padding-left: 38px;
  border-left: 2px solid #f0f0f0;
  background: #fafafa;
  border-radius: 0 4px 4px 0;
  padding: 12px 12px 12px 16px;
}

/* 限制最大嵌套层级样式 */
.comment-reply-item:last-child {
  margin-bottom: 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .reply-content-wrapper {
    gap: 8px;
  }

  .reply-username {
    font-size: 12px;
  }

  .reply-time {
    font-size: 10px;
  }

  .reply-text {
    font-size: 12px;
    margin-bottom: 6px;
  }

  .nested-replies-section {
    padding-left: 32px;
    padding: 10px 10px 10px 14px;
  }

  .reply-btn {
    font-size: 12px !important;
  }
}
</style>