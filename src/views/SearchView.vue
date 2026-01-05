<template>
  <div class="search-view">
    <div class="search-header">
      <div class="search-container">
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            size="large"
            placeholder="搜索公告、活动、科普知识..."
            class="search-input"
            @keyup.enter="performSearch"
          >
            <template #append>
              <el-button type="primary" @click="performSearch">
                <el-icon><search /></el-icon>
                搜索
              </el-button>
            </template>
          </el-input>
        </div>
        <div class="search-filters">
          <el-radio-group v-model="searchType" @change="performSearch">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="notice">公告</el-radio-button>
            <el-radio-button label="activity">活动</el-radio-button>
            <el-radio-button label="science">科普</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </div>

    <div class="search-content">
      <div class="content-container">
        <div v-loading="loading" class="search-results">
          <div v-if="searchQuery && !loading && searchResults.length === 0" class="no-results">
            <el-empty description="未找到相关内容" />
          </div>

          <div v-else-if="!searchQuery" class="search-placeholder">
            <div class="placeholder-icon">
              <el-icon size="64" color="#d3d3d3"><search /></el-icon>
            </div>
            <h3>搜索您感兴趣的内容</h3>
            <p>输入关键词搜索公告、活动、科普知识等内容</p>
            <div class="hot-searches">
              <span class="hot-label">热门搜索：</span>
              <el-tag
                v-for="tag in hotSearchTags"
                :key="tag"
                @click="quickSearch(tag)"
                class="hot-tag"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>

          <div v-else class="results-list">
            <div class="results-header">
              <h3>找到 {{ total }} 条相关结果</h3>
              <el-select v-model="sortBy" @change="performSearch" placeholder="排序方式">
                <el-option label="相关度" value="relevance" />
                <el-option label="时间" value="time" />
                <el-option label="热度" value="popularity" />
              </el-select>
            </div>

            <div class="results-items">
              <div
                v-for="result in searchResults"
                :key="`${result.type}-${result.id}`"
                class="result-item"
                @click="navigateToDetail(result)"
              >
                <div class="result-icon" :class="result.type">
                  <el-icon v-if="result.type === 'notice'"><bell /></el-icon>
                  <el-icon v-else-if="result.type === 'activity'"><calendar /></el-icon>
                  <el-icon v-else><reading /></el-icon>
                </div>
                <div class="result-content">
                  <!-- eslint-disable-next-line vue/no-v-html -- Content sanitized with DOMPurify -->
                  <div class="result-title" v-html="highlightKeyword(result.title)"></div>
                  <!-- eslint-disable-next-line vue/no-v-html -- Content sanitized with DOMPurify -->
                  <div class="result-summary" v-html="highlightKeyword(result.summary)"></div>
                  <div class="result-meta">
                    <span class="result-type">{{ getTypeText(result.type) }}</span>
                    <span class="result-time">{{ formatTime(result.createdAt) }}</span>
                    <span v-if="result.category" class="result-category">{{ result.category }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="total > pageSize" class="pagination">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50]"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="performSearch"
                @current-change="performSearch"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Bell, Calendar, Reading } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { sanitizeHighlight } from '@/utils/sanitizeHtml'

defineOptions({ name: "SearchView" })

const router = useRouter()
const route = useRoute()

// 响应式数据
const searchQuery = ref('')
const searchType = ref('all')
const sortBy = ref('relevance')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const searchResults = ref([])

// 热门搜索标签
const hotSearchTags = ref([
  '钓鱼技巧', '活动预约', '科普知识', '公告通知', '路亚', '汉江'
])

