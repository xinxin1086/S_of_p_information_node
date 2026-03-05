<template>
  <div class="discussion-detail">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/discussion' }">讨论社区</el-breadcrumb-item>
        <el-breadcrumb-item>{{ post?.title }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
    </div>

    <div v-else-if="post" class="post-detail">
      <!-- 主帖内容 -->
      <div class="main-post">
        <div class="post-header">
          <div class="author-info">
            <el-avatar :src="post.author?.avatar" :size="50">
              {{ post.author?.username?.charAt(0)?.toUpperCase() || '?' }}
            </el-avatar>
            <div class="author-details">
              <h4 class="author-name">{{ post.author?.username || '未知用户' }}</h4>
              <p class="post-time">{{ formatDateTime(post.created_at) }}</p>
            </div>
          </div>
          <div class="post-actions">
            <el-button
              :type="isLiked ? 'primary' : ''"
              :icon="Star"
              @click="toggleLike"
              v-if="authStore.isAuthenticated"
            >
              {{ isLiked ? '已赞' : '点赞' }} ({{ post.like_count }})
            </el-button>
            <el-button
              :icon="Share"
              @click="sharePost"
            >
              分享
            </el-button>
          </div>
        </div>

        <div class="post-content">
          <h1 class="post-title">{{ post.title }}</h1>
          <el-tag :type="getCategoryTagType(post.category)" class="category-tag">
            {{ getCategoryLabel(post.category) }}
          </el-tag>
          <!-- eslint-disable-next-line vue/no-v-html -- Content sanitized with DOMPurify -->
<div class="post-body" v-html="formatContent(post.content)"></div>
        </div>

        <div class="post-stats">
          <span class="stat-item">
            <el-icon><View /></el-icon>
            浏览 {{ post.view_count }}
          </span>
          <span class="stat-item">
            <el-icon><ChatDotRound /></el-icon>
            回复讨论 {{ post.reply_count }}
          </span>
          <span class="stat-item">
            <el-icon><Star /></el-icon>
            点赞 {{ post.like_count }}
          </span>
        </div>

        <!-- 主讨论回复按钮 -->
        <div class="post-reply-actions" v-if="authStore.isAuthenticated && !showFixedReplyInput">
          <el-button
            size="small"
            text
            @click="openMainPostReply"
            class="reply-link"
          >
            回复讨论
          </el-button>
          <!-- 管理员删除主帖按钮 -->
          <el-button
            v-if="canDeletePost"
            size="small"
            type="danger"
            text
            @click="handleDeletePost"
            class="delete-link"
          >
            删除讨论
          </el-button>
        </div>
      </div>

      <!-- 回复区域 -->
      <div class="reply-section">
        <h3>全部回复 ({{ replies.length }})</h3>

        <!-- 权限提示 -->
        <div v-if="!canReply" class="auth-prompt">
          <el-alert
            title="请先登录"
            description="登录后才能参与讨论回复"
            type="info"
            show-icon
            :closable="false"
          />
        </div>

        <!-- 回复列表 -->
        <div class="replies-list">
          <div
            v-for="(reply, index) in topLevelReplies"
            :key="reply.id"
            class="reply-item"
          >
            <div class="reply-floor">
              <span class="floor-number">#{{ getFloorNumber(reply.id) }}</span>
            </div>
            <div class="reply-avatar">
              <el-avatar :src="reply.author?.avatar" :size="40">
                {{ reply.author?.username?.charAt(0)?.toUpperCase() || '?' }}
              </el-avatar>
            </div>
            <div class="reply-content">
              <div class="reply-header">
                <span class="author">{{ reply.author?.username || '未知用户' }}</span>
                <span class="time">{{ formatDateTime(reply.created_at) }}</span>
                <div class="reply-actions">
                  <el-button
                    :type="isReplyLiked(reply.id) ? 'primary' : ''"
                    :icon="Star"
                    size="small"
                    text
                    @click="toggleReplyLike(reply.id)"
                    v-if="authStore.isAuthenticated"
                  >
                    {{ isReplyLiked(reply.id) ? '已赞' : '赞' }} ({{ reply.like_count }})
                  </el-button>
                  <el-button
                    v-if="!showFixedReplyInput"
                    size="small"
                    text
                    @click="openReplyInput(reply.id)"
                    class="reply-link"
                  >
                    回复
                  </el-button>
                  <!-- 删除回复按钮（管理员或创建者可见） -->
                  <el-button
                    v-if="canDeleteReply(reply)"
                    size="small"
                    type="danger"
                    text
                    @click="handleDeleteReply(reply.id)"
                    class="delete-link"
                  >
                    删除
                  </el-button>
                </div>
              </div>
              <!-- eslint-disable-next-line vue/no-v-html -- Content sanitized with DOMPurify -->
<div class="reply-body" v-html="formatContent(reply.content)"></div>

              <!-- 二级回复 -->
              <div v-if="reply.replies && reply.replies.length > 0" class="sub-replies">
                <div
                  v-for="subReply in reply.replies"
                  :key="subReply.id"
                  class="sub-reply-item"
                >
                  <el-avatar :src="subReply.author?.avatar" :size="30">
                    {{ subReply.author?.username?.charAt(0)?.toUpperCase() || '?' }}
                  </el-avatar>
                  <div class="sub-reply-content">
                    <div class="sub-reply-header">
                      <span class="author">{{ subReply.author?.username || '未知用户' }}</span>
                      <span class="time">{{ formatDateTime(subReply.created_at) }}</span>
                      <!-- 删除二级回复按钮（管理员或创建者可见） -->
                      <el-button
                        v-if="canDeleteSubReply(subReply)"
                        size="small"
                        type="danger"
                        text
                        @click="handleDeleteReply(subReply.id)"
                        class="delete-link"
                      >
                        删除
                      </el-button>
                    </div>
                    <!-- eslint-disable-next-line vue/no-v-html -- Content sanitized with DOMPurify -->
<div class="sub-reply-body" v-html="formatContent(subReply.content)"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pagination" v-if="totalPages > 1">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="totalReplies"
            layout="prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <div v-if="!loading && !post && !authStore.isAuthenticated" class="login-prompt">
      <el-alert
        title="请先登录"
        description="登录后才能参与讨论"
        type="info"
        show-icon
      >
        <el-button type="primary" @click="goToLogin">立即登录</el-button>
      </el-alert>
    </div>

    <div v-else class="not-found">
      <el-result icon="warning" title="帖子不存在" sub-title="该帖子已被删除或不存在">
        <template #extra>
          <el-button type="primary" @click="$router.push('/discussion')">
            返回讨论区
          </el-button>
        </template>
      </el-result>
    </div>

    <!-- 底部固定回复输入框 -->
    <div v-if="showFixedReplyInput && authStore.isAuthenticated" class="fixed-reply-input">
      <div class="reply-input-wrapper">
        <div class="reply-input-header">
          <span class="reply-target">回复 @{{ replyTargetUser }}...</span>
          <span class="char-count">{{ replyContent.length }}/200</span>
        </div>
        <el-input
          v-model="replyContent"
          type="textarea"
          :rows="3"
          placeholder="写下你的回复..."
          maxlength="200"
          show-word-limit
          ref="fixedReplyInput"
          class="fixed-textarea"
        />
        <div class="reply-input-actions">
          <el-button @click="cancelFixedReply" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="submitFixedReply" :loading="replying" class="submit-btn">回复</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Star, Share, View, ChatDotRound } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores'
