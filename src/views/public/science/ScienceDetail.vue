<template>
  <div class="science-detail">
    <div v-if="loading" class="loading" v-loading="loading"></div>

    <div v-else-if="!article" class="not-found">
      <el-result
        icon="warning"
        title="文章不存在"
        sub-title="抱歉，您访问的文章不存在或已被删除"
      >
        <template #extra>
          <el-button type="primary" @click="goBack">返回列表</el-button>
        </template>
      </el-result>
    </div>

    <div v-else class="article-content">
      <div class="article-header">
        <el-button @click="goBack" class="back-button" title="返回上一页">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
      </div>

      <el-card class="article-card">
        <div class="article-meta">
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="article-info">
            <el-tag :type="getArticleTypeTag(article.category)" size="small">
              {{ getArticleTypeText(article.category) }}
            </el-tag>
            <span class="article-author">{{ article.author }}</span>
            <span class="article-date">{{ formatDate(article.publishedAt || article.createdAt) }}</span>
          </div>
        </div>

        <div class="article-body" v-html="article.content"></div>

        <div class="article-stats">
          <div class="stats-left">
            <el-button @click="likeArticle" :type="article.is_liked ? 'primary' : ''" :loading="scienceStore.loading">
              <el-icon><Star /></el-icon>
              {{ article.is_liked ? '已点赞' : '点赞' }} ({{ article.like_count || 0 }})
            </el-button>
            <span class="view-count">
              <el-icon><View /></el-icon>
              阅读 ({{ article.view_count || 0 }})
            </span>
          </div>
          <div class="stats-right">
            <el-button @click="shareArticle">分享</el-button>
          </div>
        </div>
      </el-card>

      <div class="related-articles" v-if="relatedArticles.length > 0">
        <h3>相关文章</h3>
        <div class="related-grid">
          <el-card
            v-for="relatedArticle in relatedArticles"
            :key="relatedArticle.id"
            class="related-card"
            shadow="hover"
            @click="goToArticle(relatedArticle.id)"
          >
            <h4>{{ relatedArticle.title }}</h4>
            <p>{{ relatedArticle.summary }}</p>
            <div class="related-meta">
              <el-tag :type="getArticleTypeTag(relatedArticle.category)" size="small">
                {{ getArticleTypeText(relatedArticle.category) }}
              </el-tag>
              <span class="related-date">{{ formatDate(relatedArticle.createdAt) }}</span>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, View, Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useScienceStore } from '@/stores/science'

const route = useRoute()
const router = useRouter()
const scienceStore = useScienceStore()

const loading = ref(false)
const article = ref(null)
const relatedArticles = ref([])

const articleId = computed(() => parseInt(route.params.id))

const fetchArticleDetail = async () => {
  loading.value = true
  try {
    // 优先使用认证接口获取详情（包含点赞状态）
    const token = tokenManager.getAccessToken()
    let result

    if (token) {
      // 已登录用户使用认证接口
      result = await scienceStore.fetchScienceAuthenticated(articleId.value)
      // 同时记录浏览
      await scienceStore.recordVisit(articleId.value)
    } else {
      // 未登录用户使用公开接口
      result = await scienceStore.fetchScience(articleId.value)
    }

    if (result.success && result.data) {
      // 适配数据格式到前端显示
      article.value = {
        id: result.data.id,
        title: result.data.title,
        author: result.data.author_account || '管理员',
        content: result.data.content,
        category: result.data.category || 'basic',
        createdAt: result.data.created_at,
        publishedAt: result.data.published_at,
        view_count: result.data.view_count || 0,
        like_count: result.data.like_count || 0,
        is_liked: result.data.is_liked || false, // 从后端获取点赞状态
        isLiked: result.data.is_liked || false, // 兼容性字段
        cover_image: result.data.cover_image,
        coverImage: result.data.cover_image // 兼容性字段
      }

      // 获取相关文章
      fetchRelatedArticles()
    } else {
      console.error('获取文章详情失败:', result.error)
      article.value = null
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
    article.value = null
  } finally {
    loading.value = false
  }
}

const fetchRelatedArticles = async () => {
  try {
    const result = await scienceStore.fetchSciences({
      page: 1,
      size: 3,
      status: 'published'
    })

    if (result.success) {
      relatedArticles.value = (result.data || [])
        .filter(item => item.id !== articleId.value)
        .slice(0, 2)
        .map(item => ({
          id: item.id,
          title: item.title,
          summary: item.summary || item.content?.substring(0, 100) + '...',
          category: item.category || 'basic',
          createdAt: item.created_at
        }))
    }
  } catch (error) {
    console.error('获取相关文章失败:', error)
  }
}

const goBack = () => {
  router.push('/science')
}

const goToArticle = (id) => {
  router.push(`/science/${id}`)
}

const likeArticle = async () => {
  if (!article.value) return

  try {
    // 调用 store 中的点赞方法
    const result = await scienceStore.likeScience(articleId.value)

    if (result.success) {
      // 更新本地状态，使用后端返回的数据
      article.value.like_count = result.data.like_count
      article.value.is_liked = result.data.is_liked
      article.value.isLiked = result.data.is_liked // 兼容性字段
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    // 如果是网络错误，可以恢复本地状态
  }
}

const shareArticle = () => {
  ElMessage.info('分享功能开发中...')
}

const getArticleTypeTag = (category) => {
  const categoryMap = {
    basic: '',
    technique: 'success',
    environment: 'warning',
    equipment: 'info',
    safety: 'danger'
  }
  return categoryMap[category] || ''
}

const getArticleTypeText = (category) => {
  const categoryMap = {
    basic: '基础知识',
    technique: '技巧方法',
    environment: '环保理念',
    equipment: '装备介绍',
    safety: '安全知识'
  }
  return categoryMap[category] || '科普'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

onMounted(() => {
  fetchArticleDetail()
})
</script>

<style scoped>
.science-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.not-found {
  margin-top: 100px;
}

.article-header {
  margin-bottom: 20px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #495057;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.3);
}

.back-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);
}

.article-card {
  margin-bottom: 30px;
}

.article-meta {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.article-title {
  margin: 0 0 15px 0;
  font-size: 28px;
  color: #303133;
  line-height: 1.3;
}

.article-info {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.article-author {
  color: #606266;
  font-size: 14px;
}

.article-date {
  color: #909399;
  font-size: 14px;
}

.article-body {
  line-height: 1.8;
  color: #303133;
  font-size: 16px;
  margin-bottom: 30px;
}

.article-body :deep(h2) {
  margin: 30px 0 20px 0;
  color: #303133;
  font-size: 22px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.article-body :deep(h3) {
  margin: 25px 0 15px 0;
  color: #303133;
  font-size: 20px;
}

.article-body :deep(p) {
  margin: 15px 0;
}

.article-body :deep(ul) {
  margin: 15px 0;
  padding-left: 25px;
}

.article-body :deep(li) {
  margin: 8px 0;
}

.article-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.stats-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.view-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 14px;
}

.related-articles {
  margin-top: 40px;
}

.related-articles h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #303133;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.related-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.related-card:hover {
  transform: translateY(-2px);
}

.related-card h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #303133;
  line-height: 1.4;
}

.related-card p {
  margin: 0 0 15px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.related-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.related-date {
  color: #909399;
  font-size: 12px;
}

@media (max-width: 768px) {
  .science-detail {
    padding: 15px;
  }

  .article-title {
    font-size: 24px;
  }

  .article-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .article-stats {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .related-grid {
    grid-template-columns: 1fr;
  }
}
</style>