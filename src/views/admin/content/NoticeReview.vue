<template>
  <div class="notice-review">
    <div class="page-header">
      <h1>公告审核</h1>
      <p>审核管理员提交的公告，确保内容合规</p>
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
              placeholder="搜索公告标题"
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
              placeholder="公告类型"
              style="width: 100%"
              @change="handleTypeFilter"
            >
              <el-option label="全部类型" value="" />
              <el-option label="系统通知" value="系统通知" />
              <el-option label="活动公告" value="活动公告" />
              <el-option label="其他公告" value="其他公告" />
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

      <!-- 公告列表 -->
      <el-card class="notices-card" shadow="hover">
        <div v-if="filteredNotices.length === 0" class="empty-state">
          <el-empty description="暂无待审核公告" />
        </div>

        <div v-else class="notices-list">
          <div
            v-for="notice in paginatedNotices"
            :key="notice.id"
            class="notice-item"
          >
            <div class="notice-header">
              <div class="notice-title-section">
                <h3 class="notice-title">{{ notice.release_title || notice.title }}</h3>
                <el-tag :type="getStatusType(notice.status)" size="small">
                  {{ getStatusText(notice.status) }}
                </el-tag>
                <el-tag v-if="notice.notice_type" type="info" size="small" style="margin-left: 8px">
                  {{ notice.notice_type }}
                </el-tag>
              </div>
              <div class="notice-time">
                <el-icon><Calendar /></el-icon>
                {{ formatDateTime(notice.created_at || notice.release_time) }} 提交
              </div>
            </div>

            <div class="notice-info">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="发布时间">
                  {{ formatDateTime(notice.release_time) }}
                </el-descriptions-item>
                <el-descriptions-item label="过期时间">
                  {{ formatDateTime(notice.expiration) }}
                </el-descriptions-item>
                <el-descriptions-item label="创建者">
                  {{ notice.creator_display || notice.creator_account || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="最后更新">
                  {{ formatDateTime(notice.update_time) }}
                </el-descriptions-item>
                <el-descriptions-item label="公告内容" :span="2">
                  <div class="content-preview">
                    {{ truncateText(notice.release_notice || notice.content, 100) }}
                  </div>
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <div class="notice-actions">
              <el-button
                type="primary"
                @click="viewDetail(notice)"
              >
                <el-icon><View /></el-icon>
                查看详情
              </el-button>
              <el-button
                v-if="notice.status === 'pending'"
                type="success"
                @click="handleApprove(notice)"
                :loading="notice.processing"
              >
                <el-icon><Select /></el-icon>
                通过审核
              </el-button>
              <el-button
                v-if="notice.status === 'pending'"
                type="danger"
                @click="handleReject(notice)"
                :loading="notice.processing"
              >
                <el-icon><Close /></el-icon>
                拒绝
              </el-button>
              <el-button
                v-if="notice.status !== 'pending'"
                type="info"
                @click="handleRevert(notice)"
                :loading="notice.processing"
              >
                <el-icon><RefreshLeft /></el-icon>
                重新审核
              </el-button>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="filteredNotices.length > pageSize" class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="filteredNotices.length"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 公告详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="公告详情"
      width="80%"
      destroy-on-close
    >
      <div v-if="currentNotice" class="notice-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="公告标题" :span="2">
            {{ currentNotice.release_title || currentNotice.title }}
          </el-descriptions-item>
          <el-descriptions-item label="公告类型">
            {{ currentNotice.notice_type }}
          </el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag :type="getStatusType(currentNotice.status)">
              {{ getStatusText(currentNotice.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="发布时间">
            {{ formatDateTime(currentNotice.release_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="过期时间">
            {{ formatDateTime(currentNotice.expiration) }}
          </el-descriptions-item>
          <el-descriptions-item label="创建者">
            {{ currentNotice.creator_display || currentNotice.creator_account || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ formatDateTime(currentNotice.created_at || currentNotice.release_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="最后更新">
            {{ formatDateTime(currentNotice.update_time) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentNotice.reject_reason" label="拒绝原因" :span="2">
            <div class="reject-reason">{{ currentNotice.reject_reason }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="公告内容" :span="2">
            <div class="content-text">{{ currentNotice.release_notice || currentNotice.content || '无内容' }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          v-if="currentNotice?.status === 'pending'"
          type="success"
          @click="handleApprove(currentNotice)"
          :loading="currentNotice?.processing"
        >
          通过审核
        </el-button>
        <el-button
          v-if="currentNotice?.status === 'pending'"
          type="danger"
          @click="handleReject(currentNotice)"
          :loading="currentNotice?.processing"
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
        placeholder="请输入拒绝原因（将反馈给创建者）"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Calendar,
  View,
  Select,
  Close,
  RefreshLeft
} from '@element-plus/icons-vue'
import { useNoticeStore } from '@/stores/notice'

const noticeStore = useNoticeStore()

const loading = ref(true)
const notices = ref([])
const searchKeyword = ref('')
const activeStatus = ref('pending') // 默认显示待审核
const activeType = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const detailDialogVisible = ref(false)
const currentNotice = ref(null)
const rejectDialogVisible = ref(false)
const rejectReason = ref('')
const rejecting = ref(false)

// 统计数据
const stats = reactive({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0
})

// 加载公告列表
const loadNotices = async () => {
  try {
    loading.value = true

    // 获取所有公告，然后在前端筛选
    const result = await noticeStore.fetchAdminNoticesList({
      page: 1,
      size: 1000
    })

    if (result.success) {
      // 为公告添加模拟的审核状态（实际项目中应由后端返回）
      notices.value = (result.data?.items || []).map(n => ({
        ...n,
        status: n.status || 'pending', // 默认为待审核
        processing: false,
        created_at: n.created_at || n.release_time // 使用release_time作为创建时间
      }))
      updateStats()
    } else {
      ElMessage.error('加载公告列表失败')
    }
  } catch (error) {
    console.error('加载公告列表失败:', error)
    ElMessage.error('加载公告列表失败')
  } finally {
    loading.value = false
  }
}

// 更新统计数据
const updateStats = () => {
  const all = notices.value
  stats.total = all.length
  stats.pending = all.filter(n => n.status === 'pending').length
  stats.approved = all.filter(n => n.status === 'published').length
  stats.rejected = all.filter(n => n.status === 'rejected').length
}

// 筛选后的公告列表
const filteredNotices = computed(() => {
  let filtered = notices.value

  // 状态筛选
  if (activeStatus.value) {
    filtered = filtered.filter(n => n.status === activeStatus.value)
  }

  // 类型筛选
  if (activeType.value) {
    filtered = filtered.filter(n => n.notice_type === activeType.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(n =>
      (n.release_title || n.title)?.toLowerCase().includes(keyword) ||
      (n.release_notice || n.content)?.toLowerCase().includes(keyword)
    )
  }

  return filtered
})

// 分页后的公告列表
const paginatedNotices = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredNotices.value.slice(start, end)
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
const viewDetail = (notice) => {
  currentNotice.value = notice
  detailDialogVisible.value = true
}

// 通过审核
const handleApprove = async (notice) => {
  try {
    await ElMessageBox.confirm(
      `确定通过公告"${notice.release_title || notice.title}"的审核吗？通过后公告将公开发布。`,
      '通过审核',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    )

    notice.processing = true

    // 更新公告状态为已发布
    const result = await noticeStore.updateNotice(notice.id, {
      status: 'published'
    })

    if (result.success) {
      ElMessage.success('审核通过')
      // 更新本地状态
      notice.status = 'published'
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
    notice.processing = false
  }
}

// 拒绝
const handleReject = (notice) => {
  currentNotice.value = notice
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
    const notice = currentNotice.value

    const result = await noticeStore.updateNotice(notice.id, {
      status: 'rejected',
      reject_reason: rejectReason.value
    })

    if (result.success) {
      ElMessage.success('已拒绝该公告')
      notice.status = 'rejected'
      notice.reject_reason = rejectReason.value
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
const handleRevert = async (notice) => {
  try {
    await ElMessageBox.confirm(
      `确定要将公告"${notice.release_title || notice.title}"重新设为待审核状态吗？`,
      '重新审核',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    notice.processing = true

    const result = await noticeStore.updateNotice(notice.id, {
      status: 'pending'
    })

    if (result.success) {
      ElMessage.success('已重新设为待审核')
      notice.status = 'pending'
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
    notice.processing = false
  }
}

// 工具方法
const getStatusType = (status) => {
  const typeMap = {
    draft: 'info',
    pending: 'warning',
    published: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    draft: '草稿',
    pending: '待审核',
    published: '已通过',
    rejected: '已拒绝'
  }
  return textMap[status] || status
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

const truncateText = (text, maxLength) => {
  if (!text) return '无内容'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

onMounted(() => {
  loadNotices()
})
</script>

<style scoped>
.notice-review {
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

.notices-card {
  border-radius: 8px;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

.notices-list {
  padding: 10px 0;
}

.notice-item {
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
}

.notice-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.notice-title-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notice-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.notice-time {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 14px;
}

.notice-info {
  margin-bottom: 15px;
}

.content-preview {
  color: #606266;
  line-height: 1.6;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notice-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.notice-detail {
  padding: 10px 0;
}

.content-text {
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.reject-reason {
  color: #f56c6c;
  line-height: 1.6;
  padding: 10px;
  background-color: #fef0f0;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .notice-review {
    padding: 15px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .notice-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .notice-actions {
    flex-direction: column;
  }

  .notice-actions .el-button {
    width: 100%;
  }
}
</style>