import { sanitizeRichText } from '@/utils/sanitizeHtml'
import { mockForumPosts, mockForumFloors, mockForumReplies } from '@/mock/forumMockData'
import {
  getForumPosts,
  getForumFloors,
  getForumReplies,
  addForumFloor,
  addForumReply
} from '@/mock/forumMockStorage'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const post = ref(null)
const replies = ref([])
const replyContent = ref('')
const showReplyId = ref(null)
const showFixedReplyInput = ref(false)
const replyTargetUser = ref('')
const fixedReplyInput = ref(null)
const replying = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalReplies = ref(0)

const isLiked = ref(false)
const likedReplies = ref(new Set())

// 权限控制计算属性
const canReply = computed(() => {
  return authStore.isAuthenticated
})

const isAdmin = computed(() => {
  return authStore.user?.role === 'ADMIN' || authStore.user?.role === 'SUPER_ADMIN'
})

const canDeletePost = computed(() => {
  return isAdmin.value
})

// 判断用户是否可以删除指定回复（管理员或回复创建者）
const canDeleteReply = (reply) => {
  if (isAdmin.value) return true
  if (!authStore.user) return false
  // 检查是否是回复的创建者
  return reply.author?.id === authStore.user.id
}

// 判断用户是否可以删除二级回复
const canDeleteSubReply = (subReply) => {
  if (isAdmin.value) return true
  if (!authStore.user) return false
  return subReply.author?.id === authStore.user.id
}

