<template>
  <div class="profile-view">
    <el-page-header @back="$router.go(-1)">
      <template #content>
        <span class="page-header-title">个人资料</span>
      </template>
    </el-page-header>

    <div class="profile-content">
      <el-row :gutter="24">
        <!-- 左侧个人信息 -->
        <el-col :span="8">
          <el-card class="profile-card">
            <div class="profile-header">
              <el-avatar :size="100" :src="userInfo.avatar" fit="cover">
                <el-icon size="50"><User /></el-icon>
              </el-avatar>
              <h3 class="profile-name">{{ userInfo.nickname || userInfo.username }}</h3>
              <p class="profile-bio">{{ userInfo.bio || '这个人很懒，什么都没有留下...' }}</p>
            </div>

            <el-divider />

            <div class="profile-info">
              <div class="info-item">
                <span class="info-label">
                  <el-icon><User /></el-icon>
                  用户名
                </span>
                <span class="info-value">{{ userInfo.username }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">
                  <el-icon><Message /></el-icon>
                  邮箱
                </span>
                <span class="info-value">
                  {{ userInfo.email || '未设置' }}
                  <el-tag v-if="userInfo.email_verified" type="success" size="small">已验证</el-tag>
                </span>
              </div>

              <div class="info-item">
                <span class="info-label">
                  <el-icon><Phone /></el-icon>
                  手机号
                </span>
                <span class="info-value">
                  {{ userInfo.phone ? maskPhone(userInfo.phone) : '未设置' }}
                  <el-tag v-if="userInfo.phone_verified" type="success" size="small">已验证</el-tag>
                </span>
              </div>

              <div class="info-item" v-if="userInfo.gender">
                <span class="info-label">
                  <el-icon><UserFilled /></el-icon>
                  性别
                </span>
                <span class="info-value">{{ getGenderText(userInfo.gender) }}</span>
              </div>

              <div class="info-item" v-if="userInfo.birthday">
                <span class="info-label">
                  <el-icon><Calendar /></el-icon>
                  生日
                </span>
                <span class="info-value">{{ userInfo.birthday }}</span>
              </div>

              <div class="info-item" v-if="userInfo.region && userInfo.region.length">
                <span class="info-label">
                  <el-icon><Location /></el-icon>
                  所在地
                </span>
                <span class="info-value">{{ userInfo.region.join(' ') }}</span>
              </div>

              <div class="info-item" v-if="userInfo.occupation">
                <span class="info-label">
                  <el-icon><Briefcase /></el-icon>
                  职业
                </span>
                <span class="info-value">{{ userInfo.occupation }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">
                  <el-icon><Timer /></el-icon>
                  注册时间
                </span>
                <span class="info-value">{{ formatDate(userInfo.created_at) }}</span>
              </div>
            </div>

            <div class="profile-actions">
              <el-button type="primary" @click="$router.push('/user/profile/edit')">
                <el-icon><Edit /></el-icon>
                编辑资料
              </el-button>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧统计信息 -->
        <el-col :span="16">
          <div class="stats-section">
            <el-card class="stats-card">
              <template #header>
                <span>账户统计</span>
              </template>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-number">{{ userStats.postCount || 0 }}</div>
                  <div class="stat-label">发帖数量</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ userStats.commentCount || 0 }}</div>
                  <div class="stat-label">评论数量</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ userStats.bookingCount || 0 }}</div>
                  <div class="stat-label">活动预约</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ userStats.favoriteCount || 0 }}</div>
                  <div class="stat-label">收藏数量</div>
                </div>
              </div>
            </el-card>

            <el-card class="interests-card" v-if="userInfo.interests && userInfo.interests.length">
              <template #header>
                <span>兴趣爱好</span>
              </template>
              <div class="interests-list">
                <el-tag
                  v-for="interest in getUserInterests()"
                  :key="interest.value"
                  class="interest-tag"
                  type="info"
                >
                  {{ interest.label }}
                </el-tag>
              </div>
            </el-card>

            <el-card class="recent-activity-card">
              <template #header>
                <span>最近活动</span>
              </template>
              <div class="activity-list">
                <div
                  v-for="activity in recentActivities"
                  :key="activity.id"
                  class="activity-item"
                >
                  <div class="activity-icon">
                    <el-icon><component :is="getActivityIcon(activity.type)" /></el-icon>
                  </div>
                  <div class="activity-content">
                    <div class="activity-title">{{ activity.title }}</div>
                    <div class="activity-time">{{ formatDateTime(activity.time) }}</div>
                  </div>
                </div>
                <div v-if="recentActivities.length === 0" class="no-activity">
                  暂无活动记录
                </div>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api'
