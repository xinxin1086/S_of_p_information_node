<template>
  <div class="standalone-forum">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <h1>汉江垂钓站 - 论坛交流</h1>
          <span class="brand-tagline">专业垂钓爱好者交流平台</span>
        </div>
        <div class="nav-menu">
          <router-link to="/" class="nav-item">返回首页</router-link>
          <router-link to="/notice" class="nav-item">公告</router-link>
          <router-link to="/activities" class="nav-item">活动</router-link>
          <router-link to="/science" class="nav-item">科普</router-link>
          <router-link to="/user/dashboard" class="nav-item user-center">用户中心</router-link>
        </div>
        <div class="nav-actions">
          <template v-if="!user">
            <el-button @click="$router.push('/login')" class="nav-btn">登录</el-button>
            <el-button type="primary" @click="$router.push('/register')" class="nav-btn">注册</el-button>
          </template>
          <template v-else>
            <el-button @click="$router.push('/user/dashboard')" class="nav-btn">进入用户中心</el-button>
          </template>
        </div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 搜索区域 -->
      <section class="search-section">
        <div class="search-container">
          <h2 class="search-title">探索垂钓论坛</h2>
          <p class="search-subtitle">搜索帖子、交流经验、分享技巧</p>
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              size="large"
              placeholder="搜索帖子、用户、标签..."
              class="search-input"
              @keyup.enter="performSearch"
            >
              <template #append>
                <el-button type="primary" @click="performSearch">
                  <el-icon><search /></el-icon>
                  搜索帖子
                </el-button>
              </template>
            </el-input>
          </div>
          <div class="quick-links">
            <span class="quick-link-label">热门搜索：</span>
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

      <!-- 论坛内容区域 -->
      <section class="forum-section">
        <div class="forum-container">
          <!-- 热门讨论区 -->
          <div class="content-card hot-discussions">
            <div class="card-header">
              <h3 class="card-title">
                <el-icon><chat-line-round /></el-icon>
                热门讨论
              </h3>
              <el-button type="primary" @click="createPost">
                <el-icon><edit /></el-icon>
                发布帖子
              </el-button>
            </div>
            <div v-loading="discussionsLoading" class="card-content">
              <div v-if="hotDiscussions.length === 0" class="empty-state">
                <el-empty description="暂无热门讨论" />
              </div>
              <div v-else class="discussion-list">
                <div
                  v-for="post in hotDiscussions"
                  :key="post.id"
                  class="discussion-item"
                  @click="viewPost(post.id)"
                >
                  <div class="post-stats">
                    <div class="stat-item">
                      <span class="stat-number">{{ post.replyCount }}</span>
                      <span class="stat-label">回复</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-number">{{ post.viewCount }}</span>
                      <span class="stat-label">浏览</span>
                    </div>
                  </div>
                  <div class="post-info">
                    <h4 class="post-title">{{ post.title }}</h4>
                    <p class="post-summary">{{ post.summary }}</p>
                    <div class="post-meta">
                      <el-tag size="small" type="primary">{{ post.category }}</el-tag>
                      <div class="tags">
                        <el-tag
                          v-for="tag in post.tags"
                          :key="tag"
                          size="small"
                          @click.stop="searchTag(tag)"
                          class="tag-item"
                        >
                          {{ tag }}
                        </el-tag>
                      </div>
                      <span class="post-time">{{ formatTime(post.createdAt) }}</span>
                    </div>
                  </div>
                  <div class="post-author">
                    <el-avatar :src="post.author.avatar" :size="40">
                      {{ post.author.username?.charAt(0) || 'U' }}
                    </el-avatar>
                    <span class="author-name">{{ post.author.username }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 最新帖子区 -->
          <div class="content-card latest-posts">
            <div class="card-header">
              <h3 class="card-title">
                <el-icon><document /></el-icon>
                最新帖子
              </h3>
              <el-button @click="refreshLatestPosts" :loading="latestPostsLoading">
                <el-icon><refresh /></el-icon>
                刷新
              </el-button>
            </div>
            <div v-loading="latestPostsLoading" class="card-content">
              <div v-if="latestPosts.length === 0" class="empty-state">
                <el-empty description="暂无最新帖子" />
              </div>
              <div v-else class="post-list">
                <div
                  v-for="post in latestPosts"
                  :key="post.id"
                  class="post-item"
                  @click="viewPost(post.id)"
                >
                  <div class="post-content">
                    <h4 class="post-title">{{ post.title }}</h4>
                    <p class="post-excerpt">{{ post.excerpt }}</p>
                    <div class="post-meta-info">
                      <span class="category-tag">{{ post.category }}</span>
                      <span class="post-stats">
                        <el-icon><view /></el-icon>{{ post.viewCount }}
                        <el-icon><chat-dot-round /></el-icon>{{ post.replyCount }}
                      </span>
                      <span class="post-time">{{ formatTime(post.createdAt) }}</span>
                    </div>
                  </div>
                  <div class="post-author-info">
                    <el-avatar :src="post.author.avatar" :size="32">
                      {{ post.author.username?.charAt(0) || 'U' }}
                    </el-avatar>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 热门标签云 -->
          <div class="content-card tag-cloud">
            <div class="card-header">
              <h3 class="card-title">
                <el-icon><collection-tag /></el-icon>
                热门标签
              </h3>
              <el-button @click="refreshTags" :loading="tagsLoading">
                <el-icon><refresh /></el-icon>
              </el-button>
            </div>
            <div v-loading="tagsLoading" class="card-content">
              <div v-if="popularTags.length === 0" class="empty-state">
                <el-empty description="暂无标签数据" />
              </div>
              <div v-else class="tag-cloud-content">
                <el-tag
                  v-for="tag in popularTags"
                  :key="tag.name"
                  :size="getTagSize(tag.count)"
                  :type="getTagType(tag.count)"
                  @click="searchTag(tag.name)"
                  class="cloud-tag"
                >
                  {{ tag.name }} ({{ tag.count }})
                </el-tag>
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
          <p>专业的垂钓交流论坛平台</p>
          <div class="footer-links">
            <router-link to="/about">关于我们</router-link>
            <router-link to="/help">帮助中心</router-link>
            <router-link to="/contact">联系我们</router-link>
          </div>
        </div>
        <div class="footer-section">
          <h4>论坛功能</h4>
          <div class="footer-links">
            <router-link to="/forum">论坛首页</router-link>
            <router-link to="/user/forum/search">搜索帖子</router-link>
            <router-link to="/user/forum/create">发布帖子</router-link>
          </div>
        </div>
        <div class="footer-section">
          <h4>用户服务</h4>
          <div class="footer-links">
            <router-link to="/login">用户登录</router-link>
            <router-link to="/register">用户注册</router-link>
            <router-link to="/user/dashboard">用户中心</router-link>
          </div>
        </div>
        <div class="footer-section">
          <h4>联系我们</h4>
          <p>电话：400-123-4567</p>
          <p>邮箱：forum@hanjiangfishing.com</p>
          <p>地址：汉江垂钓基地</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 汉江垂钓站论坛. 保留所有权利.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Search, ChatLineRound, Document, Edit, Refresh,
  View, ChatDotRound, CollectionTag
} from '@element-plus/icons-vue'
import { useMainStore } from '@/store'
import dayjs from 'dayjs'