// 论坛分类配置（精简为4个主要分类）
const categories = [
  { label: '经验分享', value: '经验分享' },
  { label: '求助问答', value: '求助问答' },
  { label: '活动交流', value: '活动交流' },
  { label: '其他讨论', value: '其他讨论' }
]

// 顶层回复（直接回复主帖的），按时间升序排序，支持分页
const topLevelReplies = computed(() => {
  const mainReplies = replies.value.filter(r => !r.parent_id && !r.parentReplyId)
  const sorted = mainReplies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  // 分页逻辑
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sorted.slice(start, end)
})

// 获取楼层号
const floorMap = computed(() => {
  const map = new Map()
  let floorNumber = 1
  const mainReplies = replies.value.filter(r => !r.parent_id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  for (const reply of mainReplies) {
    map.set(reply.id, floorNumber++)
  }
  return map
})

const getFloorNumber = (replyId) => {
  return floorMap.value.get(replyId) || 0
}

const sortedReplies = computed(() => {
  return [...replies.value].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const totalPages = computed(() => {
  return Math.ceil(totalReplies.value / pageSize.value)
})

/**
 * 从论坛 mock 数据加载帖子详情
 * 优先从 localStorage 读取动态数据
 */
const loadForumPost = () => {
  const postId = parseInt(route.params.id)

  // 获取 localStorage 中的动态帖子
  const dynamicPosts = getForumPosts()

  // 合并静态帖子和动态帖子（去重）
  const allPosts = [...mockForumPosts]
  dynamicPosts.forEach(post => {
    if (!allPosts.some(p => p.id === post.id)) {
      allPosts.push(post)
    }
  })

  // 查找对应的帖子
  const forumPost = allPosts.find(p => p.id === postId)

  if (!forumPost) {
    post.value = null
    replies.value = []
    totalReplies.value = 0
    ElMessage.warning('帖子不存在')
    return
  }

  // 转换为主帖格式
  post.value = {
    id: forumPost.id,
    title: forumPost.title,
    content: forumPost.content,
    category: forumPost.category,
    author: {
      id: forumPost.author_user_id,
      username: forumPost.author_display,
      avatar: ''
    },
    created_at: forumPost.created_at,
    view_count: forumPost.view_count,
    reply_count: forumPost.comment_count,
    like_count: forumPost.like_count
  }

  // 获取该帖子的所有楼层（优先从 localStorage）
  const allFloors = getForumFloors()
  const postFloors = allFloors.length > 0
    ? allFloors.filter(floor => floor.post_id === postId && floor.status === 'published' && !floor.is_deleted)
    : mockForumFloors.filter(floor => floor.post_id === postId && floor.status === 'published' && !floor.is_deleted)

  // 按时间升序排序
  postFloors.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  // 获取所有回复（优先从 localStorage）
  const allReplies = getForumReplies()
  const useStoredReplies = allReplies.length > 0

  // 转换楼层为回复格式，并包含二级回复
  const formattedReplies = postFloors.map(floor => {
    // 获取该楼层的所有回复
    let floorReplies
    if (useStoredReplies) {
      floorReplies = allReplies
        .filter(reply => reply.floor_id === floor.id && reply.status === 'published' && !reply.is_deleted)
        .map(reply => ({
          id: reply.id,
          content: reply.content,
          author: {
            id: reply.author_user_id,
            username: reply.author_display,
            avatar: ''
          },
          created_at: reply.created_at,
          like_count: reply.like_count,
          parentReplyId: floor.id // 标记为二级回复
        }))
    } else {
      floorReplies = mockForumReplies
        .filter(reply => reply.floor_id === floor.id && reply.status === 'published' && !reply.is_deleted)
        .map(reply => ({
          id: reply.id,
          content: reply.content,
          author: {
            id: reply.author_user_id,
            username: reply.author_display,
            avatar: ''
          },
          created_at: reply.created_at,
          like_count: reply.like_count,
          parentReplyId: floor.id
        }))
    }

    return {
      id: floor.id,
      content: floor.content,
      author: {
        id: floor.author_user_id,
        username: floor.author_display,
        avatar: ''
      },
      created_at: floor.created_at,
      like_count: floor.like_count,
      replies: floorReplies
    }
  })

  replies.value = formattedReplies
  totalReplies.value = formattedReplies.length

  console.log('[DiscussionDetail] 加载帖子详情，帖子ID:', postId, '回复数:', totalReplies.value)
}

const fetchPost = async () => {
  loading.value = true
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    loadForumPost()
  } catch (error) {
    console.error('获取帖子详情失败:', error)
    ElMessage.error('获取帖子详情失败')
  } finally {
    loading.value = false
  }
}

const toggleLike = () => {
  if (!authStore.isAuthenticated) {
    ElMessage.info('请先登录')
    return
  }

  isLiked.value = !isLiked.value
  post.value.like_count += isLiked.value ? 1 : -1
  ElMessage.success(isLiked.value ? '点赞成功' : '取消点赞')
}

const isReplyLiked = (replyId) => {
  return likedReplies.value.has(replyId)
}

const toggleReplyLike = (replyId) => {
  if (!authStore.isAuthenticated) {
    ElMessage.info('请先登录')
    return
  }

  const reply = replies.value.find(r => r.id === replyId)
  if (reply) {
    if (likedReplies.value.has(replyId)) {
      likedReplies.value.delete(replyId)
      reply.like_count--
      ElMessage.success('取消点赞')
    } else {
      likedReplies.value.add(replyId)
      reply.like_count++
      ElMessage.success('点赞成功')
    }
  }
}

// 删除主帖
const handleDeletePost = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个讨论吗？删除后将无法恢复。',
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // TODO: 调用API删除主帖
    // await api.discussionApi.deletePost(post.value.id)

    ElMessage.success('删除成功')
    router.push('/discussion')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
    }
  }
}

