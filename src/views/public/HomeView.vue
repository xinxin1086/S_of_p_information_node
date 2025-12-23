<template>
  <div class="public-home">
    <!-- 首页轮播图 -->
    <section class="hero-section">
      <el-carousel height="400px" :interval="5000" arrow="hover">
        <el-carousel-item v-for="item in carouselItems" :key="item.id">
          <div class="carousel-item" :style="{ backgroundImage: `url(${item.image})` }">
            <div class="carousel-content">
              <h2>{{ item.title }}</h2>
              <p>{{ item.description }}</p>
              <el-button type="primary" size="large" @click="handleCarouselClick(item)">
                了解更多
              </el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- 快速导航 -->
    <section class="quick-nav">
      <div class="container">
        <h2 class="section-title">快速导航</h2>
        <div class="nav-cards">
          <div class="nav-card" @click="$router.push('/notice')">
            <el-icon class="nav-icon"><Bell /></el-icon>
            <h3>公告中心</h3>
            <p>查看最新公告信息</p>
          </div>
          <div class="nav-card" @click="$router.push('/science')">
            <el-icon class="nav-icon"><Reading /></el-icon>
            <h3>科普知识</h3>
            <p>学习专业知识</p>
          </div>
          <div class="nav-card" @click="$router.push('/activities')">
            <el-icon class="nav-icon"><Calendar /></el-icon>
            <h3>活动信息</h3>
            <p>了解最新活动</p>
          </div>
          <div class="nav-card" @click="$router.push('/about')">
            <el-icon class="nav-icon"><InfoFilled /></el-icon>
            <h3>关于平台</h3>
            <p>了解我们</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 最新公告 -->
    <section class="latest-notices">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">最新公告</h2>
          <el-link type="primary" @click="$router.push('/notice')">查看更多 →</el-link>
        </div>
        <div class="notice-list">
          <!-- 加载状态 -->
          <div v-if="noticeLoading" class="loading-notice">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载中...</span>
          </div>

          <!-- 无公告状态 -->
          <div v-else-if="latestNotices.length === 0" class="empty-notice">
            <el-icon><Document /></el-icon>
            <p>暂无公告</p>
          </div>

          <!-- 公告列表 -->
          <div v-else>
            <div
              v-for="notice in latestNotices"
              :key="notice.id"
              class="notice-item-simple"
              @click="goToNoticeDetail(notice.id)"
            >
              <div class="notice-top">
                <!-- 左侧红色标签 -->
                <div class="notice-tag">
                  {{ getNoticeTypeText(notice.type) }}
                </div>

                <!-- 中间标题 -->
                <h4 class="notice-title-simple">{{ notice.title }}</h4>

                <!-- 右侧时间和箭头 -->
                <div class="notice-right">
                  <span class="notice-time-simple">{{ formatDate(notice.createdAt || notice.release_time) }}</span>
                  <el-icon class="notice-arrow-simple"><Right /></el-icon>
                </div>
              </div>

              <!-- 分割线 -->
              <div class="notice-divider"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 热门活动 -->
    <section class="hot-activities">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">热门活动</h2>
          <el-link type="primary" @click="$router.push('/activities')">查看更多 →</el-link>
        </div>
        <!-- 加载状态 -->
        <div v-if="activitiesLoading" class="loading-activities">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>

        <!-- 无活动状态 -->
        <div v-else-if="hotActivities.length === 0" class="empty-activities">
          <el-icon><Calendar /></el-icon>
          <p>暂无活动</p>
        </div>

        <!-- 活动列表 -->
        <div v-else class="activity-grid">
          <div
            v-for="activity in hotActivities"
            :key="activity.id"
            class="activity-card"
            @click="goToActivityDetail(activity.id)"
          >
            <div class="activity-image">
              <img :src="activity.cover_image || '/placeholder-activity.jpg'" :alt="activity.title" />
            </div>
            <div class="activity-info">
              <h4>{{ activity.title }}</h4>
              <p class="activity-desc">组织者：{{ activity.organizer_display || activity.organizer || '汉江垂钓站' }}</p>
              <div class="activity-meta">
                <span><el-icon><Location /></el-icon>{{ activity.location }}</span>
                <span><el-icon><Clock /></el-icon>{{ formatDate(activity.start_time) }}</span>
              </div>
              <!-- 活动评分区域 -->
              <div class="activity-rating" v-if="activity.rating_count > 0">
                <div class="rating-display">
                  <el-rate
                    :model-value="Number(activity.avg_score) || 0"
                    disabled
                    show-score
                    text-color="#ff9900"
                    score-template="{value}"
                    size="small"
                  />
                  <span class="rating-count">({{ activity.rating_count }}人评分)</span>
                </div>
              </div>
              <div class="activity-rating" v-else>
                <div class="no-rating">
                  <el-rate
                    :model-value="0"
                    disabled
                    show-score
                    text-color="#ccc"
                    score-template="暂无评分"
                    size="small"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, Reading, Calendar, InfoFilled, Location, Clock, Document, Right, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { fetchNoticeList, getNoticeTypeTag, getNoticeTypeText } from '@/utils/notice'