defineOptions({ name: "StandaloneForum" })

const router = useRouter()
const mainStore = useMainStore()

// 响应式数据
const user = computed(() => mainStore.user)
const searchKeyword = ref('')
const discussionsLoading = ref(false)
const latestPostsLoading = ref(false)
const tagsLoading = ref(false)

const hotDiscussions = ref([])
const latestPosts = ref([])
const popularTags = ref([])

// 快速搜索标签
const quickSearchTags = ref([
  '路亚技巧', '台钓方法', '饵料配方', '钓鱼装备', '钓点推荐'
])

// 方法
const fetchHotDiscussions = async () => {
  discussionsLoading.value = true
  try {
    // 模拟API调用
    setTimeout(() => {
      hotDiscussions.value = [
        {
          id: 1,
          title: '春季野钓技巧分享，爆护经验谈',
          summary: '今天天气不错，温度适宜，微风不燥，正是春钓的大好时光。分享一下今天的野钓经历和技巧，希望对大家有帮助。',
          category: '钓技交流',
          tags: ['春季钓鱼', '野钓技巧', '爆护经验'],
          replyCount: 45,
          viewCount: 1234,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          author: {
            username: '钓鱼达人',
            avatar: ''
          }
        },
        {
          id: 2,
          title: '新手入门：如何选择合适的鱼竿和渔线',
          summary: '很多刚接触钓鱼的朋友都在问，该如何选择合适的装备。今天就来详细讲解一下新手如何选择鱼竿和渔线搭配。',
          category: '装备讨论',
          tags: ['新手入门', '装备选择', '鱼竿', '渔线'],
          replyCount: 23,
          viewCount: 856,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
          author: {
            username: '老司机',
            avatar: ''
          }
        },
        {
          id: 3,
          title: '汉江流域钓点推荐，这几个地方鱼情不错',
          summary: '在汉江流域钓鱼多年，总结了一些不错的钓点推荐给大家。这些地方交通便利，鱼情稳定，适合各种垂钓方式。',
          category: '钓点分享',
          tags: ['汉江钓点', '钓点推荐', '野钓地点'],
          replyCount: 67,
          viewCount: 2341,
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
          author: {
            username: '江钓客',
            avatar: ''
          }
        }
      ]
      discussionsLoading.value = false
    }, 800)
  } catch (error) {
    console.error('获取热门讨论失败:', error)
    discussionsLoading.value = false
  }
}