// 方法
const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    total.value = 0
    return
  }

  loading.value = true
  try {
    // 模拟API调用
    setTimeout(() => {
      const mockResults = [
        {
          id: 1,
          type: 'notice',
          title: '关于汉江垂钓站升级维护的通知',
          summary: '系统将于本周末进行升级维护，预计维护时间6小时，期间网站可能无法正常访问。',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          category: '系统公告'
        },
        {
          id: 2,
          type: 'activity',
          title: '汉江春季钓鱼比赛',
          summary: '春季钓鱼比赛报名开始，欢迎各位钓鱼爱好者参加，丰厚奖品等你来拿！',
          createdAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          category: '钓鱼比赛'
        },
        {
          id: 3,
          type: 'science',
          title: '春季钓鱼的最佳时间和技巧',
          summary: '春季是钓鱼的黄金季节，鱼类经过冬天的休养，开始活跃觅食。本文将详细介绍春季钓鱼的最佳时间、钓点选择、饵料搭配等实用技巧。',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          category: '钓鱼技巧'
        }
      ]

      // 根据搜索类型过滤结果
      let filteredResults = mockResults
      if (searchType.value !== 'all') {
        filteredResults = mockResults.filter(item => item.type === searchType.value)
      }

      // 根据关键词过滤结果（简单模拟）
      if (searchQuery.value) {
        const keyword = searchQuery.value.toLowerCase()
        filteredResults = filteredResults.filter(item =>
          item.title.toLowerCase().includes(keyword) ||
          item.summary.toLowerCase().includes(keyword)
        )
      }

      searchResults.value = filteredResults
      total.value = filteredResults.length
      loading.value = false
    }, 800)
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请稍后重试')
    loading.value = false
  }
}

const quickSearch = (tag) => {
  searchQuery.value = tag
  performSearch()
}

const highlightKeyword = (text) => {
  if (!searchQuery.value.trim()) return text
  const keyword = searchQuery.value.trim()
  const regex = new RegExp(`(${keyword})`, 'gi')
  const highlighted = text.replace(regex, '<mark>$1</mark>')
  // 净化高亮后的HTML，防止XSS攻击
  return sanitizeHighlight(highlighted)
}

const navigateToDetail = (result) => {
  switch (result.type) {
    case 'notice':
      router.push(`/notice/${result.id}`)
      break
    case 'activity':
      router.push(`/activities/${result.id}`)
      break
    case 'science':
      router.push(`/science/${result.id}`)
      break
    default:
      ElMessage.warning('无效的内容类型')
  }
}

const getTypeText = (type) => {
  const typeMap = {
    notice: '公告',
    activity: '活动',
    science: '科普'
  }
  return typeMap[type] || '其他'
}

const formatTime = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 生命周期
onMounted(() => {
  // 从URL参数获取搜索关键词
  const query = route.query.q
  if (query) {
    searchQuery.value = query
    performSearch()
  }
})
</script>

<style scoped>
.search-view {
  min-height: 100vh;
  background-color: #f8fafc;
}

.search-header {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  padding: 2rem 0;
}

.search-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-box {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
}

.search-filters {
  display: flex;
  justify-content: center;
}

.search-content {
  padding: 2rem 0;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-placeholder {
  text-align: center;
  padding: 4rem 0;
}

.placeholder-icon {
  margin-bottom: 1.5rem;
}

.search-placeholder h3 {
  margin: 0 0 0.5rem 0;
  color: #303133;
  font-size: 1.5rem;
}

.search-placeholder p {
  margin: 0 0 2rem 0;
  color: #909399;
}

.hot-searches {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.hot-label {
  color: #909399;
  font-size: 0.9rem;
}

.hot-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.hot-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.no-results {
  text-align: center;
  padding: 4rem 0;
}

.results-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.results-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.results-header h3 {
  margin: 0;
  color: #303133;
  font-size: 1.1rem;
}

.results-items {
  max-height: 600px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.result-item:hover {
  background-color: #f8fafc;
}

.result-item:last-child {
  border-bottom: none;
}

.result-icon {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: white;
  margin-top: 0.25rem;
}

.result-icon.notice {
  background-color: #3b82f6;
}

.result-icon.activity {
  background-color: #10b981;
}

.result-icon.science {
  background-color: #8b5cf6;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #303133;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.result-title :deep(mark) {
  background-color: #fef3c7;
  color: #92400e;
  padding: 0 2px;
  border-radius: 2px;
}

.result-summary {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.result-summary :deep(mark) {
  background-color: #fef3c7;
  color: #92400e;
  padding: 0 2px;
  border-radius: 2px;
}

.result-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #909399;
}

.result-type {
  background-color: #e5e7eb;
  color: #374151;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.result-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.result-category {
  background-color: #dbeafe;
  color: #1d4ed8;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.pagination {
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  border-top: 1px solid #e4e7ed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-container {
    padding: 0 15px;
  }

  .content-container {
    padding: 0 15px;
  }

  .results-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .result-item {
    padding: 1rem;
  }

  .result-icon {
    width: 40px;
    height: 40px;
  }

  .result-title {
    font-size: 1rem;
  }

  .hot-searches {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>