import { useActivityStore } from '@/stores/activity'

const router = useRouter()
const activityStore = useActivityStore()

// 轮播图数据
const carouselItems = ref([
  {
    id: 1,
    title: '欢迎来到社区交流平台',
    description: '连接邻里，共享美好生活',
    image: '/images/banner1.jpg'
  },
  {
    id: 2,
    title: '最新活动火热报名中',
    description: '精彩活动，不容错过',
    image: '/images/banner2.jpg'
  }
])

// 最新公告
const latestNotices = ref([])
const noticeLoading = ref(false)

// 热门活动
const hotActivities = ref([])
const activitiesLoading = ref(false)

// 获取最新公告
const fetchLatestNotices = async () => {
  noticeLoading.value = true
  try {
    const result = await fetchNoticeList(1, 5) // 只取前5条最新公告
    latestNotices.value = result.items.slice(0, 5)
  } catch (error) {
    console.error('获取最新公告失败:', error)
    ElMessage.error('获取最新公告失败')
  } finally {
    noticeLoading.value = false
  }
}

// 注释：不再需要单独获取评分信息，因为活动列表API已经返回了评分数据
// 活动列表API返回的数据已包含：avg_score 和 rating_count

// 获取热门活动
const fetchHotActivities = async () => {
  activitiesLoading.value = true
  try {
    const result = await activityStore.fetchPublicActivities({
      page: 1,
      size: 6  // 首页只显示6个热门活动
    })

    if (result.success) {
      const items = result.data || []
      console.log('获取到的活动数据:', items) // 调试日志

      // 直接使用API返回的数据，无需额外请求评分信息
      const processedActivities = items.map(activity => {
        console.log('处理活动数据:', activity) // 调试日志

        return {
          id: activity.id,
          title: activity.title,
          description: activity.description?.substring(0, 80) + '...' || '',
          location: activity.location || '地点待定',
          start_time: activity.start_time,
          cover_image: activity.cover_image,
          organizer_display: activity.organizer_display,
          organizer: activity.organizer,
          // 直接使用API返回的评分数据
          avg_score: activity.avg_score || 0,
          rating_count: activity.rating_count || 0
        }
      })

      hotActivities.value = processedActivities
    } else {
      console.error('获取热门活动失败:', result.error)
      hotActivities.value = []
    }
  } catch (error) {
    console.error('获取热门活动失败:', error)
    hotActivities.value = []
  } finally {
    activitiesLoading.value = false
  }
}

// 自定义日期格式化函数（匹配图片中的 2025/12/01 格式）
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

// 跳转到公告详情
const goToNoticeDetail = (noticeId) => {
  router.push(`/notice/${noticeId}`)
}

// 跳转到活动详情页面
const goToActivityDetail = (activityId) => {
  router.push(`/activities/${activityId}`)
}

// 轮播图点击事件
const handleCarouselClick = (item) => {
  // 根据轮播图内容跳转到相应页面
  switch (item.id) {
    case 1:
      router.push('/about')
      break
    case 2:
      router.push('/activities')
      break
    default:
      break
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  try {
    // 加载最新公告
    await fetchLatestNotices()

    // 加载热门活动数据
    await fetchHotActivities()
  } catch (error) {
    console.error('加载数据失败:', error)
  }
})
</script>

