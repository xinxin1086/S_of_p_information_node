<template>
  <div class="notice-list">
    <div class="page-header">
      <h1>公告列表</h1>
      <p>查看系统最新公告和通知</p>
    </div>

    <div class="notice-container">
      <div v-if="loading" class="loading">
        <el-loading />
      </div>

      <div v-else-if="notices.length === 0" class="empty-state">
        <el-empty description="暂无公告" />
      </div>

      <div v-else class="notice-grid">
        <el-card
          v-for="notice in notices"
          :key="notice.id"
          class="notice-card"
          shadow="hover"
          @click="goToDetail(notice.id)"
        >
          <div class="notice-header">
            <h3 class="notice-title">{{ notice.title }}</h3>
            <el-tag :type="getNoticeTypeTag(notice.type)" size="small">
              {{ getNoticeTypeText(notice.type) }}
            </el-tag>
          </div>

          <div class="notice-content">
            <p>{{ notice.summary || notice.content?.substring(0, 100) + '...' }}</p>
          </div>

          <div class="notice-footer">
            <div class="notice-info">
              <span class="notice-date">{{ formatDate(notice.createdAt) }}</span>
              <span v-if="notice.expireTime" class="notice-expire">
                过期时间：{{ formatDate(notice.expireTime) }}
              </span>
            </div>
            <el-icon class="notice-arrow"><Right /></el-icon>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Right } from '@element-plus/icons-vue'
import { ElMessage, ElLoading, ElEmpty } from 'element-plus'
import { api } from '@/utils/common/request'

const router = useRouter()

const loading = ref(false)
const notices = ref([])

const fetchNotices = async () => {
  loading.value = true
  try {
    const response = await api.get('/api/visit/notice')

    // 根据后端返回的数据结构进行调整
    // API 返回结构: { data: { items: [...], page: 1, size: 10, total: 7 } }
    if (response && response.data && response.data.items && Array.isArray(response.data.items)) {
      notices.value = response.data.items.map(notice => ({
        id: notice.id,
        title: notice.release_title || notice.title,
        content: notice.release_notice || notice.content,
        type: getNoticeTypeFromText(notice.notice_type),
        createdAt: notice.release_time || notice.createdAt || notice.publishTime,
        expireTime: notice.expiration,
        summary: (notice.release_notice || notice.content || '').substring(0, 100) + '...'
      }))
    } else if (Array.isArray(response)) {
      // 如果直接返回数组
      notices.value = response.map(notice => ({
        id: notice.id,
        title: notice.release_title || notice.title,
        content: notice.release_notice || notice.content,
        type: getNoticeTypeFromText(notice.notice_type),
        createdAt: notice.release_time || notice.createdAt || notice.publishTime,
        expireTime: notice.expiration,
        summary: (notice.release_notice || notice.content || '').substring(0, 100) + '...'
      }))
    } else {
      console.warn('未预期的数据结构:', response)
      notices.value = []
    }
  } catch (error) {
    console.error('获取公告列表失败:', error)
    // 可以显示错误提示
    ElMessage.error('获取公告列表失败，请稍后重试')
    notices.value = []
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => {
  router.push(`/notice/${id}`)
}

// 将中文公告类型转换为英文类型
const getNoticeTypeFromText = (typeText) => {
  const typeMap = {
    '系统通知': 'system',
    '活动公告': 'activity',
    '其他公告': 'news',
    '功能更新': 'feature'
  }
  return typeMap[typeText] || 'system'
}

const getNoticeTypeTag = (type) => {
  const typeMap = {
    system: 'danger',
    feature: 'success',
    activity: 'warning',
    news: 'info'
  }
  return typeMap[type] || 'info'
}

const getNoticeTypeText = (type) => {
  const typeMap = {
    system: '系统通知',
    feature: '功能更新',
    activity: '活动公告',
    news: '新闻资讯'
  }
  return typeMap[type] || '公告'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

onMounted(() => {
  fetchNotices()
})
</script>

<style scoped>
.notice-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  color: #303133;
  margin-bottom: 10px;
}

.page-header p {
  color: #606266;
  font-size: 16px;
}

.notice-container {
  min-height: 400px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.notice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.notice-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.notice-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.notice-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
  line-height: 1.4;
  flex: 1;
  margin-right: 10px;
}

.notice-content {
  margin-bottom: 15px;
}

.notice-content p {
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

.notice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notice-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notice-date {
  color: #909399;
  font-size: 14px;
}

.notice-expire {
  color: #e6a23c;
  font-size: 12px;
}

.notice-arrow {
  color: #909399;
  transition: color 0.2s;
}

.notice-card:hover .notice-arrow {
  color: #409eff;
}

@media (max-width: 768px) {
  .notice-list {
    padding: 15px;
  }

  .notice-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .notice-title {
    font-size: 16px;
  }
}
</style>