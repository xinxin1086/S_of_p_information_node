<template>
  <div class="science-tab">
    <div class="tab-header">
      <div class="header-left">
        <el-radio-group v-model="currentCategory" @change="fetchScienceArticles">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="technique">钓鱼技巧</el-radio-button>
          <el-radio-button label="equipment">装备知识</el-radio-button>
          <el-radio-button label="species">鱼种科普</el-radio-button>
          <el-radio-button button label="environment">环保钓鱼</el-radio-button>
        </el-radio-group>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="$router.push('/science')">
          查看全部文章
        </el-button>
      </div>
    </div>

    <div class="science-content">
      <div v-loading="loading">
        <div v-if="articles.length === 0" class="empty-state">
          <el-empty description="暂无科普文章" />
        </div>
        <div v-else class="article-list">
          <div
            v-for="article in articles"
            :key="article.id"
            class="article-item"
            @click="$router.push(`/science/${article.id}`)"
          >
            <div class="article-image">
              <img :src="article.coverImage || '/default-science.jpg'" :alt="article.title" />
              <div class="article-category">
                {{ getCategoryText(article.category) }}
              </div>
            </div>
            <div class="article-content">
              <h3 class="article-title">{{ article.title }}</h3>
              <div class="article-summary">{{ article.summary }}</div>
              <div class="article-meta">
                <div class="meta-left">
                  <span class="author">
                    <el-icon><user /></el-icon>
                    {{ article.author }}
                  </span>
                  <span class="date">
                    <el-icon><calendar /></el-icon>
                    {{ formatDate(article.publishDate) }}
                  </span>
                </div>
                <div class="meta-right">
                  <span class="views">
                    <el-icon><view /></el-icon>
                    {{ article.viewCount }}
                  </span>
                  <span class="likes">
                    <el-icon><thumb /></el-icon>
                    {{ article.likeCount }}
                  </span>
                </div>
              </div>
              <div class="article-tags">
                <el-tag
                  v-for="tag in article.tags"
                  :key="tag"
                  size="small"
                  class="tag-item"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination-wrapper" v-if="articles.length > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[6, 12, 24]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchScienceArticles"
        @current-change="fetchScienceArticles"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Calendar, View, Thumb } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

defineOptions({ name: "ScienceTab" })

const router = useRouter()

const loading = ref(false)
const currentCategory = ref('all')
const articles = ref([])
const currentPage = ref(1)
const pageSize = ref(6)
const total = ref(0)

const fetchScienceArticles = async () => {
  loading.value = true
  try {
    // 模拟API调用
    setTimeout(() => {
      const mockArticles = [
        {
          id: 1,
          title: '春季钓鱼的最佳时间和技巧',
          summary: '春季是钓鱼的黄金季节，鱼类经过冬天的休养，开始活跃觅食。本文将详细介绍春季钓鱼的最佳时间、钓点选择、饵料搭配等实用技巧...',
          coverImage: '',
          category: 'technique',
          author: '钓鱼专家',
          publishDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          viewCount: 1256,
          likeCount: 89,
          tags: ['春季钓鱼', '时间技巧', '饵料搭配']
        },
        {
          id: 2,
          title: '如何选择适合自己的路亚竿',
          summary: '路亚竿的选择直接影响到钓鱼的效果和体验。本文从硬度、调性、长度、材质等多个方面，为大家详细介绍如何选择适合自己的路亚竿...',
          coverImage: '',
          category: 'equipment',
          author: '装备达人',
          publishDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          viewCount: 892,
          likeCount: 67,
          tags: ['路亚竿', '装备选择', '钓鱼技巧']
        },
        {
          id: 3,
          title: '长江流域常见淡水鱼种识别指南',
          summary: '长江流域鱼类资源丰富，本文介绍了常见的淡水鱼种特征、生活习性、垂钓方法等知识，帮助钓鱼爱好者更好地了解和识别各种鱼类...',
          coverImage: '',
          category: 'species',
          author: '生物学家',
          publishDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          viewCount: 2145,
          likeCount: 156,
          tags: ['鱼种识别', '长江流域', '淡水鱼']
        },
        {
          id: 4,
          title: '环保钓鱼：如何做到可持续垂钓',
          summary: '保护水生态环境是每个钓鱼爱好者的责任。本文介绍了环保钓鱼的理念、方法和注意事项，倡导大家进行可持续的垂钓活动...',
          coverImage: '',
          category: 'environment',
          author: '环保志愿者',
          publishDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          viewCount: 678,
          likeCount: 45,
          tags: ['环保钓鱼', '可持续发展', '生态保护']
        },
        {
          id: 5,
          title: '夜钓技巧与安全注意事项',
          summary: '夜钓是夏季钓鱼的绝佳选择，但需要注意安全和技巧。本文详细介绍了夜钓的装备准备、钓点选择、安全防护等实用知识...',
          coverImage: '',
          category: 'technique',
          author: '夜钓高手',
          publishDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
          viewCount: 934,
          likeCount: 72,
          tags: ['夜钓', '安全防护', '钓鱼技巧']
        },
        {
          id: 6,
          title: '鱼饵的保存与使用技巧',
          summary: '好的鱼饵是钓鱼成功的关键。本文介绍了各种鱼饵的保存方法、使用技巧以及不同季节的饵料选择策略...',
          coverImage: '',
          category: 'technique',
          author: '饵料专家',
          publishDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          viewCount: 1567,
          likeCount: 98,
          tags: ['鱼饵保存', '使用技巧', '季节选择']
        }
      ]

      // 根据分类筛选
      if (currentCategory.value === 'all') {
        articles.value = mockArticles
      } else {
        articles.value = mockArticles.filter(article => article.category === currentCategory.value)
      }

      total.value = articles.value.length
      loading.value = false
    }, 800)
  } catch (error) {
    console.error('获取科普文章失败:', error)
    loading.value = false
  }
}

const getCategoryText = (category) => {
  const categoryMap = {
    technique: '钓鱼技巧',
    equipment: '装备知识',
    species: '鱼种科普',
    environment: '环保钓鱼'
  }
  return categoryMap[category] || '其他'
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

onMounted(() => {
  fetchScienceArticles()
})
</script>

<style scoped>
.science-tab {
  padding: 20px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.science-content {
  min-height: 400px;
}

.article-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
}

.article-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
}

.article-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.article-image {
  position: relative;
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

.article-item:hover .article-image img {
  transform: scale(1.05);
}

.article-category {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.article-content {
  padding: 16px;
}

.article-title {
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.article-summary {
  color: #606266;
  line-height: 1.6;
  font-size: 0.9rem;
  margin-bottom: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  min-height: 4.8rem;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 0.85rem;
  color: #909399;
}

.meta-left,
.meta-right {
  display: flex;
  gap: 16px;
}

.meta-left span,
.meta-right span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  cursor: pointer;
  transition: all 0.3s;
}

.tag-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .article-list {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (max-width: 768px) {
  .tab-header {
    flex-direction: column;
    gap: 16px;
  }

  .header-left {
    width: 100%;
    overflow-x: auto;
  }

  .header-right {
    width: 100%;
  }

  .header-right .el-button {
    width: 100%;
  }

  .article-list {
    grid-template-columns: 1fr;
  }

  .article-meta {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .meta-left,
  .meta-right {
    gap: 12px;
  }
}
</style>