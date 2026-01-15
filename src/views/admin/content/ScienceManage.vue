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
          v-model="activeCategory"
          placeholder="科普分类默认全部"
          class="info-form-select"
          style="width: 180px; margin-left: 12px;"
          @change="handleCategoryFilter"
      >
        <el-option label="全部" value=""></el-option>
        <el-option label="鱼类知识" value="鱼类知识"></el-option>
        <el-option label="生态保护" value="生态保护"></el-option>
        <el-option label="环保教育" value="环保教育"></el-option>
        <el-option label="其他" value="其他"></el-option>
      </el-select>
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
        <el-option label="已下架" value="archived"></el-option>
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
      <el-table-column prop="category" label="分类" width="120">
        <template #default="scope">
          <el-tag :type="getCategoryTagType(scope.row.category)">
            {{ scope.row.category ?? '-' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="author" label="作者" width="120">
        <template #default="scope">{{ scope.row.author ?? '-' }}</template>
      </el-table-column>
      <el-table-column prop="summary" label="摘要" min-width="200">
        <template #default="scope">{{ scope.row.summary ?? '-' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ getStatusText(scope.row.status) ?? '-' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="scope">{{ formatTime(scope.row.createdAt) ?? '-' }}</template>
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
          <el-form-item label="分类">
            <el-select
              v-model="currentArticle.category"
              :disabled="detailMode === 'view'"
              placeholder="请选择分类"
              style="width: 100%"
            >
              <el-option label="鱼类知识" value="鱼类知识" />
              <el-option label="生态保护" value="生态保护" />
              <el-option label="环保教育" value="环保教育" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
          <el-form-item label="摘要">
            <el-input
              v-model="currentArticle.summary"
              :disabled="detailMode === 'view'"
              type="textarea"
              :rows="3"
              placeholder="请输入摘要"
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

<script setup>
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

import api from '@/api'
import { sanitizeRichText } from '@/utils/sanitizeHtml'

defineOptions({ name: 'ScienceManage' })

const router = useRouter()

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const activeCategory = ref('')
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
  archived: 0
})

// 方法
const loadArticles = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    showTable.value = true

    // 这里应该调用真实的API
    // const response = await api.scienceApi.getArticles({
    //   page: currentPage.value,
    //   size: pageSize.value,
    //   category: activeCategory.value,
    //   status: activeStatus.value,
    //   keyword: searchKeyword.value
    // })

    // 模拟数据
    articles.value = Array.from({ length: pageSize.value }, (_, i) => ({
      id: (currentPage.value - 1) * pageSize.value + i + 1,
      title: `科普文章${i + 1}: 汉江流域生态保护指南`,
      category: ['鱼类知识', '生态保护', '环保教育', '其他'][i % 4],
      author: `作者${i + 1}`,
      authorAvatar: '',
      summary: '本文介绍了汉江流域的生态环境现状,以及保护措施...',
      content: '<p>详细内容...</p>',
      status: ['published', 'draft', 'archived'][i % 3],
      viewCount: Math.floor(Math.random() * 1000),
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - i * 12 * 60 * 60 * 1000)
    }))
    total.value = 100

    // 更新统计数据
    stats.value = {
      total: 100,
      published: 60,
      draft: 30,
      archived: 10
    }
  } catch (error) {
    console.error('加载科普文章失败:', error)
    errorMessage.value = '加载科普文章失败'
    showTable.value = false
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadArticles()
}

const handleCategoryFilter = () => {
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
  router.push('/admin/science/create')
}

const handleView = (article) => {
  currentArticle.value = { ...article }
  detailMode.value = 'view'
  detailDialogVisible.value = true
}

const handleEdit = (article) => {
  currentArticle.value = { ...article }
  detailMode.value = 'edit'
  detailDialogVisible.value = true
}

const handleSave = async () => {
  try {
    // 调用API保存文章
    // await api.scienceApi.updateArticle(currentArticle.value.id, currentArticle.value)

    ElMessage.success('保存成功')
    detailDialogVisible.value = false
    loadArticles()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
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

    // await api.scienceApi.updateArticleStatus(article.id, { status: 'published' })
    ElMessage.success('发布成功')
    loadArticles()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发布失败:', error)
      ElMessage.error('发布失败')
    }
  }
}

const handleArchive = async (article) => {
  try {
    await ElMessageBox.confirm(`确定要下架"${article.title}"吗?`, '确认下架', {
      type: 'warning'
    })

    // await api.scienceApi.updateArticleStatus(article.id, { status: 'archived' })
    ElMessage.success('下架成功')
    loadArticles()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('下架失败:', error)
      ElMessage.error('下架失败')
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

    // await api.scienceApi.deleteArticle(article.id)
    ElMessage.success('删除成功')
    loadArticles()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
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

    // 批量发布逻辑
    ElMessage.success(`成功发布 ${selectedArticles.value.length} 篇文章`)
    selectedArticles.value = []
    loadArticles()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量发布失败:', error)
      ElMessage.error('批量发布失败')
    }
  }
}

const handleBatchArchive = async () => {
  try {
    await ElMessageBox.confirm(`确定要下架选中的 ${selectedArticles.value.length} 篇文章吗?`, '批量下架', {
      type: 'warning'
    })

    ElMessage.success(`成功下架 ${selectedArticles.value.length} 篇文章`)
    selectedArticles.value = []
    loadArticles()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量下架失败:', error)
      ElMessage.error('批量下架失败')
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

    ElMessage.success(`成功删除 ${selectedArticles.value.length} 篇文章`)
    selectedArticles.value = []
    loadArticles()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
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

const getCategoryTagType = (category) => {
  const typeMap = {
    '鱼类知识': 'primary',
    '生态保护': 'success',
    '环保教育': 'warning',
    '其他': 'info'
  }
  return typeMap[category] || ''
}

const getStatusTagType = (status) => {
  const typeMap = {
    'published': 'success',
    'draft': 'info',
    'archived': 'danger'
  }
  return typeMap[status] || ''
}

const getStatusText = (status) => {
  const textMap = {
    'published': '已发布',
    'draft': '草稿',
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
