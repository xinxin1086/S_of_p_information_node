<template>
  <div class="activity-detail">
    <div v-if="loading" class="loading">
      <el-loading :active="loading" />
    </div>

    <div v-else-if="!activity" class="not-found">
      <el-result
        icon="warning"
        title="活动不存在"
        sub-title="抱歉，您访问的活动不存在或已被删除"
      >
        <template #extra>
          <el-button type="primary" @click="goBack">返回列表</el-button>
        </template>
      </el-result>
    </div>

    <div v-else class="activity-content">
      <div class="activity-header">
        <el-button @click="goBack" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>

      <div class="activity-hero">
        <div class="hero-image" v-if="activity.cover">
          <img :src="activity.cover" :alt="activity.title" />
          <div class="activity-status" :class="getStatusClass(activity.status)">
            {{ getStatusText(activity.status) }}
          </div>
        </div>

        <div class="hero-content">
          <h1 class="activity-title">{{ activity.title }}</h1>

          <div class="activity-meta">
            <el-tag :type="getActivityTypeTag(activity.type)" size="large">
              {{ getActivityTypeText(activity.type) }}
            </el-tag>
            <div class="meta-info">
              <div class="info-row">
                <el-icon><Location /></el-icon>
                <span>{{ activity.location }}</span>
              </div>
              <div class="info-row">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDateTime(activity.startTime) }} - {{ formatDateTime(activity.endTime) }}</span>
              </div>
              <div class="info-row">
                <el-icon><User /></el-icon>
                <span>{{ activity.participants }}/{{ activity.maxParticipants }}人参与</span>
              </div>
            </div>
          </div>

          <div class="participation-section" v-if="activity.status !== 'completed'">
            <el-progress
              v-if="activity.maxParticipants > 0"
              :percentage="(activity.participants / activity.maxParticipants) * 100"
              :stroke-width="8"
              class="progress-large"
            />
            <div class="participation-info">
              <span>{{ activity.maxParticipants - activity.participants }} 个名额剩余</span>
              <el-button
                type="primary"
                size="large"
                :disabled="isDisabled"
                @click="handleParticipation"
                class="participation-btn"
              >
                {{ getButtonText() }}
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <el-row :gutter="30" class="content-section">
        <el-col :lg="16" :md="16" :sm="24">
          <el-card class="detail-card">
            <template #header>
              <h3>活动详情</h3>
            </template>
            <div class="activity-description" v-html="activity.description"></div>
          </el-card>

          <el-card class="detail-card" v-if="activity.requirements">
            <template #header>
              <h3>参与要求</h3>
            </template>
            <div class="requirements-content" v-html="activity.requirements"></div>
          </el-card>
        </el-col>

        <el-col :lg="8" :md="8" :sm="24">
          <el-card class="detail-card">
            <template #header>
              <h3>活动组织方</h3>
            </template>
            <div class="organizer-info">
              <div class="organizer-header">
                <el-avatar :size="50" :src="activity.organizer?.avatar">
                  {{ activity.organizer?.name?.charAt(0) }}
                </el-avatar>
                <div class="organizer-details">
                  <h4>{{ activity.organizer?.name || '汉江垂钓站' }}</h4>
                  <p>{{ activity.organizer?.description || '专业的钓鱼活动组织机构' }}</p>
                </div>
              </div>
              <div class="contact-info" v-if="activity.contact">
                <div class="contact-item">
                  <el-icon><Phone /></el-icon>
                  <span>{{ activity.contact.phone }}</span>
                </div>
                <div class="contact-item">
                  <el-icon><Message /></el-icon>
                  <span>{{ activity.contact.email }}</span>
                </div>
              </div>
            </div>
          </el-card>

          <el-card class="detail-card">
            <template #header>
              <h3>活动标签</h3>
            </template>
            <div class="tags-content">
              <el-tag
                v-for="tag in activity.tags"
                :key="tag"
                class="tag-item"
                effect="plain"
              >
                {{ tag }}
              </el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 插槽：用于自定义内容（如评论评分模块） -->
      <slot name="custom-content" :activity="activity"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Location, Calendar, User, Phone, Message } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Props
const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  activity: {
    type: Object,
    default: null
  },
  isParticipating: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['go-back', 'handle-participation'])

const router = useRouter()

const isDisabled = computed(() => {
  if (props.disabled) return true
  if (!props.activity) return true
  return props.activity.status !== 'published' ||
         props.activity.participants >= props.activity.maxParticipants ||
         props.isParticipating
})

const goBack = () => {
  emit('go-back')
}

