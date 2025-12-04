<template>
  <div class="activity-list">
    <div class="page-header">
      <h1>活动中心</h1>
      <p>参与精彩活动，结识钓友，提升技能</p>
    </div>

    <div class="filter-bar">
      <el-radio-group v-model="statusFilter" @change="filterActivities">
        <el-radio-button label="all">{{ STATUS_FILTER_LABELS.all }}</el-radio-button>
        <el-radio-button label="upcoming">{{ STATUS_FILTER_LABELS.upcoming }}</el-radio-button>
        <el-radio-button label="ongoing">{{ STATUS_FILTER_LABELS.ongoing }}</el-radio-button>
        <el-radio-button label="completed">{{ STATUS_FILTER_LABELS.completed }}</el-radio-button>
      </el-radio-group>
    </div>

    <div class="activity-container">
      <div v-if="loading" class="loading">
        <el-loading :active="loading" />
      </div>

      <!-- 错误状态显示 -->
      <div v-else-if="errorMessage" class="error-state">
        <el-result icon="warning" :title="errorMessage" :sub-title="errorSubTitle">
          <template #extra>
            <el-button type="primary" @click="retryFetchActivities">重新加载</el-button>
          </template>
        </el-result>
      </div>

      <div v-else-if="filteredActivities.length === 0" class="empty-state">
        <el-empty description="暂无相关活动" />
      </div>

      <div v-else class="activity-grid">
        <el-card
          v-for="activity in filteredActivities"
          :key="activity.id"
          class="activity-card"
          shadow="hover"
          @click="goToDetail(activity.id)"
        >
          <div class="activity-image" v-if="activity.cover">
            <img :src="activity.cover" :alt="activity.title" />
            <div class="activity-status" :class="getStatusClass(activity.status)">
              {{ getStatusText(activity.status) }}
            </div>
          </div>

          <div class="activity-content">
            <h3 class="activity-title">{{ activity.title }}</h3>

            <div class="activity-info">
              <div class="info-item">
                <el-icon><Location /></el-icon>
                <span>{{ activity.location }}</span>
              </div>
              <div class="info-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDateTime(activity.startTime) }}</span>
              </div>
              <div class="info-item">
                <el-icon><User /></el-icon>
                <span>{{ activity.participants }}/{{ activity.maxParticipants }}人</span>
              </div>
            </div>

            <div class="activity-footer">
              <el-tag :type="getActivityTypeTag(activity.type)" size="small">
                {{ getActivityTypeText(activity.type) }}
              </el-tag>
              <el-progress
                v-if="activity.maxParticipants > 0"
                :percentage="(activity.participants / activity.maxParticipants) * 100"
                :stroke-width="6"
                text-inside
                class="progress-bar"
              />
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Location, Calendar, User } from '@element-plus/icons-vue'
import { useActivityStore } from '@/store/modules/activity'
import {
  STATUS_FILTER_LABELS,
  getStatusText,
  getStatusTagType,
  getStatusClass,
  getStatusesByFilter
} from '@/config/activityStatus'

const router = useRouter()
const activityStore = useActivityStore()

const loading = ref(false)
const activities = ref([])
const statusFilter = ref('all')
const errorMessage = ref('')
const errorSubTitle = ref('')

const filteredActivities = computed(() => {
  const allowedStatuses = getStatusesByFilter(statusFilter.value)
  return activities.value.filter(activity => allowedStatuses.includes(activity.status))
})

const fetchActivities = async () => {
  loading.value = true
  try {
    const result = await activityStore.fetchPublicActivities({
      page: 1,
      size: 20
      // 注意：这里不再使用status参数，因为我们会在前端进行筛选
      // 这样可以确保每次都获取所有活动数据，然后根据筛选条件在前端过滤
    })

    if (result.success) {
      // 适配数据格式到前端显示
      const items = result.data?.items || result.data || []
      activities.value = items.map(activity => ({
        id: activity.id,
        title: activity.title,
        summary: activity.description?.substring(0, 100) + '...' || '',
        location: activity.location || '地点待定',
        type: activity.type || 'social',
        status: activity.status || 'published',
        cover: activity.cover_image,
        startTime: activity.start_time,
        endTime: activity.end_time,
        participants: activity.current_participants || 0,
        maxParticipants: activity.max_participants || 0,
        organizerAccount: activity.organizer_display_name || activity.organizer_name || '组织者'
      }))
    } else {
      console.error('获取活动列表失败:', result.error)
      errorMessage.value = result.error || '获取活动列表失败'
      errorSubTitle.value = result.details || ''
    }
  } catch (error) {
    console.error('获取活动列表失败:', error)
    errorMessage.value = '获取活动列表失败'
    errorSubTitle.value = error.message || '网络连接异常，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 重试获取活动列表
const retryFetchActivities = () => {
  errorMessage.value = ''
  errorSubTitle.value = ''
  fetchActivities()
}

const filterActivities = () => {
  // 触发重新计算 filteredActivities
}

const goToDetail = (id) => {
  router.push(`/activities/${id}`)
}

// 状态相关函数已从 @/config/activityStatus 导入

const getActivityTypeTag = (type) => {
  const typeMap = {
    competition: 'danger',
    training: 'success',
    volunteer: 'warning',
    experience: 'info',
    social: ''
  }
  return typeMap[type] || ''
}

const getActivityTypeText = (type) => {
  const textMap = {
    competition: '比赛',
    training: '培训',
    volunteer: '公益',
    experience: '体验',
    social: '社交'
  }
  return textMap[type] || '活动'
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchActivities()
})
</script>

<style scoped>
.activity-list {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  color: #303133;
  margin-bottom: 10px;
}

.page-header p {
  color: #606266;
  font-size: 16px;
}

.filter-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.activity-container {
  min-height: 400px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 25px;
}

.activity-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.activity-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.activity-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.activity-card:hover .activity-image img {
  transform: scale(1.05);
}

.activity-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.status-draft {
  background-color: #c0c4cc;
}

.status-published {
  background-color: #409eff;
}

.status-ongoing {
  background-color: #67c23a;
}

.status-completed {
  background-color: #909399;
}

.status-cancelled {
  background-color: #f56c6c;
}

.activity-content {
  padding: 20px;
}

.activity-title {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #303133;
  line-height: 1.4;
}

.activity-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 14px;
}

.info-item .el-icon {
  font-size: 14px;
  color: #909399;
}

.activity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  width: 120px;
}

@media (max-width: 768px) {
  .activity-list {
    padding: 15px;
  }

  .filter-bar {
    margin-bottom: 20px;
  }

  .activity-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .activity-title {
    font-size: 16px;
  }

  .activity-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .progress-bar {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .filter-bar {
    overflow-x: auto;
    justify-content: flex-start;
  }

  .el-radio-group {
    flex-wrap: nowrap;
  }
}
</style>