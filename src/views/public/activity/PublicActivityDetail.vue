<template>
  <BaseActivityDetail
    :loading="loading"
    :activity="activity"
    :is-participating="isParticipating"
    :disabled="isDisabled"
    @go-back="goBack"
    @handle-participation="handleParticipation"
  >
    <template #custom-content="{ activity }">
      <!-- 使用评论评分组件 -->
      <ActivityCommentsReviews
        :activity="activity"
        :comments="comments"
        :ratings="ratings"
        :has-rated="hasRated"
        :submitting="submitting"
        :rating-submitting="ratingSubmitting"
        :is-authenticated="isAuthenticated"
        button-color="#409eff"
        @submit-comment="handleSubmitComment"
        @submit-reply="handleSubmitReply"
        @submit-rating="handleSubmitRating"
        @reply-comment="replyToComment"
        @cancel-reply="cancelReply"
        @load-replies="handleLoadReplies"
        @delete-comment="handleDeleteComment"
        ref="commentsReviewsRef"
      />
    </template>
  </BaseActivityDetail>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ActivityCommentsReviews from '@/components/ActivityCommentsReviews.vue'
import BaseActivityDetail from '@/components/BaseActivityDetail.vue'
import { useAuthStore } from '@/stores'
import { useActivityStore } from '@/stores/activity'

const route = useRoute()
const router = useRouter()
const activityStore = useActivityStore()
const authStore = useAuthStore()
const commentsReviewsRef = ref(null)

const loading = ref(false)
const activity = ref(null)
const isParticipating = ref(false)
const comments = ref([])
const submitting = ref(false)

// 评分相关状态
const ratings = ref([])
const hasRated = ref(false)
const ratingSubmitting = ref(false)

const activityId = computed(() => parseInt(route.params.id))
const isAuthenticated = computed(() => authStore.isAuthenticated)
// 检查是否为管理员身份
const isAdmin = computed(() => {
  return authStore.user?.role === 'ADMIN' || authStore.user?.role === 'SUPER_ADMIN'
})

const isDisabled = computed(() => {
  if (!activity.value) return true

  // 管理员不能报名活动
  if (isAdmin.value) return true

  return activity.value.status !== 'published' ||
         (typeof activity.value.participants === 'number' &&
          typeof activity.value.max_participants === 'number' &&
          activity.value.participants >= activity.value.max_participants) ||
         isParticipating.value
})