<style scoped>
.public-home {
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 轮播图样式 */
.hero-section {
  margin-bottom: 60px;
}

.carousel-item {
  height: 400px;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
}

.carousel-content {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  padding: 40px;
  border-radius: 8px;
}

.carousel-content h2 {
  font-size: 32px;
  margin-bottom: 16px;
}

.carousel-content p {
  font-size: 18px;
  margin-bottom: 24px;
}

/* 快速导航样式 */
.quick-nav {
  padding: 60px 0;
  background: #f8f9fa;
}

.section-title {
  font-size: 28px;
  text-align: center;
  margin-bottom: 40px;
  color: #333;
}

.nav-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.nav-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nav-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.nav-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 16px;
}

.nav-card h3 {
  font-size: 20px;
  margin-bottom: 12px;
  color: #333;
}

.nav-card p {
  color: #666;
  font-size: 14px;
}

/* 最新公告样式 */
.latest-notices {
  padding: 60px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 加载状态样式 */
.loading-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #999;
  gap: 8px;
}

.loading-notice .el-icon {
  font-size: 20px;
}

/* 无公告状态样式 */
.empty-notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #999;
}

.empty-notice .el-icon {
  font-size: 48px;
  margin-bottom: 12px;
  color: #ddd;
}

.empty-notice p {
  font-size: 16px;
  margin: 0;
}

/* 热门活动加载和无数据状态样式 */
.loading-activities {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
  gap: 8px;
}

.loading-activities .el-icon {
  font-size: 24px;
}

.empty-activities {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.empty-activities .el-icon {
  font-size: 48px;
  margin-bottom: 12px;
  color: #ddd;
}

.empty-activities p {
  font-size: 16px;
  margin: 0;
}

/* 简化版公告项样式 */
.notice-item-simple {
  background: white;
  cursor: pointer;
  padding: 0;
  margin-bottom: 0;
  transition: background-color 0.2s ease;
}

.notice-item-simple:hover {
  background-color: #f9f9f9;
}

.notice-top {
  display: flex;
  align-items: center;
  padding: 15px 0;
  gap: 10px;
}

/* 左侧红色标签样式 */
.notice-tag {
  background-color: #FFCCCC;
  color: #333333;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 4px;
  white-space: nowrap;
  font-weight: normal;
  flex-shrink: 0;
}

/* 中间标题样式 */
.notice-title-simple {
  font-size: 16px;
  font-weight: bold;
  color: #333333;
  margin: 0;
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 右侧区域样式 */
.notice-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/* 时间样式 */
.notice-time-simple {
  font-size: 14px;
  color: #999999;
  white-space: nowrap;
}

/* 箭头样式 */
.notice-arrow-simple {
  font-size: 16px;
  color: #999999;
  transition: color 0.2s ease;
}

.notice-item-simple:hover .notice-arrow-simple {
  color: #666666;
}

/* 分割线样式 */
.notice-divider {
  height: 1px;
  background-color: #E0E0E0;
  margin: 0;
}

/* 热门活动样式 */
.hot-activities {
  padding: 60px 0;
  background: #f8f9fa;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.activity-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.activity-image {
  height: 200px;
  overflow: hidden;
}

.activity-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.activity-card:hover .activity-image img {
  transform: scale(1.05);
}

.activity-info {
  padding: 20px;
}

.activity-info h4 {
  font-size: 18px;
  margin-bottom: 12px;
  color: #333;
}

.activity-desc {
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.activity-meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #999;
}

.activity-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 活动评分样式 */
.activity-rating {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-count {
  font-size: 12px;
  color: #999;
}

.no-rating {
  display: flex;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }

  .carousel-content {
    margin: 0 15px;
    padding: 20px;
  }

  .carousel-content h2 {
    font-size: 24px;
  }

  .carousel-content p {
    font-size: 16px;
  }

  .section-title {
    font-size: 24px;
  }

  .nav-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .nav-card {
    padding: 20px;
  }

  .nav-icon {
    font-size: 36px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .notice-top {
    padding: 12px 0;
    gap: 8px;
  }

  .notice-tag {
    font-size: 11px;
    padding: 3px 8px;
  }

  .notice-title-simple {
    font-size: 15px;
  }

  .notice-time-simple {
    font-size: 13px;
  }

  .notice-arrow-simple {
    font-size: 14px;
  }

  .activity-grid {
    grid-template-columns: 1fr;
  }
}
</style>