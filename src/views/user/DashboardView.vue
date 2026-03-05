<template>
  <div class="user-dashboard">
    <!-- 用户欢迎区域 -->
    <div class="welcome-section">
      <el-card class="welcome-card">
        <div class="welcome-content">
          <div class="user-info">
            <el-avatar :size="80" :src="user?.avatar" class="user-avatar">
              <el-icon size="40"><User /></el-icon>
            </el-avatar>
            <div class="user-details">
              <h2>欢迎回来，{{ user?.username || user?.nickname || '用户' }}！</h2>
              <p class="user-role">
                <el-tag v-if="user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'" type="danger">
                  {{ user?.role === 'SUPER_ADMIN' ? '超级管理员' : '管理员' }}
                </el-tag>
                <el-tag v-else type="primary">普通用户</el-tag>
                <span class="last-login">上次登录：{{ formatDate(user?.last_login) }}</span>
              </p>
              <p v-if="user?.bio" class="user-bio">{{ user.bio }}</p>
            </div>
          </div>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/user/profile')">
              <el-icon><Edit /></el-icon>
              编辑资料
            </el-button>
            <el-button @click="$router.push('/user/settings')">
              <el-icon><Setting /></el-icon>
              账户设置
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 统计数据区域 -->
    <div class="stats-section">
      <el-row :gutter="24">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon size="32" color="#409EFF"><Document /></el-icon>
              </div>
              <div class="stat-info">
                <h3>{{ userStats.activities || 0 }}</h3>
                <p>参与活动</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon size="32" color="#67C23A"><ChatLineRound /></el-icon>
              </div>
              <div class="stat-info">
                <h3>{{ userStats.comments || 0 }}</h3>
                <p>评论回复</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon size="32" color="#E6A23C"><Select /></el-icon>
              </div>
              <div class="stat-info">
                <h3>{{ userStats.scienceLikes || 0 }}</h3>
                <p>科普点赞</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon size="32" color="#F56C6C"><View /></el-icon>
              </div>
              <div class="stat-info">
                <h3>{{ userStats.scienceViews || 0 }}</h3>
                <p>科普浏览</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 快捷入口区域 -->
    <div class="quick-access-section">
      <el-row :gutter="24">
        <el-col :span="12">
          <el-card class="quick-access-card">
            <template #header>
              <h3>快捷功能</h3>
            </template>
            <div class="access-buttons">
              <el-button
                v-for="item in quickAccessItems"
                :key="item.path"
                class="access-button"
                @click="$router.push(item.path)"
              >
                <el-icon>
                  <component :is="item.icon" />
                </el-icon>
                <span>{{ item.title }}</span>
              </el-button>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="recent-activity-card">
            <template #header>
              <h3>最近活动</h3>
            </template>
            <div class="activity-list">
              <div
                v-for="activity in recentActivities"
                :key="activity.id"
                class="activity-item"
              >
                <div class="activity-icon">
                  <el-icon>
                    <component :is="getActivityIcon(activity.type)" />
                  </el-icon>
                </div>
                <div class="activity-content">
                  <p class="activity-title">{{ activity.title }}</p>
                  <p class="activity-time">{{ formatDate(activity.time) }}</p>
                </div>
              </div>
              <div v-if="recentActivities.length === 0" class="no-activity">
                <p>暂无最近活动</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import {
  User,
  Edit,
  Setting,
  Document,
  ChatLineRound,
  Select,
  View
} from '@element-plus/icons-vue'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import api from '@/api/unified'
import { useAuthStore, usePermissions } from '@/stores'

// Store
const authStore = useAuthStore()
const { isAdmin } = usePermissions()
const route = useRoute()

// 计算属性
const user = computed(() => authStore.user)

// 用户统计数据
const userStats = ref({
  activities: 0,
  comments: 0,
  scienceLikes: 0,
  scienceViews: 0
})

