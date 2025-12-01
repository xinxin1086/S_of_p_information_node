<template>
  <div class="guest-layout">
    <!-- 顶部导航栏 -->
    <header class="guest-header">
      <div class="header-container">
        <div class="header-left">
          <h1 class="logo">
            <router-link to="/">社区交流平台</router-link>
          </h1>
        </div>

        <nav class="header-nav">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ active: isActiveRoute(item.path) }"
          >
            {{ item.title }}
          </router-link>
        </nav>

        <div class="header-right">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索..."
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <!-- 已登录状态：显示用户头像 -->
          <div v-if="authStore.isAuthenticated && authStore.user" class="user-avatar-section">
            <el-dropdown @command="handleUserAction" trigger="click">
              <div class="user-avatar">
                <img
                  :src="userAvatarSrc"
                  :alt="authStore.user.username || '用户头像'"
                  @error="handleAvatarError"
                />
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="dashboard">个人中心</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <!-- 未登录状态：显示登录/注册按钮 -->
          <el-button-group v-else>
            <el-button @click="handleLogin">登录</el-button>
            <el-button type="primary" @click="handleRegister">注册</el-button>
          </el-button-group>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="guest-footer">
      <div class="footer-container">
        <div class="footer-section">
          <h3>关于我们</h3>
          <p>社区交流平台是一个致力于促进渔业爱好者交流的专业平台。</p>
        </div>

        <div class="footer-section">
          <h3>快速链接</h3>
          <ul>
            <li><router-link to="/about">关于平台</router-link></li>
            <li><router-link to="/notice">公告中心</router-link></li>
            <li><router-link to="/science">科普知识</router-link></li>
            <li><router-link to="/activities">活动信息</router-link></li>
          </ul>
        </div>

        <div class="footer-section">
          <h3>联系方式</h3>
          <p>邮箱：contact@example.com</p>
          <p>电话：400-123-4567</p>
          <p>地址：某某省某某市某某区</p>
        </div>

        <div class="footer-section">
          <h3>关注我们</h3>
          <div class="social-links">
            <el-icon class="social-icon"><ChatLineRound /></el-icon>
            <el-icon class="social-icon"><Position /></el-icon>
            <el-icon class="social-icon"><Phone /></el-icon>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2024 社区交流平台. 保留所有权利.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, ChatLineRound, Position, Phone } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/modules/auth'
import { formatAvatarUrl } from '@/utils/common/format.js'

// Router
const route = useRoute()
const router = useRouter()

// Auth store
const authStore = useAuthStore()

// 组件挂载时检查认证状态
onMounted(async () => {
  // 检查本地是否有token，如果有则验证登录状态
  if (authStore.token && !authStore.isAuthenticated) {
    await authStore.checkAuth()
  }
})

// 响应式数据
const searchKeyword = ref('')

// 导航项
const navItems = [
  { title: '首页', path: '/' },
  { title: '公告', path: '/notice' },
  { title: '科普', path: '/science' },
  { title: '活动', path: '/activities' },
  { title: '关于', path: '/about' }
]

// 方法
const isActiveRoute = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    // 这里可以跳转到搜索页面，但现在访客无法搜索论坛内容
    // 可以改为搜索公告、科普、活动等公开内容
    router.push({
      path: '/search',
      query: { q: searchKeyword.value.trim() }
    })
    searchKeyword.value = ''
  }
}

// 处理登录按钮点击
const handleLogin = () => {
  // 如果用户已登录，先退出登录再跳转到登录页面
  if (authStore.isAuthenticated) {
    authStore.logout()
  }
  router.push('/login')
}

// 处理注册按钮点击
const handleRegister = () => {
  // 如果用户已登录，先退出登录再跳转到注册页面
  if (authStore.isAuthenticated) {
    authStore.logout()
  }
  router.push('/register')
}

