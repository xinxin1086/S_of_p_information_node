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
        <div class="post-reply-actions" v-if="authStore.isAuthenticated && !showFixedReplyInput && authStore.user?.role !== 'ADMIN' && authStore.user?.role !== 'SUPER_ADMIN'">
          <el-button
            size="small"
            text
            @click="openMainPostReply"
            class="reply-link"
          >
            回复讨论
          </el-button>
        </div>
      </div>

      <!-- 回复区域 -->
      <div class="reply-section">
        <h3>全部回复 ({{ replies.length }})</h3>

        <!-- 权限提示 -->
        <div v-if="!canReply" class="auth-prompt">
          <el-alert
            v-if="!authStore.isAuthenticated"
            title="请先登录"
            description="登录后才能参与讨论回复"
            type="info"
            show-icon
            :closable="false"
          />
          <el-alert
            v-else-if="authStore.user?.role === 'ADMIN' || authStore.user?.role === 'SUPER_ADMIN'"
            title="管理员账号"
            description="管理员账号不能参与讨论回复"
            type="warning"
            show-icon
            :closable="false"
          />
        </div>

        <!-- 回复列表 -->
        <div class="replies-list">
          <div
            v-for="reply in sortedReplies"
            :key="reply.id"
            class="reply-item"
          >
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
                    v-if="!showFixedReplyInput && authStore.user?.role !== 'ADMIN' && authStore.user?.role !== 'SUPER_ADMIN'"
                    size="small"
                    text
                    @click="openReplyInput(reply.id)"
                    class="reply-link"
                  >
                    回复
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
    <div v-if="showFixedReplyInput && authStore.isAuthenticated && authStore.user?.role !== 'ADMIN' && authStore.user?.role !== 'SUPER_ADMIN'" class="fixed-reply-input">
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { Star, Share, View, ChatDotRound } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores'
import { sanitizeRichText } from '@/utils/sanitizeHtml'

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
  return authStore.isAuthenticated && authStore.user?.role !== 'ADMIN' && authStore.user?.role !== 'SUPER_ADMIN'
})

const categories = [
  { label: '经验分享', value: 'experience' },
  { label: '装备讨论', value: 'equipment' },
  { label: '钓技交流', value: 'technique' },
  { label: '饵料配方', value: 'bait' },
  { label: '钓点推荐', value: 'spot' },
  { label: '渔获展示', value: 'catch' },
  { label: '闲聊灌水', value: 'chat' },
  { label: '其他', value: 'other' }
]

const sortedReplies = computed(() => {
  return replies.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const totalPages = computed(() => {
  return Math.ceil(totalReplies.value / pageSize.value)
})

const generateMockData = () => {
  const postId = parseInt(route.params.id)

  const mockPost = {
    id: postId,
    title: '分享一个超有效的鲫鱼饵料配方',
    content: `最近研究出一个特别适合钓鲫鱼的饵料配方，经过多次试验，效果非常好，今天分享给大家。

**配方比例：**
- 玉米面：40%
- 豆粕：30%
- 鱼粉：15%
- 麦麸：10%
- 白糖：5%

**制作方法：**
1. 先将玉米面用开水烫熟，半熟状态即可
2. 豆粕炒香后磨成粉
3. 将所有材料混合均匀
4. 加水调节到合适的湿度，能捏成团但不散开
5. 静置发酵30分钟即可使用

**使用技巧：**
- 钓鲫鱼时搓成黄豆大小的颗粒
- 打窝时可以撒一些干粉料
- 夏天发酵时间可以短一些
- 冬天可以加一点白酒增加香味

这个配方在水库、池塘测试效果都不错，大家可以试试看！`,
    category: 'bait',
    author: {
      id: 1,
      username: '钓鱼大师',
      avatar: ''
    },
    created_at: '2024-01-15T10:30:00',
    view_count: 156,
    reply_count: 23,
    like_count: 45
  }

  const mockReplies = [
    {
      id: 1,
      content: '感谢分享！我明天就试试这个配方，希望能够有好的收获。',
      author: {
        id: 2,
        username: '新手小白',
        avatar: ''
      },
      created_at: '2024-01-15T14:20:00',
      like_count: 5,
      replies: [
        {
          id: 101,
          content: '记得要控制好发酵时间，夏天30分钟就差不多了。',
          author: {
            id: 1,
            username: '钓鱼大师',
            avatar: ''
          },
          created_at: '2024-01-15T15:30:00',
          like_count: 3
        }
      ]
    },
    {
      id: 2,
      content: '豆粕一定要炒出香味吗？有什么特别的要求吗？',
      author: {
        id: 3,
        username: '学习中的鱼友',
        avatar: ''
      },
      created_at: '2024-01-15T16:45:00',
      like_count: 2,
      replies: []
    },
    {
      id: 3,
      content: '试过了，效果确实不错！昨天用这个配方钓了2斤多的鲫鱼，比原来的饵料效果好多了。',
      author: {
        id: 4,
        username: '实践出真知',
        avatar: ''
      },
      created_at: '2024-01-16T09:15:00',
      like_count: 8,
      replies: []
    }
  ]

  post.value = mockPost
  replies.value = mockReplies
  totalReplies.value = mockReplies.length
}

const fetchPost = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    generateMockData()
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

    if (showReplyId.value) {
      // 回复某条评论
      const parentReply = replies.value.find(r => r.id === showReplyId.value)
      if (parentReply) {
        if (!parentReply.replies) {
          parentReply.replies = []
        }

        const subReply = {
          id: Date.now(),
          content: replyContent.value,
          author: {
            id: authStore.user?.id || 999,
            username: authStore.user?.username || '匿名用户',
            avatar: authStore.user?.avatar || ''
          },
          created_at: new Date().toISOString(),
          like_count: 0
        }

        parentReply.replies.push(subReply)
        post.value.reply_count++
      }
    } else {
      // 快速回复主帖
      const reply = {
        id: Date.now(),
        content: replyContent.value,
        author: {
          id: authStore.user?.id || 999,
          username: authStore.user?.username || '匿名用户',
          avatar: authStore.user?.avatar || ''
        },
        created_at: new Date().toISOString(),
        like_count: 0,
        replies: []
      }

      replies.value.unshift(reply)
      totalReplies.value++
      post.value.reply_count++
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
  const typeMap = {
    experience: 'success',
    equipment: 'primary',
    technique: 'warning',
    bait: 'danger',
    spot: 'info',
    catch: 'success',
    chat: '',
    other: ''
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
}

.reply-avatar {
  flex-shrink: 0;
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