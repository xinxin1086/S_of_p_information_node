<template>
  <div class="activity-review">
    <div class="page-header">
      <h1>活动审核</h1>
      <p>审核组织用户提交的活动，确保内容合规</p>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else class="review-content">
      <!-- 筛选操作栏 -->
      <el-card class="filter-card" shadow="hover">
        <el-row :gutter="20" align="middle">
          <el-col :span="8">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索活动标题"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="activeStatus"
              placeholder="审核状态"
              style="width: 100%"
              @change="handleStatusFilter"
            >
              <el-option label="全部" value="" />
              <el-option label="待审核" value="pending" />
              <el-option label="已通过" value="published" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
              v-model="activeType"
              placeholder="活动类型"
              style="width: 100%"
              @change="handleTypeFilter"
            >
              <el-option label="全部类型" value="" />
              <el-option label="科普讲座" value="science_lecture" />
              <el-option label="钓鱼比赛" value="fishing_competition" />
              <el-option label="生态游览" value="ecology_tour" />
              <el-option label="技能培训" value="workshop" />
              <el-option label="展览活动" value="exhibition" />
              <el-option label="其他活动" value="other" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="handleSearch" style="width: 100%">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </el-col>
        </el-row>
      </el-card>

      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">总计</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card pending">
            <div class="stat-content">
              <div class="stat-number">{{ stats.pending }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card approved">
            <div class="stat-content">
              <div class="stat-number">{{ stats.approved }}</div>
              <div class="stat-label">已通过</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card rejected">
            <div class="stat-content">
              <div class="stat-number">{{ stats.rejected }}</div>
              <div class="stat-label">已拒绝</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 活动列表 -->
      <el-card class="activities-card" shadow="hover">
        <div v-if="filteredActivities.length === 0" class="empty-state">
          <el-empty description="暂无待审核活动" />
        </div>

        <div v-else class="activities-list">
          <div
            v-for="activity in paginatedActivities"
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-header">
              <div class="activity-title-section">
                <h3 class="activity-title">{{ activity.title }}</h3>
                <el-tag :type="getStatusType(activity.status)" size="small">
                  {{ getStatusText(activity.status) }}
                </el-tag>
                <el-tag v-if="activity.type" type="info" size="small" style="margin-left: 8px">
                  {{ getTypeText(activity.type) }}
                </el-tag>
              </div>
              <div class="activity-time">
                <el-icon><Calendar /></el-icon>
                {{ formatDateTime(activity.created_at) }} 提交
              </div>
            </div>

            <div class="activity-info">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="活动时间">
                  {{ formatDateTime(activity.start_time) }} 至 {{ formatDateTime(activity.end_time) }}
                </el-descriptions-item>
                <el-descriptions-item label="活动地点">
                  {{ activity.location || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="人数限制">
                  {{ activity.current_participants || 0 }} / {{ activity.max_participants || '不限' }}
                </el-descriptions-item>
                <el-descriptions-item label="组织者">
                  {{ activity.organizer_display || activity.organizer_account || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="活动简介" :span="2">
                  {{ activity.description || '无简介' }}
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <div class="activity-actions">
              <el-button
                type="primary"
                @click="viewDetail(activity)"
              >
                <el-icon><View /></el-icon>
                查看详情
              </el-button>
              <el-button
                v-if="activity.status === 'pending'"
                type="success"
                @click="handleApprove(activity)"
                :loading="activity.processing"
              >
                <el-icon><Select /></el-icon>
                通过审核
              </el-button>
              <el-button
                v-if="activity.status === 'pending'"
                type="danger"
                @click="handleReject(activity)"
                :loading="activity.processing"
              >
                <el-icon><Close /></el-icon>
                拒绝
              </el-button>
              <el-button
                v-if="activity.status !== 'pending'"
                type="info"
                @click="handleRevert(activity)"
                :loading="activity.processing"
              >
                <el-icon><RefreshLeft /></el-icon>
                重新审核
              </el-button>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="filteredActivities.length > pageSize" class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="filteredActivities.length"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 活动详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="活动详情"
      width="80%"
      destroy-on-close
    >
      <div v-if="currentActivity" class="activity-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="活动标题" :span="2">
            {{ currentActivity.title }}
          </el-descriptions-item>
          <el-descriptions-item label="活动类型">
            {{ getTypeText(currentActivity.type) }}
          </el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag :type="getStatusType(currentActivity.status)">
              {{ getStatusText(currentActivity.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">
            {{ formatDateTime(currentActivity.start_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="结束时间">
            {{ formatDateTime(currentActivity.end_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="活动地点" :span="2">
            {{ currentActivity.location || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="人数限制">
            {{ currentActivity.max_participants || '不限' }}
          </el-descriptions-item>
          <el-descriptions-item label="当前报名">
            {{ currentActivity.current_participants || 0 }} 人
          </el-descriptions-item>
          <el-descriptions-item label="组织者">
            {{ currentActivity.organizer_display || currentActivity.organizer_account || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ formatDateTime(currentActivity.created_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="活动简介" :span="2">
            <div class="content-text">{{ currentActivity.description || '无' }}</div>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentActivity.content" label="详细内容" :span="2">
            <!-- eslint-disable-next-line vue/no-v-html -- Content sanitized with DOMPurify -->
<div class="content-text" v-html="sanitizedActivityContent"></div>
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentActivity.cover_image" class="cover-image">
          <h4>活动封面</h4>
          <el-image
            :src="currentActivity.cover_image"
            fit="cover"
            style="width: 300px; height: 200px"
            :preview-src-list="[currentActivity.cover_image]"
          />
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          v-if="currentActivity?.status === 'pending'"
          type="success"
          @click="handleApprove(currentActivity)"
          :loading="currentActivity?.processing"
        >
          通过审核
        </el-button>
        <el-button
          v-if="currentActivity?.status === 'pending'"
          type="danger"
          @click="handleReject(currentActivity)"
          :loading="currentActivity?.processing"
        >
          拒绝
        </el-button>
      </template>
    </el-dialog>

    <!-- 拒绝原因对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝原因"
      width="500px"
    >
      <el-input
        v-model="rejectReason"
        type="textarea"
        :rows="4"
        placeholder="请输入拒绝原因（将反馈给组织者）"
        maxlength="500"
        show-word-limit
      />
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject" :loading="rejecting">
          确认拒绝
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  Search,
  Calendar,
  View,
  Select,
  Close,
  RefreshLeft
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, reactive, computed, onMounted } from 'vue'

import { useActivityStore } from '@/stores/activity'
import { sanitizeRichText } from '@/utils/sanitizeHtml'

const activityStore = useActivityStore()

const loading = ref(true)
const activities = ref([])
const searchKeyword = ref('')
const activeStatus = ref('pending') // 默认显示待审核
const activeType = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const detailDialogVisible = ref(false)
const currentActivity = ref(null)
const rejectDialogVisible = ref(false)
const rejectReason = ref('')
const rejecting = ref(false)

// 净化后的活动内容
const sanitizedActivityContent = computed(() => {
  return sanitizeRichText(currentActivity.value?.content)
})

// 统计数据
const stats = reactive({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0
})

// 加载待审核活动
const loadActivities = async () => {
  try {
    loading.value = true

    // 获取所有活动，然后在前端筛选待审核的
    const result = await activityStore.fetchActivities({
      page: 1,
      size: 1000
    })

    if (result.success) {
      // 处理不同的数据结构
      let activityList = []
      if (Array.isArray(result.data)) {
        activityList = result.data
      } else if (result.data?.items && Array.isArray(result.data.items)) {
        activityList = result.data.items
      }

      activities.value = activityList.map(a => ({
        ...a,
        processing: false
      }))
      updateStats()
    } else {
      ElMessage.error('加载活动列表失败')
    }
  } catch (error) {
    console.error('加载活动列表失败:', error)
    ElMessage.error('加载活动列表失败')
  } finally {
    loading.value = false
  }
}

// 更新统计数据
const updateStats = () => {
  const all = activities.value
  stats.total = all.length
  stats.pending = all.filter(a => a.status === 'pending').length
  stats.approved = all.filter(a => a.status === 'published').length
  stats.rejected = all.filter(a => a.status === 'rejected' || a.status === 'cancelled').length
}

// 筛选后的活动列表
const filteredActivities = computed(() => {
  let filtered = activities.value

  // 状态筛选
  if (activeStatus.value) {
    filtered = filtered.filter(a => a.status === activeStatus.value)
  }

  // 类型筛选
  if (activeType.value) {
    filtered = filtered.filter(a => a.type === activeType.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(a =>
      a.title?.toLowerCase().includes(keyword) ||
      a.description?.toLowerCase().includes(keyword)
    )
  }

  return filtered
})

// 分页后的活动列表
const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredActivities.value.slice(start, end)
})

// 搜索和筛选
const handleSearch = () => {
  currentPage.value = 1
}

const handleStatusFilter = () => {
  currentPage.value = 1
}

const handleTypeFilter = () => {
  currentPage.value = 1
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 查看详情
const viewDetail = (activity) => {
  currentActivity.value = activity
  detailDialogVisible.value = true
}

// 通过审核
const handleApprove = async (activity) => {
  try {
    await ElMessageBox.confirm(
      `确定通过活动"${activity.title}"的审核吗？通过后活动将公开发布。`,
      '通过审核',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    )

    activity.processing = true

    const result = await activityStore.updateActivity(activity.id, {
      status: 'published'
    })

    if (result.success) {
      ElMessage.success('审核通过')
      // 更新本地状态
      activity.status = 'published'
      updateStats()
    } else {
      ElMessage.error(result.error || '操作失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('审核失败:', error)
      ElMessage.error('操作失败')
    }
  } finally {
    activity.processing = false
  }
}

// 拒绝
const handleReject = (activity) => {
  currentActivity.value = activity
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

// 确认拒绝
const confirmReject = async () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }

  try {
    rejecting.value = true
    const activity = currentActivity.value

    const result = await activityStore.updateActivity(activity.id, {
      status: 'rejected',
      reject_reason: rejectReason.value
    })

    if (result.success) {
      ElMessage.success('已拒绝该活动')
      activity.status = 'rejected'
      updateStats()
      rejectDialogVisible.value = false
      detailDialogVisible.value = false
    } else {
      ElMessage.error(result.error || '操作失败')
    }
  } catch (error) {
    console.error('拒绝失败:', error)
    ElMessage.error('操作失败')
  } finally {
    rejecting.value = false
  }
}

// 重新审核
const handleRevert = async (activity) => {
  try {
    await ElMessageBox.confirm(
      `确定要将活动"${activity.title}"重新设为待审核状态吗？`,
      '重新审核',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    activity.processing = true

    const result = await activityStore.updateActivity(activity.id, {
      status: 'pending'
    })

    if (result.success) {
      ElMessage.success('已重新设为待审核')
      activity.status = 'pending'
      updateStats()
    } else {
      ElMessage.error(result.error || '操作失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  } finally {
    activity.processing = false
  }
}

// 工具方法
const getStatusType = (status) => {
  const typeMap = {
    draft: 'info',
    pending: 'warning',
    published: 'success',
    ongoing: 'primary',
    completed: '',
    cancelled: 'danger',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    draft: '草稿',
    pending: '待审核',
    published: '已通过',
    ongoing: '进行中',
    completed: '已结束',
    cancelled: '已取消',
    rejected: '已拒绝'
  }
  return textMap[status] || status
}

const getTypeText = (type) => {
  const typeMap = {
    science_lecture: '科普讲座',
    fishing_competition: '钓鱼比赛',
    ecology_tour: '生态游览',
    workshop: '技能培训',
    exhibition: '展览活动',
    other: '其他活动'
  }
  return typeMap[type] || type
}

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
  loadActivities()
})
</script>

<style scoped>
.activity-review {
  max-width: 1600px;
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

.stat-card.pending {
  border-left: 4px solid #e6a23c;
}

.stat-card.approved {
  border-left: 4px solid #67c23a;
}

.stat-card.rejected {
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

.activities-card {
  border-radius: 8px;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

.activities-list {
  padding: 10px 0;
}

.activity-item {
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
}

.activity-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.activity-title-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.activity-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.activity-time {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 14px;
}

.activity-info {
  margin-bottom: 15px;
}

.activity-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.activity-detail {
  padding: 10px 0;
}

.content-text {
  line-height: 1.6;
  white-space: pre-wrap;
}

.cover-image {
  margin-top: 20px;
  text-align: center;
}

.cover-image h4 {
  margin-bottom: 10px;
  color: #303133;
}

@media (max-width: 768px) {
  .activity-review {
    padding: 15px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .activity-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .activity-actions {
    flex-direction: column;
  }

  .activity-actions .el-button {
    width: 100%;
  }
}
</style>