<template>
  <div class="user-dashboard">
    <div class="dashboard-header">
      <h1>用户中心</h1>
      <p>欢迎回来，{{ user?.username }}！</p>
    </div>

    <!-- 用户信息卡片 -->
    <div class="user-info-card">
      <div class="user-avatar">
        <el-avatar :size="80" :src="userAvatar">
          {{ user?.username?.charAt(0)?.toUpperCase() }}
        </el-avatar>
        <el-button type="primary" size="small" @click="editAvatar">
          更换头像
        </el-button>
      </div>
      <div class="user-details">
        <h2>{{ user?.username }}</h2>
        <p><el-icon><User /></el-icon> {{ user?.role === 'organization' ? '组织用户' : '普通用户' }}</p>
        <p><el-icon><Phone /></el-icon> {{ user?.phone || '未设置' }}</p>
        <p><el-icon><Message /></el-icon> {{ user?.email || '未设置' }}</p>
      </div>
    </div>

    <!-- 快速功能 -->
    <div class="quick-actions">
      <h3>快速功能</h3>
      <div class="action-grid">
        <div class="action-card" @click="$router.push('/user/profile')">
          <el-icon class="action-icon"><User /></el-icon>
          <h4>个人资料管理</h4>
          <p>管理您的基本信息</p>
        </div>
        <div class="action-card" @click="$router.push('/user/settings')">
          <el-icon class="action-icon"><Setting /></el-icon>
          <h4>账户设置</h4>
          <p>修改密码和隐私设置</p>
        </div>
        <div class="action-card" @click="$router.push('/user/activities')">
          <el-icon class="action-icon"><Calendar /></el-icon>
          <h4>活动功能</h4>
          <p>浏览和参与活动</p>
        </div>
      </div>
    </div>

    <!-- 组织用户专属功能 -->
    <div v-if="user?.role === 'organization'" class="organization-features">
      <h3>组织用户</h3>
      <div class="action-grid">
        <div class="action-card" @click="$router.push('/user/weave/dashboard')">
          <el-icon class="action-icon"><DataBoard /></el-icon>
          <h4>控制台</h4>
          <p>数据概览和统计信息</p>
        </div>
        <div class="action-card" @click="$router.push('/user/weave/create-activity')">
          <el-icon class="action-icon"><Plus /></el-icon>
          <h4>创建活动</h4>
          <p>发布新的活动信息</p>
        </div>
        <div class="action-card" @click="$router.push('/user/weave/my-activities')">
          <el-icon class="action-icon"><List /></el-icon>
          <h4>我的活动</h4>
          <p>管理您创建的活动</p>
        </div>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="recent-activities">
      <h3>最近活动</h3>
      <div class="activity-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="activity-content">
            <h4>{{ activity.title }}</h4>
            <p>{{ activity.description }}</p>
            <span class="activity-time">{{ formatDate(activity.time) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  User,
  Phone,
  Message,
  Setting,
  Calendar,
  DataBoard,
  Plus,
  List
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores'
import { formatAvatarUrl } from '@/utils/common/format'


const router = useRouter()
const authStore = useAuthStore()

// 用户信息
const user = computed(() => authStore.user)
const userAvatar = computed(() => formatAvatarUrl(user.value?.avatar))

// 最近活动数据
const recentActivities = ref([
  {
    id: 1,
    title: '系统登录',
    description: '您成功登录了系统',
    time: new Date()
  }
])

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 编辑头像
const editAvatar = () => {
  // 这里可以实现头像上传功能
  console.log('编辑头像')
}

// 组件挂载时加载数据
onMounted(() => {
  // 加载用户最近活动数据
})
</script>

<style scoped>
.user-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 8px;
}

.dashboard-header p {
  color: #666;
  font-size: 16px;
}

.user-info-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 30px;
}

.user-avatar {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.user-details {
  flex: 1;
}

.user-details h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.user-details p {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  margin-bottom: 12px;
  font-size: 14px;
}

.quick-actions,
.organization-features,
.recent-activities {
  margin-bottom: 30px;
}

.quick-actions h3,
.organization-features h3,
.recent-activities h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.action-icon {
  font-size: 40px;
  color: #409eff;
  margin-bottom: 16px;
}

.action-card h4 {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.action-card p {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.activity-list {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  background: #f0f9ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-content h4 {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.activity-content p {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.activity-time {
  font-size: 12px;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-dashboard {
    padding: 15px;
  }

  .dashboard-header h1 {
    font-size: 24px;
  }

  .user-info-card {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }

  .organization-features .action-grid {
    grid-template-columns: 1fr;
  }
}
</style>