import {
  User,
  Message,
  Phone,
  UserFilled,
  Calendar,
  Location,
  Briefcase,
  Timer,
  Edit,
  DocumentCopy,
  ChatLineSquare,
  Calendar as ActivityIcon,
  Star
} from '@element-plus/icons-vue'

defineOptions({ name: "ProfileView" })

// 用户信息
const userInfo = reactive({
  username: '',
  nickname: '',
  avatar: '',
  bio: '',
  email: '',
  email_verified: false,
  phone: '',
  phone_verified: false,
  gender: '',
  birthday: '',
  region: [],
  occupation: '',
  created_at: '',
  interests: []
})

// 用户统计信息
const userStats = reactive({
  postCount: 0,
  commentCount: 0,
  bookingCount: 0,
  favoriteCount: 0
})

// 最近活动
const recentActivities = ref([])

// 兴趣选项映射
const interestOptions = {
  fishing: '垂钓',
  outdoor: '户外活动',
  photography: '摄影',
  cooking: '烹饪',
  reading: '阅读',
  travel: '旅行',
  sports: '运动',
  music: '音乐'
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 手机号脱敏
const maskPhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 获取性别文本
const getGenderText = (gender) => {
  const genderMap = {
    male: '男',
    female: '女',
    other: '其他'
  }
  return genderMap[gender] || '未知'
}

// 获取用户兴趣标签
const getUserInterests = () => {
  return (userInfo.interests || []).map(interest => ({
    value: interest,
    label: interestOptions[interest] || interest
  }))
}

// 获取活动图标
const getActivityIcon = (type) => {
  const iconMap = {
    post: DocumentCopy,
    comment: ChatLineSquare,
    booking: ActivityIcon,
    favorite: Star
  }
  return iconMap[type] || DocumentCopy
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await userApi.getUserInfo()
    if (response.data) {
      Object.assign(userInfo, response.data)
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败')
    console.error('获取用户信息失败:', error)
  }
}

// 获取用户统计信息
const fetchUserStats = async () => {
  try {
    const response = await userApi.getUserStats()
    if (response.data) {
      Object.assign(userStats, response.data)
    }
  } catch (error) {
    // 静默处理统计信息获取失败，因为这些接口可能还未实现
    console.warn('统计信息接口可能未实现:', error.message)
    // 使用默认统计数据
    Object.assign(userStats, {
      activities: 0,
      comments: 0,
      favorites: 0,
      points: 0
    })
  }
}

// 获取最近活动
const fetchRecentActivities = async () => {
  try {
    const response = await userApi.getUserActivities({ limit: 10 })
    if (response.data) {
      recentActivities.value = response.data
    }
  } catch (error) {
    // 静默处理活动记录获取失败
    console.warn('活动记录接口可能未实现:', error.message)
    recentActivities.value = []
  }
}

onMounted(() => {
  fetchUserInfo()
  fetchUserStats()
  fetchRecentActivities()
})
</script>

<style scoped>
.profile-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header-title {
  font-size: 18px;
  font-weight: 500;
}

.profile-content {
  margin-top: 20px;
}

.profile-card {
  text-align: center;
}

.profile-header {
  margin-bottom: 24px;
}

.profile-name {
  margin: 16px 0 8px 0;
  color: #333;
  font-size: 20px;
  font-weight: 500;
}

.profile-bio {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  padding: 0 8px;
}

.profile-info {
  text-align: left;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  min-width: 80px;
}

.info-value {
  color: #333;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-actions {
  display: flex;
  justify-content: center;
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 24px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #00b42a;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.interests-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.interest-tag {
  margin: 0;
}

.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f9ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0284c7;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  color: #333;
  font-size: 14px;
  margin-bottom: 4px;
}

.activity-time {
  color: #666;
  font-size: 12px;
}

.no-activity {
  text-align: center;
  color: #999;
  padding: 40px 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .profile-view {
    padding: 16px;
  }

  .el-col {
    width: 100% !important;
    margin-bottom: 20px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>