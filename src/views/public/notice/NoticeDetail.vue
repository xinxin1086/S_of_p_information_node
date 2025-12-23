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
        <el-button @click="goBack" class="back-button" title="返回上一页">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
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
import { useNoticeStore } from '@/stores/notice'
import {
  getNoticeTypeTag,
  getNoticeTypeText,
  formatDate,
  getNoticeTypeFromText
} from '@/utils/notice'

const route = useRoute()
const router = useRouter()
const noticeStore = useNoticeStore()

const relatedNotices = ref([])

const noticeId = computed(() => parseInt(route.params.id))

// 计算属性，从store获取数据
const loading = computed(() => noticeStore.loading)
const notice = computed(() => noticeStore.currentNotice)

const fetchNoticeDetail = async () => {
  try {
    console.log('📄 获取公告详情:', noticeId.value)

    const result = await noticeStore.fetchPublicNotice(noticeId.value)

    if (!result.success) {
      ElMessage.error(result.error || '获取公告详情失败')
    }

    // 获取相关公告推荐
    await fetchRelatedNotices()
  } catch (error) {
    console.error('获取公告详情失败:', error)
    ElMessage.error('获取公告详情失败')
  }
}

const fetchRelatedNotices = async () => {
  try {
    const result = await noticeStore.fetchPublicNotices({ page: 1, size: 4 })

    if (result.success && result.data?.items) {
      relatedNotices.value = result.data.items
        .filter(item => item.id !== noticeId.value)
        .slice(0, 3) // 只显示最多3个相关公告
        .map(item => ({
          id: item.id,
          title: item.title,
          summary: (item.content || '').substring(0, 100) + '...',
          createdAt: item.createdAt
        }))
    }
  } catch (error) {
    console.warn('获取相关公告失败:', error)
    relatedNotices.value = []
  }
}

const goBack = () => {
  router.push('/notice')
}

const goToNotice = (id) => {
  router.push(`/notice/${id}`)
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
  gap: 6px;
  padding: 8px 16px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #495057;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.3);
}

.back-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);
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