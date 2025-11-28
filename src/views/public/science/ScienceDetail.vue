<template>
  <div class="science-detail">
    <div v-if="loading" class="loading">
      <el-loading :active="loading" />
    </div>

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
        <el-button @click="goBack" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>

      <el-card class="article-card">
        <div class="article-meta">
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="article-info">
            <el-tag :type="getArticleTypeTag(article.category)" size="small">
              {{ getArticleTypeText(article.category) }}
            </el-tag>
            <span class="article-author">{{ article.author || '管理员' }}</span>
            <span class="article-date">{{ formatDate(article.createdAt) }}</span>
          </div>
        </div>

        <div class="article-body" v-html="article.content"></div>

        <div class="article-stats">
          <div class="stats-left">
            <el-button @click="likeArticle" :type="article.isLiked ? 'primary' : ''">
              <el-icon><Star /></el-icon>
              点赞 ({{ article.likes }})
            </el-button>
            <span class="view-count">
              <el-icon><View /></el-icon>
              阅读 ({{ article.views }})
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

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const article = ref(null)
const relatedArticles = ref([])

const articleId = computed(() => parseInt(route.params.id))

const fetchArticleDetail = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟数据
    const mockArticles = {
      1: {
        id: 1,
        title: '新手钓鱼入门：装备选择与基础技巧',
        author: '钓鱼专家',
        content: `
          <h2>前言</h2>
          <p>钓鱼是一项既能放松身心又能锻炼耐性的户外活动。对于初学者来说，选择合适的装备和掌握基础技巧是成功的关键。本文将为您详细介绍钓鱼入门需要了解的一切。</p>

          <h2>第一章：基础装备选择</h2>
          <h3>1.1 鱼竿选择</h3>
          <p>鱼竿是钓鱼最重要的装备。初学者建议选择：</p>
          <ul>
            <li><strong>长度</strong>：2.7-3.6米的碳素竿</li>
            <li><strong>调性</strong>：中调或软调，便于掌握</li>
            <li><strong>材质</strong>：碳素材质，轻便且灵敏</li>
          </ul>

          <h3>1.2 鱼线选择</h3>
          <p>鱼线的选择要考虑目标鱼种和钓场环境：</p>
          <ul>
            <li><strong>线号</strong>：新手建议2-3号线</li>
            <li><strong>材质</strong>：尼龙线，性价比高</li>
            <li><strong>长度</strong>：100米左右，便于更换</li>
          </ul>

          <h3>1.3 鱼钩选择</h3>
          <p>鱼钩大小要匹配目标鱼种：</p>
          <ul>
            <li><strong>小钩</strong>：适合鲫鱼、白条等小鱼</li>
            <li><strong>中钩</strong>：适合鲤鱼、草鱼等中型鱼</li>
            <li><strong>大钩</strong>：适合青鱼、鲢鱼等大鱼</li>
          </ul>

          <h2>第二章：基础钓法技巧</h2>
          <h3>2.1 立钓姿势</h3>
          <p>正确的立钓姿势能够提高钓鱼效率：</p>
          <ul>
            <li>保持身体平衡，双脚分开与肩同宽</li>
            <li>持竿姿势要自然，手腕放松</li>
            <li>注意观察浮漂信号，及时提竿</li>
          </ul>

          <h3>2.2 抛竿技巧</h3>
          <p>准确的抛竿是成功钓鱼的关键：</p>
          <ul>
            <li>瞄准目标点，用力均匀</li>
            <li>利用手腕发力，而非整个手臂</li>
            <li>注意抛竿后的线线松弛度</li>
          </ul>

          <h2>第三章：注意事项</h2>
          <h3>3.1 安全事项</h3>
          <ul>
            <li>注意防滑，选择安全的钓位</li>
            <li>注意防晒，带好防晒用品</li>
            <li>保管好装备，避免丢失</li>
          </ul>

          <h3>3.2 环保意识</h3>
          <ul>
            <li>垃圾要带走，保护环境</li>
            <li>小鱼要放生，保护生态</li>
            <li>遵守当地钓鱼规定</li>
          </ul>

          <h2>总结</h2>
          <p>钓鱼是一项需要耐心和技巧的活动。通过不断练习和学习，您一定能成为一名优秀的钓手。记住，享受过程比收获更重要！</p>
        `,
        category: 'basic',
        createdAt: '2024-01-15T10:00:00Z',
        views: 1234,
        likes: 89,
        isLiked: false
      },
      2: {
        id: 2,
        title: '春季钓鲤鱼的最佳时机和方法',
        author: '经验钓手',
        content: `
          <h2>春季鲤鱼习性分析</h2>
          <p>春季是鲤鱼活跃的季节，了解其习性对于成功钓获至关重要。</p>

          <h3>最佳钓时</h3>
          <ul>
            <li><strong>早晨</strong>：6-9点，温度适宜</li>
            <li><strong>傍晚</strong>：17-19点，光线昏暗</li>
            <li><strong>阴天</strong>：全天可钓，鲤鱼更活跃</li>
          </ul>

          <h2>春季钓法技巧</h2>
          <p>详细内容待完善...</p>
        `,
        category: 'technique',
        createdAt: '2024-01-12T14:30:00Z',
        views: 856,
        likes: 67,
        isLiked: false
      }
    }

    article.value = mockArticles[articleId.value] || null

    // 模拟相关文章
    if (article.value) {
      relatedArticles.value = [
        {
          id: 2,
          title: '春季钓鲤鱼的最佳时机和方法',
          summary: '分析春季鲤鱼的习性特点，推荐有效的钓法技巧和饵料搭配。',
          category: 'technique',
          createdAt: '2024-01-12T14:30:00Z'
        },
        {
          id: 3,
          title: '环保钓鱼：保护水域生态的重要性',
          summary: '倡导环保钓鱼理念，介绍如何在不影响环境的前提下享受垂钓乐趣。',
          category: 'environment',
          createdAt: '2024-01-08T09:15:00Z'
        }
      ].filter(item => item.id !== articleId.value)
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/science')
}

const goToArticle = (id) => {
  router.push(`/science/${id}`)
}

const likeArticle = () => {
  if (article.value) {
    if (article.value.isLiked) {
      article.value.likes--
      article.value.isLiked = false
      ElMessage.success('已取消点赞')
    } else {
      article.value.likes++
      article.value.isLiked = true
      ElMessage.success('点赞成功')
    }
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
  gap: 5px;
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