const fetchLatestPosts = async () => {
  latestPostsLoading.value = true
  try {
    // 模拟API调用
    setTimeout(() => {
      latestPosts.value = [
        {
          id: 4,
          title: '昨天在水库钓到一条大鲤鱼，分享一下喜悦',
          excerpt: '昨天下午去水库钓鱼，没想到钓到一条8斤重的大鲤鱼，太兴奋了！',
          category: '钓鱼分享',
          viewCount: 156,
          replyCount: 12,
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
          author: {
            username: '水库钓手',
            avatar: ''
          }
        },
        {
          id: 5,
          title: '自制玉米饵料配方，效果很不错',
          excerpt: '经过多次试验，终于调配出一款效果不错的玉米饵料，今天分享给大家。',
          category: '饵料配方',
          viewCount: 98,
          replyCount: 8,
          createdAt: new Date(Date.now() - 45 * 60 * 1000),
          author: {
            username: '饵料专家',
            avatar: ''
          }
        },
        {
          id: 6,
          title: '请教各位大师，夜钓需要注意什么？',
          excerpt: '最近想尝试夜钓，但是没有经验，想请教一下有经验的老师傅们需要注意什么。',
          category: '求助问答',
          viewCount: 234,
          replyCount: 19,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          author: {
            username: '夜钓新手',
            avatar: ''
          }
        }
      ]
      latestPostsLoading.value = false
    }, 600)
  } catch (error) {
    console.error('获取最新帖子失败:', error)
    latestPostsLoading.value = false
  }
}

const fetchPopularTags = async () => {
  tagsLoading.value = true
  try {
    // 模拟API调用
    setTimeout(() => {
      popularTags.value = [
        { name: '路亚', count: 156 },
        { name: '台钓', count: 142 },
        { name: '野钓', count: 128 },
        { name: '黑坑', count: 95 },
        { name: '海钓', count: 87 },
        { name: '冰钓', count: 76 },
        { name: '夜钓', count: 68 },
        { name: '抛竿', count: 54 },
        { name: '手竿', count: 49 },
        { name: '饵料', count: 123 },
        { name: '钓技', count: 112 },
        { name: '装备', count: 98 }
      ]
      tagsLoading.value = false
    }, 400)
  } catch (error) {
    console.error('获取热门标签失败:', error)
    tagsLoading.value = false
  }
}

// 搜索功能
const performSearch = () => {
  if (searchKeyword.value.trim()) {
    if (user.value) {
      router.push(`/user/forum/search?q=${encodeURIComponent(searchKeyword.value)}`)
    } else {
      ElMessage.warning('请先登录后再搜索帖子')
      router.push('/login')
    }
  } else {
    ElMessage.warning('请输入搜索关键词')
  }
}