// 快捷功能入口
const quickAccessItems = ref([
  {
    title: '活动中心',
    path: '/user/activities',
    icon: 'Calendar'
  },
  {
    title: '我的预约',
    path: '/user/activities/my-bookings',
    icon: 'Document'
  },
  {
    title: '预约历史',
    path: '/user/activities/booking-history',
    icon: 'ChatLineRound'
  },
  {
    title: '公告中心',
    path: '/notice',
    icon: 'Bell'
  },
  {
    title: '科普知识',
    path: '/science',
    icon: 'Reading'
  },
  {
    title: '讨论交流',
    path: '/discussion',
    icon: 'ChatLineRound'
  },
  {
    title: '个人资料',
    path: '/user/profile',
    icon: 'User'
  },
  {
    title: '账户设置',
    path: '/user/settings',
    icon: 'Setting'
  },
  // 管理员功能 - 仅管理员可见
  ...(isAdmin.value ? [{
    title: '管理员面板',
    path: '/admin/dashboard',
    icon: 'Setting'
  }] : [])
])

const recentActivities = ref([])

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '暂无记录'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 获取活动图标
const getActivityIcon = (type) => {
  const iconMap = {
    activity: 'Calendar',
    comment: 'Comment',
    article: 'Reading',
    favorite: 'Star',
    login: 'User'
  }
  return iconMap[type] || 'Document'
}

const fetchUserStats = async () => {
  try {
    // 动态导入以支持 Mock 模式
    const { shouldUseMock, userApi } = await import('@/api/unified')
    const isMockMode = shouldUseMock()

    console.log('[DEBUG Dashboard] fetchUserStats 开始执行，isMockMode:', isMockMode, '当前用户ID:', user.value?.id)

    if (isMockMode) {
      console.log('[DEBUG Dashboard] 进入 Mock 模式分支')

      // Mock 模式：从 Mock 数据统计函数获取
      const { getUserIndividualStats } = await import('@/mock/userMockData')
      const currentUserId = user.value?.id

      console.log('[DEBUG Dashboard] 准备调用 getUserIndividualStats，currentUserId:', currentUserId, 'type:', typeof currentUserId)

      // 获取科普文章静态 mock 数据
      const { mockScienceArticleLikes: staticLikes, mockScienceArticleVisits: staticVisits } = await import('@/mock/scienceMockData')
      // 获取科普文章 localStorage 动态数据
      const { getScienceArticleLikes, getScienceArticleVisits } = await import('@/mock/scienceMockStorage')

      if (currentUserId) {
        // getUserIndividualStats 现在是异步函数
        const stats = await getUserIndividualStats(currentUserId)

        console.log('[DEBUG Dashboard] getUserIndividualStats 返回:', stats)

        // 统计当前用户的科普文章点赞数和浏览数
        // 确保 currentUserId 是 number 类型进行比较
        const userIdNum = typeof currentUserId === 'number' ? currentUserId : parseInt(currentUserId, 10)

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

        const scienceLikes = allLikes.filter(like => like.user_id === userIdNum).length
        const scienceViews = allVisits.filter(visit => visit.user_id === userIdNum).length

        console.log('[DEBUG Dashboard] 当前用户 ID:', userIdNum, '活动数:', stats.activity_count, '评论数:', stats.comment_count, '科普点赞:', scienceLikes, '科普浏览:', scienceViews)

        userStats.value = {
          activities: stats.activity_count,
          comments: stats.comment_count,
          scienceLikes,
          scienceViews
        }

        console.log('[DEBUG Dashboard] 最终 userStats.value:', userStats.value)
      } else {
        // 默认值
        userStats.value = {
          activities: 0,
          comments: 0,
          scienceLikes: 0,
          scienceViews: 0
        }
      }
    } else {
      // 真实 API 模式：调用后端接口
      const [activityStatsResult, userStatsResult] = await Promise.allSettled([
        userApi.getUserActivityStats?.(),
        userApi.getUserStats?.()
      ])

      // 处理活动统计
      let activityCount = 0
      if (activityStatsResult.status === 'fulfilled' && activityStatsResult.value?.success) {
        const data = activityStatsResult.value.data
        activityCount = data?.activity_count || data?.count || data?.total || 0
      }

      // 处理用户统计
      let commentCount = 0
      let scienceLikes = 0
      let scienceViews = 0
      if (userStatsResult.status === 'fulfilled' && userStatsResult.value?.success) {
        const data = userStatsResult.value.data
        commentCount = data?.comment_count || data?.comments || 0
        scienceLikes = data?.science_like_count || data?.scienceLikes || 0
        scienceViews = data?.science_view_count || data?.scienceViews || 0
      }

      userStats.value = {
        activities: activityCount,
        comments: commentCount,
        scienceLikes,
        scienceViews
      }
    }
  } catch (error) {
    console.error('获取用户统计失败:', error)
    // 出错时设置为默认值
    userStats.value = {
      activities: 0,
      comments: 0,
      scienceLikes: 0,
      scienceViews: 0
    }
  }
}

