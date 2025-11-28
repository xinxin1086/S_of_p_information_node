<template>
  <div class="activity-list">
    <div class="page-header">
      <h1>活动中心</h1>
      <p>参与精彩活动，结识钓友，提升技能</p>
    </div>

    <div class="filter-bar">
      <el-radio-group v-model="statusFilter" @change="filterActivities">
        <el-radio-button label="all">全部活动</el-radio-button>
        <el-radio-button label="ongoing">进行中</el-radio-button>
        <el-radio-button label="upcoming">即将开始</el-radio-button>
        <el-radio-button label="completed">已结束</el-radio-button>
      </el-radio-group>
    </div>

    <div class="activity-container">
      <div v-if="loading" class="loading">
        <el-loading :active="loading" />
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

            <div class="activity-summary">
              <p>{{ activity.summary }}</p>
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

const router = useRouter()

const loading = ref(false)
const activities = ref([])
const statusFilter = ref('all')

const filteredActivities = computed(() => {
  if (statusFilter.value === 'all') {
    return activities.value
  }
  return activities.value.filter(activity => activity.status === statusFilter.value)
})

const fetchActivities = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    activities.value = [
      {
        id: 1,
        title: '汉江春季钓鱼大赛',
        summary: '年度大型钓鱼比赛，丰厚奖品等你来拿！专业钓手与业余爱好者同场竞技，共享垂钓乐趣。',
        location: '汉江渔场',
        type: 'competition',
        status: 'upcoming',
        cover: 'https://via.placeholder.com/400x250/FF6B6B/FFFFFF?text=钓鱼大赛',
        startTime: '2024-03-15T08:00:00Z',
        endTime: '2024-03-15T17:00:00Z',
        participants: 45,
        maxParticipants: 100
      },
      {
        id: 2,
        title: '新手钓鱼培训班',
        summary: '专业教练手把手教学，从零开始学钓鱼。提供全套装备，适合完全没有经验的新手参加。',
        location: '城东培训基地',
        type: 'training',
        status: 'ongoing',
        cover: 'https://via.placeholder.com/400x250/4ECDC4/FFFFFF?text=新手培训',
        startTime: '2024-01-20T09:00:00Z',
        endTime: '2024-01-20T16:00:00Z',
        participants: 18,
        maxParticipants: 30
      },
      {
        id: 3,
        title: '环保钓鱼公益活动',
        summary: '清理河道垃圾，保护生态环境。在享受垂钓乐趣的同时，为环保事业贡献一份力量。',
        location: '滨江公园',
        type: 'volunteer',
        status: 'completed',
        cover: 'https://via.placeholder.com/400x250/95E1D3/FFFFFF?text=环保活动',
        startTime: '2024-01-10T07:00:00Z',
        endTime: '2024-01-10T12:00:00Z',
        participants: 67,
        maxParticipants: 80
      },
      {
        id: 4,
        title: '夜间垂钓体验活动',
        summary: '体验独特的夜间垂钓乐趣，学习夜间钓鱼技巧和注意事项。提供照明设备和小吃。',
        location: '汉江夜钓区',
        type: 'experience',
        status: 'ongoing',
        cover: 'https://via.placeholder.com/400x250/AA96DA/FFFFFF?text=夜钓体验',
        startTime: '2024-01-18T19:00:00Z',
        endTime: '2024-01-19T06:00:00Z',
        participants: 12,
        maxParticipants: 20
      }
    ]
  } catch (error) {
    console.error('获取活动列表失败:', error)
  } finally {
    loading.value = false
  }
}

const filterActivities = () => {
  // 触发重新计算 filteredActivities
}

const goToDetail = (id) => {
  router.push(`/activities/${id}`)
}

const getStatusClass = (status) => {
  const classMap = {
    upcoming: 'status-upcoming',
    ongoing: 'status-ongoing',
    completed: 'status-completed',
    cancelled: 'status-cancelled'
  }
  return classMap[status] || 'status-upcoming'
}

const getStatusText = (status) => {
  const textMap = {
    upcoming: '即将开始',
    ongoing: '进行中',
    completed: '已结束',
    cancelled: '已取消'
  }
  return textMap[status] || '即将开始'
}

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

.status-upcoming {
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

.activity-summary {
  margin-bottom: 15px;
}

.activity-summary p {
  color: #606266;
  line-height: 1.5;
  margin: 0;
  font-size: 14px;
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