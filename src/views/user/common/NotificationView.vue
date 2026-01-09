<template>
  <div class="notification-view">
    <el-page-header @back="$router.go(-1)">
      <template #content>
        <span class="page-header-title">通知中心</span>
      </template>
    </el-page-header>

    <div class="notification-content">
      <!-- 通知筛选器 -->
      <el-card class="filter-card">
        <el-radio-group v-model="activeTab" @change="handleTabChange">
          <el-radio-button value="all">全部</el-radio-button>
          <el-radio-button value="unread">未读</el-radio-button>
          <el-radio-button value="reply">回复</el-radio-button>
          <el-radio-button value="like">点赞</el-radio-button>
          <el-radio-button value="system">系统</el-radio-button>
        </el-radio-group>

        <div class="actions">
          <el-button
            v-if="unreadCount > 0"
            type="primary"
            size="small"
            @click="markAllAsRead"
          >
            全部已读
          </el-button>
        </div>
      </el-card>

      <!-- 通知列表 -->
      <el-card class="notification-list-card">
        <el-skeleton v-if="loading" :rows="5" animated />

        <div v-else-if="notifications.length === 0" class="empty-state">
          <el-empty description="暂无通知" />
        </div>

        <div v-else class="notification-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ 'unread': !notification.is_read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon">
              <el-icon v-if="notification.type === 'reply'" class="reply-icon">
                <ChatDotRound />
              </el-icon>
              <el-icon v-else-if="notification.type === 'like'" class="like-icon">
                <Star />
              </el-icon>
              <el-icon v-else class="system-icon">
                <Bell />
              </el-icon>
            </div>

            <div class="notification-content">
              <div class="notification-header">
                <span class="notification-type">
                  {{ getTypeText(notification.type) }}
                </span>
                <span class="notification-time">
                  {{ formatTime(notification.created_at) }}
                </span>
              </div>

              <div class="notification-message">
                <span v-if="notification.sender" class="sender-name">
                  {{ notification.sender?.username || notification.sender?.account || '系统通知' }}
                </span>
                <span>{{ notification.content }}</span>
              </div>

              <div v-if="notification.preview" class="notification-preview">
                "{{ notification.preview }}"
              </div>
            </div>

            <div class="notification-status">
              <el-badge v-if="!notification.is_read" is-dot />
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="total > 0" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import {
  ChatDotRound,
  Star,
  Bell
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { ElMessage } from 'element-plus'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

import { userApi } from '@/api'

import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

defineOptions({ name: "NotificationView" })

const router = useRouter()

// 状态
const loading = ref(false)
const activeTab = ref('all')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const notifications = ref([])
const unreadCount = ref(0)

// 获取通知列表
const fetchNotifications = async () => {
  try {
    loading.value = true

    const params = {
      page: currentPage.value,
      page_size: pageSize.value
    }

    // 根据选中的标签筛选
    if (activeTab.value === 'unread') {
      params.is_read = false
    } else if (activeTab.value !== 'all') {
      params.type = activeTab.value
    }

    const response = await userApi.getNotifications(params)

    if (response?.data) {
      notifications.value = response.data.list || []
      total.value = response.data.total || 0
      unreadCount.value = response.data.unread_count || 0
    }
  } catch (error) {
    console.error('获取通知失败:', error)
    ElMessage.error('获取通知失败')
  } finally {
    loading.value = false
  }
}

// 标记全部为已读
const markAllAsRead = async () => {
  try {
    await userApi.markAllNotificationsAsRead()
    ElMessage.success('已全部标记为已读')
    unreadCount.value = 0
    notifications.value.forEach(notification => {
      notification.is_read = true
    })
  } catch (error) {
    console.error('标记失败:', error)
    ElMessage.error('操作失败')
  }
}

// 点击通知
const handleNotificationClick = async (notification) => {
  // 标记为已读
  if (!notification.is_read) {
    try {
      await userApi.markNotificationAsRead(notification.id)
      notification.is_read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (error) {
      console.error('标记失败:', error)
    }
  }

  // 跳转到相关内容
  if (notification.target_type && notification.target_id) {
    const routeMap = {
      'post': `/forum/post/${notification.target_id}`,
      'discussion': `/activities/${notification.target_id}`,
      'comment': `/forum/post/${notification.target_id}`
    }

    const route = routeMap[notification.target_type]
    if (route) {
      router.push(route)
    }
  }
}

// 标签切换
const handleTabChange = () => {
  currentPage.value = 1
  fetchNotifications()
}

// 页码改变
const handlePageChange = () => {
  fetchNotifications()
}

// 每页数量改变
const handleSizeChange = () => {
  currentPage.value = 1
  fetchNotifications()
}

// 获取类型文本
const getTypeText = (type) => {
  const typeMap = {
    'reply': '回复了我的',
    'like': '赞了我的',
    'system': '系统通知'
  }
  return typeMap[type] || '通知'
}

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).fromNow()
}

onMounted(() => {
  fetchNotifications()
})
</script>

<style scoped>
.notification-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header-title {
  font-size: 18px;
  font-weight: 500;
}

.notification-content {
  margin-top: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-card :deep(.el-card__body) {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  display: flex;
  gap: 12px;
}

.notification-list-card {
  min-height: 400px;
}

.empty-state {
  padding: 40px 0;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.notification-item:hover {
  background: #f5f7fa;
  border-color: #409eff;
}

.notification-item.unread {
  background: #f0f9ff;
  border-color: #409eff;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon .reply-icon {
  color: #409eff;
  font-size: 20px;
}

.notification-icon .like-icon {
  color: #f56c6c;
  font-size: 20px;
}

.notification-icon .system-icon {
  color: #909399;
  font-size: 20px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.notification-type {
  font-weight: 500;
  color: #333;
}

.notification-time {
  font-size: 14px;
  color: #909399;
}

.notification-message {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
}

.sender-name {
  font-weight: 500;
  color: #409eff;
  margin-right: 4px;
}

.notification-preview {
  color: #909399;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-left: 12px;
  border-left: 2px solid #e0e0e0;
}

.notification-status {
  flex-shrink: 0;
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .notification-view {
    padding: 16px;
  }

  .filter-card :deep(.el-card__body) {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .notification-item {
    padding: 12px;
  }

  .notification-icon {
    width: 32px;
    height: 32px;
  }

  .notification-icon .el-icon {
    font-size: 16px;
  }
}
</style>
