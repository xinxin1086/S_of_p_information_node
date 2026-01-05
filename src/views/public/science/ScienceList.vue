<template>
  <div class="science-list">
    <div class="page-header">
      <h1>科普知识</h1>
      <p>学习钓鱼知识，提升垂钓技能</p>
    </div>

    <div class="science-container" v-loading="loading">
      <div v-if="articles.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无科普文章" />
      </div>

      <div v-if="!loading && articles.length > 0" class="science-grid">
        <el-card
          v-for="article in articles"
          :key="article.id"
          class="article-card"
          shadow="hover"
          @click="goToDetail(article.id)"
        >
          <div class="article-image" v-if="article.cover">
            <img :src="article.cover" :alt="article.title" />
          </div>

          <div class="article-content">
            <div class="article-header">
              <h3 class="article-title">{{ article.title }}</h3>
              <el-tag :type="getArticleTypeTag(article.category)" size="small">
                {{ getArticleTypeText(article.category) }}
              </el-tag>
            </div>

            <div class="article-summary">
              <p>{{ article.summary }}</p>
            </div>

            <div class="article-footer">
              <span class="article-date">{{ formatDate(article.publishedAt || article.createdAt) }}</span>
              <div class="article-stats">
                <span class="stat-item">
                  <el-icon><View /></el-icon> {{ article.view_count || article.views || 0 }}
                </span>
                <el-button
                  @click.stop="quickLike(article)"
                  :type="article.is_liked ? 'primary' : 'text'"
                  size="small"
                  :loading="article.liking"
                  class="like-button"
                >
                  <el-icon><Star /></el-icon>
                  {{ article.like_count || article.likes || 0 }}
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { View, Star } from '@element-plus/icons-vue'
import { useScienceStore } from '@/stores/science'
import { tokenManager } from '@/utils/tokenManager'

const router = useRouter()
const scienceStore = useScienceStore()

const loading = ref(false)
const articles = ref([])

const fetchArticles = async () => {
  loading.value = true
  try {
    const result = await scienceStore.fetchSciences({
      page: 1,
      size: 20,
      status: 'published' // 只显示已发布的文章
    })

    if (result.success) {
      // 适配数据格式到前端显示
      articles.value = (result.data || []).map(article => ({
        id: article.id,
        title: article.title,
        summary: article.summary || article.content?.substring(0, 100) + '...',
        content: article.content,
        category: article.category || 'basic',
        cover: article.cover_image,
        cover_image: article.cover_image, // 兼容性字段
        createdAt: article.created_at,
        publishedAt: article.published_at,
        view_count: article.view_count || 0,
        like_count: article.like_count || 0,
        views: article.view_count || 0, // 兼容性字段
        likes: article.like_count || 0, // 兼容性字段
        authorAccount: article.author_account,
        author_account: article.author_account, // 兼容性字段
        is_liked: false // 默认未点赞
      }))

      // 获取点赞状态
      await fetchLikeStatus()
    } else {
      console.error('获取科普文章列表失败:', result.error)
    }
  } catch (error) {
    console.error('获取科普文章列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取用户对这些文章的点赞状态
const fetchLikeStatus = async () => {
  try {
    const token = tokenManager.getAccessToken()
    if (!token || articles.value.length === 0) {
      return
    }

    const articleIds = articles.value.filter(a => a?.id).map(article => article.id)
    const result = await scienceStore.getLikeStatus(articleIds)

    if (result.success && result.data?.article_like_status) {
      // 更新文章的点赞状态
      articles.value.forEach(article => {
        if (article?.id) {
          article.is_liked = result.data.article_like_status[article.id] || false
        }
      })
    }
  } catch (error) {
    console.error('获取点赞状态失败:', error)
  }
}

const goToDetail = (id) => {
  router.push(`/science/${id}`)
}

// 快速点赞功能
const quickLike = async (article) => {
  if (article.liking) return

  article.liking = true
  try {
    const result = await scienceStore.likeScience(article.id)

    if (result.success) {
      // 更新本地状态
      article.like_count = result.data.like_count
      article.is_liked = result.data.is_liked
    }
  } catch (error) {
    console.error('快速点赞失败:', error)
  } finally {
    article.liking = false
  }
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
  fetchArticles()
})
</script>

<style scoped>
.science-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  color: #303133;
  margin-bottom: 10px;
}

.page-header p {
  color: #606266;
  font-size: 16px;
}

.science-container {
  min-height: 400px;
}


.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.science-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.article-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.article-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.article-card:hover .article-image img {
  transform: scale(1.05);
}

.article-content {
  padding: 20px;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.article-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
  line-height: 1.4;
  flex: 1;
  margin-right: 10px;
}

.article-summary {
  margin-bottom: 15px;
}

.article-summary p {
  color: #606266;
  line-height: 1.6;
  margin: 0;
  font-size: 14px;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-date {
  color: #909399;
  font-size: 14px;
}

.article-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 14px;
}

.like-button {
  padding: 4px 8px;
  min-height: auto;
  font-size: 14px;
  border: none;
  background: transparent;
  color: #909399;
  transition: all 0.2s ease;
}

.like-button:hover {
  color: #f56565;
  background: rgba(245, 101, 101, 0.1);
  transform: scale(1.05);
}

.like-button.is-primary {
  color: #f56565;
  background: rgba(245, 101, 101, 0.1);
}

.like-button .el-icon {
  font-size: 14px;
}

.stat-item .el-icon {
  font-size: 14px;
}

@media (max-width: 768px) {
  .science-list {
    padding: 15px;
  }

  .science-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .article-title {
    font-size: 16px;
  }

  .article-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .article-stats {
    gap: 10px;
  }

  .like-button {
    padding: 2px 6px;
    font-size: 12px;
  }
}
</style>