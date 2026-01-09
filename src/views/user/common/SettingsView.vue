<template>
  <div class="settings-view">
    <div class="settings-header">
      <h2>系统设置</h2>
      <p class="subtitle">管理您的账户设置和偏好</p>
    </div>

    <el-row :gutter="20">
      <el-col :span="4">
        <el-card class="settings-nav">
          <el-menu
            :default-active="activeTab"
            mode="vertical"
            @select="handleTabSelect"
            class="settings-menu"
          >
            <el-menu-item index="account">
              <el-icon><User /></el-icon>
              <span>账户设置</span>
            </el-menu-item>
            <el-menu-item index="privacy">
              <el-icon><Lock /></el-icon>
              <span>隐私设置</span>
            </el-menu-item>
            <el-menu-item index="notification">
              <el-icon><Bell /></el-icon>
              <span>通知设置</span>
            </el-menu-item>
            <el-menu-item index="appearance">
              <el-icon><Brush /></el-icon>
              <span>外观设置</span>
            </el-menu-item>
            <el-menu-item index="language">
              <el-icon><Location /></el-icon>
              <span>语言设置</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <el-col :span="20">
        <el-card class="settings-content">
          <!-- 账户设置 -->
          <div v-show="activeTab === 'account'" class="setting-section">
            <h3>账户设置</h3>
            <el-form :model="accountForm" label-width="120px" class="settings-form">
              <el-form-item label="用户名">
                <el-input v-model="accountForm.username" disabled />
                <span class="form-tip">用户名不可修改</span>
              </el-form-item>

              <el-form-item label="邮箱">
                <el-input v-model="accountForm.email" />
                <span class="form-tip">用于登录和接收通知</span>
              </el-form-item>

              <el-form-item label="手机号">
                <el-input v-model="accountForm.phone" />
                <span class="form-tip">用于账户验证</span>
              </el-form-item>

              <el-form-item label="个人简介">
                <el-input
                  v-model="accountForm.bio"
                  type="textarea"
                  :rows="4"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="saveAccountSettings" :loading="saving">
                  保存更改
                </el-button>
              </el-form-item>
            </el-form>

            <el-divider />

            <h4>密码修改</h4>
            <el-form :model="passwordForm" label-width="120px" class="settings-form">
              <el-form-item label="当前密码">
                <el-input v-model="passwordForm.currentPassword" type="password" show-password />
              </el-form-item>

              <el-form-item label="新密码">
                <el-input v-model="passwordForm.newPassword" type="password" show-password />
              </el-form-item>

              <el-form-item label="确认密码">
                <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
              </el-form-item>

              <el-form-item>
                <el-button type="warning" @click="changePassword" :loading="saving">
                  修改密码
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 隐私设置 -->
          <div v-show="activeTab === 'privacy'" class="setting-section">
            <h3>隐私设置</h3>
            <el-form label-width="200px" class="settings-form">
              <el-form-item label="个人资料可见性">
                <el-radio-group v-model="privacySettings.profileVisibility">
                  <el-radio label="public">公开</el-radio>
                  <el-radio label="registered">仅注册用户</el-radio>
                  <el-radio label="private">私密</el-radio>
                </el-radio-group>
                <div class="form-tip">控制谁可以查看您的个人资料</div>
              </el-form-item>

              <el-form-item label="活动记录可见性">
                <el-radio-group v-model="privacySettings.activityVisibility">
                  <el-radio label="public">公开</el-radio>
                  <el-radio label="friends">仅好友</el-radio>
                  <el-radio label="private">私密</el-radio>
                </el-radio-group>
                <div class="form-tip">控制谁可以查看您的活动记录</div>
              </el-form-item>

              <el-form-item label="允许搜索到我的账号">
                <el-switch v-model="privacySettings.searchable" />
                <div class="form-tip">关闭后其他用户无法搜索到您的账号</div>
              </el-form-item>

              <el-form-item label="允许他人发送好友请求">
                <el-switch v-model="privacySettings.allowFriendRequests" />
                <div class="form-tip">关闭后其他用户无法向您发送好友请求</div>
              </el-form-item>

              <el-form-item label="显示在线状态">
                <el-switch v-model="privacySettings.showOnlineStatus" />
                <div class="form-tip">其他用户可以看到您是否在线</div>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="savePrivacySettings" :loading="saving">
                  保存隐私设置
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 通知设置 -->
          <div v-show="activeTab === 'notification'" class="setting-section">
            <h3>通知设置</h3>
            <el-form label-width="200px" class="settings-form">
              <div class="notification-group">
                <h4>邮件通知</h4>
                <el-form-item label="系统公告">
                  <el-switch v-model="notificationSettings.email.systemAnnouncements" />
                </el-form-item>
                <el-form-item label="活动提醒">
                  <el-switch v-model="notificationSettings.email.activityReminders" />
                </el-form-item>
                <el-form-item label="账户安全">
                  <el-switch v-model="notificationSettings.email.securityAlerts" />
                </el-form-item>
                <el-form-item label="每周摘要">
                  <el-switch v-model="notificationSettings.email.weeklyDigest" />
                </el-form-item>
              </div>

              <el-divider />

              <div class="notification-group">
                <h4>站内通知</h4>
                <el-form-item label="私信消息">
                  <el-switch v-model="notificationSettings.site.privateMessages" />
                </el-form-item>
                <el-form-item label="评论回复">
                  <el-switch v-model="notificationSettings.site.commentReplies" />
                </el-form-item>
                <el-form-item label="点赞和收藏">
                  <el-switch v-model="notificationSettings.site.likesAndFavorites" />
                </el-form-item>
                <el-form-item label="系统消息">
                  <el-switch v-model="notificationSettings.site.systemMessages" />
                </el-form-item>
              </div>

              <el-divider />

              <div class="notification-group">
                <h4>推送通知</h4>
                <el-form-item label="启用推送通知">
                  <el-switch v-model="notificationSettings.push.enabled" />
                </el-form-item>
                <el-form-item label="活动开始提醒">
                  <el-switch v-model="notificationSettings.push.activityStart" :disabled="!notificationSettings.push.enabled" />
                </el-form-item>
                <el-form-item label="活动报名成功">
                  <el-switch v-model="notificationSettings.push.registrationSuccess" :disabled="!notificationSettings.push.enabled" />
                </el-form-item>
              </div>

              <el-form-item>
                <el-button type="primary" @click="saveNotificationSettings" :loading="saving">
                  保存通知设置
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 外观设置 -->
          <div v-show="activeTab === 'appearance'" class="setting-section">
            <h3>外观设置</h3>
            <el-form label-width="200px" class="settings-form">
              <el-form-item label="主题模式">
                <el-radio-group v-model="appearanceSettings.theme" @change="handleThemeChange">
                  <el-radio label="light">浅色</el-radio>
                  <el-radio label="dark">深色</el-radio>
                  <el-radio label="auto">跟随系统</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="主题色">
                <div class="color-picker-wrapper">
                  <el-color-picker v-model="appearanceSettings.primaryColor" @change="handleColorChange" />
                  <span class="color-preview">当前主题色: {{ appearanceSettings.primaryColor }}</span>
                </div>
              </el-form-item>

              <el-form-item label="字体大小">
                <el-slider v-model="appearanceSettings.fontSize" :min="12" :max="20" :marks="fontSizeMarks" @change="handleFontSizeChange" />
              </el-form-item>

              <el-form-item label="紧凑模式">
                <el-switch v-model="appearanceSettings.compactMode" @change="handleCompactModeChange" />
                <div class="form-tip">启用后界面元素间距会减小</div>
              </el-form-item>

              <el-form-item label="动画效果">
                <el-switch v-model="appearanceSettings.animations" @change="handleAnimationChange" />
                <div class="form-tip">关闭后禁用所有过渡动画</div>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="saveAppearanceSettings" :loading="saving">
                  保存外观设置
                </el-button>
                <el-button @click="resetAppearanceSettings">
                  重置为默认
                </el-button>
              </el-form-item>
            </el-form>

            <el-divider />

            <h4>主题预览</h4>
            <div class="theme-preview">
              <el-card>
                <div class="preview-content">
                  <h5>预览标题</h5>
                  <p>这是一段示例文本，用于预览当前主题效果。</p>
                  <el-button type="primary">主要按钮</el-button>
                  <el-button>默认按钮</el-button>
                </div>
              </el-card>
            </div>
          </div>

          <!-- 语言设置 -->
          <div v-show="activeTab === 'language'" class="setting-section">
            <h3>语言设置</h3>
            <el-form label-width="200px" class="settings-form">
              <el-form-item label="界面语言">
                <el-select v-model="languageSettings.interface" placeholder="请选择语言" @change="handleLanguageChange">
                  <el-option label="简体中文" value="zh-CN" />
                  <el-option label="繁體中文" value="zh-TW" />
                  <el-option label="English" value="en-US" />
                </el-select>
              </el-form-item>

              <el-form-item label="时区设置">
                <el-select v-model="languageSettings.timezone" placeholder="请选择时区">
                  <el-option label="UTC+08:00 北京时间" value="Asia/Shanghai" />
                  <el-option label="UTC+09:00 东京时间" value="Asia/Tokyo" />
                  <el-option label="UTC-05:00 纽约时间" value="America/New_York" />
                  <el-option label="UTC+00:00 伦敦时间" value="Europe/London" />
                </el-select>
              </el-form-item>

              <el-form-item label="日期格式">
                <el-radio-group v-model="languageSettings.dateFormat">
                  <el-radio label="YYYY-MM-DD">2024-01-15</el-radio>
                  <el-radio label="MM/DD/YYYY">01/15/2024</el-radio>
                  <el-radio label="DD/MM/YYYY">15/01/2024</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="时间格式">
                <el-radio-group v-model="languageSettings.timeFormat">
                  <el-radio label="24h">24小时制</el-radio>
                  <el-radio label="12h">12小时制</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="saveLanguageSettings" :loading="saving">
                  保存语言设置
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import {
  User,
  Lock,
  Bell,
  Brush,
  Location
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ref, onMounted } from 'vue'

