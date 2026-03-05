<template>
  <div class="info-container">
    <!-- 查询栏 -->
    <div class="info-list-query-bar">
      <el-input
          v-model="searchKeyword"
          placeholder="请输入科普标题查询"
          class="info-form-input"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
      ></el-input>
      <el-select
          v-model="activeStatus"
          placeholder="状态默认全部"
          class="info-form-select"
          style="width: 180px; margin-left: 12px;"
          @change="handleStatusFilter"
      >
        <el-option label="全部" value=""></el-option>
        <el-option label="已发布" value="published"></el-option>
        <el-option label="草稿" value="draft"></el-option>
        <el-option label="待审核" value="pending"></el-option>
        <el-option label="已拒绝" value="rejected"></el-option>
      </el-select>
      <button class="info-btn query-btn" @click="handleSearch" style="margin-left: 12px;">查询</button>
      <button class="info-btn reset-btn" @click="handleRefresh" style="margin-left: 8px;">刷新</button>
    </div>

    <!-- 操作栏 -->
    <div class="info-list-action-bar">
      <button class="info-btn add-btn" @click="handleCreate">新增科普</button>
      <button class="info-btn batch-delete-btn" @click="handleBatchDelete" :disabled="selectedArticles.length === 0">
        批量删除 ({{ selectedArticles.length }})
      </button>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="info-global-error">{{ errorMessage }}</div>

    <!-- 无数据提示 -->
    <div v-if="!showTable && !errorMessage" class="info-list-empty-tip">暂无科普数据</div>

    <!-- 科普文章列表 -->
    <el-table
        :data="articles"
        v-if="showTable"
        border
        class="info-list-table"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="id" label="ID" width="80">
        <template #default="scope">{{ scope.row.id ?? '-' }}</template>
      </el-table-column>
      <el-table-column prop="title" label="标题" width="200">
        <template #default="scope">{{ scope.row.title ?? '-' }}</template>
      </el-table-column>
      <el-table-column prop="author_display" label="发布者" width="150">
        <template #default="scope">{{ scope.row.author_display ?? '-' }}</template>
      </el-table-column>
      <el-table-column prop="author_user_id" label="发布者ID" width="120">
        <template #default="scope">{{ scope.row.author_user_id ?? '-' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ getStatusText(scope.row.status) ?? '-' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="scope">{{ formatTime(scope.row.created_at) ?? '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <button class="info-btn edit-btn" @click="handleEdit(scope.row)" style="margin-right: 4px;">编辑</button>
          <button class="info-btn delete-btn" @click="handleDelete(scope.row)">删除</button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="info-pagination" v-if="showTable">
      <span>共 {{ total }} 条</span>
      <button :disabled="currentPage === 1" @click="handlePageChange(currentPage - 1)">&lt;</button>
      <button class="current-page">{{ currentPage }}</button>
      <button :disabled="currentPage === totalPage" @click="handlePageChange(currentPage + 1)">&gt;</button>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="detailMode === 'view' ? '查看科普' : '编辑科普'"
      width="80%"
      :close-on-click-modal="false"
    >
      <div v-if="currentArticle" class="detail-content">
        <el-form :model="currentArticle" label-width="100px">
          <el-form-item label="标题">
            <el-input
              v-model="currentArticle.title"
              :disabled="detailMode === 'view'"
              placeholder="请输入标题"
            />
          </el-form-item>
          <el-form-item label="内容">
            <!-- eslint-disable-next-line vue/no-v-html -- Content sanitized with DOMPurify -->
            <div v-if="detailMode === 'view'" class="article-content" v-html="sanitizedArticleContent"></div>
            <el-input
              v-else
              v-model="currentArticle.content"
              type="textarea"
              :rows="15"
              placeholder="请输入内容"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">取消</el-button>
        <el-button v-if="detailMode === 'edit'" type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  Search,
  Plus,
  Refresh,
  View,
  User,
  ArrowDown,
  Promotion,
  Download,
  Delete
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import api from '@/api/unified'
import { sanitizeRichText } from '@/utils/sanitizeHtml'

