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
import { useAuthStore } from '@/store/modules/auth'
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

// 定时器
let timeTimer: NodeJS.Timeout | null = null

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
</style>
