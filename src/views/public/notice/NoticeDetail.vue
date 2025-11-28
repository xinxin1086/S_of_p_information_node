<template>
  <div class="notice-detail">
    <div v-if="loading" class="loading">
      <el-loading />
    </div>

    <div v-else-if="!notice" class="not-found">
      <el-result
        icon="warning"
        title="公告不存在"
        sub-title="抱歉，您访问的公告不存在或已被删除"
      >
        <template #extra>
          <el-button type="primary" @click="goBack">返回列表</el-button>
        </template>
      </el-result>
    </div>

    <div v-else class="notice-content">
      <div class="notice-header">
        <el-button @click="goBack" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>

      <el-card class="notice-card">
        <div class="notice-meta">
          <h1 class="notice-title">{{ notice.title }}</h1>
          <div class="notice-info">
            <el-tag :type="getNoticeTypeTag(notice.type)" size="small">
              {{ getNoticeTypeText(notice.type) }}
            </el-tag>
            <span class="notice-date">{{ formatDate(notice.createdAt) }}</span>
            <span v-if="notice.expireTime" class="notice-expire-time">
              <el-icon v-if="isExpired(notice.expireTime)" color="#f56c6c"><Clock /></el-icon>
              <el-icon v-else color="#e6a23c"><Clock /></el-icon>
              过期时间：{{ formatDate(notice.expireTime) }}
              <el-tag v-if="isExpired(notice.expireTime)" type="danger" size="small" style="margin-left: 8px;">已过期</el-tag>
            </span>
          </div>
        </div>

        <div class="notice-body" v-if="notice.content" v-html="notice.content"></div>
        <div class="notice-body" v-else>
          <p>暂无详细内容</p>
        </div>

        <div class="notice-footer" v-if="notice.attachments && notice.attachments.length > 0">
          <h3>相关附件</h3>
          <div class="attachment-list">
            <a
              v-for="attachment in notice.attachments"
              :key="attachment.id"
              :href="attachment.url"
              target="_blank"
              class="attachment-item"
            >
              <el-icon><Document /></el-icon>
              <span>{{ attachment.name }}</span>
              <span class="attachment-size">({{ formatFileSize(attachment.size) }})</span>
            </a>
          </div>
        </div>
      </el-card>

      <div class="related-notices" v-if="relatedNotices.length > 0">
        <h3>相关公告</h3>
        <div class="related-grid">
          <el-card
            v-for="relatedNotice in relatedNotices"
            :key="relatedNotice.id"
            class="related-card"
            shadow="hover"
            @click="goToNotice(relatedNotice.id)"
          >
            <h4>{{ relatedNotice.title }}</h4>
            <p>{{ relatedNotice.summary }}</p>
            <span class="related-date">{{ formatDate(relatedNotice.createdAt) }}</span>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Document, Clock } from '@element-plus/icons-vue'
import { ElMessage, ElLoading, ElResult, ElButton, ElCard, ElTag, ElIcon } from 'element-plus'
import { api } from '@/utils/common/request'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const notice = ref(null)
const relatedNotices = ref([])

const noticeId = computed(() => parseInt(route.params.id))

const fetchNoticeDetail = async () => {
  loading.value = true
  try {
    // 调用后端API获取公告详情
    const response = await api.get(`/api/visit/notice/${noticeId.value}`)

    // 根据后端返回的数据结构进行处理
    // API 返回结构: { data: { id, release_title, release_notice, notice_type, release_time, expiration, ... }, success: true }
    if (response && response.data && response.data.id) {
      notice.value = {
        id: response.data.id,
        title: response.data.release_title || response.data.title,
        content: response.data.release_notice || response.data.content,
        type: getNoticeTypeFromText(response.data.notice_type),
        createdAt: response.data.release_time || response.data.createdAt || response.data.publishTime,
        expireTime: response.data.expiration,
        attachments: response.data.attachments || []
      }
    } else {
      console.warn('未预期的详情数据结构:', response)
      notice.value = null
    }

    // 获取相关公告推荐
    try {
      const relatedResponse = await api.get('/api/visit/notice')
      if (relatedResponse && relatedResponse.data && relatedResponse.data.items && Array.isArray(relatedResponse.data.items)) {
        relatedNotices.value = relatedResponse.data.items
          .filter(item => item.id !== noticeId.value)
          .slice(0, 3) // 只显示最多3个相关公告
          .map(item => ({
            id: item.id,
            title: item.release_title || item.title,
            summary: (item.release_notice || item.content || '').substring(0, 100) + '...',
            createdAt: item.release_time || item.createdAt || item.publishTime
          }))
      } else {
        console.warn('未预期的相关公告数据结构:', relatedResponse)
        relatedNotices.value = []
      }
    } catch (relatedError) {
      console.warn('获取相关公告失败:', relatedError)
      relatedNotices.value = []
    }
  } catch (error) {
    console.error('获取公告详情失败:', error)
    ElMessage.error('获取公告详情失败，请稍后重试')
    notice.value = null
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/notice')
}

const goToNotice = (id) => {
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
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const isExpired = (expireTime) => {
  if (!expireTime) return false
  return new Date(expireTime) < new Date()
}

onMounted(() => {
  fetchNoticeDetail()
})
</script>

<style scoped>
.notice-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.not-found {
  margin-top: 100px;
}

.notice-header {
  margin-bottom: 20px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

.notice-card {
  margin-bottom: 30px;
}

.notice-meta {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.notice-title {
  margin: 0 0 15px 0;
  font-size: 28px;
  color: #303133;
  line-height: 1.3;
}

.notice-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 15px;
}

.notice-date {
  color: #909399;
  font-size: 14px;
}

.notice-expire-time {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #e6a23c;
  font-size: 14px;
}

.notice-body {
  line-height: 1.8;
  color: #303133;
  font-size: 16px;
}

.notice-body :deep(h3) {
  margin: 25px 0 15px 0;
  color: #303133;
  font-size: 20px;
}

.notice-body :deep(p) {
  margin: 15px 0;
}

.notice-body :deep(ul) {
  margin: 15px 0;
  padding-left: 25px;
}

.notice-body :deep(li) {
  margin: 8px 0;
}

.notice-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.notice-footer h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #303133;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: #f5f7fa;
  border-radius: 6px;
  text-decoration: none;
  color: #303133;
  transition: background-color 0.2s;
}

.attachment-item:hover {
  background: #e6f7ff;
}

.attachment-size {
  color: #909399;
  font-size: 12px;
  margin-left: 5px;
}

.related-notices {
  margin-top: 40px;
}

.related-notices h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #303133;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.related-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.related-card:hover {
  transform: translateY(-2px);
}

.related-card h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #303133;
  line-height: 1.4;
}

.related-card p {
  margin: 0 0 10px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.related-date {
  color: #909399;
  font-size: 12px;
}

@media (max-width: 768px) {
  .notice-detail {
    padding: 15px;
  }

  .notice-title {
    font-size: 24px;
  }

  .notice-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .related-grid {
    grid-template-columns: 1fr;
  }
}
</style>