const fetchActivityDetail = async () => {
  loading.value = true
  try {
    const result = await activityStore.fetchPublicActivity(activityId.value)

    if (result.success && result.data) {
      // 直接使用修复后的API返回的完整数据
      activity.value = {
        id: result.data.id,
        title: result.data.title,
        description: result.data.description || '',
        content: result.data.content || '',
        requirements: result.data.requirements || '',
        location: result.data.location,
        type: result.data.type || 'other',
        status: result.data.status,
        cover: result.data.cover_image,
        startTime: result.data.start_time,
        endTime: result.data.end_time,
        participants: result.data.current_participants || 0,
        maxParticipants: result.data.max_participants || 0,
        organizer: {
          name: result.data.organizer_display || '汉江垂钓站',
          description: '专业的活动组织方'
        },
        tags: result.data.tags ?
          (Array.isArray(result.data.tags) ? result.data.tags :
           (typeof result.data.tags === 'string' ? result.data.tags.split(',') : ['活动'])) : ['活动'],
        contact_info: result.data.contact_info || '',
        images: result.data.images || [],
        // 新增评分信息
        avgScore: result.data.avg_score || 0,
        ratingCount: result.data.rating_count || 0,
        // 保存完整的评分统计数据
        ratingStatistics: result.data.rating_statistics || null
      }

      // 获取评论
      fetchComments()
    } else {
      console.error('获取活动详情失败:', result.error)
      activity.value = null
    }
  } catch (error) {
    console.error('获取活动详情失败:', error)
    activity.value = null
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/activities')
}

const handleParticipation = async ({ action }) => {
  // 安全检查：确保活动数据存在
  if (!activity.value) {
    ElMessage.error('活动数据加载中，请稍后再试')
    return
  }

  // 检查管理员权限 - 管理员不能报名活动
  if (isAdmin.value) {
    ElMessage.warning('管理员账号无法报名参加活动')
    return
  }

  if (action === 'cancel') {
    // 调用取消预约接口
    isParticipating.value = false
    // 安全地更新参与者数量
    if (typeof activity.value.participants === 'number') {
      activity.value.participants--
    }
    ElMessage.success('已取消报名')
  } else if (action === 'join') {
    // 调用活动预约接口
    const result = await activityStore.bookActivity(activity.value.id)

    if (result.success) {
      isParticipating.value = true
      // 安全地更新参与者数量
      if (typeof activity.value.participants === 'number') {
        activity.value.participants++
      }
      ElMessage.success('报名成功！')
    } else {
      ElMessage.error(result.error || '报名失败')
    }
  }
}


// 获取讨论列表
const fetchComments = async () => {
  try {
    const result = await activityStore.fetchDiscussions(activityId.value)

    if (result.success) {
      // 处理可能的嵌套数据结构
      const commentsData = result.data?.items || result.data || []
      const commentsArray = Array.isArray(commentsData) ? commentsData : []

      comments.value = commentsArray.filter(Boolean).map(comment => ({
        id: comment?.id,
        content: comment?.content,
        create_time: comment?.create_time,
        // 适配 Mock 数据字段：user_display_name -> author_display
        author_display: comment?.author_display || comment?.user_display_name || '匿名用户',
        // 适配 Mock 数据字段：user_id -> author_user_id
        author_user_id: comment?.author_user_id || comment?.user_id,
        // 适配 Mock 数据字段：user_avatar -> author_avatar
        author_avatar: comment?.author_avatar || comment?.user_avatar,
        // 对于讨论列表，discuss_id 就是讨论本身的 id
        discuss_id: comment?.discuss_id || comment?.id,
        parent_comment_id: comment?.parent_comment_id,
        replies: comment?.replies || [] // 使用API返回的回复数据
      }))
    } else {
      console.warn('获取评论列表返回失败:', result.error)
      comments.value = []
    }
  } catch (error) {
    console.error('获取评论失败:', error)
    // 显示友好的错误提示，但不影响用户使用其他功能
    ElMessage.warning('评论加载失败，您可以刷新页面重试')
    comments.value = []
  }
}

// 新的事件处理方法（用于配合ActivityCommentsReviews组件）
const handleSubmitComment = async ({ content }) => {
  submitting.value = true
  try {
    // 安全检查：确保活动数据存在
    if (!activity.value?.id) {
      ElMessage.error('活动信息加载中，请稍后再试')
      return
    }

    const result = await activityStore.createDiscussion(activity.value.id, { content })

    if (result.success) {
      ElMessage.success('讨论发表成功')
      commentsReviewsRef.value?.resetCommentForm()
      // 重新获取讨论列表
      fetchComments()
    } else {
      console.error('发表讨论失败:', result.error)
      // 根据错误类型给出不同的提示
      if (result.error?.includes('500') || result.error?.includes('Internal Server Error')) {
        ElMessage.error('服务器暂时不可用，请稍后再试')
      } else if (result.error?.includes('401') || result.error?.includes('Unauthorized')) {
        ElMessage.error('请先登录后再发表讨论')
      } else {
        ElMessage.error(result.error || '讨论发表失败')
      }
    }
  } catch (error) {
    console.error('发表讨论失败:', error)
    // 错误已由 request.ts 拦截器统一处理，这里只需记录日志
    // 如果需要自定义错误处理，请使用 useErrorHandler composable
  } finally {
    submitting.value = false
  }
}

const handleSubmitReply = async ({ content, discussion_id, parent_comment_id }) => {
  submitting.value = true
  try {
    // 安全检查：确保讨论ID存在
    if (!discussion_id) {
      ElMessage.error('讨论信息错误，请稍后再试')
      return
    }

    const result = await activityStore.createDiscussionComment(discussion_id, {
      content,
      parent_comment_id: parent_comment_id // 被回复的评论ID
    })

    if (result.success) {
      ElMessage.success('回复成功')
      commentsReviewsRef.value?.resetReplyForm()
      // 重新获取评论列表
      fetchComments()
    } else {
      console.error('回复失败:', result.error)
      // 根据错误类型给出不同的提示
      if (result.error?.includes('500') || result.error?.includes('Internal Server Error')) {
        ElMessage.error('服务器暂时不可用，请稍后再试')
      } else if (result.error?.includes('401') || result.error?.includes('Unauthorized')) {
        ElMessage.error('请先登录后再发表回复')
      } else {
        ElMessage.error(result.error || '回复失败')
      }
    }
  } catch (error) {
    console.error('回复失败:', error)
    // 错误已由 request.ts 拦截器统一处理，这里只需记录日志
    // 如果需要自定义错误处理，请使用 useErrorHandler composable
  } finally {
    submitting.value = false
  }
}

const replyToComment = (comment) => {
  // 这个方法现在由ActivityCommentsReviews组件内部处理
  console.log('Replying to comment:', comment)
}

const cancelReply = () => {
  // 这个方法现在由ActivityCommentsReviews组件内部处理
  console.log('Cancel reply')
}

// 加载讨论回复
const handleLoadReplies = async (discussionId) => {
  try {
    // 访客使用访客接口，登录用户使用认证接口
    const result = isAuthenticated.value
      ? await activityStore.fetchDiscussionComments(discussionId)
      : await activityStore.fetchPublicDiscussionComments(discussionId)

    if (result.success) {
      // 将回复数据合并到对应的讨论中
      const discussion = comments.value.find(c => c.id === discussionId)
      if (discussion) {
        // 适配数据格式：result.data 可能是 { items: [...] } 或直接是数组
        const repliesData = result.data?.items || result.data || []
        const repliesArray = Array.isArray(repliesData) ? repliesData : []

        discussion.replies = repliesArray.filter(Boolean).map(reply => ({
          ...reply,
          author_avatar: reply.author_avatar // 确保包含头像字段
        }))
        discussion.hasMoreReplies = repliesArray.length >= 10 // 假设每页10条，如果满了就可能有更多
      }
    } else {
      console.error('加载回复失败:', result.error)
      ElMessage.error(result.error || '加载回复失败')
    }
  } catch (error) {
    console.error('加载回复失败:', error)
    ElMessage.error('加载回复失败，请稍后再试')
  }
}

// 删除评论处理方法
const handleDeleteComment = async (commentId) => {
  console.log('🟡 开始删除评论, commentId:', commentId)

  try {
    console.log('🟡 调用 activityStore.deleteDiscussionComment...')
    const result = await activityStore.deleteDiscussionComment(commentId)
    console.log('🟡 Store 返回结果:', result)

    if (result.success) {
      console.log('✅ 删除成功，重新获取评论列表')
      ElMessage.success('删除成功')
      // 重新获取讨论列表
      fetchComments()
    } else {
      console.error('❌ 删除失败，Store 返回错误:', result.error)
      ElMessage.error(result.error || '删除失败')
    }
  } catch (error) {
    console.error('❌ 删除评论异常:', error)
    ElMessage.error('删除失败，请稍后再试')
  }
}

// 新的评分处理方法
const handleSubmitRating = async ({ rating, comment }) => {
  ratingSubmitting.value = true
  try {
    const result = await activityStore.rateActivity(activityId.value, { rating, comment })

    if (result.success) {
      ElMessage.success('评分提交成功')
      hasRated.value = true
      commentsReviewsRef.value?.resetRatingForm()
      // 重新获取评分数据
      fetchRatings()
    } else {
      ElMessage.error(result.error || '评分提交失败')
    }
  } catch (error) {
    console.error('提交评分失败:', error)
    ElMessage.error('评分提交失败，请重试')
  } finally {
    ratingSubmitting.value = false
  }
}

// 获取评分列表 - 始终尝试获取详细评分数据以显示评分列表
const fetchRatings = async () => {
  try {
    const result = await activityStore.fetchActivityRatingsDetail(activityId.value)

    if (result.success) {
      // 处理API返回的数据结构
      const apiData = result.data

      // 设置评分详情列表 - 修复：数据在apiData.ratings中
      if (apiData.ratings && Array.isArray(apiData.ratings)) {
        ratings.value = apiData.ratings.map(rating => ({
          id: rating.id,
          rating: rating.score || rating.rating, // 注意API返回的可能是score或rating字段
          comment: rating.comment,
          created_at: rating.created_at,
          // 适配 Mock 数据字段：user_display_name
          user_display_name: rating.rater_display || rating.user_display_name || '匿名用户',
          // 适配 Mock 数据字段：user_avatar -> rater_avatar
          user_avatar: rating.user_info?.avatar || rating.user_avatar,
          rater_avatar: rating.rater_avatar || rating.user_avatar
        }))
      } else {
        ratings.value = []
      }

      // 更新活动统计信息（如果API返回了统计数据）
      if (apiData.statistics && activity.value) {
        activity.value.avgScore = apiData.statistics.average_score || 0
        activity.value.ratingCount = apiData.statistics.total_count || 0
      }

      // 检查当前用户是否已经评分（这里需要根据实际用户信息判断）
      // const currentUserId = getCurrentUserId() // 需要实现获取当前用户ID的方法
      // hasRated.value = ratings.value.some(rating => rating.user_id === currentUserId)
      hasRated.value = false

      console.log('评分数据获取成功:', {
        ratings: ratings.value,
        statistics: apiData.statistics
      })
    } else {
      console.warn('获取评分数据失败:', result.error)
      ratings.value = []
      hasRated.value = false
    }
  } catch (error) {
    console.error('获取评分详情失败:', error)
    ratings.value = []
    hasRated.value = false
  }
}

onMounted(() => {
  fetchActivityDetail()
  // 获取评分详情数据
  fetchRatings()
})
</script>