// 定义文章接口类型
interface ScienceArticle {
  id: number
  title: string
  content: string
  status: 'draft' | 'pending' | 'published' | 'rejected'
  view_count?: number
  like_count?: number
  author_user_id?: number | null
  author_display?: string
  created_at: string
  updated_at: string
}

defineOptions({ name: 'ScienceManage' })

const router = useRouter()

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const activeStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const totalPage = computed(() => Math.ceil(total.value / pageSize.value) || 1)

const articles = ref([])
const selectedArticles = ref([])

const detailDialogVisible = ref(false)
const detailMode = ref('view') // 'view' | 'edit'
const currentArticle = ref(null)

const showTable = ref(true)
const errorMessage = ref('')

// 净化后的文章内容（防止XSS攻击）
const sanitizedArticleContent = computed(() => {
  return currentArticle.value ? sanitizeRichText(currentArticle.value.content) : ''
})

// 统计数据
const stats = ref({
  total: 0,
  published: 0,
  draft: 0,
  pending: 0,
  rejected: 0
})

// 方法
const loadArticles = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    showTable.value = true

    // 调用真实的API
    const response = await api.admin.science.list({
      page: currentPage.value,
      size: pageSize.value,
      status: activeStatus.value || undefined,
      keyword: searchKeyword.value || undefined
    })

    if (response.success && response.data) {
      articles.value = response.data.items || []
      total.value = response.data.total || 0
    } else {
      throw new Error(response.message || '加载失败')
    }

    // 加载统计数据
    loadStatistics()
  } catch (error) {
    console.error('加载科普文章失败:', error)
    errorMessage.value = error.message || '加载科普文章失败'
    showTable.value = false
  } finally {
    loading.value = false
  }
}