// 删除回复
const handleDeleteReply = async (replyId) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条回复吗？删除后将无法恢复。',
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // TODO: 调用API删除回复
    // await api.discussionApi.deleteReply(replyId)

    // 从列表中移除 - 需要检查顶层回复和二级回复
    let deleted = false

    // 先检查是否是顶层回复
    const topLevelIndex = replies.value.findIndex(r => r.id === replyId)
    if (topLevelIndex > -1) {
      replies.value.splice(topLevelIndex, 1)
      deleted = true
    } else {
      // 检查是否是二级回复
      for (const reply of replies.value) {
        if (reply.replies && reply.replies.length > 0) {
          const subIndex = reply.replies.findIndex(r => r.id === replyId)
          if (subIndex > -1) {
            reply.replies.splice(subIndex, 1)
            deleted = true
            break
          }
        }
      }
    }

    if (deleted) {
      totalReplies.value--
      if (post.value && post.value.reply_count > 0) {
        post.value.reply_count--
      }
      ElMessage.success('删除成功')
    } else {
      ElMessage.warning('未找到要删除的回复')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
    }
  }
}

const openMainPostReply = () => {
  if (!authStore.isAuthenticated) {
    ElMessage.info('请先登录')
    return
  }

  // 设置为回复主帖模式
  replyContent.value = ''
  replyTargetUser.value = post.value?.author?.username || '楼主'
  showReplyId.value = null
  showFixedReplyInput.value = true

  // 聚焦到固定回复输入框
  nextTick(() => {
    if (fixedReplyInput.value) {
      fixedReplyInput.value.focus()
    }
  })
}

