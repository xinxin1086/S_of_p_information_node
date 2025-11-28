<template>
  <header class="common-header" :class="headerClass">
    <div class="header-container">
      <!-- 左侧区域 -->
      <div class="header-left">
        <!-- Logo -->
        <div class="logo" v-if="showLogo">
          <router-link to="/">
            <img v-if="logoUrl" :src="logoUrl" :alt="title" />
            <h1 v-else>{{ title }}</h1>
          </router-link>
        </div>

        <!-- 返回按钮 -->
        <el-button
          v-if="showBack"
          class="back-button"
          @click="handleBack"
          :icon="ArrowLeft"
          circle
          text
        />

        <!-- 面包屑导航 -->
        <el-breadcrumb
          v-if="showBreadcrumb && breadcrumbItems.length > 0"
          separator="/"
          class="breadcrumb"
        >
          <el-breadcrumb-item
            v-for="item in breadcrumbItems"
            :key="item.path"
            :to="item.path"
          >
            {{ item.title }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 中间区域 -->
      <div class="header-center" v-if="$slots.center">
        <slot name="center" />
      </div>

      <!-- 右侧区域 -->
      <div class="header-right">
        <!-- 搜索框 -->
        <div v-if="showSearch" class="search-wrapper">
          <el-input
            v-model="searchKeyword"
            :placeholder="searchPlaceholder"
            class="search-input"
            @keyup.enter="handleSearch"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- 工具栏 -->
        <div class="toolbar">
          <slot name="toolbar" />

          <!-- 全屏按钮 -->
          <el-tooltip content="全屏" placement="bottom" v-if="showFullscreen">
            <el-button
              class="toolbar-button"
              @click="toggleFullscreen"
              :icon="isFullscreen ? 'Aim' : 'FullScreen'"
              circle
              text
            />
          </el-tooltip>

          <!-- 主题切换 -->
          <el-tooltip content="切换主题" placement="bottom" v-if="showThemeToggle">
            <el-button
              class="toolbar-button"
              @click="toggleTheme"
              :icon="isDark ? 'Sunny' : 'Moon'"
              circle
              text
            />
          </el-tooltip>

          <!-- 通知 -->
          <el-badge :value="unreadCount" :hidden="unreadCount === 0" v-if="showNotification">
            <el-button
              class="toolbar-button"
              @click="handleNotification"
              :icon="Bell"
              circle
              text
            />
          </el-badge>

          <!-- 用户菜单 -->
          <el-dropdown
            v-if="showUserMenu && user"
            @command="handleUserMenuCommand"
            trigger="click"
          >
            <div class="user-info">
              <el-avatar :src="userAvatar" :size="32">
                {{ user.username?.charAt(0)?.toUpperCase() }}
              </el-avatar>
              <span class="username" v-if="!isMobile">{{ user.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 标签页导航 -->
    <div v-if="showTabs" class="tabs-container">
      <el-tabs
        v-model="activeTab"
        type="card"
        @tab-click="handleTabClick"
        @tab-remove="handleTabRemove"
      >
        <el-tab-pane
          v-for="tab in tabs"
          :key="tab.path"
          :label="tab.title"
          :name="tab.path"
          :closable="tab.closable"
        />
      </el-tabs>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useMainStore, useAuthStore } from '@/store'
import { formatAvatarUrl } from '@/utils/common/format'
import {
  ArrowLeft,
  Search,
  Bell,
  User,
  Setting,
  SwitchButton,
  ArrowDown
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  // 基础配置
  title: {
    type: String,
    default: '社区交流平台'
  },
  logoUrl: {
    type: String,
    default: ''
  },

  // 显示控制
  showLogo: {
    type: Boolean,
    default: true
  },
  showBack: {
    type: Boolean,
    default: false
  },
  showBreadcrumb: {
    type: Boolean,
    default: true
  },
  showSearch: {
    type: Boolean,
    default: false
  },
  showFullscreen: {
    type: Boolean,
    default: false
  },
  showThemeToggle: {
    type: Boolean,
    default: false
  },
  showNotification: {
    type: Boolean,
    default: false
  },
  showUserMenu: {
    type: Boolean,
    default: true
  },
  showTabs: {
    type: Boolean,
    default: false
  },

  // 样式配置
  fixed: {
    type: Boolean,
    default: true
  },
  transparent: {
    type: Boolean,
    default: false
  },
  bordered: {
    type: Boolean,
    default: true
  },

  // 搜索配置
  searchPlaceholder: {
    type: String,
    default: '搜索...'
  },

  // 面包屑配置
  breadcrumbItems: {
    type: Array,
    default: () => []
  },

  // 标签页配置
  tabs: {
    type: Array,
    default: () => []
  },
  activeTab: {
    type: String,
    default: ''
  },

  // 通知配置
  unreadCount: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits([
  'back',
  'search',
  'fullscreen',
  'theme-change',
  'notification',
  'user-menu-command',
  'tab-click',
  'tab-remove'
])

// Store
const mainStore = useMainStore()
const authStore = useAuthStore()

// Router
const route = useRoute()
const router = useRouter()

// 响应式数据
const searchKeyword = ref('')
const isFullscreen = ref(false)
const isDark = ref(false)

// 计算属性
const headerClass = computed(() => ({
  'is-fixed': props.fixed,
  'is-transparent': props.transparent,
  'is-bordered': props.bordered
}))

const user = computed(() => authStore.user)
const userAvatar = computed(() => formatAvatarUrl(user.value?.avatar))
const isMobile = computed(() => mainStore.isMobile)

// 方法
const handleBack = () => {
  emit('back')
  // 默认行为：返回上一页
  router.back()
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    emit('search', searchKeyword.value.trim())
  }
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
  emit('fullscreen', isFullscreen.value)
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  emit('theme-change', isDark.value)
}

const handleNotification = () => {
  emit('notification')
}

const handleUserMenuCommand = async (command) => {
  emit('user-menu-command', command)

  // 默认处理
  switch (command) {
    case 'profile':
      router.push('/user/profile')
      break
    case 'settings':
      router.push('/user/settings')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        authStore.logout()
        router.push('/login')
        ElMessage.success('已退出登录')
      } catch {
        // 用户取消
      }
      break
  }
}

const handleTabClick = (tab) => {
  emit('tab-click', tab)
}

const handleTabRemove = (tabName) => {
  emit('tab-remove', tabName)
}

// 全屏状态监听
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// 生命周期
onMounted(() => {
  if (props.showFullscreen) {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
  }

  // 初始化主题
  isDark.value = document.documentElement.classList.contains('dark')
})

onUnmounted(() => {
  if (props.showFullscreen) {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }
})
</script>

<style scoped>
.common-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.common-header.is-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.common-header.is-transparent {
  background: transparent;
  box-shadow: none;
}

.common-header.is-bordered {
  border-bottom: 1px solid #e4e7ed;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
  min-width: 0;
}

.logo {
  flex-shrink: 0;
}

.logo a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
}

