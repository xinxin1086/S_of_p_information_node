<template>
  <div class="organization-dashboard">
    <div class="page-header">
      <h1>控制台</h1>
      <p>欢迎使用活动管理平台，查看您的活动数据和快捷操作</p>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else class="dashboard-content">
      <!-- 数据统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon total">
                <el-icon><Grid /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalActivities }}</div>
                <div class="stat-label">总活动数</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon published">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.publishedActivities }}</div>
                <div class="stat-label">已发布</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon ongoing">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.ongoingActivities }}</div>
                <div class="stat-label">进行中</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon participants">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalParticipants }}</div>
                <div class="stat-label">参与人数</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 快捷操作 -->
      <el-card class="quick-actions-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Operation /></el-icon>
            <span>快捷操作</span>
          </div>
        </template>

        <el-row :gutter="15">
          <el-col :xs="24" :sm="12" :md="6">
            <div class="action-card" @click="goToCreateActivity">
              <div class="action-icon create">
                <el-icon><Plus /></el-icon>
              </div>
              <div class="action-content">
                <h4>创建活动</h4>
                <p>发布新的精彩活动</p>
              </div>
            </div>
          </el-col>

          <el-col :xs="24" :sm="12" :md="6">
            <div class="action-card" @click="goToMyActivities">
              <div class="action-icon manage">
                <el-icon><List /></el-icon>
              </div>
              <div class="action-content">
                <h4>我的活动</h4>
                <p>管理我创建的活动</p>
              </div>
            </div>
          </el-col>

          <el-col :xs="24" :sm="12" :md="6">
            <div class="action-card" @click="goToActivityList">
              <div class="action-icon view">
                <el-icon><View /></el-icon>
              </div>
              <div class="action-content">
                <h4>浏览活动</h4>
                <p>查看所有公开活动</p>
              </div>
            </div>
          </el-col>

          <el-col :xs="24" :sm="12" :md="6">
            <div class="action-card" @click="goToStats">
              <div class="action-icon stats">
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div class="action-content">
                <h4>数据统计</h4>
                <p>查看活动数据分析</p>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 最近活动和预约 -->
      <el-row :gutter="20">
        <el-col :xs="24" :lg="16">
          <el-card class="recent-activities-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><Document /></el-icon>
                <span>最近活动</span>
                <el-button type="primary" link @click="goToMyActivities">查看全部</el-button>
              </div>
            </template>

            <div v-if="recentActivities.length === 0" class="empty-state">
              <el-empty description="暂无活动，快去创建吧">
                <el-button type="primary" @click="goToCreateActivity">创建活动</el-button>
              </el-empty>
            </div>

            <div v-else class="activity-list">
              <div
                v-for="activity in recentActivities"
                :key="activity.id"
                class="activity-item"
                @click="viewActivity(activity.id)"
              >
                <div class="activity-info">
                  <h4 class="activity-title">{{ activity.title }}</h4>
                  <div class="activity-meta">
                    <el-tag :type="getStatusType(activity.status)" size="small">
                      {{ getStatusText(activity.status) }}
                    </el-tag>
                    <span class="activity-time">
                      <el-icon><Calendar /></el-icon>
                      {{ formatDateTime(activity.start_time) }}
                    </span>
                  </div>
                </div>
                <div class="activity-stats">
                  <span class="stat-item">
                    <el-icon><User /></el-icon>
                    {{ activity.current_participants || 0 }}/{{ activity.max_participants || '不限' }}
                  </span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="8">
          <el-card class="recent-bookings-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><Bell /></el-icon>
                <span>最新预约</span>
              </div>
            </template>

            <div v-if="recentBookings.length === 0" class="empty-state">
              <el-empty description="暂无预约记录" :image-size="100" />
            </div>

            <div v-else class="booking-list">
              <div
                v-for="booking in recentBookings"
                :key="booking.id"
                class="booking-item"
              >
                <div class="booking-info">
                  <h4 class="booking-title">{{ booking.activity_title }}</h4>
                  <div class="booking-meta">
                    <span class="booking-user">{{ booking.user_name || '用户' }}</span>
                    <span class="booking-time">{{ formatRelativeTime(booking.created_at) }}</span>
                  </div>
                </div>
                <el-tag :type="booking.status === 'confirmed' ? 'success' : 'warning'" size="small">
                  {{ getBookingStatusText(booking.status) }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 活动评分概览 -->
      <el-card v-if="stats.averageRating > 0" class="rating-overview-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Star /></el-icon>
            <span>活动评分概览</span>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="8">
            <div class="rating-item">
              <div class="rating-value">
                <el-rate
                  v-model="stats.averageRating"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template="{value} 分"
                />
              </div>
              <div class="rating-label">平均评分</div>
            </div>
          </el-col>

          <el-col :xs="24" :sm="8">
            <div class="rating-item">
              <div class="rating-count">{{ stats.totalRatings }}</div>
              <div class="rating-label">总评分数</div>
            </div>
          </el-col>

          <el-col :xs="24" :sm="8">
            <div class="rating-item">
              <div class="rating-count">{{ stats.ratedActivities }}</div>
              <div class="rating-label">已评价活动</div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Grid,
  CircleCheck,
  Clock,
  User,
  Plus,
  List,
  View,
  DataAnalysis,
  Operation,
  Document,
  Bell,
  Star,
  Calendar
} from '@element-plus/icons-vue'
import { useActivityStore } from '@/stores/activity'