const fetchRecentActivities = async () => {
  try {
    // 使用 activityAdapter 获取最近活动
    const response = await api.activity.getPublicActivities({ page: 1, size: 5 })
    // 提取活动数据并转换为最近活动格式
    const items = response.data?.items || response.data || []
    recentActivities.value = items.map(activity => ({
      id: activity.id,
      title: activity.title,
      type: activity.type || 'activity',
      time: activity.start_time || activity.created_at
    }))
  } catch (error) {
    console.error('获取最近活动失败:', error)
    recentActivities.value = []
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    fetchUserStats()
    fetchRecentActivities()
  }

  // 监听 localStorage 变化（当在其他标签页发布新回复时自动刷新统计）
  window.addEventListener('storage', handleStorageChange)
})

// 当从其他页面返回 Dashboard 时，刷新统计数据
// 这样用户在发布新回复后返回 Dashboard，就能看到更新后的统计
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/user/dashboard' && authStore.isAuthenticated) {
      fetchUserStats()
      fetchRecentActivities()
    }
  }
)

// 处理 localStorage 变化事件（跨标签页同步）
const handleStorageChange = (event) => {
  // 当论坛楼层数据、回复数据、科普点赞或浏览数据发生变化时，刷新统计
  const watchedKeys = [
    'mock_data_forum_floors',
    'mock_data_forum_replies',
    'mock_data_science_article_likes',
    'mock_data_science_article_visits'
  ]
  if (watchedKeys.includes(event.key)) {
    console.log('[Dashboard] 检测到数据变化:', event.key, '刷新统计数据')
    if (authStore.isAuthenticated) {
      fetchUserStats()
    }
  }
}

// 组件卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
})
</script>

<style scoped>
.user-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 欢迎区域 */
.welcome-section {
  margin-bottom: 24px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.user-details h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.user-role {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 8px 0;
}

.last-login {
  font-size: 14px;
  opacity: 0.8;
}

.user-bio {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.4;
}

.quick-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* 统计数据区域 */
.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  height: 100%;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  flex-shrink: 0;
}

.stat-info h3 {
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stat-info p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

/* 快捷入口区域 */
.quick-access-section {
  margin-bottom: 24px;
}

.access-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.access-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  height: auto;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.access-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.access-button .el-icon {
  font-size: 20px;
}

.access-button span {
  font-size: 12px;
  line-height: 1.2;
}

/* 最近活动区域 */
.recent-activity-card {
  height: 100%;
}

.activity-list {
  max-height: 300px;
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
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: #f5f7fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #606266;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #303133;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-time {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.no-activity {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-dashboard {
    padding: 16px;
  }

  .welcome-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .user-info {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .quick-actions {
    width: 100%;
    justify-content: center;
  }

  .access-buttons {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>