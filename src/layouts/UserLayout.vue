<template>
  <div class="user-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed, 'is-mobile': isMobile }">
    <!-- 顶部导航栏 -->
    <header class="user-header">
      <div class="header-left">
        <el-icon class="menu-toggle" @click="toggleSidebar">
          <Menu />
        </el-icon>
        <h1 class="logo">社区交流平台</h1>
      </div>

      <div class="header-right">
        <!-- 通知铃铛 -->
        <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
          <el-icon class="header-icon" @click="showNotifications">
            <Bell />
          </el-icon>
        </el-badge>

        <!-- 搜索框 -->
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

        <!-- 用户菜单 -->
        <el-dropdown @command="handleUserMenuCommand">
          <div class="user-avatar">
            <el-avatar :src="userAvatarCache" :alt="user?.username">
              {{ user?.username?.charAt(0)?.toUpperCase() }}
            </el-avatar>
            <span class="username">{{ user?.username }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <!-- 基础用户菜单 -->
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>
                个人资料
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <el-icon><Setting /></el-icon>
                设置
              </el-dropdown-item>

              <!-- 管理员菜单 - 严格的权限控制 -->
              <template v-if="authStore.isAuthenticated && permissions && (isAdmin || isSuperAdmin)">
                <el-dropdown-item divided command="admin">
                  <el-icon><DataAnalysis /></el-icon>
                  管理面板
                  <el-tag v-if="isSuperAdmin" size="small" type="danger" class="ml-2">超级管理员</el-tag>
                  <el-tag v-else-if="isAdmin" size="small" type="warning" class="ml-2">管理员</el-tag>
                </el-dropdown-item>
              </template>

              <!-- 权限信息显示 -->
              <el-dropdown-item v-if="currentRole" disabled class="permission-info">
                <small class="text-gray-500">当前角色: {{ currentRole }}</small>
              </el-dropdown-item>

              <!-- 退出登录 -->
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <div class="main-container">
      <!-- 侧边栏 -->
      <aside class="user-sidebar" v-show="!isMobile || !sidebarCollapsed">
        <nav class="sidebar-nav">
          <el-menu
            :default-active="activeMenu"
            :collapse="sidebarCollapsed"
            :unique-opened="true"
            router
            @select="handleMenuSelect"
          >
            <el-menu-item
              v-for="item in menuItems"
              :key="item.path"
              :index="item.path"
            >
              <el-icon>
                <component :is="getMenuIcon(item.icon)" />
              </el-icon>
              <template #title>{{ item.title }}</template>
            </el-menu-item>

            <!-- 子菜单 -->
            <el-sub-menu
              v-for="submenu in subMenuItems"
              :key="submenu.title"
              :index="submenu.path"
            >
              <template #title>
                <el-icon>
                  <component :is="getMenuIcon(submenu.icon)" />
                </el-icon>
                <span>{{ submenu.title }}</span>
              </template>

              <el-menu-item
                v-for="child in submenu.children"
                :key="child.path"
                :index="child.path"
              >
                <el-icon><Right /></el-icon>
                <template #title>{{ child.title }}</template>
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="main-content">
        <!-- 面包屑导航 -->
        <el-breadcrumb separator="/" class="breadcrumb" v-if="breadcrumb.length > 0">
          <el-breadcrumb-item
            v-for="item in breadcrumb"
            :key="item.path"
            :to="item.path"
          >
            {{ item.title }}
          </el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 页面内容 -->
        <div class="content-wrapper">
          <router-view />
        </div>
      </main>
    </div>

    <!-- 移动端遮罩层 -->
    <div
      class="mobile-overlay"
      v-show="isMobile && !sidebarCollapsed"
      @click="toggleSidebar"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useMainStore } from '@/stores'
import { useAuthStore, usePermissions } from '@/stores'
import { getUserAvatar } from '@/utils/avatarHelper'
import {
  Menu,
  Bell,
  Search,
  User,
  Setting,
  SwitchButton,
  ArrowDown,
  Right,
  House,
  ChatLineRound,
  Calendar,
  Compass,
  UserFilled,
  Tools,
  DataAnalysis
} from '@element-plus/icons-vue'

// Store
const mainStore = useMainStore()
const authStore = useAuthStore()

// 使用新的权限系统
const {
  hasPermission,
  currentRole,
  isAdmin,
  isSuperAdmin,
  userPermissions,
  permissions,
  user
} = usePermissions()


// Router
const route = useRoute()
const router = useRouter()

// 响应式数据
const searchKeyword = ref('')
const unreadCount = ref(0)

// 计算属性 - 使用缓存机制避免频繁重新计算
const userAvatarCache = ref('')

// 使用 watch 监控 user 变化，避免频繁更新头像
// 使用深度监听，但只有在关键字段变化时才更新
watch(
  () => user.value,
  (newUser, oldUser) => {
    if (!newUser) {
      userAvatarCache.value = '/images/default-avatar.png'
      return
    }

    // 提取关键字段
    const newAvatar = newUser.avatar || newUser.head_pic || newUser.profile_image
    const newUsername = newUser.username || newUser.name || newUser.nickname

    const oldAvatar = oldUser?.avatar || oldUser?.head_pic || oldUser?.profile_image
    const oldUsername = oldUser?.username || oldUser?.name || oldUser?.nickname

    // 只有当关键字段真正变化时才重新计算头像
    if (newAvatar !== oldAvatar || newUsername !== oldUsername) {
      if (newAvatar) {
        userAvatarCache.value = getUserAvatar(newUser)
      } else if (newUsername) {
        userAvatarCache.value = getUserAvatar(newUser)
      } else {
        userAvatarCache.value = '/images/default-avatar.png'
      }
    }
  },
  { deep: true, immediate: true }
)

