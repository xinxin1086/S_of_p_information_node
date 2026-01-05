<template>
  <div class="my-activities">
    <div class="page-header">
      <h1>我的活动</h1>
      <p>管理您创建的所有活动</p>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else class="activities-content">
      <!-- 操作栏 -->
      <el-card class="action-bar-card" shadow="hover">
        <div class="action-bar">
          <div class="action-bar-left">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索活动标题"
              style="width: 300px"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div class="action-bar-right">
            <el-button type="primary" @click="goToCreateActivity">
              <el-icon><Plus /></el-icon>
              创建活动
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 状态筛选标签 -->
      <el-card class="filter-card" shadow="hover">
        <el-radio-group v-model="activeStatus" @change="handleStatusFilter">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="draft">草稿</el-radio-button>
          <el-radio-button label="pending">审核中</el-radio-button>
          <el-radio-button label="published">已发布</el-radio-button>
          <el-radio-button label="ongoing">进行中</el-radio-button>
          <el-radio-button label="completed">已结束</el-radio-button>
          <el-radio-button label="cancelled">已取消</el-radio-button>
        </el-radio-group>
      </el-card>

      <!-- 活动列表 -->
      <el-card class="activities-list-card" shadow="hover">
        <div v-if="filteredActivities.length === 0" class="empty-state">
          <el-empty :description="emptyStateText">
            <el-button v-if="activeStatus === '' && !searchKeyword" type="primary" @click="goToCreateActivity">
              创建第一个活动
            </el-button>
          </el-empty>
        </div>

        <div v-else class="activities-table">
          <el-table :data="paginatedActivities" style="width: 100%" stripe>
            <el-table-column prop="title" label="活动标题" min-width="200">
              <template #default="{ row }">
                <div class="activity-title-cell" @click="viewActivity(row.id)">
                  <span class="activity-title">{{ row.title }}</span>
                  <el-tag v-if="row.is_featured" type="warning" size="small" style="margin-left: 8px">
                    推荐
                  </el-tag>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="活动时间" width="180">
              <template #default="{ row }">
                <div class="activity-time">
                  <div>{{ formatDate(row.start_time) }}</div>
                  <div class="time-sub">至 {{ formatDate(row.end_time) }}</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="参与情况" width="120" align="center">
              <template #default="{ row }">
                <div class="participants-info">
                  <el-icon><User /></el-icon>
                  <span>{{ row.current_participants || 0 }}</span>
                  <span v-if="row.max_participants" class="max-participants">/ {{ row.max_participants }}</span>
                  <span v-else class="unlimited">不限</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="数据统计" width="150" align="center">
              <template #default="{ row }">
                <div class="stats-info">
                  <span class="stat-item">
                    <el-icon><View /></el-icon>
                    {{ row.view_count || 0 }}
                  </span>
                  <span v-if="row.average_rating" class="stat-item">
                    <el-icon><Star /></el-icon>
                    {{ row.average_rating.toFixed(1) }}
                  </span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button type="primary" link size="small" @click="viewActivity(row.id)">
                    查看
                  </el-button>
                  <el-button
                    v-if="canEditActivity(row.status)"
                    type="primary"
                    link
                    size="small"
                    @click="editActivity(row.id)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    v-if="canDeleteActivity(row.status)"
                    type="danger"
                    link
                    size="small"
                    @click="handleDelete(row)"
                  >
                    删除
                  </el-button>
                  <el-button
                    v-if="row.status === 'draft'"
                    type="success"
                    link
                    size="small"
                    @click="handlePublish(row)"
                  >
                    发布
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div v-if="filteredActivities.length > pageSize" class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="filteredActivities.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Plus,
  User,
  View,
  Star
} from '@element-plus/icons-vue'
import { useActivityStore } from '@/stores/activity'

const router = useRouter()
const activityStore = useActivityStore()

const loading = ref(true)
const activities = ref([])
const searchKeyword = ref('')
const activeStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 加载活动数据
const loadActivities = async () => {
  try {
    loading.value = true

    const result = await activityStore.fetchMyActivities({
      page: 1,
      size: 100
    })

    if (result.success) {
      activities.value = result.data || []
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

// 筛选后的活动列表
const filteredActivities = computed(() => {
  let filtered = activities.value

  // 状态筛选
  if (activeStatus.value) {
    filtered = filtered.filter(a => a.status === activeStatus.value)
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

// 空状态文本
const emptyStateText = computed(() => {
  if (searchKeyword.value) {
    return '没有找到匹配的活动'
  }
  if (activeStatus.value) {
    const statusText = getStatusText(activeStatus.value)
    return `暂无${statusText}的活动`
  }
  return '暂无活动'
})

// 导航方法
const goToCreateActivity = () => {
  router.push('/user/weave/create-activity')
}

const viewActivity = (id) => {
  router.push(`/user/activities/${id}`)
}

const editActivity = (id) => {
  router.push(`/user/weave/edit-activity/${id}`)
}

// 搜索和筛选
const handleSearch = () => {
  currentPage.value = 1
}

const handleStatusFilter = () => {
  currentPage.value = 1
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 删除活动
const handleDelete = async (activity) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除活动"${activity.title}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const result = await activityStore.deleteActivity(activity.id)

    if (result.success) {
      ElMessage.success('删除成功')
      // 从列表中移除
      activities.value = activities.value.filter(a => a.id !== activity.id)
    } else {
      ElMessage.error(result.error || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除活动失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 发布活动
const handlePublish = async (activity) => {
  try {
    await ElMessageBox.confirm(
      `确定要发布活动"${activity.title}"吗？发布后将进入审核流程。`,
      '发布确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    const result = await activityStore.updateActivity(activity.id, {
      status: 'pending'
    })

    if (result.success) {
      ElMessage.success('提交审核成功')
      // 更新本地状态
      const index = activities.value.findIndex(a => a.id === activity.id)
      if (index !== -1) {
        activities.value[index].status = 'pending'
      }
    } else {
      ElMessage.error(result.error || '提交审核失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发布活动失败:', error)
      ElMessage.error('提交审核失败')
    }
  }
}

// 判断是否可以编辑
const canEditActivity = (status) => {
  return ['draft', 'pending', 'published'].includes(status)
}

// 判断是否可以删除
const canDeleteActivity = (status) => {
  return ['draft', 'pending', 'cancelled'].includes(status)
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

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

onMounted(() => {
  loadActivities()
})
</script>

<style scoped>
.my-activities {
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

.action-bar-card,
.filter-card,
.activities-list-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.action-bar-left,
.action-bar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-card :deep(.el-card__body) {
  padding: 15px 20px;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

.activities-table {
  padding: 10px 0;
}

.activity-title-cell {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.activity-title {
  color: #303133;
  font-weight: 500;
  transition: color 0.2s;
}

.activity-title-cell:hover .activity-title {
  color: #409eff;
}

.activity-time {
  font-size: 13px;
  color: #606266;
}

.time-sub {
  color: #909399;
  font-size: 12px;
  margin-top: 2px;
}

.participants-info {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
  font-size: 14px;
}

.max-participants {
  color: #909399;
}

.unlimited {
  color: #67c23a;
  font-size: 12px;
}

.stats-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #606266;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .my-activities {
    padding: 15px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .action-bar-left,
  .action-bar-right {
    width: 100%;
  }

  .action-bar-left :deep(.el-input) {
    width: 100% !important;
  }

  .filter-card :deep(.el-radio-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .activities-table :deep(.el-table__body-wrapper) {
    overflow-x: auto;
  }
}
</style>
