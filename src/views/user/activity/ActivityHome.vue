<template>
  <div class="activity-home">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>活动中心</h1>
      <p>发现精彩活动，结识钓友，享受钓鱼乐趣</p>
    </div>

    <!-- 活动筛选 -->
    <div class="filter-section">
      <el-radio-group v-model="currentFilter" @change="handleFilterChange" size="large">
        <el-radio-button label="all">全部活动</el-radio-button>
        <el-radio-button label="upcoming">即将开始</el-radio-button>
        <el-radio-button label="ongoing">进行中</el-radio-button>
        <el-radio-button label="completed">已结束</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-loading :active="loading" text="加载活动中..." />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="errorMessage" class="error-container">
      <el-empty
        :image-size="120"
        :description="errorMessage"
      >
        <el-button type="primary" @click="retryLoad">重新加载</el-button>
      </el-empty>
    </div>

    <!-- 活动列表 -->
    <div v-else class="activity-grid">
      <div
        v-for="activity in filteredActivities"
        :key="activity.id"
        class="activity-card"
        @click="goToDetail(activity.id)"
      >
        <!-- 活动封面 -->
        <div class="activity-cover" v-if="activity.cover_image">
          <img :src="activity.cover_image" :alt="activity.title" />
          <div class="activity-status" :class="getStatusClass(activity.status)">
            {{ getStatusText(activity.status) }}
          </div>
        </div>

        <div class="activity-cover placeholder" v-else>
          <div class="activity-status" :class="getStatusClass(activity.status)">
            {{ getStatusText(activity.status) }}
          </div>
        </div>

        <!-- 活动内容 -->
        <div class="activity-content">
          <h3 class="activity-title">{{ activity.title }}</h3>

          <p class="activity-description">{{ activity.description }}</p>

          <div class="activity-info">
            <div class="info-item">
              <el-icon><Location /></el-icon>
              <span>{{ activity.location }}</span>
            </div>

            <div class="info-item">
              <el-icon><Calendar /></el-icon>
              <span>{{ formatDate(activity.start_time) }}</span>
            </div>

            <div class="info-item">
              <el-icon><User /></el-icon>
              <span>{{ activity.current_participants || 0 }}/{{ activity.max_participants }}人</span>
            </div>
          </div>

          <div class="activity-footer">
            <el-tag
              :type="getStatusTagType(activity.status)"
              size="small"
            >
              {{ getStatusText(activity.status) }}
            </el-tag>

            <div class="progress-info" v-if="activity.max_participants > 0">
              <el-progress
                :percentage="getParticipantPercentage(activity)"
                :stroke-width="6"
                :show-text="false"
              />
              <span class="progress-text">
                {{ activity.current_participants || 0 }}/{{ activity.max_participants }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && !errorMessage && filteredActivities.length === 0" class="empty-container">
      <el-empty description="暂无相关活动" />
    </div>
  </div>
</template>

<script setup>
import { Location, Calendar, User } from '@element-plus/icons-vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import {
  STATUS_FILTER_LABELS,
  getStatusText,
  getStatusTagType,
  getStatusClass,
  getStatusesByFilter
} from '@/config/activityStatus'
import { useActivityStore } from '@/stores/activity'

const router = useRouter()
const activityStore = useActivityStore()

// 响应式数据
const loading = ref(false)
const activities = ref([])
const currentFilter = ref('all')
const errorMessage = ref('')

// 计算属性：根据筛选条件过滤活动
const filteredActivities = computed(() => {
  if (!activities.value.length) return []

  const allowedStatuses = getStatusesByFilter(currentFilter.value)
  return activities.value.filter(activity =>
    allowedStatuses.includes(activity.status)
  )
})

// 计算参与人数百分比
const getParticipantPercentage = (activity) => {
  if (!activity.max_participants || activity.max_participants <= 0) return 0
  const current = activity.current_participants || 0
  return Math.round((current / activity.max_participants) * 100)
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 加载活动列表
const loadActivities = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await activityStore.fetchActivities({
      page: 1,
      size: 20
    })

    if (result.success) {
      activities.value = result.data || []
    } else {
      errorMessage.value = result.error || '加载活动失败'
    }
  } catch (error) {
    console.error('加载活动失败:', error)
    errorMessage.value = '网络连接失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 筛选条件改变处理
const handleFilterChange = () => {
  // 由于我们在前端进行筛选，这里不需要重新请求
}

// 重新加载
const retryLoad = () => {
  loadActivities()
}

// 跳转到活动详情
const goToDetail = (activityId) => {
  router.push(`/activities/${activityId}`)
}

// 页面挂载时加载数据
onMounted(() => {
  loadActivities()
})
</script>

<style scoped>
.activity-home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 48px;
}

.page-header h1 {
  font-size: 36px;
  color: #303133;
  margin-bottom: 12px;
  font-weight: 600;
}

.page-header p {
  font-size: 18px;
  color: #606266;
  margin: 0;
}

.filter-section {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.loading-container,
.error-container,
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.activity-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.activity-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.activity-cover {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.activity-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.activity-card:hover .activity-cover img {
  transform: scale(1.05);
}

.activity-cover.placeholder {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  backdrop-filter: blur(10px);
}

.status-draft {
  background-color: #909399;
}

.status-published {
  background-color: #409eff;
}

.status-ongoing {
  background-color: #67c23a;
}

.status-completed {
  background-color: #e6a23c;
}

.status-cancelled {
  background-color: #f56c6c;
}

.activity-content {
  padding: 20px;
}

.activity-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.activity-description {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.activity-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

.info-item .el-icon {
  font-size: 16px;
  color: #909399;
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 120px;
}

.progress-text {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .activity-home {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .page-header p {
    font-size: 16px;
  }

  .activity-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .activity-content {
    padding: 16px;
  }

  .activity-title {
    font-size: 18px;
  }
}
</style>
