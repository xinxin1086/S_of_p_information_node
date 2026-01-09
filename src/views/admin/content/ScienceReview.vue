<template>
  <div class="science-review">
    <div class="page-header">
      <h1>科普审核</h1>
      <p>审核用户提交的科普文章，确保内容合规</p>
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
              placeholder="搜索科普标题"
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
              v-model="activeCategory"
              placeholder="科普分类"
              style="width: 100%"
              @change="handleCategoryFilter"
            >
              <el-option label="全部分类" value="" />
              <el-option label="鱼类知识" value="鱼类知识" />
              <el-option label="生态保护" value="生态保护" />
              <el-option label="环保教育" value="环保教育" />
              <el-option label="其他" value="其他" />
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

      <!-- 科普列表 -->
      <el-card class="sciences-card" shadow="hover">
        <div v-if="filteredSciences.length === 0" class="empty-state">
          <el-empty description="暂无待审核科普" />
        </div>

        <div v-else class="sciences-list">
          <div
            v-for="science in paginatedSciences"
            :key="science.id"
            class="science-item"
          >
            <div class="science-header">
              <div class="science-title-section">
                <h3 class="science-title">{{ science.title }}</h3>
                <el-tag :type="getStatusType(science.status)" size="small">
                  {{ getStatusText(science.status) }}
                </el-tag>
                <el-tag v-if="science.category" type="info" size="small" style="margin-left: 8px">
                  {{ science.category }}
                </el-tag>
              </div>
              <div class="science-time">
                <el-icon><Calendar /></el-icon>
                {{ formatDateTime(science.created_at || science.publish_time) }} 提交
              </div>
            </div>

            <div class="science-info">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="作者">
                  {{ science.author_display || science.author_account || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="发布时间">
                  {{ formatDateTime(science.publish_time) }}
                </el-descriptions-item>
                <el-descriptions-item label="浏览次数">
                  {{ science.view_count || 0 }}
                </el-descriptions-item>
                <el-descriptions-item label="点赞次数">
                  {{ science.like_count || 0 }}
                </el-descriptions-item>
                <el-descriptions-item label="科普摘要" :span="2">
                  <div class="content-preview">
                    {{ truncateText(science.summary || science.content, 100) }}
                  </div>
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <div class="science-actions">
              <el-button
                type="primary"
                @click="viewDetail(science)"
              >
                <el-icon><View /></el-icon>
                查看详情
              </el-button>
              <el-button
                v-if="science.status === 'pending'"
                type="success"
                @click="handleApprove(science)"
                :loading="science.processing"
              >
                <el-icon><Select /></el-icon>
                通过审核
              </el-button>
              <el-button
                v-if="science.status === 'pending'"
                type="danger"
                @click="handleReject(science)"
                :loading="science.processing"
              >
                <el-icon><Close /></el-icon>
                拒绝
              </el-button>
              <el-button
                v-if="science.status !== 'pending'"
                type="info"
                @click="handleRevert(science)"
                :loading="science.processing"
              >
                <el-icon><RefreshLeft /></el-icon>
                重新审核
              </el-button>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="filteredSciences.length > pageSize" class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="filteredSciences.length"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 科普详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="科普详情"
      width="80%"
      destroy-on-close
    >
      <div v-if="currentScience" class="science-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="科普标题" :span="2">
            {{ currentScience.title }}
          </el-descriptions-item>
          <el-descriptions-item label="科普分类">
            {{ currentScience.category || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag :type="getStatusType(currentScience.status)">
              {{ getStatusText(currentScience.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="作者">
            {{ currentScience.author_display || currentScience.author_account || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ formatDateTime(currentScience.created_at || currentScience.publish_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="浏览次数">
            {{ currentScience.view_count || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="点赞次数">
            {{ currentScience.like_count || 0 }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentScience.reject_reason" label="拒绝原因" :span="2">
            <div class="reject-reason">{{ currentScience.reject_reason }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="科普摘要" :span="2">
            <div class="content-text">{{ currentScience.summary || '无摘要' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="科普内容" :span="2">
            <!-- eslint-disable-next-line vue/no-v-html -- Content sanitized with DOMPurify -->
<div class="content-text" v-html="sanitizedScienceContent"></div>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 封面图片 -->
        <div v-if="currentScience.cover_image" class="cover-image">
          <h4>封面图片</h4>
          <el-image
            :src="currentScience.cover_image"
            fit="cover"
            style="width: 300px; height: 200px"
            :preview-src-list="[currentScience.cover_image]"
          />
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          v-if="currentScience?.status === 'pending'"
          type="success"
          @click="handleApprove(currentScience)"
          :loading="currentScience?.processing"
        >
          通过审核
        </el-button>
        <el-button
          v-if="currentScience?.status === 'pending'"
          type="danger"
          @click="handleReject(currentScience)"
          :loading="currentScience?.processing"
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
        placeholder="请输入拒绝原因（将反馈给作者）"
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

import { useScienceStore } from '@/stores/science'
import { sanitizeRichText } from '@/utils/sanitizeHtml'

const scienceStore = useScienceStore()

const loading = ref(true)
const sciences = ref([])
const searchKeyword = ref('')
const activeStatus = ref('pending') // 默认显示待审核
const activeCategory = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const detailDialogVisible = ref(false)
const currentScience = ref(null)
const rejectDialogVisible = ref(false)
const rejectReason = ref('')
const rejecting = ref(false)

// 净化后的科普内容
const sanitizedScienceContent = computed(() => {
  return sanitizeRichText(currentScience.value?.content)
})

// 统计数据
const stats = reactive({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0
})

// 加载科普列表
const loadSciences = async () => {
  try {
    loading.value = true

    // 获取所有科普，然后在前端筛选
    const result = await scienceStore.fetchSciences({
      page: 1,
      size: 1000
    })

    if (result.success) {
      // 为科普添加模拟的审核状态（实际项目中应由后端返回）
      sciences.value = (result.data || []).map(s => ({
        ...s,
        status: s.status || 'pending', // 默认为待审核
        processing: false,
        created_at: s.created_at || s.publish_time // 使用publish_time作为创建时间
      }))
      updateStats()
    } else {
      ElMessage.error('加载科普列表失败')
    }
  } catch (error) {
    console.error('加载科普列表失败:', error)
    ElMessage.error('加载科普列表失败')
  } finally {
    loading.value = false
  }
}

// 更新统计数据
const updateStats = () => {
  const all = sciences.value
  stats.total = all.length
  stats.pending = all.filter(s => s.status === 'pending').length
  stats.approved = all.filter(s => s.status === 'published').length
  stats.rejected = all.filter(s => s.status === 'rejected').length
}

// 筛选后的科普列表
const filteredSciences = computed(() => {
  let filtered = sciences.value

  // 状态筛选
  if (activeStatus.value) {
    filtered = filtered.filter(s => s.status === activeStatus.value)
  }

  // 分类筛选
  if (activeCategory.value) {
    filtered = filtered.filter(s => s.category === activeCategory.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(s =>
      s.title?.toLowerCase().includes(keyword) ||
      s.summary?.toLowerCase().includes(keyword) ||
      s.content?.toLowerCase().includes(keyword)
    )
  }

  return filtered
})

// 分页后的科普列表
const paginatedSciences = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredSciences.value.slice(start, end)
})

// 搜索和筛选
const handleSearch = () => {
  currentPage.value = 1
}

const handleStatusFilter = () => {
  currentPage.value = 1
}

const handleCategoryFilter = () => {
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
const viewDetail = (science) => {
  currentScience.value = science
  detailDialogVisible.value = true
}

// 通过审核
const handleApprove = async (science) => {
  try {
    await ElMessageBox.confirm(
      `确定通过科普"${science.title}"的审核吗？通过后科普将公开发布。`,
      '通过审核',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    )

    science.processing = true

    // 更新科普状态为已发布
    const result = await scienceStore.updateScience(science.id, {
      status: 'published'
    })

    if (result.success) {
      ElMessage.success('审核通过')
      // 更新本地状态
      science.status = 'published'
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
    science.processing = false
  }
}

// 拒绝
const handleReject = (science) => {
  currentScience.value = science
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
    const science = currentScience.value

    const result = await scienceStore.updateScience(science.id, {
      status: 'rejected',
      reject_reason: rejectReason.value
    })

    if (result.success) {
      ElMessage.success('已拒绝该科普')
      science.status = 'rejected'
      science.reject_reason = rejectReason.value
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
const handleRevert = async (science) => {
  try {
    await ElMessageBox.confirm(
      `确定要将科普"${science.title}"重新设为待审核状态吗？`,
      '重新审核',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    science.processing = true

    const result = await scienceStore.updateScience(science.id, {
      status: 'pending'
    })

    if (result.success) {
      ElMessage.success('已重新设为待审核')
      science.status = 'pending'
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
    science.processing = false
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
  loadSciences()
})
</script>

<style scoped>
.science-review {
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

.sciences-card {
  border-radius: 8px;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

.sciences-list {
  padding: 10px 0;
}

.science-item {
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
}

.science-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.science-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.science-title-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.science-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.science-time {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 14px;
}

.science-info {
  margin-bottom: 15px;
}

.content-preview {
  color: #606266;
  line-height: 1.6;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.science-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.science-detail {
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

.cover-image {
  margin-top: 20px;
  text-align: center;
}

.cover-image h4 {
  margin-bottom: 10px;
  color: #303133;
}

@media (max-width: 768px) {
  .science-review {
    padding: 15px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .science-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .science-actions {
    flex-direction: column;
  }

  .science-actions .el-button {
    width: 100%;
  }
}
</style>
