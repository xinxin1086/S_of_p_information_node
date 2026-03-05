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
        :is-authenticated="true"
        button-color="#b3d4fc"
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
import { useActivityStore } from '@/stores/activity'

const route = useRoute()
const router = useRouter()
const activityStore = useActivityStore()
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
const isDisabled = computed(() => {
  if (!activity.value) return true
  return activity.value.status !== 'published' ||
         activity.value.participants >= activity.value.maxParticipants ||
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
        tags: result.data.tags ? result.data.tags.split(',') : ['活动'],
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
  router.push('/user/activities')
}

const handleParticipation = async ({ action, activity }) => {
  if (action === 'cancel') {
    // 调用取消预约接口
    isParticipating.value = false
    activity.value.participants--
    ElMessage.success('已取消报名')
  } else if (action === 'join') {
    // 调用活动预约接口
    const result = await activityStore.bookActivity(activity.id)

    if (result.success) {
      isParticipating.value = true
      activity.value.participants++
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
      // 适配数据格式：result.data 可能是 { items: [...] } 或直接是数组
      const commentsData = result.data?.items || result.data || []
      const commentsArray = Array.isArray(commentsData) ? commentsData : []

      comments.value = commentsArray.filter(Boolean).map(comment => ({
        id: comment?.id,
        content: comment?.content,
        create_time: comment?.create_time,
        // 兼容 Mock 数据和真实 API 字段
        author_display: comment?.author_display || comment?.user_display_name || '匿名用户',
        author_user_id: comment?.author_user_id || comment?.user_id,
        author_avatar: comment?.author_avatar || comment?.user_avatar,
        // 对于讨论列表，discuss_id 就是讨论本身的 id
        discuss_id: comment?.discuss_id || comment?.id,
        parent_comment_id: comment?.parent_comment_id,
        replies: comment?.replies || [] // 使用API返回的回复数据
      }))
    } else {
      comments.value = []
    }
  } catch (error) {
    console.error('获取评论失败:', error)
    comments.value = []
  }
}

// 新的事件处理方法（用于配合ActivityCommentsReviews组件）
const handleSubmitComment = async ({ content }) => {
  submitting.value = true
  try {
    const result = await activityStore.createDiscussion(activity.value.id, { content })

    if (result.success) {
      ElMessage.success('讨论发表成功')
      commentsReviewsRef.value?.resetCommentForm()
      // 重新获取讨论列表
      fetchComments()
    } else {
      ElMessage.error(result.error || '讨论发表失败')
    }
  } catch (error) {
    console.error('发表讨论失败:', error)
    ElMessage.error('讨论发表失败，请重试')
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
      // 重新获取讨论列表
      fetchComments()
    } else {
      ElMessage.error(result.error || '回复失败')
    }
  } catch (error) {
    console.error('回复失败:', error)
    ElMessage.error('回复失败，请重试')
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
    const result = await activityStore.fetchDiscussionComments(discussionId)

    if (result.success) {
      // 将回复数据合并到对应的讨论中
      const discussion = comments.value.find(c => c.id === discussionId)
      if (discussion) {
        // 适配数据格式：result.data 可能是 { items: [...] } 或直接是数组
        const repliesData = result.data?.items || result.data || []
        const repliesArray = Array.isArray(repliesData) ? repliesData : []

        // 确保回复数据包含正确的字段映射
        discussion.replies = repliesArray.filter(Boolean).map(reply => ({
          ...reply,
          // 兼容 Mock 数据和真实 API 字段
          author_display: reply.author_display || reply.user_display_name || '匿名用户',
          author_avatar: reply.author_avatar || reply.user_avatar
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
  console.log('🟡 ActivityDetail: 开始处理删除评论, commentId:', commentId)

  try {
    console.log('🟡 ActivityDetail: 调用 Store 的删除方法...')
    const result = await activityStore.deleteDiscussionComment(commentId)
    console.log('🟡 ActivityDetail: Store 删除结果:', result)

    if (result.success) {
      console.log('✅ ActivityDetail: 删除成功，显示成功消息')
      ElMessage.success('删除成功')
      // 重新获取讨论列表
      console.log('🟡 ActivityDetail: 重新获取讨论列表...')
      fetchComments()
    } else {
      console.error('❌ ActivityDetail: 删除失败:', result.error)
      ElMessage.error(result.error || '删除失败')
    }
  } catch (error) {
    console.error('❌ ActivityDetail: 删除评论异常:', error)
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

// 获取评分列表
const fetchRatings = async () => {
  try {
    // 使用正确的评分获取接口
    const result = await activityStore.fetchActivityRatingsDetail(activityId.value)

    if (result.success) {
      // 处理API返回的数据结构
      const apiData = result.data

      // 设置评分详情列表
      if (apiData.ratings && Array.isArray(apiData.ratings)) {
        ratings.value = apiData.ratings.map(rating => ({
          id: rating.id,
          // 兼容 Mock 数据和真实 API 字段
          rating: rating.score || rating.rating,
          comment: rating.comment,
          created_at: rating.created_at,
          user_display_name: rating.rater_display || rating.user_display_name || rating.user_info?.username || '匿名用户',
          user_avatar: rating.user_info?.avatar || rating.user_avatar,
          rater_avatar: rating.rater_avatar || rating.user_avatar
        }))
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
