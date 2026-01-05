<template>
  <div class="admin-main-content">
    <!-- 欢迎信息区域 -->
    <div class="welcome-section">
      <div class="welcome-header">
        <h1 class="welcome-title">欢迎回来，{{ adminUsername }}！</h1>
        <div class="current-time">
          <span class="time-label">当前时间：</span>
          <span class="time-value">{{ currentTime }}</span>
        </div>
      </div>

      <div class="welcome-description">
        <p>管理后台控制系统，提供系统管理和数据监控功能</p>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ latestNotices.length }}</div>
            <div class="stat-label">最新公告</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon users">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalUsers }}</div>
            <div class="stat-label">用户总数</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon content">
            <el-icon><Folder /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalContent }}</div>
            <div class="stat-label">内容总数</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon activity">
            <el-icon><DataAnalysis /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalActivities }}</div>
            <div class="stat-label">活动总数</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速操作区域 -->
    <div class="quick-actions-section">
      <div class="section-header">
        <h2 class="section-title">
          快速操作
          <el-tag v-if="isSuperAdmin" size="small" type="danger" class="ml-2">超级管理员</el-tag>
          <el-tag v-else-if="isAdmin" size="small" type="warning" class="ml-2">管理员</el-tag>
        </h2>
        <div class="current-role">
          <span class="text-gray-600">当前角色: </span>
          <span class="font-medium">{{ currentRole || '未知' }}</span>
        </div>
      </div>

      <div class="quick-actions-grid">
        <!-- 用户管理 -->
        <div
          v-if="hasPermission('ADMIN')"
          class="quick-action-card"
          @click="goToUserManagement"
        >
          <div class="action-icon user-management">
            <el-icon><User /></el-icon>
          </div>
          <div class="action-content">
            <h3 class="action-title">用户管理</h3>
            <p class="action-description">管理系统用户和权限</p>
          </div>
        </div>

        <!-- 内容管理 -->
        <div
          v-if="hasPermission('ADMIN')"
          class="quick-action-card"
          @click="goToContentManagement"
        >
          <div class="action-icon content-management">
            <el-icon><Folder /></el-icon>
          </div>
          <div class="action-content">
            <h3 class="action-title">内容管理</h3>
            <p class="action-description">管理公告和科普内容</p>
          </div>
        </div>

        <!-- 活动管理 -->
        <div
          v-if="hasPermission('ADMIN')"
          class="quick-action-card"
          @click="goToActivityManagement"
        >
          <div class="action-icon activity-management">
            <el-icon><DataAnalysis /></el-icon>
          </div>
          <div class="action-content">
            <h3 class="action-title">活动管理</h3>
            <p class="action-description">管理活动和讨论内容</p>
          </div>
        </div>

        </div>
    </div>

    <!-- 最新公告列表 -->
    <div class="notices-section">
      <div class="section-header">
        <h2 class="section-title">最新公告</h2>
        <el-button type="primary" size="small" @click="goToNotices">
          查看全部
        </el-button>
      </div>

      <div class="notices-list">
        <div v-if="loading" class="loading">
          <el-icon class="is-loading"><Loading /></el-icon>
        </div>

        <div v-else-if="latestNotices.length === 0" class="empty-notices">
          <el-empty description="暂无公告" />
        </div>

        <div v-else class="notices-items">
          <div
            v-for="notice in latestNotices"
            :key="notice.id"
            class="notice-item"
            @click="goToNoticeDetail(notice.id)"
          >
            <div class="notice-info">
              <h4 class="notice-title">{{ notice.title }}</h4>
              <div class="notice-meta">
                <span class="notice-type">
                  <el-tag :type="getNoticeTypeTag(notice.type)" size="small">
                    {{ getNoticeTypeText(notice.type) }}
                  </el-tag>
                </span>
                <span class="notice-time">{{ formatDate(notice.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Document,
  User,
  Folder,
  DataAnalysis,
  Loading
} from '@element-plus/icons-vue'
import { useAuthStore, usePermissions } from '@/stores'
import {
  fetchNoticeList,
  getNoticeTypeFromText,
  getNoticeTypeTag,
  getNoticeTypeText,
  formatDate,
  type NoticeItem
} from '@/utils/notice'

const router = useRouter()
const authStore = useAuthStore()

// 使用新的权限系统
const {
  hasPermission,
  currentRole,
  isAdmin,
  isSuperAdmin,
  userPermissions
} = usePermissions()

// 响应式数据
const loading = ref(false)
const latestNotices = ref<NoticeItem[]>([])
const currentTime = ref('')
const totalUsers = ref(0)
const totalContent = ref(0)
const totalActivities = ref(0)

// 计算属性
const adminUsername = computed(() => {
  const user = authStore.user
  return user?.nickname || user?.username || user?.account || '管理员'
})

// 更新当前时间
const updateCurrentTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

// 获取最新公告
const fetchLatestNotices = async () => {
  loading.value = true
  try {
    const result = await fetchNoticeList(1, 10)
    latestNotices.value = result.items.slice(0, 10) // 只取前10条
  } catch (error) {
    console.error('获取最新公告失败:', error)
    ElMessage.error('获取最新公告失败')
  } finally {
    loading.value = false
  }
}

// 模拟获取统计数据
const fetchStats = () => {
  // 这里应该调用真实的API
  totalUsers.value = 156
  totalContent.value = 89
  totalActivities.value = 42
}

// 页面跳转方法
const goToNotices = () => {
  router.push('/admin/content/notice')
}

const goToNoticeDetail = (id: number | string) => {
  router.push(`/admin/content/notice-detail/${id}`)
}

// 统一的权限检查辅助函数
const checkAdminPermission = (): boolean => {
  if (!hasPermission('ADMIN')) {
    ElMessage.warning('您需要管理员权限才能执行此操作')
    return false
  }
  return true
}

// 快速操作方法 - 优化后的权限检查
const goToUserManagement = () => {
  if (checkAdminPermission()) {
    router.push('/admin/user/admin')
  }
}

const goToContentManagement = () => {
  if (checkAdminPermission()) {
    router.push('/admin/content/notice')
  }
}

const goToActivityManagement = () => {
  if (checkAdminPermission()) {
    router.push('/admin/content/activity')
  }
}


// 定时器
let timeTimer: number | null = null

// 生命周期
onMounted(() => {
  updateCurrentTime()
  timeTimer = setInterval(updateCurrentTime, 1000)
  fetchLatestNotices()
  fetchStats()
})

onUnmounted(() => {
  if (timeTimer) {
    clearInterval(timeTimer)
  }
})
</script>

<style scoped>
.admin-main-content {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
}

/* 欢迎信息区域 */
.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 32px;
  color: white;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.welcome-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

.current-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  opacity: 0.9;
}

.time-label {
  opacity: 0.8;
}

.time-value {
  font-weight: 500;
  font-family: 'Monaco', 'Menlo', monospace;
}

.welcome-description {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

/* 统计卡片区域 */
.stats-section {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.users {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.content {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.activity {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon :deep(.el-icon) {
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

/* 最新公告区域 */
.notices-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
}

.loading .el-icon {
  font-size: 24px;
  color: #409eff;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.empty-notices {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
}

.notices-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.notice-item:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.notice-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notice-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0;
  line-height: 1.4;
}

.notice-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notice-type {
  margin-right: 12px;
}

.notice-time {
  font-size: 12px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-main-content {
    padding: 16px;
  }

  .welcome-section {
    padding: 24px;
  }

  .welcome-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .welcome-title {
    font-size: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}

/* 快速操作区域 */
.quick-actions-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
}

.current-role {
  display: flex;
  align-items: center;
  gap: 4px;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.quick-action-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.quick-action-card:hover {
  border-color: #409eff;
  background: #ecf5ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}


.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon .el-icon {
  font-size: 24px;
  color: white;
}

.action-icon.user-management {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.action-icon.content-management {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.action-icon.activity-management {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}


.action-content {
  flex: 1;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.action-description {
  font-size: 14px;
  color: #606266;
  margin: 0;
  line-height: 1.5;
}

.quick-action-card .el-tag {
  position: absolute;
  top: 16px;
  right: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .quick-action-card {
    padding: 16px;
  }

  .action-icon {
    width: 40px;
    height: 40px;
  }

  .action-icon .el-icon {
    font-size: 20px;
  }
}
</style>
