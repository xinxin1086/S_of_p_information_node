<template>
  <div class="science-manage">
    <div class="page-header">
      <h1>科普管理</h1>
      <p>管理平台所有科普知识文章</p>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else class="manage-content">
      <!-- 操作栏 -->
      <el-card class="action-card" shadow="hover">
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
          <el-col :span="5">
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
          <el-col :span="5">
            <el-select
              v-model="activeStatus"
              placeholder="发布状态"
              style="width: 100%"
              @change="handleStatusFilter"
            >
              <el-option label="全部状态" value="" />
              <el-option label="已发布" value="published" />
              <el-option label="草稿" value="draft" />
              <el-option label="已下架" value="archived" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <div class="action-buttons">
              <el-button type="primary" @click="handleCreate">
                <el-icon><Plus /></el-icon>
                新建科普
              </el-button>
              <el-button @click="handleRefresh">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
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
          <el-card class="stat-card published">
            <div class="stat-content">
              <div class="stat-number">{{ stats.published }}</div>
              <div class="stat-label">已发布</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card draft">
            <div class="stat-content">
              <div class="stat-number">{{ stats.draft }}</div>
              <div class="stat-label">草稿</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card archived">
            <div class="stat-content">
              <div class="stat-number">{{ stats.archived }}</div>
              <div class="stat-label">已下架</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 科普文章列表 -->
      <el-card class="table-card" shadow="hover">
        <el-table
          :data="articles"
          style="width: 100%"
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="title" label="标题" min-width="200">
            <template #default="{ row }">
              <div class="title-cell">
                <div class="title-text">{{ row.title }}</div>
                <div class="title-meta">
                  <el-tag size="small" :type="getCategoryTagType(row.category)">
                    {{ row.category }}
                  </el-tag>
                  <span class="view-count">
                    <el-icon><View /></el-icon>
                    {{ row.viewCount || 0 }}
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="author" label="作者" width="120">
            <template #default="{ row }">
              <div class="author-cell">
                <el-avatar :size="24" :src="row.authorAvatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span>{{ row.author }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="summary" label="摘要" min-width="200">
            <template #default="{ row }">
              <div class="summary-text">{{ row.summary }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatTime(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleView(row)">
                查看
              </el-button>
              <el-button type="warning" link size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-dropdown @command="(command) => handleAction(command, row)">
                <el-button type="info" link size="small">
                  更多
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="publish" v-if="row.status !== 'published'">
                      <el-icon><Promotion /></el-icon>
                      发布
                    </el-dropdown-item>
                    <el-dropdown-item command="archive" v-if="row.status !== 'archived'">
                      <el-icon><Download /></el-icon>
                      下架
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" divided>
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>

        <!-- 批量操作栏 -->
        <div v-if="selectedArticles.length > 0" class="batch-actions">
          <span class="selected-info">已选择 {{ selectedArticles.length }} 项</span>
          <div class="batch-buttons">
            <el-button size="small" @click="handleBatchPublish">批量发布</el-button>
            <el-button size="small" @click="handleBatchArchive">批量下架</el-button>
            <el-button size="small" type="danger" @click="handleBatchDelete">批量删除</el-button>
          </div>
        </div>

        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 查看/编辑对话框 -->
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

const articles = ref([])
const selectedArticles = ref([])

const detailDialogVisible = ref(false)
const detailMode = ref('view') // 'view' | 'edit'
const currentArticle = ref(null)

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
    ElMessage.error('加载科普文章失败')
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
.science-manage {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 24px;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.loading-container {
  min-height: 400px;
}

.manage-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.action-card {
  border-radius: 12px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.stats-row {
  margin-bottom: 0;
}

.stat-card {
  border-radius: 12px;
  overflow: hidden;
}

.stat-content {
  text-align: center;
  padding: 10px 0;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.stat-card.published .stat-number {
  color: #67c23a;
}

.stat-card.draft .stat-number {
  color: #909399;
}

.stat-card.archived .stat-number {
  color: #f56c6c;
}

.table-card {
  border-radius: 12px;
}

.title-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title-text {
  font-weight: 500;
  color: #303133;
}

.title-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.view-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 12px;
}

.author-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-text {
  color: #606266;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.batch-actions {
  margin-top: 15px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-info {
  color: #606266;
  font-weight: 500;
}

.batch-buttons {
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.detail-content {
  max-height: 60vh;
  overflow-y: auto;
}

.article-content {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
  line-height: 1.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .science-manage {
    padding: 10px;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .action-buttons .el-button {
    width: 100%;
  }

  .stats-row {
    margin-bottom: 10px;
  }

  .batch-actions {
    flex-direction: column;
    gap: 10px;
  }

  .batch-buttons {
    flex-direction: column;
    width: 100%;
  }

  .batch-buttons .el-button {
    width: 100%;
  }
}
</style>