.logo img {
  height: 32px;
  max-width: 120px;
  object-fit: contain;
}

.logo h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #409eff;
}

.back-button {
  flex-shrink: 0;
}

.breadcrumb {
  flex: 1;
  min-width: 0;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-shrink: 0;
}

.search-wrapper {
  width: 240px;
}

.search-input {
  width: 100%;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-button {
  font-size: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
}

.tabs-container {
  background: #fff;
  border-top: 1px solid #e4e7ed;
}

.tabs-container :deep(.el-tabs__header) {
  margin: 0;
}

.tabs-container :deep(.el-tabs__nav-wrap) {
  padding: 0 20px;
}

/* 响应式 */
@media (max-width: 768px) {
  .header-container {
    padding: 0 15px;
  }

  .breadcrumb {
    display: none;
  }

  .search-wrapper {
    width: 180px;
  }

  .username {
    display: none;
  }
}

@media (max-width: 480px) {
  .header-container {
    height: auto;
    min-height: 60px;
    padding: 10px 15px;
    flex-direction: column;
    gap: 10px;
  }

  .header-left,
  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .search-wrapper {
    width: 100%;
    max-width: 200px;
  }
}

/* 暗色主题 */
@media (prefers-color-scheme: dark) {
  .common-header {
    background: #1a1a1a;
  }

  .common-header.is-bordered {
    border-color: #3a3a3a;
  }

  .logo h1 {
    color: #409eff;
  }

  .username {
    color: #fff;
  }

  .user-info:hover {
    background-color: #2a2a2a;
  }

  .tabs-container {
    background: #1a1a1a;
    border-color: #3a3a3a;
  }
}
</style>