<template>
  <div class="profile-view">
    <el-page-header @back="$router.go(-1)">
      <template #content>
        <span class="page-header-title">个人资料</span>
      </template>
    </el-page-header>

    <div class="profile-content">
      <el-row :gutter="24">
        <!-- 左侧个人信息 -->
        <el-col :span="8">
          <el-card class="profile-card">
            <div class="profile-header" v-if="userInfo">
              <el-avatar :size="100" :src="userInfo?.avatar" fit="cover">
                <el-icon size="50"><User /></el-icon>
              </el-avatar>
              <h3 class="profile-name">{{ userInfo?.nickname || userInfo?.username || '用户' }}</h3>
            </div>

            <el-divider />

            <div class="profile-info" v-if="userInfo">
              <div class="info-item">
                <span class="info-label">
                  <el-icon><User /></el-icon>
                  用户名
                </span>
                <span class="info-value">{{ userInfo?.username || '未设置' }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">
                  <el-icon><Message /></el-icon>
                  邮箱
                </span>
                <span class="info-value">{{ userInfo?.email || '未设置' }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">
                  <el-icon><Phone /></el-icon>
                  手机号
                </span>
                <span class="info-value">
                  {{ userInfo?.phone ? maskPhone(userInfo.phone) : '未设置' }}
                </span>
              </div>

              <div class="info-item">
                <span class="info-label">
                  <el-icon><Timer /></el-icon>
                  注册时间
                </span>
                <span class="info-value">{{ formatDate(userInfo.created_at) }}</span>
              </div>
            </div>

            <div class="profile-actions">
              <el-button type="primary" @click="$router.push('/user/profile/edit')">
                <el-icon><Edit /></el-icon>
                编辑资料
              </el-button>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧统计信息 -->
        <el-col :span="16">
          <div class="stats-section">
            <el-card class="stats-card">
              <template #header>
                <span>账户统计</span>
              </template>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-number">{{ userStats.postCount || 0 }}</div>
                  <div class="stat-label">发帖数量</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ userStats.commentCount || 0 }}</div>
                  <div class="stat-label">评论数量</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ userStats.scienceLikeCount || 0 }}</div>
                  <div class="stat-label">科普点赞</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ userStats.scienceViewCount || 0 }}</div>
                  <div class="stat-label">科普浏览</div>
                </div>
              </div>
            </el-card>

            <el-card class="recent-activity-card">
              <template #header>
                <span>最近活动</span>
              </template>
              <div class="activity-list">
                <div
                  v-for="activity in recentActivities"
                  :key="activity.id"
                  class="activity-item"
                >
                  <div class="activity-icon">
                    <el-icon><component :is="getActivityIcon(activity.type)" /></el-icon>
                  </div>
                  <div class="activity-content">
                    <div class="activity-title">{{ activity.title }}</div>
                    <div class="activity-time">{{ formatDateTime(activity.time) }}</div>
                  </div>
                </div>
                <div v-if="recentActivities.length === 0" class="no-activity">
                  暂无活动记录
                </div>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import {
  User,
  Message,
  Phone,
  UserFilled,
  Calendar,
  Location,
  Briefcase,
  Timer,
  Edit,
  DocumentCopy,
  ChatLineSquare,
  Calendar as ActivityIcon,
  Star
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import { userApi } from '@/api/unified'

const route = useRoute()

defineOptions({ name: "ProfileView" })

// 用户信息（只包含后端 UserInfo 类型中定义的字段）
const userInfo = reactive({
  username: '',
  nickname: '',
  avatar: '',
  email: '',
  phone: '',
  created_at: ''
})

// 用户统计信息
const userStats = reactive({
  postCount: 0,
  commentCount: 0,
  scienceLikeCount: 0,
  scienceViewCount: 0
})

// 最近活动
const recentActivities = ref([])

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 手机号脱敏
const maskPhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 获取活动图标
const getActivityIcon = (type) => {
  const iconMap = {
    post: DocumentCopy,
    comment: ChatLineSquare,
    booking: ActivityIcon,
    favorite: Star
  }
  return iconMap[type] || DocumentCopy
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await userApi.getUserInfo()
    if (response.data) {
      // 只使用后端 UserInfo 类型中定义的字段
      userInfo.username = response.data.username || ''
      userInfo.nickname = response.data.nickname || ''
      userInfo.avatar = response.data.avatar || ''
      userInfo.email = response.data.email || ''
      userInfo.phone = response.data.phone || ''
      userInfo.created_at = response.data.created_at || ''
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败')
    console.error('获取用户信息失败:', error)
  }
}

// 获取用户统计信息
const fetchUserStats = async () => {
  console.log('[DEBUG Profile] fetchUserStats 被调用')
  try {
    // 先检查是否是 mock 模式
    const { shouldUseMock } = await import('@/api/unified')
    const isMockMode = shouldUseMock()

    // 只有在非 mock 模式下才使用 API 返回的统计数据
    if (!isMockMode) {
      const response = await userApi.getUserStats()
      if (response.data) {
        Object.assign(userStats, response.data)
      }
    }

    // 动态导入科普文章和论坛数据以获取统计
    try {
      if (isMockMode) {
        // Mock 模式：直接从 mock 数据统计
        const { useAuthStore } = await import('@/stores')
        const currentUserId = useAuthStore().user?.id

        if (currentUserId) {
          // 确保 currentUserId 是 number 类型进行比较
          const userIdNum = typeof currentUserId === 'number' ? currentUserId : parseInt(currentUserId, 10)

          // 科普文章统计 - 合并静态和动态数据
          const { mockScienceArticleLikes: staticLikes, mockScienceArticleVisits: staticVisits } = await import('@/mock/scienceMockData')
          const { getScienceArticleLikes, getScienceArticleVisits } = await import('@/mock/scienceMockStorage')

          // 从 localStorage 读取动态数据
          const dynamicLikes = getScienceArticleLikes()
          const dynamicVisits = getScienceArticleVisits()

          // 合并静态和动态数据（去重）
          const allLikes = [...staticLikes]
          dynamicLikes.forEach(like => {
            if (!allLikes.some(l => l.id === like.id)) {
              allLikes.push(like)
            }
          })

          const allVisits = [...staticVisits]
          dynamicVisits.forEach(visit => {
            if (!allVisits.some(v => v.id === visit.id)) {
              allVisits.push(visit)
            }
          })

          userStats.scienceLikeCount = allLikes.filter(like => like.user_id === userIdNum).length
          userStats.scienceViewCount = allVisits.filter(visit => visit.user_id === userIdNum).length

          // 论坛统计 - 合并静态和动态数据
          const { mockForumPosts: staticPosts, mockForumFloors: staticFloors, mockForumReplies: staticReplies } = await import('@/mock/forumMockData')
          const { getForumPosts, getForumFloors, getForumReplies } = await import('@/mock/forumMockStorage')

          // 从 localStorage 读取动态数据
          const dynamicPosts = getForumPosts()
          const dynamicFloors = getForumFloors()
          const dynamicReplies = getForumReplies()

          console.log('[DEBUG Profile] 静态帖子数:', staticPosts.length, '动态帖子数:', dynamicPosts.length)
          console.log('[DEBUG Profile] 动态帖子详情:', dynamicPosts)
          console.log('[DEBUG Profile] 动态帖子作者:', dynamicPosts.map(p => ({ id: p.id, author: p.author_user_id, title: p.title })))

          // 合并静态和动态数据（去重）
          const allPosts = [...staticPosts]
          dynamicPosts.forEach(post => {
            if (!allPosts.some(p => p.id === post.id)) {
              allPosts.push(post)
            }
          })

          const allFloors = [...staticFloors]
          dynamicFloors.forEach(floor => {
            if (!allFloors.some(f => f.id === floor.id)) {
              allFloors.push(floor)
            }
          })

          const allReplies = [...staticReplies]
          dynamicReplies.forEach(reply => {
            if (!allReplies.some(r => r.id === reply.id)) {
              allReplies.push(reply)
            }
          })

          // 过滤当前用户的帖子（支持类型安全比较）
          const userPosts = allPosts.filter(post => {
            const authorId = post.author_user_id
            const match = authorId === userIdNum || authorId === String(userIdNum) || (typeof authorId === 'string' && parseInt(authorId, 10) === userIdNum)
            if (match && dynamicPosts.some(dp => dp.id === post.id)) {
              console.log('[DEBUG Profile] 匹配的动态帖子:', post.id, post.title, 'author_id:', authorId)
            }
            return match
          })

          userStats.postCount = userPosts.length
          console.log('[DEBUG Profile] 用户帖子数:', userPosts.length, '帖子列表:', userPosts.map(p => ({ id: p.id, title: p.title, author: p.author_user_id })))

          // 楼层和回复都算作评论，支持类型安全比较
          const floorCount = allFloors.filter(floor => {
            const authorId = floor.author_user_id
            return authorId === userIdNum || authorId === String(userIdNum) || (typeof authorId === 'string' && parseInt(authorId, 10) === userIdNum)
          }).length
          const replyCount = allReplies.filter(reply => {
            const authorId = reply.author_user_id
            return authorId === userIdNum || authorId === String(userIdNum) || (typeof authorId === 'string' && parseInt(authorId, 10) === userIdNum)
          }).length
          userStats.commentCount = floorCount + replyCount

          console.log('[DEBUG Profile] 用户 ID:', userIdNum)
          console.log('[DEBUG Profile] 发帖数:', userStats.postCount, '评论数:', userStats.commentCount)
          console.log('[DEBUG Profile] 科普点赞:', userStats.scienceLikeCount, '科普浏览:', userStats.scienceViewCount)
        }
      }
    } catch (mockError) {
      console.warn('统计获取失败:', mockError.message)
    }
  } catch (error) {
    // 静默处理统计信息获取失败，因为这些接口可能还未实现
    console.warn('统计信息接口可能未实现:', error.message)
    // 使用默认统计数据
    Object.assign(userStats, {
      postCount: 0,
      commentCount: 0,
      scienceLikeCount: 0,
      scienceViewCount: 0
    })
  }
}

// 获取最近活动
const fetchRecentActivities = async () => {
  try {
    const response = await userApi.getUserActivities({ limit: 10 })
    if (response.data) {
      recentActivities.value = response.data
    }
  } catch (error) {
    // 静默处理活动记录获取失败
    console.warn('活动记录接口可能未实现:', error.message)
    recentActivities.value = []
  }
}

onMounted(() => {
  fetchUserInfo()
  fetchUserStats()
  fetchRecentActivities()

  // 监听 localStorage 变化（当在其他标签页发布新帖/回复时自动刷新统计）
  window.addEventListener('storage', handleStorageChange)
})

// 当从其他页面返回 Profile 时，刷新统计数据
watch(
  () => route.path,
  (newPath) => {
    console.log('[DEBUG Profile] 路由变化:', newPath)
    if (newPath === '/user/profile' || newPath.endsWith('/profile')) {
      console.log('[DEBUG Profile] 检测到进入个人资料页，刷新统计数据')
      fetchUserStats()
    }
  },
  { immediate: false } // 组件挂载时不会立即执行，因为 onMounted 已经调用了一次
)

// 处理 localStorage 变化事件（跨标签页同步）
const handleStorageChange = (event) => {
  // 当论坛帖子、楼层、回复数据或科普数据发生变化时，刷新统计
  const watchedKeys = [
    'mock_data_forum_posts',
    'mock_data_forum_floors',
    'mock_data_forum_replies',
    'mock_data_science_article_likes',
    'mock_data_science_article_visits'
  ]
  if (watchedKeys.includes(event.key)) {
    console.log('[Profile] 检测到数据变化:', event.key, '刷新统计数据')
    fetchUserStats()
  }
}

// 组件卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
})
</script>

<style scoped>
.profile-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header-title {
  font-size: 18px;
  font-weight: 500;
}

.profile-content {
  margin-top: 20px;
}

.profile-card {
  text-align: center;
}

.profile-header {
  margin-bottom: 24px;
}

.profile-name {
  margin: 16px 0 8px 0;
  color: #333;
  font-size: 20px;
  font-weight: 500;
}

.profile-bio {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  padding: 0 8px;
}

.profile-info {
  text-align: left;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  min-width: 80px;
}

.info-value {
  color: #333;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-actions {
  display: flex;
  justify-content: center;
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 24px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #00b42a;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.interests-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.interest-tag {
  margin: 0;
}

.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f9ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0284c7;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  color: #333;
  font-size: 14px;
  margin-bottom: 4px;
}

.activity-time {
  color: #666;
  font-size: 12px;
}

.no-activity {
  text-align: center;
  color: #999;
  padding: 40px 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .profile-view {
    padding: 16px;
  }

  .el-col {
    width: 100% !important;
    margin-bottom: 20px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>