// 加载统计数据
const loadStatistics = async () => {
  try {
    const response = await api.admin.science.statistics()
    if (response.success && response.data) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadArticles()
}

const handleStatusFilter = () => {
  currentPage.value = 1
  loadArticles()
}

const handleRefresh = () => {
  loadArticles()
  ElMessage.success('刷新成功')
}

const handleCreate = () => {
  // 跳转到科普编辑器页面
  router.push('/admin/science/editor')
}

const handleView = (article) => {
  currentArticle.value = { ...article }
  detailMode.value = 'view'
  detailDialogVisible.value = true
}

const handleEdit = (article) => {
  // 跳转到科普编辑器页面
  router.push(`/admin/science/editor/${article.id}`)
}

const handleSave = async () => {
  try {
    const articleData = {
      title: currentArticle.value.title,
      category: currentArticle.value.category,
      summary: currentArticle.value.summary,
      content: currentArticle.value.content,
      status: currentArticle.value.status || 'draft'
    }

    let response
    if (currentArticle.value?.id) {
      // 更新现有文章
      response = await api.admin.science.update(currentArticle.value.id, articleData)
    } else {
      // 创建新文章
      response = await api.admin.science.create(articleData)
    }

    if (response.success) {
      ElMessage.success(currentArticle.value?.id ? '保存成功' : '创建成功')
      detailDialogVisible.value = false
      loadArticles()
    } else {
      throw new Error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(error.message || '保存失败')
  }
}

const handleAction = async (command, article) => {
  switch (command) {
    case 'publish':
      await handlePublish(article)
      break
    case 'archive':
      await handleArchive(article)
      break
    case 'delete':
      await handleDelete(article)
      break
  }
}

const handlePublish = async (article) => {
  try {
    await ElMessageBox.confirm(`确定要发布"${article.title}"吗?`, '确认发布', {
      type: 'warning'
    })

    const response = await api.admin.science.batchStatus({
      article_ids: [article.id],
      action: 'publish'
    })

    if (response.success) {
      ElMessage.success('发布成功')
      loadArticles()
    } else {
      throw new Error(response.message || '发布失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发布失败:', error)
      ElMessage.error(error.message || '发布失败')
    }
  }
}

const handleArchive = async (article) => {
  try {
    await ElMessageBox.confirm(`确定要下架"${article.title}"吗?`, '确认下架', {
      type: 'warning'
    })

    const response = await api.admin.science.batchStatus({
      article_ids: [article.id],
      action: 'archive'
    })

    if (response.success) {
      ElMessage.success('下架成功')
      loadArticles()
    } else {
      throw new Error(response.message || '下架失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('下架失败:', error)
      ElMessage.error(error.message || '下架失败')
    }
  }
}

const handleDelete = async (article) => {
  try {
    await ElMessageBox.confirm(`确定要删除"${article.title}"吗?此操作不可恢复!`, '确认删除', {
      type: 'error',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消'
    })

    const response = await api.admin.science.delete(article.id)

    if (response.success) {
      ElMessage.success('删除成功')
      loadArticles()
    } else {
      throw new Error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleSelectionChange = (selection) => {
  selectedArticles.value = selection
}

const handleBatchPublish = async () => {
  try {
    await ElMessageBox.confirm(`确定要发布选中的 ${selectedArticles.value.length} 篇文章吗?`, '批量发布', {
      type: 'warning'
    })

    const ids = selectedArticles.value.map(item => item.id)
    const response = await api.admin.science.batchStatus({
      article_ids: ids,
      action: 'publish'
    })

    if (response.success) {
      ElMessage.success(`成功发布 ${selectedArticles.value.length} 篇文章`)
      selectedArticles.value = []
      loadArticles()
    } else {
      throw new Error(response.message || '批量发布失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量发布失败:', error)
      ElMessage.error(error.message || '批量发布失败')
    }
  }
}

const handleBatchArchive = async () => {
  try {
    await ElMessageBox.confirm(`确定要下架选中的 ${selectedArticles.value.length} 篇文章吗?`, '批量下架', {
      type: 'warning'
    })

    const ids = selectedArticles.value.map(item => item.id)
    const response = await api.admin.science.batchStatus({
      article_ids: ids,
      action: 'archive'
    })

    if (response.success) {
      ElMessage.success(`成功下架 ${selectedArticles.value.length} 篇文章`)
      selectedArticles.value = []
      loadArticles()
    } else {
      throw new Error(response.message || '批量下架失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量下架失败:', error)
      ElMessage.error(error.message || '批量下架失败')
    }
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedArticles.value.length} 篇文章吗?此操作不可恢复!`,
      '批量删除',
      {
        type: 'error',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )

    const ids = selectedArticles.value.map(item => item.id)
    const response = await api.admin.science.batchDelete(ids)

    if (response.success) {
      ElMessage.success(`成功删除 ${selectedArticles.value.length} 篇文章`)
      selectedArticles.value = []
      loadArticles()
    } else {
      throw new Error(response.message || '批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error(error.message || '批量删除失败')
    }
  }
}

const handleSizeChange = () => {
  currentPage.value = 1
  loadArticles()
}

const handlePageChange = () => {
  loadArticles()
}

// 辅助方法
const formatTime = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const getStatusTagType = (status) => {
  const typeMap = {
    'published': 'success',
    'draft': 'info',
    'pending': 'warning',
    'rejected': 'danger',
    'archived': 'danger'
  }
  return typeMap[status] || ''
}

const getStatusText = (status) => {
  const textMap = {
    'published': '已发布',
    'draft': '草稿',
    'pending': '待审核',
    'rejected': '已拒绝',
    'archived': '已下架'
  }
  return textMap[status] || status
}

// 生命周期
onMounted(() => {
  loadArticles()
})
</script>

<style scoped>
/* 适配下拉框与输入框对齐 */
.el-select {
  vertical-align: middle;
}
</style>