const handleParticipation = async () => {
  if (!props.activity) return

  if (props.isParticipating) {
    try {
      await ElMessageBox.confirm('确定要取消报名吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      emit('handle-participation', { action: 'cancel', activity: props.activity })
    } catch {
      // 用户取消
    }
  } else {
    try {
      await ElMessageBox.confirm('确定要报名参加此活动吗？', '确认报名', {
        confirmButtonText: '确定报名',
        cancelButtonText: '取消',
        type: 'info'
      })

      emit('handle-participation', { action: 'join', activity: props.activity })
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('报名失败，请重试')
      }
    }
  }
}

const getButtonText = () => {
  if (props.isParticipating) return '取消报名'
  if (!props.activity) return '查看详情'
  if (props.activity.status === 'completed') return '活动已结束'
  if (props.activity.status === 'ongoing') return '活动进行中'
  if (props.activity.participants >= props.activity.maxParticipants) return '名额已满'
  return '立即报名'
}

const getStatusClass = (status) => {
  const classMap = {
    upcoming: 'status-upcoming',
    ongoing: 'status-ongoing',
    completed: 'status-completed',
    cancelled: 'status-cancelled'
  }
  return classMap[status] || 'status-upcoming'
}

const getStatusText = (status) => {
  const textMap = {
    upcoming: '即将开始',
    ongoing: '进行中',
    completed: '已结束',
    cancelled: '已取消'
  }
  return textMap[status] || '即将开始'
}

const getActivityTypeTag = (type) => {
  const typeMap = {
    competition: 'danger',
    training: 'success',
    volunteer: 'warning',
    experience: 'info',
    social: ''
  }
  return typeMap[type] || ''
}

const getActivityTypeText = (type) => {
  const textMap = {
    competition: '比赛',
    training: '培训',
    volunteer: '公益',
    experience: '体验',
    social: '社交'
  }
  return textMap[type] || '活动'
}

const formatDateTime = (dateString) => {
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
</script>

<style scoped>
.activity-detail {
  max-width: 1200px;
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

.activity-header {
  margin-bottom: 20px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

.activity-hero {
  margin-bottom: 30px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.hero-image {
  position: relative;
  width: 100%;
  height: 400px;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-status {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.status-upcoming {
  background-color: #409eff;
}

.status-ongoing {
  background-color: #67c23a;
}

.status-completed {
  background-color: #909399;
}

.status-cancelled {
  background-color: #f56c6c;
}

.hero-content {
  padding: 30px;
}

.activity-title {
  margin: 0 0 20px 0;
  font-size: 32px;
  color: #303133;
  line-height: 1.3;
}

.activity-meta {
  margin-bottom: 25px;
}

.meta-info {
  margin-top: 15px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: #606266;
  font-size: 16px;
}

.info-row .el-icon {
  color: #909399;
}

.participation-section {
  border-top: 1px solid #e4e7ed;
  padding-top: 25px;
}

.progress-large {
  margin-bottom: 20px;
}

.participation-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.participation-info span {
  color: #606266;
  font-size: 16px;
}

.participation-btn {
  min-width: 120px;
}

.content-section {
  margin-bottom: 40px;
}

.detail-card {
  margin-bottom: 20px;
}

.detail-card :deep(.el-card__header) {
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
}

.detail-card :deep(.el-card__header h3) {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.activity-description,
.requirements-content {
  line-height: 1.8;
  color: #303133;
  font-size: 16px;
}

.activity-description :deep(h2),
.requirements-content :deep(h2) {
  margin: 25px 0 15px 0;
  color: #303133;
  font-size: 20px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.activity-description :deep(p),
.requirements-content :deep(p) {
  margin: 15px 0;
}

.activity-description :deep(ul),
.requirements-content :deep(ul) {
  margin: 15px 0;
  padding-left: 25px;
}

.activity-description :deep(li),
.requirements-content :deep(li) {
  margin: 8px 0;
}

.organizer-info {
  text-align: center;
}

.organizer-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.organizer-details {
  margin-top: 10px;
}

.organizer-details h4 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 16px;
}

.organizer-details p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.contact-info {
  text-align: left;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: #606266;
  font-size: 14px;
}

.tags-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  margin: 0;
}

@media (max-width: 768px) {
  .activity-detail {
    padding: 15px;
  }

  .hero-image {
    height: 250px;
  }

  .hero-content {
    padding: 20px;
  }

  .activity-title {
    font-size: 24px;
  }

  .participation-info {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .content-section {
    margin-bottom: 20px;
  }

  .detail-card {
    margin-bottom: 15px;
  }
}
</style>