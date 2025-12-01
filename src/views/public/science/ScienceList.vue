<template>
  <div class="science-list">
    <div class="page-header">
      <h1>科普知识</h1>
      <p>学习钓鱼知识，提升垂钓技能</p>
    </div>

    <div class="science-container">
      <div v-if="loading" class="loading">
        <el-loading :active="loading" />
      </div>

      <div v-else-if="articles.length === 0" class="empty-state">
        <el-empty description="暂无科普文章" />
      </div>

      <div v-else class="science-grid">
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
                <span><el-icon><View /></el-icon> {{ article.views }}</span>
                <span><el-icon><Star /></el-icon> {{ article.likes }}</span>
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
import { useScienceStore } from '@/store/modules/science'

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
        createdAt: article.created_at,
        publishedAt: article.published_at,
        views: article.view_count,
        likes: article.like_count,
        authorAccount: article.author_account
      }))
    } else {
      console.error('获取科普文章列表失败:', result.error)
    }
  } catch (error) {
    console.error('获取科普文章列表失败:', error)
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => {
  router.push(`/science/${id}`)
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

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
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
  gap: 15px;
}

.article-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 14px;
}

.article-stats .el-icon {
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
    gap: 12px;
  }
}
</style>