const sidebarCollapsed = computed(() => mainStore.sidebarCollapsed)
const isMobile = computed(() => mainStore.isMobile)
const activeMenu = computed(() => route.path)

// 菜单数据 - 按照规范要求调整
const menuItems = computed(() => [
  {
    title: '返回首页',
    path: '/',
    icon: 'House'
  },
  {
    title: '用户首页',
    path: '/user/dashboard',
    icon: 'DataAnalysis'
  },
  {
    title: '活动功能',
    path: '/user/activities',
    icon: 'Calendar'
  }
])

const subMenuItems = computed(() => {
  const items = [
    {
      title: '个人管理',
      path: '/user',
      icon: 'UserFilled',
      children: [
        { title: '个人资料管理', path: '/user/profile' },
        { title: '账户设置', path: '/user/settings' }
      ]
    }
  ]

  // 更严格的管理员权限检查
  // 确保用户已登录、权限数据存在、并且角色为管理员
  const isAdminUser = authStore.isAuthenticated &&
                     permissions.value &&
                     (isAdmin.value || isSuperAdmin.value)

  if (isAdminUser) {
    const adminMenu = {
      title: '管理员功能',
      path: '/admin/dashboard',
      icon: 'Tools',
      children: [
        { title: '管理面板', path: '/admin/dashboard' }
      ]
    }

    items.push(adminMenu)
  }

  // 组织用户专属功能 - 使用权限系统判断
  if (hasPermission('ORGANIZATION')) {
    items.push({
      title: '组织用户',
      path: '/user/weave',
      icon: 'Compass',
      children: [
        { title: '控制台', path: '/user/weave/dashboard' },
        { title: '创建活动', path: '/user/weave/create-activity' },
        { title: '编辑活动', path: '/user/weave/edit-activity' },
        { title: '我的活动', path: '/user/weave/my-activities' }
      ]
    })
  }

  return items
})

// 面包屑导航
const breadcrumb = computed(() => {
  const breadcrumbs = []
  const pathArray = route.path.split('/').filter(item => item)

  let currentPath = ''
  pathArray.forEach(path => {
    currentPath += `/${path}`
    const routeItem = findRouteByPath(currentPath)
    if (routeItem) {
      breadcrumbs.push({
        title: routeItem.meta?.title || routeItem.name || path,
        path: currentPath
      })
    }
  })

  return breadcrumbs
})

// 方法
const toggleSidebar = () => {
  mainStore.toggleSidebar()
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/user/forum/search',
      query: { q: searchKeyword.value.trim() }
    })
    searchKeyword.value = ''
  }
}

const handleUserMenuCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/user/profile')
      break
    case 'settings':
      router.push('/user/settings')
      break
    case 'admin':
      router.push('/admin/dashboard')
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

const handleMenuSelect = (index) => {
  // 移动端选择菜单后关闭侧边栏
  if (isMobile.value) {
    mainStore.sidebarCollapsed = true
  }
}

const showNotifications = () => {
  ElMessage.info('通知功能开发中...')
}

const getMenuIcon = (iconName) => {
  const iconMap = {
    House,
    ChatLineRound,
    Calendar,
    Compass,
    UserFilled,
    Tools,
    DataAnalysis
  }
  return iconMap[iconName] || House
}

const findRouteByPath = (path) => {
  return route.matched.find(route => route.path === path)
}

// 检测移动端
const checkMobile = () => {
  mainStore.setMobile(window.innerWidth <= 768)
}

// 生命周期
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// 监听路由变化
watch(
  () => route.path,
  () => {
    // 路由变化时移动端自动收起侧边栏
    if (isMobile.value) {
      mainStore.sidebarCollapsed = true
    }
  }
)
</script>

<style scoped>
.user-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.user-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: relative;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.menu-toggle {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}

.menu-toggle:hover {
  color: #409eff;
}

.logo {
  margin: 0;
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.notification-badge {
  cursor: pointer;
}

.header-icon {
  font-size: 18px;
  color: #606266;
  cursor: pointer;
  transition: color 0.3s;
}

.header-icon:hover {
  color: #409eff;
}

.search-input {
  width: 200px;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.user-avatar:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #303133;
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.user-sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  transition: width 0.3s;
}

.user-sidebar.sidebar-collapsed {
  width: 64px;
}

.sidebar-nav {
  height: 100%;
  overflow-y: auto;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.breadcrumb {
  padding: 15px 20px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f5f7fa;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
}

/* 响应式 */
@media (max-width: 768px) {
  .user-header {
    padding: 0 15px;
  }

  .search-input {
    width: 150px;
  }

  .username {
    display: none;
  }

  .user-sidebar {
    position: fixed;
    top: 60px;
    left: 0;
    height: calc(100vh - 60px);
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.3s;
  }

  .user-sidebar:not(.sidebar-collapsed) {
    transform: translateX(0);
  }

  .content-wrapper {
    padding: 15px;
  }
}

/* 暗色主题 */
@media (prefers-color-scheme: dark) {
  .user-header,
  .user-sidebar {
    background: #1a1a1a;
    border-color: #3a3a3a;
  }

  .logo {
    color: #fff;
  }

  .username {
    color: #fff;
  }

  .user-avatar:hover {
    background-color: #2a2a2a;
  }

  .breadcrumb {
    background: #1a1a1a;
    border-color: #3a3a3a;
  }

  .content-wrapper {
    background: #0a0a0a;
  }
}
</style>