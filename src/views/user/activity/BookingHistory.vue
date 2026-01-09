<template>
  <div class="booking-history">
    <div class="page-header">
      <h1>预约历史</h1>
      <p>查看您所有的活动预约记录，包括当前和历史的预约</p>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else class="history-content">
      <!-- 筛选和搜索 -->
      <el-card class="filter-card" shadow="hover">
        <el-row :gutter="20" align="middle">
          <el-col :span="10">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索活动名称"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="8">
            <el-select
              v-model="activeStatus"
              placeholder="预约状态"
              style="width: 100%"
              @change="handleStatusFilter"
            >
              <el-option label="全部" value="" />
              <el-option label="已确认" value="confirmed" />
              <el-option label="已参加" value="attended" />
              <el-option label="已取消" value="cancelled" />
              <el-option label="已过期" value="expired" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 100%"
              @change="handleDateFilter"
            />
          </el-col>
        </el-row>
      </el-card>

      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">总预约数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card confirmed">
            <div class="stat-content">
              <div class="stat-number">{{ stats.confirmed }}</div>
              <div class="stat-label">已确认</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card attended">
            <div class="stat-content">
              <div class="stat-number">{{ stats.attended }}</div>
              <div class="stat-label">已参加</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card cancelled">
            <div class="stat-content">
              <div class="stat-number">{{ stats.cancelled }}</div>
              <div class="stat-label">已取消</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 预约历史列表 -->
      <el-card class="history-list-card" shadow="hover">
        <div v-if="filteredBookings.length === 0" class="empty-state">
          <el-empty description="暂无预约历史记录" />
        </div>

        <div v-else class="history-list">
          <!-- 时间线形式展示 -->
          <el-timeline class="booking-timeline">
            <el-timeline-item
              v-for="booking in paginatedBookings"
              :key="booking.id"
              :timestamp="formatDateTime(booking.booking_time)"
              placement="top"
              :type="getTimelineType(booking.status)"
              :icon="getTimelineIcon(booking.status)"
            >
              <el-card class="timeline-card">
                <div class="card-header">
                  <div class="activity-title">
                    <h3>{{ booking.activity?.title || '未知活动' }}</h3>
                    <el-tag :type="getStatusTagType(booking.status)" size="small">
                      {{ getStatusText(booking.status) }}
                    </el-tag>
                  </div>
                  <div class="card-actions">
                    <el-button
                      type="primary"
                      link
                      size="small"
                      @click="viewActivity(booking.activity?.id)"
                    >
                      <el-icon><View /></el-icon>
                      查看活动
                    </el-button>
                    <el-button
                      v-if="booking.status === 'confirmed' && canCancel(booking.activity?.start_time)"
                      type="warning"
                      link
                      size="small"
                      @click="cancelBooking(booking)"
                      :loading="cancellingId === booking.id"
                    >
                      <el-icon><Close /></el-icon>
                      取消预约
                    </el-button>
                  </div>
                </div>

                <el-descriptions :column="2" border class="booking-info">
                  <el-descriptions-item label="活动时间">
                    <el-icon style="margin-right: 4px;"><Calendar /></el-icon>
                    {{ formatDateTime(booking.activity?.start_time) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="活动地点">
                    <el-icon style="margin-right: 4px;"><Location /></el-icon>
                    {{ booking.activity?.location || '-' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="预约时间">
                    <el-icon style="margin-right: 4px;"><Clock /></el-icon>
                    {{ formatDateTime(booking.booking_time) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="活动类型">
                    <el-tag type="info" size="small">
                      {{ getTypeText(booking.activity?.type) }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item
                    v-if="booking.cancel_time"
                    label="取消时间"
                    :span="2"
                  >
                    <el-icon style="margin-right: 4px;"><Close /></el-icon>
                    {{ formatDateTime(booking.cancel_time) }}
                  </el-descriptions-item>
                  <el-descriptions-item
                    v-if="booking.cancel_reason"
                    label="取消原因"
                    :span="2"
                  >
                    <el-alert
                      :title="booking.cancel_reason"
                      type="warning"
                      :closable="false"
                      show-icon
                    />
                  </el-descriptions-item>
                  <el-descriptions-item
                    v-if="booking.activity?.description"
                    label="活动简介"
                    :span="2"
                  >
                    <div class="activity-description">
                      {{ booking.activity.description }}
                    </div>
                  </el-descriptions-item>
                </el-descriptions>

                <!-- 活动封面（如果有） -->
                <div
                  v-if="booking.activity?.cover_image"
                  class="activity-cover"
                >
                  <el-image
                    :src="booking.activity.cover_image"
                    fit="cover"
                    style="width: 200px; height: 120px; border-radius: 4px;"
                    :preview-src-list="[booking.activity.cover_image]"
                  />
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>

        <!-- 分页 -->
        <div v-if="filteredBookings.length > pageSize" class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="filteredBookings.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import {
  Search,
  Calendar,
  Location,
  Clock,
  Close,
  View
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useActivityStore } from '@/stores/activity'

const router = useRouter()
const activityStore = useActivityStore()

const loading = ref(true)
const bookings = ref([])
const searchKeyword = ref('')
const activeStatus = ref('')
const dateRange = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const cancellingId = ref(null)

// 统计数据
const stats = reactive({
  total: 0,
  confirmed: 0,
  attended: 0,
  cancelled: 0
})

// 加载预约历史
const loadBookingHistory = async () => {
  try {
    loading.value = true

    const result = await activityStore.fetchMyBookings({
      page: 1,
      size: 1000
    })

    if (result.success) {
      bookings.value = result.data || []
      updateStats()
    } else {
      ElMessage.error('加载预约历史失败')
    }
  } catch (error) {
    console.error('加载预约历史失败:', error)
    ElMessage.error('加载预约历史失败')
  } finally {
    loading.value = false
  }
}

// 更新统计数据
const updateStats = () => {
  const all = bookings.value
  stats.total = all.length
  stats.confirmed = all.filter(b => b.status === 'confirmed').length
  stats.attended = all.filter(b => b.status === 'attended').length
  stats.cancelled = all.filter(b => b.status === 'cancelled' || b.status === 'expired').length
}

// 筛选后的预约列表
const filteredBookings = computed(() => {
  let filtered = bookings.value

  // 状态筛选
  if (activeStatus.value) {
    filtered = filtered.filter(b => b.status === activeStatus.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(b =>
      b.activity?.title?.toLowerCase().includes(keyword) ||
      b.activity?.location?.toLowerCase().includes(keyword)
    )
  }

  // 日期范围筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    filtered = filtered.filter(b => {
      const bookingDate = new Date(b.booking_time)
      return bookingDate >= startDate && bookingDate <= endDate
    })
  }

  // 按预约时间倒序排序
  filtered.sort((a, b) => new Date(b.booking_time) - new Date(a.booking_time))

  return filtered
})

// 分页后的预约列表
const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredBookings.value.slice(start, end)
})

// 搜索和筛选
const handleSearch = () => {
  currentPage.value = 1
}

const handleStatusFilter = () => {
  currentPage.value = 1
}

const handleDateFilter = () => {
  currentPage.value = 1
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 查看活动详情
const viewActivity = (activityId) => {
  if (activityId) {
    router.push(`/user/activities/${activityId}`)
  }
}

// 取消预约
const cancelBooking = async (booking) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消预约"${booking.activity?.title}"吗？`,
      '取消预约',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    cancellingId.value = booking.id

    const result = await activityStore.cancelBooking(booking.activity?.id)

    if (result.success) {
      ElMessage.success('预约已取消')
      // 更新本地状态
      booking.status = 'cancelled'
      booking.cancel_time = new Date().toISOString()
      updateStats()
    } else {
      ElMessage.error(result.error || '取消失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消预约失败:', error)
      ElMessage.error('取消失败')
    }
  } finally {
    cancellingId.value = null
  }
}

// 判断是否可以取消
const canCancel = (startTime) => {
  if (!startTime) return false
  const now = new Date()
  const start = new Date(startTime)
  // 活动开始前1小时可以取消
  return (start - now) > 60 * 60 * 1000
}

// 获取时间线类型
const getTimelineType = (status) => {
  const typeMap = {
    confirmed: 'success',
    attended: 'primary',
    cancelled: 'danger',
    expired: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取时间线图标
const getTimelineIcon = (status) => {
  return null
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    confirmed: 'success',
    attended: 'primary',
    cancelled: 'danger',
    expired: 'info',
    pending: 'warning'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    confirmed: '已确认',
    attended: '已参加',
    cancelled: '已取消',
    expired: '已过期',
    pending: '待确认'
  }
  return textMap[status] || status
}

// 获取活动类型文本
const getTypeText = (type) => {
  const typeMap = {
    science_lecture: '科普讲座',
    fishing_competition: '钓鱼比赛',
    ecology_tour: '生态游览',
    workshop: '技能培训',
    exhibition: '展览活动',
    other: '其他活动'
  }
  return typeMap[type] || '未知类型'
}

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadBookingHistory()
})
</script>

<style scoped>
.booking-history {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  color: #303133;
  margin-bottom: 8px;
  font-size: 28px;
}

.page-header p {
  color: #606266;
  font-size: 14px;
  margin: 0;
}

.loading-container {
  padding: 40px;
}

.filter-card {
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.confirmed {
  border-left: 4px solid #67c23a;
}

.stat-card.attended {
  border-left: 4px solid #409eff;
}

.stat-card.cancelled {
  border-left: 4px solid #f56c6c;
}

.stat-content {
  text-align: center;
  padding: 10px 0;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.history-list-card {
  border-radius: 8px;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

.history-list {
  padding: 20px 0;
}

.booking-timeline {
  padding-left: 20px;
}

.timeline-card {
  border-radius: 8px;
}

.timeline-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.activity-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.activity-title h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.booking-info {
  margin-bottom: 15px;
}

.activity-description {
  line-height: 1.6;
  color: #606266;
  margin-top: 8px;
}

.activity-cover {
  margin-top: 15px;
  text-align: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .booking-history {
    padding: 15px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .card-actions {
    width: 100%;
    flex-direction: column;
  }

  .card-actions .el-button {
    width: 100%;
  }
}
</style>