import api from '@/api'
import { useAuthStore } from '@/stores/auth'

defineOptions({ name: 'SettingsView' })

const authStore = useAuthStore()

// 响应式数据
const activeTab = ref('account')
const saving = ref(false)

// 账户设置表单
const accountForm = ref({
  username: '',
  email: '',
  phone: '',
  bio: ''
})

// 密码修改表单
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 隐私设置
const privacySettings = ref({
  profileVisibility: 'public',
  activityVisibility: 'public',
  searchable: true,
  allowFriendRequests: true,
  showOnlineStatus: true
})

// 通知设置
const notificationSettings = ref({
  email: {
    systemAnnouncements: true,
    activityReminders: true,
    securityAlerts: true,
    weeklyDigest: false
  },
  site: {
    privateMessages: true,
    commentReplies: true,
    likesAndFavorites: true,
    systemMessages: true
  },
  push: {
    enabled: false,
    activityStart: true,
    registrationSuccess: true
  }
})

// 外观设置
const appearanceSettings = ref({
  theme: 'light',
  primaryColor: '#409EFF',
  fontSize: 14,
  compactMode: false,
  animations: true
})

const fontSizeMarks = {
  12: '小',
  14: '标准',
  16: '中',
  18: '大',
  20: '特大'
}

// 语言设置
const languageSettings = ref({
  interface: 'zh-CN',
  timezone: 'Asia/Shanghai',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h'
})

