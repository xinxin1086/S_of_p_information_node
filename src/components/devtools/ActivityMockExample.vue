<template>
  <div class="activity-example">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>📚 活动模块使用示例</span>
          <el-tag :type="apiType === 'mock' ? 'warning' : 'success'" size="small">
            {{ apiType === 'mock' ? 'Mock API' : '真实 API' }}
          </el-tag>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="搜索">
          <el-input
            v-model="searchForm.search"
            placeholder="输入关键词"
            clearable
            @clear="loadActivities"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="选择状态"
            clearable
            @change="loadActivities"
          >
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadActivities">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 活动列表 -->
      <el-table :data="activities" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="location" label="地点" width="150" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="max_participants" label="人数限制" width="100">
          <template #default="{ row }">
            {{ row.current_participants }}/{{ row.max_participants }}
          </template>
        </el-table-column>
        <el-table-column label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.start_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">查看</el-button>
            <el-button size="small" type="primary" @click="bookActivity(row)">
              预约
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadActivities"
          @current-change="loadActivities"
        />
      </div>
    </el-card>

    <!-- 活动详情对话框 -->
    <el-dialog v-model="detailVisible" title="活动详情" width="60%">
      <div v-if="currentActivity">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="活动ID">
            {{ currentActivity.id }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentActivity.status)" size="small">
              {{ getStatusLabel(currentActivity.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="标题" :span="2">
            {{ currentActivity.title }}
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ currentActivity.description }}
          </el-descriptions-item>
          <el-descriptions-item label="地点">
            {{ currentActivity.location }}
          </el-descriptions-item>
          <el-descriptions-item label="人数限制">
            {{ currentActivity.current_participants }}/{{ currentActivity.max_participants }}
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">
            {{ formatDate(currentActivity.start_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="结束时间">
            {{ formatDate(currentActivity.end_time) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { activityAdapter } from '@/services/activityAdapter'
import { getCurrentApiType } from '@/services/activityAdapter'
import type { ActivityInterface } from '@/types/activity'

const loading = ref(false)
const activities = ref<ActivityInterface[]>([])
const detailVisible = ref(false)
const currentActivity = ref<ActivityInterface | null>(null)
const apiType = ref<'mock' | 'real'>('mock')

const searchForm = ref({
  search: '',
  status: ''
})

const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

onMounted(() => {
  apiType.value = getCurrentApiType()
  loadActivities()
})

async function loadActivities() {
  loading.value = true
  try {
    const response = await activityAdapter.getPublicActivities({
      page: pagination.value.page,
      size: pagination.value.size,
      search: searchForm.value.search || undefined,
      status: searchForm.value.status as any
    })

    if (response.success) {
      activities.value = response.data.items
      pagination.value.total = response.data.total
    } else {
      ElMessage.error(response.message || '加载失败')
    }
  } catch (error) {
    console.error('加载活动失败:', error)
    ElMessage.error('加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  searchForm.value = {
    search: '',
    status: ''
  }
  pagination.value.page = 1
  loadActivities()
}

function viewDetail(activity: ActivityInterface) {
  currentActivity.value = activity
  detailVisible.value = true
}

async function bookActivity(activity: ActivityInterface) {
  try {
    const response = await activityAdapter.bookActivity(activity.id, {
      user_id: 101 // 示例用户 ID
    })

    if (response.success) {
      ElMessage.success('预约成功')
      loadActivities()
    } else {
      ElMessage.error(response.message || '预约失败')
    }
  } catch (error) {
    console.error('预约失败:', error)
    ElMessage.error('预约失败，请稍后重试')
  }
}

function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

function getStatusType(status: string): any {
  const typeMap: Record<string, any> = {
    draft: 'info',
    published: 'success',
    ongoing: 'primary',
    completed: '',
    cancelled: 'danger'
  }
  return typeMap[status] || ''
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped>
.activity-example {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
