<template>
  <div class="activity-tab">
    <div class="tab-header">
      <div class="header-actions">
        <el-button type="primary" @click="$router.push('/user/activities')">
          查看全部活动
        </el-button>
        <el-button v-if="user?.role === 'fisher'" type="success" @click="$router.push('/user/fisher/create-activity')">
          发布活动
        </el-button>
      </div>
    </div>

    <div class="activity-grid">
      <div v-loading="loading">
        <div v-if="activities.length === 0" class="empty-state">
          <el-empty description="暂无活动" />
        </div>
        <el-row :gutter="20" v-else>
          <el-col :xs="24" :sm="12" :lg="8" v-for="activity in activities" :key="activity.id">
            <el-card class="activity-card" shadow="hover" @click="$router.push(`/user/activities/${activity.id}`)">
              <div class="activity-image">
                <img :src="activity.image || '/default-activity.jpg'" :alt="activity.title" />
                <div class="activity-status" :class="activity.status">
                  {{ getStatusText(activity.status) }}
                </div>
              </div>
              <div class="activity-content">
                <h3 class="activity-title">{{ activity.title }}</h3>
                <div class="activity-info">
                  <div class="info-item">
                    <el-icon><calendar /></el-icon>
                    <span>{{ formatDate(activity.date) }}</span>
                  </div>
                  <div class="info-item">
                    <el-icon><location /></el-icon>
                    <span>{{ activity.location }}</span>
                  </div>
                  <div class="info-item">
                    <el-icon><user /></el-icon>
                    <span>{{ activity.organizer }}</span>
                  </div>
                </div>
                <div class="activity-stats">
                  <div class="stat-item">
                    <span class="stat-label">名额</span>
                    <span class="stat-value">{{ activity.bookedCount }}/{{ activity.maxParticipants }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">价格</span>
                    <span class="stat-value price">¥{{ activity.price }}</span>
                  </div>
                </div>
                <div class="activity-actions">
                  <el-progress
                    :percentage="getBookingPercentage(activity)"
                    :color="getProgressColor(activity)"
                    :show-text="false"
                    :stroke-width="6"
                  />
                  <el-button
                    :type="activity.status === 'ongoing' ? 'primary' : 'default'"
                    size="small"
                    @click.stop="handleBooking(activity)"
                    :disabled="activity.status !== 'ongoing' || activity.bookedCount >= activity.maxParticipants"
                  >
                    {{ getBookingButtonText(activity) }}
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="pagination-wrapper" v-if="activities.length > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[6, 12, 24]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchActivities"
        @current-change="fetchActivities"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Calendar, Location, User } from '@element-plus/icons-vue'
import { useMainStore } from '@/store'
import dayjs from 'dayjs'

defineOptions({ name: "ActivityTab" })

const router = useRouter()
const mainStore = useMainStore()

const user = computed(() => mainStore.user)
const loading = ref(false)
const activities = ref([])
const currentPage = ref(1)
const pageSize = ref(6)
const total = ref(0)

const fetchActivities = async () => {
  loading.value = true
  try {
    // 模拟API调用
    setTimeout(() => {
      activities.value = [
        {
          id: 1,
          title: '汉江春季钓鱼比赛',
          description: '欢迎各位钓鱼爱好者参加春季钓鱼比赛，丰厚奖品等你来拿！',
          image: '',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          location: '汉江上游钓鱼基地',
          organizer: '汉江垂钓协会',
          maxParticipants: 50,
          bookedCount: 32,
          price: 128,
          status: 'ongoing' // upcoming, ongoing, completed, cancelled
        },
        {
          id: 2,
          title: '路亚技巧培训课程',
          description: '专业路亚教练手把手教学，从零开始学路亚',
          image: '',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          location: '汉江体育中心',
          organizer: '路亚高手俱乐部',
          maxParticipants: 20,
          bookedCount: 18,
          price: 298,
          status: 'ongoing'
        },
        {
          id: 3,
          title: '亲子钓鱼体验活动',
          description: '带孩子来体验钓鱼的乐趣，增进亲子感情',
          image: '',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          location: '汉江休闲垂钓园',
          organizer: '汉江亲子活动中心',
          maxParticipants: 30,
          bookedCount: 12,
          price: 88,
          status: 'ongoing'
        }
      ]
      total.value = 15
      loading.value = false
    }, 800)
  } catch (error) {
    console.error('获取活动列表失败:', error)
    ElMessage.error('获取活动列表失败')
    loading.value = false
  }
}

const getStatusText = (status) => {
  const statusMap = {
    upcoming: '即将开始',
    ongoing: '报名中',
    completed: '已结束',
    cancelled: '已取消'
  }
  return statusMap[status] || '未知'
}

const formatDate = (date) => {
  return dayjs(date).format('MM-DD HH:mm')
}

const getBookingPercentage = (activity) => {
  return Math.round((activity.bookedCount / activity.maxParticipants) * 100)
}

const getProgressColor = (activity) => {
  const percentage = getBookingPercentage(activity)
  if (percentage >= 90) return '#f56c6c'
  if (percentage >= 70) return '#e6a23c'
  return '#409eff'
}

const getBookingButtonText = (activity) => {
  if (activity.status !== 'ongoing') {
    return getStatusText(activity.status)
  }
  if (activity.bookedCount >= activity.maxParticipants) {
    return '已满员'
  }
  return '立即预约'
}

const handleBooking = (activity) => {
  if (!user.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  if (activity.status !== 'ongoing') {
    ElMessage.info('活动已结束或未开始')
    return
  }

  if (activity.bookedCount >= activity.maxParticipants) {
    ElMessage.warning('活动已满员')
    return
  }

  // 跳转到活动详情页进行预约
  router.push(`/user/activities/${activity.id}`)
}

onMounted(() => {
  fetchActivities()
})
</script>

<style scoped>
.activity-tab {
  padding: 20px;
}

.tab-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.activity-grid {
  min-height: 400px;
}

.activity-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.activity-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 6px;
  margin-bottom: 16px;
}

.activity-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-status {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  color: white;
}

.activity-status.ongoing {
  background-color: #67c23a;
}

.activity-status.upcoming {
  background-color: #409eff;
}

.activity-status.completed {
  background-color: #909399;
}

.activity-status.cancelled {
  background-color: #f56c6c;
}

.activity-content {
  padding: 0 4px;
}

.activity-title {
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  color: #606266;
  font-size: 0.9rem;
}

.info-item .el-icon {
  margin-right: 8px;
  color: #909399;
}

.activity-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #303133;
}

.stat-value.price {
  color: #f56c6c;
}

.activity-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.activity-actions .el-progress {
  flex: 1;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tab-header {
    justify-content: center;
  }

  .header-actions {
    flex-direction: column;
    width: 100%;
  }

  .activity-actions {
    flex-direction: column;
    gap: 8px;
  }

  .activity-actions .el-button {
    width: 100%;
  }
}
</style>