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
                <el-icon size="32" color="#E6A23C"><Star /></el-icon>
              </div>
              <div class="stat-info">
                <h3>{{ userStats.favorites || 0 }}</h3>
                <p>收藏内容</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon size="32" color="#F56C6C"><Trophy /></el-icon>
              </div>
              <div class="stat-info">
                <h3>{{ userStats.points || 0 }}</h3>
                <p>积分等级</p>
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
import { ref, computed, onMounted } from 'vue'
import { useAuthStore, usePermissions } from '@/stores'
import { ElMessage } from 'element-plus'
import {
  User,
  Edit,
  Setting,
  Document,
  ChatLineRound,
  Star,
  Trophy,
  Calendar,
  Bell,
  Reading,
  Compass,
  Comment
} from '@element-plus/icons-vue'

// Store
const authStore = useAuthStore()
const { isAdmin } = usePermissions()

// 计算属性
const user = computed(() => authStore.user)

// 用户统计数据
const userStats = ref({
  activities: 0,
  comments: 0,
  favorites: 0,
  points: 0
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

// 最近活动
const recentActivities = ref([
  // 这里应该从API获取，现在用模拟数据
])

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

// 获取用户统计数据
const fetchUserStats = async () => {
  try {
    // 这里应该调用实际的API获取用户统计数据
    // const response = await userApi.getUserStats()
    // userStats.value = response.data

    // 模拟数据
    userStats.value = {
      activities: 5,
      comments: 12,
      favorites: 8,
      points: 156
    }
  } catch (error) {
    console.error('获取用户统计失败:', error)
  }
}

// 获取最近活动
const fetchRecentActivities = async () => {
  try {
    // 这里应该调用实际的API获取最近活动
    // const response = await userApi.getRecentActivities()
    // recentActivities.value = response.data

    // 模拟数据
    recentActivities.value = [
      {
        id: 1,
        type: 'activity',
        title: '报名了"夏日垂钓大赛"',
        time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        type: 'comment',
        title: '评论了"春季钓鱼技巧分享"',
        time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        type: 'favorite',
        title: '收藏了"钓鱼装备推荐"',
        time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  } catch (error) {
    console.error('获取最近活动失败:', error)
    recentActivities.value = []
  }
}

// 组件挂载时获取数据
onMounted(() => {
  // 如果用户已登录，获取用户统计数据和最近活动
  if (authStore.isAuthenticated) {
    fetchUserStats()
    fetchRecentActivities()
  }
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