const router = useRouter()
const activityStore = useActivityStore()

const loading = ref(true)
const recentActivities = ref([])
const recentBookings = ref([])

// 统计数据
const stats = reactive({
  totalActivities: 0,
  publishedActivities: 0,
  ongoingActivities: 0,
  totalParticipants: 0,
  averageRating: 0,
  totalRatings: 0,
  ratedActivities: 0
})

// 加载仪表板数据
const loadDashboardData = async () => {
  try {
    loading.value = true

    // 获取我的活动列表
    const activitiesResult = await activityStore.fetchMyActivities({
      page: 1,
      size: 5
    })

    if (activitiesResult.success) {
      const activities = activitiesResult.data || []
      recentActivities.value = activities

      // 计算统计数据
      stats.totalActivities = activities.length
      stats.publishedActivities = activities.filter(a => a.status === 'published').length
      stats.ongoingActivities = activities.filter(a => {
        const now = new Date()
        const start = new Date(a.start_time)
        const end = new Date(a.end_time)
        return now >= start && now <= end
      }).length

      stats.totalParticipants = activities.reduce((sum, a) => {
        return sum + (a.current_participants || 0)
      }, 0)
    }

    // 获取活动统计
    const statsResult = await activityStore.fetchUserActivityStats()
    if (statsResult.success && statsResult.data) {
      const data = statsResult.data
      stats.averageRating = data.average_rating || 0
      stats.totalRatings = data.total_ratings || 0
      stats.ratedActivities = data.rated_activities || 0

      // 模拟最新预约数据（实际应该从API获取）
      if (data.recent_bookings) {
        recentBookings.value = data.recent_bookings
      }
    }
  } catch (error) {
    console.error('加载仪表板数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 导航方法
const goToCreateActivity = () => {
  router.push('/user/weave/create-activity')
}

const goToMyActivities = () => {
  router.push('/user/weave/my-activities')
}

const goToActivityList = () => {
  router.push('/activities')
}

const goToStats = () => {
  // 活动统计页面可能集成在当前页面或独立页面
  ElMessage.info('数据统计功能开发中...')
}

const viewActivity = (id) => {
  router.push(`/user/activities/${id}`)
}

// 工具方法
const getStatusType = (status) => {
  const typeMap = {
    draft: 'info',
    pending: 'warning',
    published: 'success',
    ongoing: 'primary',
    completed: '',
    cancelled: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    draft: '草稿',
    pending: '审核中',
    published: '已发布',
    ongoing: '进行中',
    completed: '已结束',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

const getBookingStatusText = (status) => {
  const textMap = {
    pending: '待确认',
    confirmed: '已确认',
    cancelled: '已取消',
    completed: '已完成'
  }
  return textMap[status] || status
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatRelativeTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.organization-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: #303133;
  margin-bottom: 10px;
  font-size: 28px;
}

.page-header p {
  color: #606266;
  font-size: 14px;
}

.loading-container {
  padding: 40px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon.published {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-icon.ongoing {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-icon.participants {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.quick-actions-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.card-header .el-button {
  margin-left: auto;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 15px;
}

.action-card:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.action-icon {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.action-icon.create {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.action-icon.manage {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.action-icon.view {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.action-icon.stats {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.action-content h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #303133;
}

.action-content p {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.recent-activities-card,
.recent-bookings-card,
.rating-overview-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.empty-state {
  padding: 40px 0;
}

.activity-list,
.booking-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s ease;
}

.activity-item:hover {
  background: #f8f9fa;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-title {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #303133;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.activity-time {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
}

.activity-stats {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
  font-size: 13px;
}

.booking-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.booking-item:last-child {
  border-bottom: none;
}

.booking-title {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #303133;
}

.booking-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.booking-user {
  color: #606266;
}

.booking-time {
  color: #909399;
}

.rating-item {
  text-align: center;
  padding: 20px;
}

.rating-value {
  margin-bottom: 10px;
}

.rating-label {
  font-size: 14px;
  color: #909399;
}

.rating-count {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .organization-dashboard {
    padding: 15px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .stat-value {
    font-size: 24px;
  }

  .action-card {
    margin-bottom: 10px;
  }

  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .activity-stats {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