const openReplyInput = (replyId) => {
  if (!authStore.isAuthenticated) {
    ElMessage.info('请先登录')
    return
  }

  const reply = replies.value.find(r => r.id === replyId)
  if (reply) {
    replyContent.value = ''
    replyTargetUser.value = reply.author?.username || '楼主'
    showReplyId.value = replyId
    showFixedReplyInput.value = true

    // 聚焦到固定回复输入框
    nextTick(() => {
      if (fixedReplyInput.value) {
        fixedReplyInput.value.focus()
      }
    })
  }
}

const cancelFixedReply = () => {
  showFixedReplyInput.value = false
  showReplyId.value = null
  replyContent.value = ''
  replyTargetUser.value = ''
}

const submitFixedReply = async () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  replying.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))

    const currentUserId = authStore.user?.id || 999
    const currentUserDisplayName = authStore.user?.username || authStore.user?.nickname || '匿名用户'

    if (showReplyId.value) {
      // 回复某条评论（创建二级回复）
      const parentReply = replies.value.find(r => r.id === showReplyId.value)
      if (parentReply) {
        if (!parentReply.replies) {
          parentReply.replies = []
        }

        const newReply = {
          id: Date.now(),
          floor_id: showReplyId.value,
          content: replyContent.value,
          like_count: 0,
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          author_user_id: currentUserId,
          author_display: currentUserDisplayName,
          quote_content: null,
          quote_author: null,
          is_deleted: false
        }

        // 保存到 localStorage
        addForumReply(newReply)

        // 添加到界面显示
        const subReply = {
          id: newReply.id,
          content: newReply.content,
          author: {
            id: newReply.author_user_id,
            username: newReply.author_display,
            avatar: ''
          },
          created_at: newReply.created_at,
          like_count: newReply.like_count,
          parentReplyId: parentReply.id
        }

        parentReply.replies.push(subReply)
        post.value.reply_count++
      }
    } else {
      // 快速回复主帖（创建新楼层）
      const postId = parseInt(route.params.id)
      const maxFloorId = Math.max(...getForumFloors().map(f => f.id), ...mockForumFloors.map(f => f.id), 0)

      const newFloor = {
        id: maxFloorId + 1,
        post_id: postId,
        content: replyContent.value,
        floor_number: 0, // 楼层号会在显示时计算
        like_count: 0,
        reply_count: 0,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author_user_id: currentUserId,
        author_display: currentUserDisplayName,
        is_deleted: false
      }

      // 保存到 localStorage
      addForumFloor(newFloor)

      // 添加到界面显示
      const reply = {
        id: newFloor.id,
        content: newFloor.content,
        author: {
          id: newFloor.author_user_id,
          username: newFloor.author_display,
          avatar: ''
        },
        created_at: newFloor.created_at,
        like_count: newFloor.like_count,
        replies: []
      }

      replies.value.unshift(reply)
      totalReplies.value++
      post.value.reply_count++

      console.log('[DiscussionDetail] 新楼层已创建并保存到 localStorage:', newFloor)
    }

    cancelFixedReply()
    ElMessage.success('回复成功')
  } catch (error) {
    console.error('回复失败:', error)
    ElMessage.error('回复失败，请重试')
  } finally {
    replying.value = false
  }
}

const sharePost = () => {
  const url = window.location.href
  if (navigator.share) {
    navigator.share({
      title: post.value.title,
      text: post.value.content.substring(0, 100),
      url: url
    })
  } else {
    navigator.clipboard.writeText(url)
    ElMessage.success('链接已复制到剪贴板')
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchPost()
}

const goToLogin = () => {
  router.push('/login')
}

const getCategoryLabel = (category) => {
  const item = categories.find(c => c.value === category)
  return item ? item.label : category
}

const getCategoryTagType = (category) => {
  // 根据论坛分类返回对应的标签类型（仅4个分类）
  const typeMap = {
    '经验分享': 'success',
    '求助问答': 'warning',
    '活动交流': 'primary',
    '其他讨论': 'info'
  }
  return typeMap[category] || ''
}

const formatContent = (content) => {
  const formatted = content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
  // 净化格式化后的HTML，防止XSS攻击
  return sanitizeRichText(formatted)
}

const formatDateTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchPost()
})
</script>

<style scoped>
.discussion-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
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