// 计算用户头像源
const userAvatarSrc = computed(() => {
  if (!authStore.user) return '/src/assets/logo.png'

  // 使用格式化函数处理头像URL
  const formattedAvatar = formatAvatarUrl(authStore.user.avatar)

  // 如果没有头像，使用默认头像
  return formattedAvatar || '/src/assets/logo.png'
})

// 处理用户下拉菜单操作
const handleUserAction = (command) => {
  switch (command) {
    case 'dashboard':
      router.push('/user/dashboard')
      break
    case 'logout':
      authStore.logout()
      ElMessage.success('已退出登录')
      break
  }
}

// 处理头像加载错误
const handleAvatarError = (event) => {
  // 如果用户头像加载失败，使用默认头像
  event.target.src = '/src/assets/logo.png'
}
</script>

<style scoped>
.guest-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.guest-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
}

.header-left {
  flex-shrink: 0;
}

.logo {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #409eff;
}

.logo a {
  text-decoration: none;
  color: inherit;
  transition: color 0.3s;
}

.logo a:hover {
  color: #337ecc;
}

.header-nav {
  display: flex;
  gap: 30px;
  flex: 1;
  justify-content: center;
}

.nav-item {
  text-decoration: none;
  color: #606266;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s;
  position: relative;
}

.nav-item:hover {
  color: #409eff;
  background-color: #f0f9ff;
}

.nav-item.active {
  color: #409eff;
  background-color: #f0f9ff;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 3px;
  background: #409eff;
  border-radius: 2px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-shrink: 0;
}

.search-input {
  width: 200px;
}

.main-content {
  flex: 1;
  min-height: calc(100vh - 60px - 300px);
}

.guest-footer {
  background: #2c3e50;
  color: #ecf0f1;
  padding-top: 40px;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  padding: 0 20px;
}

.footer-section h3 {
  margin-bottom: 15px;
  color: #fff;
  font-size: 18px;
}

.footer-section p {
  margin-bottom: 8px;
  color: #bdc3c7;
  line-height: 1.6;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 8px;
}

.footer-section ul li a {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section ul li a:hover {
  color: #3498db;
}

.social-links {
  display: flex;
  gap: 15px;
}

.social-icon {
  font-size: 20px;
  color: #bdc3c7;
  cursor: pointer;
  transition: color 0.3s;
}

.social-icon:hover {
  color: #3498db;
}

.footer-bottom {
  max-width: 1200px;
  margin: 40px auto 0;
  padding: 20px;
  text-align: center;
  border-top: 1px solid #34495e;
}

.footer-bottom p {
  margin: 0;
  color: #95a5a6;
}

/* 用户头像样式 */
.user-avatar-section {
  display: flex;
  align-items: center;
  margin-left: 10px;
}

.user-avatar {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.user-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式 */
@media (max-width: 768px) {
  .header-container {
    padding: 0 15px;
  }

  .header-nav {
    display: none;
  }

  .search-input {
    width: 150px;
  }

  .user-avatar img {
    width: 35px;
    height: 35px;
  }

  .footer-container {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 0 15px;
  }

  .main-content {
    min-height: calc(100vh - 60px - 400px);
  }
}

@media (max-width: 480px) {
  .header-container {
    flex-direction: column;
    height: auto;
    padding: 15px;
    gap: 15px;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .search-input {
    flex: 1;
    max-width: 180px;
  }

  .user-avatar img {
    width: 32px;
    height: 32px;
  }

  .user-avatar-section {
    margin-left: 8px;
  }

  .main-content {
    min-height: calc(100vh - 120px - 400px);
  }
}

/* 暗色主题 */
@media (prefers-color-scheme: dark) {
  .guest-header {
    background: #1a1a1a;
    border-color: #3a3a3a;
  }

  .nav-item {
    color: #b0b0b0;
  }

  .nav-item:hover {
    color: #409eff;
    background-color: #2a2a2a;
  }

  .nav-item.active {
    color: #409eff;
    background-color: #2a2a2a;
  }

  .guest-footer {
    background: #0a0a0a;
  }
}
</style>