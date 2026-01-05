<template>
  <div class="notice-detail">
    <!-- 页面头部 -->
    <div class="detail-header">
      <el-button @click="goBack" type="text" class="back-button">
        <el-icon><ArrowLeft /></el-icon>
        返回公告列表
      </el-button>
      <div class="header-actions">
        <el-button @click="handleEdit" type="primary">
          <el-icon><Edit /></el-icon>
          编辑公告
        </el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-loading :active="loading" text="加载公告详情中..." />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="errorMessage" class="error-container">
      <el-empty :description="errorMessage">
        <el-button type="primary" @click="retryLoad">重新加载</el-button>
      </el-empty>
    </div>

    <!-- 公告详情 -->
    <div v-else-if="noticeData" class="notice-content">
      <!-- 公告基本信息 -->
      <div class="notice-info-section">
        <h1 class="notice-title">{{ noticeData.release_title }}</h1>

        <div class="notice-meta">
          <el-tag :type="getNoticeTypeTag(noticeData.notice_type)" size="large">
            {{ noticeData.notice_type }}
          </el-tag>

          <div class="meta-item">
            <el-icon><Calendar /></el-icon>
            <span>发布时间：{{ formatDate(noticeData.release_time) }}</span>
          </div>

          <div class="meta-item">
            <el-icon><Clock /></el-icon>
            <span>过期时间：{{ formatDate(noticeData.expiration) }}</span>
          </div>

          <div v-if="noticeData.update_time" class="meta-item">
            <el-icon><Refresh /></el-icon>
            <span>最后更新：{{ formatDate(noticeData.update_time) }}</span>
          </div>
        </div>
      </div>

      <!-- 公告内容 -->
      <div class="notice-body">
        <!-- eslint-disable-next-line vue/no-v-html -- Content sanitized with DOMPurify -->
<div class="content-wrapper" v-html="sanitizedNoticeContent"></div>
      </div>

      <!-- 附件列表 -->
      <div v-if="attachments.length > 0" class="attachments-section">
        <h3>相关附件</h3>
        <div class="attachment-list">
          <div
            v-for="attachment in attachments"
            :key="attachment.id"
            class="attachment-item"
          >
            <el-icon><Document /></el-icon>
            <a :href="attachment.url" target="_blank" class="attachment-link">
              {{ attachment.name }}
            </a>
            <el-button size="small" type="text" @click="downloadAttachment(attachment)">
              下载
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Edit,
  Calendar,
  Clock,
  Refresh,
  Document
} from '@element-plus/icons-vue'
import { useNoticeStore } from '@/stores/notice'
import { sanitizeRichText } from '@/utils/sanitizeHtml'

const route = useRoute()
const router = useRouter()
const noticeStore = useNoticeStore()

// 响应式数据
const loading = ref(false)
const errorMessage = ref('')
const noticeData = ref(null)
const attachments = ref([])

// 净化后的公告内容
const sanitizedNoticeContent = computed(() => {
  return sanitizeRichText(noticeData.value?.release_notice)
})

// 方法
const goBack = () => {
  router.push('/admin/content/notice')
}

const handleEdit = () => {
  router.push(`/admin/notice/editor/${noticeData.value.id}`)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getNoticeTypeTag = (type) => {
  const typeMap = {
    '系统通知': 'danger',
    '活动公告': 'primary',
    '其他公告': 'info'
  }
  return typeMap[type] || 'info'
}

const downloadAttachment = (attachment) => {
  window.open(attachment.url, '_blank')
}

// 加载公告详情
const loadNoticeDetail = async () => {
  const noticeId = route.params.id
  if (!noticeId) {
    errorMessage.value = '缺少公告ID'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    // 使用访客接口获取完整的公告详情（包含内容和附件）
    const result = await noticeStore.fetchPublicNotice(noticeId)

    if (result.success && result.data) {
      noticeData.value = result.data
      attachments.value = result.data.attachments || []
    } else {
      errorMessage.value = result.error || '获取公告详情失败'
    }
  } catch (error) {
    console.error('获取公告详情失败:', error)
    let errorMsg = '获取公告详情失败'
    if (error.response?.status === 500) {
      errorMsg = '服务器内部错误，请稍后重试'
    } else if (error.response?.status === 401) {
      errorMsg = '登录已过期，请重新登录'
    } else if (error.response?.status === 403) {
      errorMsg = '没有权限访问该资源'
    } else if (error.response?.status === 404) {
      errorMsg = '公告不存在'
    } else if (error.message) {
      errorMsg += '：' + error.message
    }

    errorMessage.value = errorMsg
  } finally {
    loading.value = false
  }
}

// 重新加载
const retryLoad = () => {
  loadNoticeDetail()
}

// 页面挂载时加载数据
onMounted(() => {
  loadNoticeDetail()
})
</script>

<style scoped>
.notice-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.back-button {
  font-size: 14px;
  color: #606266;
}

.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.notice-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.notice-info-section {
  padding: 32px;
  border-bottom: 1px solid #f0f0f0;
}

.notice-title {
  margin: 0 0 24px 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.notice-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.meta-item .el-icon {
  font-size: 16px;
  color: #909399;
}

.notice-body {
  padding: 32px;
}

.content-wrapper {
  line-height: 1.8;
  color: #303133;
  font-size: 16px;
}

.content-wrapper :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 16px 0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content-wrapper :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  background: #fff;
}

.content-wrapper :deep(table th),
.content-wrapper :deep(table td) {
  border: 1px solid #e8e8e8;
  padding: 12px 16px;
  text-align: left;
}

.content-wrapper :deep(table th) {
  background-color: #fafafa;
  font-weight: 600;
  color: #333;
}

.content-wrapper :deep(blockquote) {
  margin: 16px 0;
  padding: 16px 20px;
  border-left: 4px solid #409eff;
  background-color: #f8f9fa;
  color: #666;
}

.content-wrapper :deep(pre) {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 16px;
  overflow-x: auto;
  margin: 16px 0;
}

.content-wrapper :deep(code) {
  background-color: #f1f3f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9em;
}

.content-wrapper :deep(h1),
.content-wrapper :deep(h2),
.content-wrapper :deep(h3),
.content-wrapper :deep(h4),
.content-wrapper :deep(h5),
.content-wrapper :deep(h6) {
  margin: 24px 0 12px 0;
  color: #2c3e50;
  font-weight: 600;
}

.content-wrapper :deep(h1) { font-size: 28px; }
.content-wrapper :deep(h2) { font-size: 24px; }
.content-wrapper :deep(h3) { font-size: 20px; }
.content-wrapper :deep(h4) { font-size: 18px; }
.content-wrapper :deep(h5) { font-size: 16px; }
.content-wrapper :deep(h6) { font-size: 14px; }

.attachments-section {
  padding: 24px 32px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.attachments-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  transition: all 0.2s ease;
}

.attachment-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.attachment-link {
  flex: 1;
  color: #409eff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.attachment-link:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notice-detail {
    padding: 16px;
  }

  .detail-header {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .notice-info-section,
  .notice-body {
    padding: 24px 20px;
  }

  .notice-title {
    font-size: 24px;
  }

  .notice-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .content-wrapper {
    font-size: 15px;
  }
}
</style>