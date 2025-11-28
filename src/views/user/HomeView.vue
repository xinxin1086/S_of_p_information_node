<!-- ./src/views/HomeView.vue -->
<template>
  <div class="user-dashboard">
    <div class="dashboard-header">
      <h1>用户首页</h1>
      <p class="welcome-text">欢迎回来，{{ userInfo.nickname || userInfo.username }}！</p>
    </div>

    <div class="dashboard-content">
      <!-- 用户基本信息卡片 -->
      <el-card class="user-info-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <el-button type="primary" link @click="$router.push('/user/profile')">
              查看详情 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </template>
        <div class="user-basic-info">
          <div class="avatar-section">
            <el-avatar :size="80" :src="userInfo.avatar" fit="cover">
              <el-icon size="40"><User /></el-icon>
            </el-avatar>
          </div>
          <div class="info-section">
            <div class="info-item">
              <span class="label">用户名：</span>
              <span class="value">{{ userInfo.username }}</span>
            </div>
            <div class="info-item">
              <span class="label">昵称：</span>
              <span class="value">{{ userInfo.nickname || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="label">邮箱：</span>
              <span class="value">{{ userInfo.email || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="label">手机号：</span>
              <span class="value">{{ userInfo.phone || '未设置' }}</span>
            </div>
            <div class="info-item">
              <span class="label">注册时间：</span>
              <span class="value">{{ formatDate(userInfo.created_at) }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 快捷操作卡片 -->
      <el-card class="quick-actions-card">
        <template #header>
          <span>快捷操作</span>
        </template>
        <div class="quick-actions">
          <el-button type="primary" @click="$router.push('/user/profile/edit')">
            <el-icon><Edit /></el-icon>
            编辑个人资料
          </el-button>
          <el-button @click="$router.push('/user/account')">
            <el-icon><Setting /></el-icon>
            账户设置
          </el-button>
          <el-button @click="$router.push('/user/forum')">
            <el-icon><ChatDotRound /></el-icon>
            进入论坛
          </el-button>
          <el-button @click="$router.push('/user/activities')">
            <el-icon><Calendar /></el-icon>
            查看活动
          </el-button>
        </div>
      </el-card>

      <!-- 统计信息卡片 -->
      <div class="stats-cards">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ userStats.postCount || 0 }}</div>
            <div class="stat-label">发帖数量</div>
          </div>
          <el-icon class="stat-icon"><DocumentCopy /></el-icon>
        </el-card>

        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ userStats.commentCount || 0 }}</div>
            <div class="stat-label">评论数量</div>
          </div>
          <el-icon class="stat-icon"><ChatLineSquare /></el-icon>
        </el-card>

        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ userStats.bookingCount || 0 }}</div>
            <div class="stat-label">活动预约</div>
          </div>
          <el-icon class="stat-icon"><Calendar /></el-icon>
        </el-card>

        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ userStats.favoriteCount || 0 }}</div>
            <div class="stat-label">收藏数量</div>
          </div>
          <el-icon class="stat-icon"><Star /></el-icon>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ArrowRight,
  User,
  Edit,
  Setting,
  ChatDotRound,
  Calendar,
  DocumentCopy,
  ChatLineSquare,
  Star
} from '@element-plus/icons-vue'

defineOptions({ name: "HomeView" })

// 用户信息
const userInfo = reactive({
  username: '垂钓爱好者',
  nickname: '江边渔夫',
  email: 'fisher@example.com',
  phone: '138****8888',
  avatar: '',
  created_at: '2024-01-15T10:30:00Z',
  status: 'active'
})

// 用户统计信息
const userStats = reactive({
  postCount: 12,
  commentCount: 45,
  bookingCount: 8,
  favoriteCount: 23
})

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

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    // 这里应该调用实际的API
    // const response = await userApi.getUserInfo()
    // Object.assign(userInfo, response.data)

    // 模拟数据
    console.log('获取用户信息...')
  } catch (error) {
    ElMessage.error('获取用户信息失败')
    console.error('获取用户信息失败:', error)
  }
}

// 获取用户统计信息
const fetchUserStats = async () => {
  try {
    // 这里应该调用实际的API
    // const response = await userApi.getUserStats()
    // Object.assign(userStats, response.data)

    // 模拟数据
    console.log('获取用户统计信息...')
  } catch (error) {
    ElMessage.error('获取统计信息失败')
    console.error('获取统计信息失败:', error)
  }
}

onMounted(() => {
  fetchUserInfo()
  fetchUserStats()
})
</script>

<style scoped>
.user-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 30px;
}

.dashboard-header h1 {
  color: #00b42a;
  margin-bottom: 10px;
  font-size: 2.5rem;
}

.welcome-text {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.user-info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-basic-info {
  display: flex;
  gap: 24px;
  align-items: center;
}

.avatar-section {
  flex-shrink: 0;
}

.info-section {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
}

.label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
  margin-right: 12px;
}

.value {
  color: #333;
  font-weight: 400;
}

.quick-actions-card {
  margin-bottom: 20px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.quick-actions .el-button {
  height: 50px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-content {
  position: relative;
  z-index: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #00b42a;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.stat-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 2.5rem;
  color: #e0e0e0;
}

@media (max-width: 768px) {
  .user-dashboard {
    padding: 16px;
  }

  .user-basic-info {
    flex-direction: column;
    text-align: center;
  }

  .info-section {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .dashboard-header h1 {
    font-size: 2rem;
  }
}
</style>