const quickSearch = (tag) => {
  searchKeyword.value = tag
  performSearch()
}

const searchTag = (tag) => {
  if (user.value) {
    router.push(`/user/forum/search?tag=${encodeURIComponent(tag)}`)
  } else {
    ElMessage.warning('请先登录后再搜索帖子')
    router.push('/login')
  }
}

const createPost = () => {
  if (user.value) {
    router.push('/user/forum/create')
  } else {
    ElMessage.warning('请先登录后再发布帖子')
    router.push('/login')
  }
}

const viewPost = (postId) => {
  if (user.value) {
    router.push(`/user/forum/post/${postId}`)
  } else {
    ElMessage.warning('请先登录后查看帖子')
    router.push('/login')
  }
}

// 刷新功能
const refreshLatestPosts = () => {
  fetchLatestPosts()
}

const refreshTags = () => {
  fetchPopularTags()
}

// 工具函数
const getTagSize = (count) => {
  if (count >= 150) return 'large'
  if (count >= 100) return 'default'
  if (count >= 50) return 'small'
  return 'small'
}

const getTagType = (count) => {
  if (count >= 150) return 'danger'
  if (count >= 100) return 'warning'
  if (count >= 50) return 'primary'
  return 'info'
}

const formatTime = (date) => {
  return dayjs(date).format('MM-DD HH:mm')
}

// 生命周期
onMounted(() => {
  fetchHotDiscussions()
  fetchLatestPosts()
  fetchPopularTags()
})
</script>

<style scoped>
.standalone-forum {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  height: 80px;
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
.nav-item.router-link-active {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.user-center {
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

/* 主要内容 */
.main-content {
  flex: 1;
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

/* 论坛内容区域 */
.forum-section {
  padding: 3rem 0;
}

.forum-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  margin-bottom: 2rem;
}

.content-card:hover {
  transform: translateY(-2px);
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

.card-content {
  padding: 1.5rem;
  min-height: 200px;
}

/* 热门讨论 */
.discussion-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.discussion-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.discussion-item:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.post-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  min-width: 60px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.2rem;
  font-weight: 600;
  color: #3b82f6;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
}

.post-info {
  flex: 1;
  min-width: 0;
}

.post-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
}

.post-summary {
  margin: 0 0 1rem 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag-item {
  cursor: pointer;
  transition: all 0.2s;
}

.tag-item:hover {
  transform: scale(1.05);
}

.post-time {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-left: auto;
}

.post-author {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 80px;
}

.author-name {
  font-size: 0.85rem;
  color: #64748b;
  text-align: center;
}

/* 最新帖子 */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.post-item:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.post-content {
  flex: 1;
  min-width: 0;
}

.post-excerpt {
  margin: 0.5rem 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-meta-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.85rem;
}

.category-tag {
  background: #3b82f6;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.post-stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
}

.post-author-info {
  flex-shrink: 0;
}

/* 标签云 */
.tag-cloud-content {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.cloud-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.cloud-tag:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  max-width: 1400px;
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
@media (max-width: 1024px) {
  .forum-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .hot-discussions {
    order: 1;
  }

  .tag-cloud {
    order: 2;
  }

  .latest-posts {
    order: 3;
  }
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    height: auto;
    padding: 1rem 20px;
    gap: 1rem;
  }

  .nav-menu {
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .search-title {
    font-size: 2rem;
  }

  .search-subtitle {
    font-size: 1rem;
  }

  .forum-container {
    padding: 0 15px;
  }

  .discussion-item {
    flex-direction: column;
    text-align: center;
  }

  .post-stats {
    flex-direction: row;
    justify-content: center;
    gap: 1.5rem;
  }

  .post-author {
    flex-direction: row;
    gap: 0.5rem;
  }

  .footer-container {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .search-container {
    padding: 0 15px;
  }

  .quick-links {
    flex-direction: column;
    gap: 0.5rem;
  }

  .discussion-item,
  .post-item {
    padding: 1rem;
  }

  .card-content {
    padding: 1rem;
  }
}
</style>