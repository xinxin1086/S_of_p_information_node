<template>
  <div class="my-bookings">
    <div class="page-header">
      <h1>我的预约</h1>
      <p>查看和管理您的活动预约记录</p>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-radio-group v-model="statusFilter" @change="filterBookings">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="confirmed">已确认</el-radio-button>
        <el-radio-button label="attended">已参加</el-radio-button>
        <el-radio-button label="cancelled">已取消</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 预约列表 -->
    <div class="bookings-container">
      <div v-if="loading" class="loading">
        <el-loading :active="loading" />
      </div>

      <div v-else-if="filteredBookings.length === 0" class="empty-state">
        <el-empty description="暂无预约记录" />
      </div>

      <div v-else class="bookings-list">
        <el-card
          v-for="booking in filteredBookings"
          :key="booking.id"
          class="booking-card"
          shadow="hover"
        >
          <div class="booking-content">
            <div class="booking-header">
              <div class="activity-info">
                <h3>{{ booking.activity.title }}</h3>
                <el-tag :type="getStatusTagType(booking.status)" size="small">
                  {{ getStatusText(booking.status) }}
                </el-tag>
              </div>
              <div class="booking-actions">
                <el-button
                  v-if="booking.status === 'confirmed'"
                  type="warning"
                  size="small"
                  @click="cancelBooking(booking)"
                  :loading="cancellingBooking === booking.id"
                >
                  取消预约
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  @click="viewActivity(booking.activity.id)"
                >
                  查看详情
                </el-button>
              </div>
            </div>

            <div class="booking-details">
              <div class="detail-item">
                <el-icon><Location /></el-icon>
                <span>{{ booking.activity.location }}</span>
              </div>
              <div class="detail-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDateTime(booking.activity.start_time) }}</span>
              </div>
              <div class="detail-item">
                <el-icon><Clock /></el-icon>
                <span>预约时间：{{ formatDateTime(booking.booking_time) }}</span>
              </div>
              <div class="detail-item" v-if="booking.cancel_time">
                <el-icon><Close /></el-icon>
                <span>取消时间：{{ formatDateTime(booking.cancel_time) }}</span>
              </div>
              <div class="detail-item" v-if="booking.cancel_reason">
                <el-icon><Warning /></el-icon>
                <span>取消原因：{{ booking.cancel_reason }}</span>
              </div>
            </div>

            <div class="activity-summary" v-if="booking.activity.description">
              <p>{{ booking.activity.description }}</p>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Location, Calendar, Clock, Close, Warning } from '@element-plus/icons-vue'
import { useActivityStore } from '@/store/modules/activity'

const router = useRouter()
const activityStore = useActivityStore()

const loading = ref(false)
const bookings = ref([])
const statusFilter = ref('all')
const cancellingBooking = ref(null)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 筛选后的预约列表
const filteredBookings = computed(() => {
  if (statusFilter.value === 'all') {
    return bookings.value
  }
  return bookings.value.filter(booking => booking.status === statusFilter.value)
})

// 获取预约列表
const fetchBookings = async () => {
  loading.value = true
  try {
    const result = await activityStore.fetchMyBookings({
      page: currentPage.value,
      size: pageSize.value
    })

    if (result.success) {
      const items = result.data?.items || result.data || []
      bookings.value = items.map(booking => ({
        id: booking.id,
        status: booking.status,
        booking_time: booking.booking_time || booking.created_at,
        cancel_time: booking.cancel_time,
        cancel_reason: booking.cancel_reason,
        activity: {
          id: booking.activity?.id || booking.activity_id,
          title: booking.activity?.title || '活动名称',
          description: booking.activity?.description,
          location: booking.activity?.location,
          start_time: booking.activity?.start_time,
          end_time: booking.activity?.end_time
        }
      }))
      total.value = result.data?.total || items.length
    } else {
      ElMessage.error(result.error || '获取预约记录失败')
      bookings.value = []
    }
  } catch (error) {
    console.error('获取预约记录失败:', error)
    ElMessage.error('获取预约记录失败')
    bookings.value = []
  } finally {
    loading.value = false
  }
}

// 筛选预约
const filterBookings = () => {
  currentPage.value = 1
  fetchBookings()
}

// 取消预约
const cancelBooking = async (booking) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消预约"${booking.activity.title}"吗？`,
      '取消预约',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '暂不取消',
        type: 'warning'
      }
    )

    cancellingBooking.value = booking.id
    const result = await activityStore.cancelBooking(booking.activity.id)

    if (result.success) {
      ElMessage.success('预约取消成功')
      // 更新本地状态
      const index = bookings.value.findIndex(b => b.id === booking.id)
      if (index !== -1) {
        bookings.value[index].status = 'cancelled'
        bookings.value[index].cancel_time = new Date().toISOString()
      }
    } else {
      ElMessage.error(result.error || '取消预约失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消预约失败:', error)
      ElMessage.error('取消预约失败')
    }
  } finally {
    cancellingBooking.value = null
  }
}

// 查看活动详情
const viewActivity = (activityId) => {
  router.push(`/activities/${activityId}`)
}

// 状态相关方法
const getStatusText = (status) => {
  const statusMap = {
    confirmed: '已确认',
    attended: '已参加',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const getStatusTagType = (status) => {
  const typeMap = {
    confirmed: 'success',
    attended: 'info',
    cancelled: 'danger'
  }
  return typeMap[status] || ''
}

// 分页处理
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  fetchBookings()
}

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  fetchBookings()
}

// 格式化时间
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
  fetchBookings()
})
</script>

<style scoped>
.my-bookings {
  max-width: 1200px;
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

.filter-section {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.bookings-container {
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

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.booking-card {
  transition: transform 0.2s;
}

.booking-card:hover {
  transform: translateY(-2px);
}

.booking-content {
  padding: 10px 0;
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.activity-info {
  flex: 1;
}

.activity-info h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #303133;
  line-height: 1.4;
}

.booking-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.booking-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

.detail-item .el-icon {
  font-size: 14px;
  color: #909399;
}

.activity-summary {
  padding-top: 15px;
  border-top: 1px solid #e4e7ed;
}

.activity-summary p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
  font-size: 14px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

@media (max-width: 768px) {
  .my-bookings {
    padding: 15px;
  }

  .booking-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .booking-actions {
    justify-content: flex-start;
  }

  .activity-info h3 {
    font-size: 16px;
  }

  .detail-item {
    font-size: 13px;
  }

  .pagination-container {
    margin-top: 20px;
  }
}
</style>
