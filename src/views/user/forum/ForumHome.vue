<template>
  <div class="forum-home">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <h1>汉江垂钓站</h1>
          <span class="brand-tagline">专业垂钓资讯平台</span>
        </div>
        <div class="nav-menu">
          <router-link to="/" class="nav-item active">首页</router-link>
          <router-link to="/notice" class="nav-item">公告</router-link>
          <router-link to="/activities" class="nav-item">活动</router-link>
          <router-link to="/science" class="nav-item">科普</router-link>
        </div>
        <div class="nav-actions">
          <template v-if="!user">
            <el-button @click="$router.push('/login')" class="nav-btn">登录</el-button>
            <el-button type="primary" @click="$router.push('/register')" class="nav-btn">注册</el-button>
          </template>
          <template v-else>
            <el-dropdown @command="handleUserCommand">
              <div class="user-menu">
                <el-avatar :src="user.avatar" :size="32">
                  {{ user.username?.charAt(0) || 'U' }}
                </el-avatar>
                <span class="username">{{ user.username }}</span>
                <el-icon><arrow-down /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                  <el-dropdown-item command="settings">账户设置</el-dropdown-item>
                  <el-dropdown-item command="myBookings" v-if="user.role !== 'fisher'">我的预约</el-dropdown-item>
                  <el-dropdown-item command="fisherDashboard" v-if="user.role === 'fisher'">控制台</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 搜索区域 -->
      <section class="search-section">
        <div class="search-container">
          <h2 class="search-title">探索垂钓世界</h2>
          <p class="search-subtitle">搜索公告、活动、科普知识</p>
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              size="large"
              placeholder="输入关键词搜索..."
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
          <div class="quick-links">
            <span class="quick-link-label">快速搜索：</span>
            <el-tag
              v-for="tag in quickSearchTags"
              :key="tag"
              @click="quickSearch(tag)"
              class="quick-tag"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </section>

      <!-- 内容区域 -->
      <section class="content-section">
        <div class="content-container">
          <!-- 公告区域 -->
          <div class="content-card notice-card">
            <div class="card-header">
              <h3 class="card-title">
                <el-icon><bell /></el-icon>
                最新公告
              </h3>
              <router-link to="/notice" class="more-link">
                查看更多 <el-icon><arrow-right /></el-icon>
              </router-link>
            </div>
            <div v-loading="noticesLoading" class="card-content">
              <div v-if="notices.length === 0" class="empty-state">
                <el-empty description="暂无公告" />
              </div>
              <div v-else class="notice-list">
                <div
                  v-for="notice in notices"
                  :key="notice.id"
                  class="notice-item"
                  @click="$router.push(`/notice/${notice.id}`)"
                >
                  <div class="notice-icon">
                    <el-icon><document /></el-icon>
                  </div>
                  <div class="notice-info">
                    <h4 class="notice-title">{{ notice.title }}</h4>
                    <p class="notice-summary">{{ notice.summary }}</p>
                    <div class="notice-meta">
                      <span class="notice-type">{{ getNoticeType(notice.type) }}</span>
                      <span class="notice-time">{{ formatTime(notice.createdAt) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 活动区域 -->
          <div class="content-card activity-card">
            <div class="card-header">
              <h3 class="card-title">
                <el-icon><calendar /></el-icon>
                精选活动
              </h3>
              <router-link to="/activities" class="more-link">
                查看更多 <el-icon><arrow-right /></el-icon>
              </router-link>
            </div>
            <div v-loading="activitiesLoading" class="card-content">
              <div v-if="activities.length === 0" class="empty-state">
                <el-empty description="暂无活动" />
              </div>
              <div v-else class="activity-grid">
                <div
                  v-for="activity in activities"
                  :key="activity.id"
                  class="activity-item"
                  @click="$router.push(`/activities/${activity.id}`)"
                >
                  <div class="activity-image">
                    <img :src="activity.image || '/default-activity.jpg'" :alt="activity.title" />
                    <div class="activity-status" :class="activity.status">
                      {{ getStatusText(activity.status) }}
                    </div>
                  </div>
                  <div class="activity-info">
                    <h4 class="activity-title">{{ activity.title }}</h4>
                    <div class="activity-meta">
                      <span><el-icon><location /></el-icon> {{ activity.location }}</span>
                      <span><el-icon><calendar /></el-icon> {{ formatDate(activity.date) }}</span>
                    </div>
                    <div class="activity-price">
                      <span class="price">¥{{ activity.price }}</span>
                      <span class="slots">{{ activity.bookedCount }}/{{ activity.maxParticipants }}人</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 科普知识区域 -->
          <div class="content-card science-card">
            <div class="card-header">
              <h3 class="card-title">
                <el-icon><reading /></el-icon>
                科普知识
              </h3>
              <router-link to="/science" class="more-link">
                查看更多 <el-icon><arrow-right /></el-icon>
              </router-link>
            </div>
            <div v-loading="scienceLoading" class="card-content">
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
                  </div>
                  <div class="article-info">
                    <h4 class="article-title">{{ article.title }}</h4>
                    <p class="article-summary">{{ article.summary }}</p>
                    <div class="article-meta">
                      <span class="article-category">{{ getCategoryText(article.category) }}</span>
                      <span class="article-time">{{ formatDate(article.publishDate) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 页尾 -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-section">
          <h4>汉江垂钓站</h4>
          <p>专业的垂钓资讯服务平台</p>
          <div class="footer-links">
            <router-link to="/about">关于我们</router-link>
            <router-link to="/contact">联系我们</router-link>
          </div>
        </div>
        <div class="footer-section">
          <h4>快速链接</h4>
          <div class="footer-links">
            <router-link to="/notice">公告通知</router-link>
            <router-link to="/activities">活动预约</router-link>
            <router-link to="/science">科普知识</router-link>
          </div>
        </div>
        <div class="footer-section">
          <h4>用户服务</h4>
          <div class="footer-links">
            <router-link to="/login">用户登录</router-link>
            <router-link to="/register">用户注册</router-link>
            <router-link to="/help">帮助中心</router-link>
          </div>
        </div>
        <div class="footer-section">
          <h4>联系我们</h4>
          <p>电话：400-123-4567</p>
          <p>邮箱：info@hanjiangfishing.com</p>
          <p>地址：汉江垂钓基地</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 汉江垂钓站. 保留所有权利.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowDown, Search, Bell, Document, Calendar, Location, Reading, ArrowRight
} from '@element-plus/icons-vue'
import { useMainStore } from '@/store'
import { useNoticeStore } from '@/store/modules/notice'
import { useActivityStore } from '@/store/modules/activity'
import { useScienceStore } from '@/store/modules/science'
import dayjs from 'dayjs'

defineOptions({ name: "ForumHome" })

const router = useRouter()
const mainStore = useMainStore()
const noticeStore = useNoticeStore()
const activityStore = useActivityStore()
const scienceStore = useScienceStore()

// 响应式数据
const user = computed(() => mainStore.user)
const searchKeyword = ref('')
const noticesLoading = ref(false)
const activitiesLoading = ref(false)
const scienceLoading = ref(false)

const notices = ref([])
const activities = ref([])
const articles = ref([])

// 快速搜索标签
const quickSearchTags = ref([
  '钓鱼技巧', '活动预约', '科普知识', '公告通知'
])

// 方法
const fetchNotices = async () => {
  noticesLoading.value = true
  try {
    // 模拟API调用
    setTimeout(() => {
      notices.value = [
        {
          id: 1,
          title: '关于汉江垂钓站升级维护的通知',
          summary: '系统将于本周末进行升级维护，预计维护时间6小时，期间网站可能无法正常访问。',
          type: 'system',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: 2,
          title: '春节钓鱼活动报名开始啦！',
          summary: '春节期间我们将举办大型钓鱼比赛活动，欢迎各位钓鱼爱好者报名参加，丰厚奖品等你来拿！',
          type: 'activity',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          id: 3,
          title: '新功能上线：活动预约系统',
          summary: '我们正式上线了活动预约系统，用户可以在线预约各种钓鱼活动，更加便捷的服务体验。',
          type: 'feature',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
          id: 4,
          title: '冬季钓鱼安全注意事项',
          summary: '冬季钓鱼需要注意保暖和安全，特别是冰钓活动，请务必做好安全防护措施。',
          type: 'safety',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        }
      ]
      noticesLoading.value = false
    }, 500)
  } catch (error) {
    console.error('获取公告失败:', error)
    noticesLoading.value = false
  }
}

const fetchActivities = async () => {
  activitiesLoading.value = true
  try {
    // 模拟API调用
    setTimeout(() => {
      activities.value = [
        {
          id: 1,
          title: '汉江春季钓鱼比赛',
          location: '汉江上游钓鱼基地',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          price: 128,
          maxParticipants: 50,
          bookedCount: 32,
          status: 'ongoing',
          image: ''
        },
        {
          id: 2,
          title: '路亚技巧培训课程',
          location: '汉江体育中心',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          price: 298,
          maxParticipants: 20,
          bookedCount: 18,
          status: 'ongoing',
          image: ''
        },
        {
          id: 3,
          title: '亲子钓鱼体验活动',
          location: '汉江休闲垂钓园',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          price: 88,
          maxParticipants: 30,
          bookedCount: 12,
          status: 'ongoing',
          image: ''
        }
      ]
      activitiesLoading.value = false
    }, 800)
  } catch (error) {
    console.error('获取活动失败:', error)
    activitiesLoading.value = false
  }
}

const fetchScienceArticles = async () => {
  scienceLoading.value = true
  try {
    // 模拟API调用
    setTimeout(() => {
      articles.value = [
        {
          id: 1,
          title: '春季钓鱼的最佳时间和技巧',
          summary: '春季是钓鱼的黄金季节，鱼类经过冬天的休养，开始活跃觅食。本文将详细介绍春季钓鱼的最佳时间、钓点选择、饵料搭配等实用技巧。',
          coverImage: '',
          category: 'technique',
          publishDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: 2,
          title: '如何选择适合自己的路亚竿',
          summary: '路亚竿的选择直接影响到钓鱼的效果和体验。本文从硬度、调性、长度、材质等多个方面，为大家详细介绍如何选择适合自己的路亚竿。',
          coverImage: '',
          category: 'equipment',
          publishDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          id: 3,
          title: '长江流域常见淡水鱼种识别指南',
          summary: '长江流域鱼类资源丰富，本文介绍了常见的淡水鱼种特征、生活习性、垂钓方法等知识，帮助钓鱼爱好者更好地了解和识别各种鱼类。',
          coverImage: '',
          category: 'species',
          publishDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      ]
      scienceLoading.value = false
    }, 600)
  } catch (error) {
    console.error('获取科普文章失败:', error)
    scienceLoading.value = false
  }
}

// 搜索功能
const performSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchKeyword.value)}`)
  } else {
    ElMessage.warning('请输入搜索关键词')
  }
}

const quickSearch = (tag) => {
  searchKeyword.value = tag
  performSearch()
}

// 用户操作
const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/user/profile')
      break
    case 'settings':
      router.push('/user/settings')
      break
    case 'myBookings':
      router.push('/user/bookings')
      break
    case 'fisherDashboard':
      router.push('/user/fisher/dashboard')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        mainStore.clearUser()
        ElMessage.success('已退出登录')
        router.push('/')
      }).catch(() => {})
      break
  }
}

// 工具函数
const getNoticeType = (type) => {
  const typeMap = {
    system: '系统公告',
    activity: '活动通知',
    feature: '功能更新',
    safety: '安全提醒'
  }
  return typeMap[type] || '公告'
}

const getStatusText = (status) => {
  const statusMap = {
    upcoming: '即将开始',
    ongoing: '报名中',
    completed: '已结束',
    cancelled: '已取消'
  }
  return statusMap[status] || '未知'
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

const formatTime = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const formatDate = (date) => {
  return dayjs(date).format('MM-DD')
}

// 生命周期
onMounted(() => {
  fetchNotices()
  fetchActivities()
  fetchScienceArticles()
})
</script>

<style scoped>
.forum-home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 导航栏 */
.navbar {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  height: 70px;
  justify-content: space-between;
}

.nav-brand {
  display: flex;
  flex-direction: column;
}

.nav-brand h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.brand-tagline {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-top: 2px;
}

.nav-menu {
  display: flex;
  gap: 2rem;
}

.nav-item {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s;
}

.nav-item:hover,
.nav-item.active {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.user-menu:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.username {
  font-weight: 500;
}

/* 主要内容 */
.main-content {
  flex: 1;
  background-color: #f8fafc;
}

/* 搜索区域 */
.search-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 0;
  text-align: center;
}

.search-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-title {
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.search-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 2rem;
}

.search-box {
  margin-bottom: 1.5rem;
}

.search-input {
  max-width: 600px;
  margin: 0 auto;
  display: block;
}

.quick-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.quick-link-label {
  font-size: 0.95rem;
  opacity: 0.9;
}

.quick-tag {
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  transition: all 0.3s;
}

.quick-tag:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* 内容区域 */
.content-section {
  padding: 3rem 0;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.content-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
}

.more-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: color 0.3s;
}

.more-link:hover {
  color: #2563eb;
}

.card-content {
  padding: 1.5rem;
  min-height: 300px;
}

/* 公告列表 */
.notice-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notice-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.notice-item:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.notice-icon {
  display: flex;
  align-items: flex-start;
  color: #3b82f6;
  margin-top: 0.25rem;
}

.notice-info {
  flex: 1;
}

.notice-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
}

.notice-summary {
  margin: 0 0 0.75rem 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notice-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.notice-type {
  background: #3b82f6;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.notice-time {
  color: #94a3b8;
}

/* 活动网格 */
.activity-grid {
  display: grid;
  gap: 1rem;
}

.activity-item {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.3s;
}

.activity-item:hover {
  border-color: #cbd5e1;
  background: #e2e8f0;
}

.activity-image {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.activity-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-status {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
}

.activity-status.ongoing {
  background-color: #10b981;
}

.activity-info {
  padding: 1rem;
}

.activity-title {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
}

.activity-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  color: #64748b;
}

.activity-meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.activity-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-weight: 600;
  color: #ef4444;
  font-size: 1.1rem;
}

.slots {
  color: #64748b;
  font-size: 0.85rem;
}

/* 科普文章列表 */
.article-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.article-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.article-item:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.article-image {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-info {
  flex: 1;
  min-width: 0;
}

.article-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-summary {
  margin: 0 0 0.75rem 0;
  color: #64748b;
  font-size: 0.85rem;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}

.article-category {
  background: #8b5cf6;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.article-time {
  color: #94a3b8;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 3rem 0;
}

/* 页尾 */
.footer {
  background: #1e293b;
  color: white;
  padding: 3rem 0 1rem;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #f1f5f9;
}

.footer-section p {
  margin: 0 0 0.5rem 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-links a {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #f1f5f9;
}

.footer-bottom {
  text-align: center;
  padding: 1.5rem 20px 0;
  border-top: 1px solid #334155;
}

.footer-bottom p {
  margin: 0;
  color: #64748b;
  font-size: 0.85rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    height: auto;
    padding: 1rem 20px;
    gap: 1rem;
  }

  .nav-menu {
    gap: 1rem;
  }

  .search-title {
    font-size: 2rem;
  }

  .search-subtitle {
    font-size: 1rem;
  }

  .content-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .footer-container {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .article-item {
    flex-direction: column;
    text-align: center;
  }

  .article-image {
    width: 100%;
    height: 200px;
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .search-container {
    padding: 0 15px;
  }

  .content-container {
    padding: 0 15px;
  }

  .quick-links {
    flex-direction: column;
    gap: 0.5rem;
  }

  .notice-item {
    flex-direction: column;
    text-align: center;
  }

  .activity-meta {
    font-size: 0.8rem;
  }
}
</style>