.breadcrumb {
  margin-bottom: 20px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.main-post {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 30px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.author-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.post-time {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.post-actions {
  display: flex;
  gap: 10px;
}

.post-content {
  margin-bottom: 20px;
}

.post-title {
  margin: 0 0 15px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.category-tag {
  margin-bottom: 20px;
}

.post-body {
  line-height: 1.8;
  color: #303133;
  font-size: 16px;
}

.post-stats {
  display: flex;
  gap: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  font-size: 14px;
  color: #909399;
}

.post-reply-actions {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.reply-section {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 30px;
  padding-bottom: 120px;
}

.reply-section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.reply-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  position: relative;
}

.reply-floor {
  position: absolute;
  top: 20px;
  left: 10px;
}

.floor-number {
  font-size: 16px;
  font-weight: 600;
  color: #909399;
  background: #e4e7ed;
  padding: 4px 10px;
  border-radius: 4px;
  user-select: none;
}

.reply-avatar {
  flex-shrink: 0;
  margin-left: 60px; /* 为楼层号留出空间 */
}

.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.reply-header .author {
  font-weight: 500;
  color: #409eff;
}

.reply-header .time {
  font-size: 13px;
  color: #909399;
}

.reply-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.reply-body {
  line-height: 1.6;
  color: #303133;
  margin-bottom: 15px;
}

.sub-replies {
  margin-top: 15px;
  padding-left: 20px;
  border-left: 2px solid #e4e7ed;
}

.sub-reply-item {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.sub-reply-content {
  flex: 1;
}

.sub-reply-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.sub-reply-header .author {
  font-size: 13px;
  font-weight: 500;
  color: #409eff;
}

.sub-reply-header .time {
  font-size: 12px;
  color: #909399;
}

.sub-reply-body {
  line-height: 1.5;
  color: #606266;
  font-size: 14px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.login-prompt {
  margin-bottom: 30px;
}

.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

/* 底部固定回复输入框样式 */
.fixed-reply-input {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #ddd;
  padding: 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.reply-input-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

.reply-input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.reply-target {
  color: #333;
  font-weight: 500;
}

.char-count {
  color: #999;
  font-size: 12px;
}

.fixed-textarea {
  margin-bottom: 12px;
}

.fixed-textarea .el-textarea__inner {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
}

.fixed-textarea .el-textarea__inner:focus {
  border-color: #0099FF;
  box-shadow: 0 0 0 2px rgba(0, 153, 255, 0.2);
}

.reply-input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.cancel-btn {
  background: #ffffff !important;
  border: 1px solid #ddd !important;
  color: #999 !important;
  border-radius: 4px !important;
  padding: 8px 16px !important;
  font-size: 14px !important;
  min-width: 80px !important;
}

.cancel-btn:hover {
  border-color: #999 !important;
  color: #666 !important;
}

.submit-btn {
  background: #0099FF !important;
  border: 1px solid #0099FF !important;
  color: #ffffff !important;
  border-radius: 4px !important;
  padding: 8px 16px !important;
  font-size: 14px !important;
  min-width: 80px !important;
}

.submit-btn:hover {
  background: #0077cc !important;
  border-color: #0077cc !important;
}

/* 回复按钮样式 */
.reply-link, .reply-btn {
  color: #0099FF !important;
  font-size: 14px !important;
  text-decoration: none !important;
  padding: 0 !important;
  margin: 0 !important;
  min-height: auto !important;
  border: none !important;
  background: none !important;
}

.reply-link:hover, .reply-btn:hover {
  color: #0077cc !important;
  text-decoration: underline !important;
}

/* 响应式 */
@media (max-width: 768px) {
  .discussion-detail {
    padding: 15px;
  }

  .main-post,
  .reply-section {
    padding: 20px;
  }

  .post-header {
    flex-direction: column;
    gap: 15px;
  }

  .post-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .post-title {
    font-size: 20px;
  }

  .reply-header {
    flex-wrap: wrap;
    gap: 10px;
  }

  .reply-actions {
    order: 3;
    width: 100%;
    margin-top: 5px;
  }

  .reply-item {
    padding: 15px;
    gap: 12px;
  }

  .sub-replies {
    padding-left: 10px;
  }

  .sub-reply-item {
    gap: 8px;
  }
}
</style>