// 方法
const handleTabSelect = (index) => {
  activeTab.value = index
}

const saveAccountSettings = async () => {
  try {
    saving.value = true
    // 调用API保存账户设置
    // await api.userApi.updateProfile(accountForm.value)
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    ElMessage.success('账户设置已保存')
  } catch (error) {
    console.error('保存账户设置失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const changePassword = async () => {
  // 验证密码
  if (!passwordForm.value.currentPassword) {
    ElMessage.warning('请输入当前密码')
    return
  }
  if (!passwordForm.value.newPassword) {
    ElMessage.warning('请输入新密码')
    return
  }
  if (passwordForm.value.newPassword.length < 6) {
    ElMessage.warning('新密码长度不能少于6位')
    return
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致')
    return
  }

  try {
    saving.value = true
    // 调用API修改密码
    // await api.userApi.changePassword(passwordForm.value)
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    ElMessage.success('密码修改成功，请重新登录')
    // 清空表单
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error('修改失败，请检查当前密码是否正确')
  } finally {
    saving.value = false
  }
}

const savePrivacySettings = async () => {
  try {
    saving.value = true
    // 调用API保存隐私设置
    // await api.userApi.updatePrivacySettings(privacySettings.value)
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    ElMessage.success('隐私设置已保存')
  } catch (error) {
    console.error('保存隐私设置失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const saveNotificationSettings = async () => {
  try {
    saving.value = true
    // 调用API保存通知设置
    // await api.userApi.updateNotificationSettings(notificationSettings.value)
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    ElMessage.success('通知设置已保存')
  } catch (error) {
    console.error('保存通知设置失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const saveAppearanceSettings = async () => {
  try {
    saving.value = true
    // 保存到本地存储
    localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings.value))
    // 调用API保存外观设置
    // await api.userApi.updateAppearanceSettings(appearanceSettings.value)
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    ElMessage.success('外观设置已保存')
  } catch (error) {
    console.error('保存外观设置失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const resetAppearanceSettings = () => {
  appearanceSettings.value = {
    theme: 'light',
    primaryColor: '#409EFF',
    fontSize: 14,
    compactMode: false,
    animations: true
  }
  ElMessage.info('已重置为默认设置')
}

const handleThemeChange = (value) => {
  // 应用主题
  document.documentElement.setAttribute('data-theme', value)
  if (value === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const handleColorChange = (color) => {
  // 应用主题色
  document.documentElement.style.setProperty('--el-color-primary', color)
}

const handleFontSizeChange = (size) => {
  // 应用字体大小
  document.documentElement.style.setProperty('--base-font-size', `${size}px`)
}

const handleCompactModeChange = (enabled) => {
  // 应用紧凑模式
  if (enabled) {
    document.documentElement.classList.add('compact-mode')
  } else {
    document.documentElement.classList.remove('compact-mode')
  }
}

const handleAnimationChange = (enabled) => {
  // 应用动画设置
  if (enabled) {
    document.documentElement.classList.remove('no-animations')
  } else {
    document.documentElement.classList.add('no-animations')
  }
}

const saveLanguageSettings = async () => {
  try {
    saving.value = true
    // 保存到本地存储
    localStorage.setItem('languageSettings', JSON.stringify(languageSettings.value))
    // 调用API保存语言设置
    // await api.userApi.updateLanguageSettings(languageSettings.value)
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    ElMessage.success('语言设置已保存')
  } catch (error) {
    console.error('保存语言设置失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const handleLanguageChange = (language) => {
  ElMessage.info(`语言已切换为: ${language}`)
  // 实际应用中这里应该重新加载页面或动态切换语言
}

// 加载用户设置
const loadUserSettings = async () => {
  try {
    // 加载用户基本信息
    if (authStore.user) {
      accountForm.value = {
        username: authStore.user.username || '',
        email: authStore.user.email || '',
        phone: authStore.user.phone || '',
        bio: authStore.user.bio || ''
      }
    }

    // 从本地存储加载外观设置
    const savedAppearanceSettings = localStorage.getItem('appearanceSettings')
    if (savedAppearanceSettings) {
      appearanceSettings.value = JSON.parse(savedAppearanceSettings)
    }

    // 从本地存储加载语言设置
    const savedLanguageSettings = localStorage.getItem('languageSettings')
    if (savedLanguageSettings) {
      languageSettings.value = JSON.parse(savedLanguageSettings)
    }

    // 调用API获取用户设置
    // const response = await api.userApi.getSettings()
    // privacySettings.value = response.privacy
    // notificationSettings.value = response.notifications
  } catch (error) {
    console.error('加载用户设置失败:', error)
  }
}

// 生命周期
onMounted(() => {
  loadUserSettings()
})
</script>

<style scoped>
.settings-view {
  padding: 20px;
}

.settings-header {
  margin-bottom: 20px;
}

.settings-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
}

.subtitle {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.settings-nav {
  position: sticky;
  top: 20px;
}

.settings-menu {
  border: none;
}

.settings-content {
  min-height: 600px;
}

.setting-section {
  padding: 20px;
}

.setting-section h3 {
  margin: 0 0 24px 0;
  color: #303133;
  font-size: 20px;
  border-bottom: 2px solid #409EFF;
  padding-bottom: 10px;
}

.setting-section h4 {
  margin: 20px 0 16px 0;
  color: #606266;
  font-size: 16px;
}

.settings-form {
  max-width: 800px;
}

.form-tip {
  display: block;
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

.notification-group {
  margin-bottom: 20px;
}

.notification-group h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 15px;
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-preview {
  color: #606266;
  font-size: 14px;
}

.theme-preview {
  margin-top: 20px;
  max-width: 500px;
}

.preview-content h5 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
}

.preview-content p {
  margin: 0 0 16px 0;
  color: #606266;
  line-height: 1.6;
}

.preview-content .el-button {
  margin-right: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-view {
    padding: 15px;
  }

  .el-col {
    margin-bottom: 20px;
  }

  .el-col:first-child {
    margin-bottom: 0;
  }

  .settings-nav {
    position: static;
  }

  .settings-form {
    max-width: 100%;
  }

  .form-tip {
    font-size: 11px;
  }
}
</style>
