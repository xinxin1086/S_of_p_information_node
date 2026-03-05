<template>
  <div v-if="isDev" class="mock-control-panel">
    <el-card class="control-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>🔧 Mock 数据控制面板</span>
          <el-button
            :icon="isExpanded ? ArrowDown : ArrowRight"
            text
            @click="isExpanded = !isExpanded"
          />
        </div>
      </template>

      <el-collapse-transition>
        <div v-show="isExpanded">
          <!-- API 模式切换 -->
          <div class="control-section">
            <div class="section-title">API 模式</div>
            <el-segmented
              v-model="apiMode"
              :options="[
                { label: 'Mock API', value: 'mock' },
                { label: '真实 API', value: 'real' }
              ]"
              @change="handleApiModeChange"
            />
            <el-tag
              :type="apiMode === 'mock' ? 'warning' : 'success'"
              size="small"
              style="margin-left: 10px"
            >
              {{ apiMode === 'mock' ? '开发中' : '生产' }}
            </el-tag>
          </div>

          <!-- 数据统计 -->
          <div class="control-section">
            <div class="section-title">数据统计</div>
            <el-tabs v-model="activeTab" type="border-card">
              <el-tab-pane label="活动数据" name="activity">
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="活动">{{ stats.activities }}</el-descriptions-item>
                  <el-descriptions-item label="预约">{{ stats.bookings }}</el-descriptions-item>
                  <el-descriptions-item label="评分">{{ stats.ratings }}</el-descriptions-item>
                  <el-descriptions-item label="讨论">{{ stats.discussions }}</el-descriptions-item>
                  <el-descriptions-item label="评论" :span="2">{{ stats.comments }}</el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>
              <el-tab-pane label="用户数据" name="user">
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="总用户">{{ userStats.total_users }}</el-descriptions-item>
                  <el-descriptions-item label="普通用户">{{ userStats.normal_users }}</el-descriptions-item>
                  <el-descriptions-item label="组织用户">{{ userStats.org_users }}</el-descriptions-item>
                  <el-descriptions-item label="管理员">{{ userStats.admins }}</el-descriptions-item>
                  <el-descriptions-item label="活跃用户">{{ userStats.active_users }}</el-descriptions-item>
                  <el-descriptions-item label="已封禁">{{ userStats.banned_users }}</el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>
              <el-tab-pane label="公告数据" name="notice">
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="总公告">{{ noticeStats.total_notices }}</el-descriptions-item>
                  <el-descriptions-item label="系统通知">{{ noticeStats.system_notices }}</el-descriptions-item>
                  <el-descriptions-item label="活动公告">{{ noticeStats.activity_notices }}</el-descriptions-item>
                  <el-descriptions-item label="其他公告">{{ noticeStats.general_notices }}</el-descriptions-item>
                  <el-descriptions-item label="有效公告">{{ noticeStats.active_notices }}</el-descriptions-item>
                  <el-descriptions-item label="已过期">{{ noticeStats.expired_notices }}</el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>
              <el-tab-pane label="科普文章" name="science">
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="总文章">{{ scienceStats.total_articles }}</el-descriptions-item>
                  <el-descriptions-item label="已发布">{{ scienceStats.published_articles }}</el-descriptions-item>
                  <el-descriptions-item label="待审核">{{ scienceStats.pending_articles }}</el-descriptions-item>
                  <el-descriptions-item label="草稿">{{ scienceStats.draft_articles }}</el-descriptions-item>
                  <el-descriptions-item label="总点赞">{{ scienceStats.total_likes }}</el-descriptions-item>
                  <el-descriptions-item label="总浏览">{{ scienceStats.total_visits }}</el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>
              <el-tab-pane label="论坛" name="forum">
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="总帖子">{{ forumStats.total_posts }}</el-descriptions-item>
                  <el-descriptions-item label="总楼层">{{ forumStats.total_floors }}</el-descriptions-item>
                  <el-descriptions-item label="总回复">{{ forumStats.total_replies }}</el-descriptions-item>
                  <el-descriptions-item label="总点赞">{{ forumStats.total_likes }}</el-descriptions-item>
                  <el-descriptions-item label="总浏览" :span="2">{{ forumStats.total_visits }}</el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>
            </el-tabs>
          </div>

          <!-- 数据操作 -->
          <div class="control-section">
            <div class="section-title">数据操作</div>
            <el-space wrap>
              <el-button size="small" @click="handleRefresh">
                <el-icon><Refresh /></el-icon>
                刷新统计
              </el-button>
              <el-button size="small" type="warning" @click="handleReset">
                <el-icon><RefreshLeft /></el-icon>
                重置数据
              </el-button>
              <el-button size="small" type="danger" @click="handleClear">
                <el-icon><Delete /></el-icon>
                清空数据
              </el-button>
              <el-button size="small" @click="handleExport">
                <el-icon><Download /></el-icon>
                导出数据
              </el-button>
              <el-button size="small" @click="handleImport">
                <el-icon><Upload /></el-icon>
                导入数据
              </el-button>
            </el-space>
          </div>

          <!-- 快捷操作 -->
          <div class="control-section">
            <div class="section-title">快捷操作</div>
            <el-space wrap>
              <el-button size="small" type="primary" @click="handleAddActivity">
                <el-icon><Plus /></el-icon>
                添加测试活动
              </el-button>
              <el-button size="small" @click="showTestAccounts">
                <el-icon><User /></el-icon>
                查看测试账号
              </el-button>
              <el-button size="small" @click="openInNewTab">
                <el-icon><CopyDocument /></el-icon>
                打开数据查看器
              </el-button>
            </el-space>
          </div>

          <!-- 使用说明 -->
          <el-alert
            type="info"
            :closable="false"
            show-icon
            style="margin-top: 15px"
          >
            <template #title>
              <span style="font-size: 12px">
                切换 API 模式后页面将自动刷新
              </span>
            </template>
          </el-alert>
        </div>
      </el-collapse-transition>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  ArrowDown,
  ArrowRight,
  Refresh,
  RefreshLeft,
  Delete,
  Download,
  Upload,
  Plus,
  CopyDocument,
  User
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { setMockMode } from '@/config'
import { getCurrentApiType } from '@/utils/mockHelper'
import {
  getMockDataStats,
  resetMockData,
  clearMockData,
  exportMockData,
  importMockData,
  activityStorage
} from '@/mock/mockStorage'
import mockActivityData from '@/mock/activityMockData'
import { getUserStats } from '@/mock/userMockData'
import { getNoticeStats } from '@/mock/noticeMockData'
import { getScienceArticleStats } from '@/mock/scienceMockData'
import { getForumStats } from '@/mock/forumMockData'

const isDev = import.meta.env.DEV
const isExpanded = ref(true)
const activeTab = ref('activity')
const apiMode = ref<'mock' | 'real'>('mock')
const stats = ref({
  activities: 0,
  bookings: 0,
  ratings: 0,
  discussions: 0,
  comments: 0
})
const userStats = ref({
  total_users: 0,
  normal_users: 0,
  org_users: 0,
  admins: 0,
  deleted_users: 0,
  active_users: 0,
  banned_users: 0
})
const noticeStats = ref({
  total_notices: 0,
  system_notices: 0,
  activity_notices: 0,
  general_notices: 0,
  active_notices: 0,
  expired_notices: 0
})
const scienceStats = ref({
  total_articles: 0,
  published_articles: 0,
  pending_articles: 0,
  draft_articles: 0,
  total_likes: 0,
  total_visits: 0
})
const forumStats = ref({
  total_posts: 0,
  total_floors: 0,
  total_replies: 0,
  total_likes: 0,
  total_visits: 0
})

// 初始化
onMounted(() => {
  updateApiMode()
  updateAllStats()
})

// 更新 API 模式
function updateApiMode() {
  apiMode.value = getCurrentApiType()
}

// 更新所有统计数据
function updateAllStats() {
  stats.value = getMockDataStats()
  userStats.value = getUserStats()
  noticeStats.value = getNoticeStats()
  scienceStats.value = getScienceArticleStats()
  forumStats.value = getForumStats()
}

// 切换 API 模式
async function handleApiModeChange(value: 'mock' | 'real') {
  try {
    await ElMessageBox.confirm(
      `切换到 ${value === 'mock' ? 'Mock' : '真实'} API 后页面将刷新，是否继续？`,
      '确认切换',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    setMockMode(value === 'mock')
  } catch {
    // 取消切换，恢复原状态
    updateApiMode()
  }
}

// 刷新统计
function handleRefresh() {
  updateAllStats()
  ElMessage.success('统计数据已刷新')
}

// 重置数据
async function handleReset() {
  try {
    await ElMessageBox.confirm(
      '此操作将重置所有 Mock 数据为初始状态，是否继续？',
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    resetMockData(mockActivityData)
    updateAllStats()
    ElMessage.success('数据已重置')
  } catch {
    // 取消操作
  }
}

// 清空数据
async function handleClear() {
  try {
    await ElMessageBox.confirm(
      '此操作将清空所有 Mock 数据，是否继续？',
      '确认清空',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    clearMockData()
    updateAllStats()
    ElMessage.success('数据已清空')
  } catch {
    // 取消操作
  }
}

// 导出数据
function handleExport() {
  try {
    const json = exportMockData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mock-data-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('数据已导出')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 导入数据
function handleImport() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        importMockData(event.target?.result as string)
        updateAllStats()
        ElMessage.success('数据已导入')
      } catch (error) {
        ElMessage.error('导入失败，请检查文件格式')
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

// 添加测试活动
function handleAddActivity() {
  const newActivity = {
    id: Date.now(),
    title: `测试活动 ${Date.now()}`,
    description: '这是一个测试活动',
    type: 'other' as const,
    status: 'draft' as const,
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 3600000).toISOString(),
    location: '测试地点',
    max_participants: 50,
    current_participants: 0,
    organizer_id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_deleted: false
  }

  activityStorage.add(newActivity)
  updateAllStats()
  ElMessage.success('测试活动已添加')
}

// 显示测试账号
function showTestAccounts() {
  const win = window.open('', '_blank')
  if (win) {
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>测试账号列表</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background: #f5f7fa; }
          .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
          h1 { color: #303133; margin-bottom: 30px; border-bottom: 2px solid #409eff; padding-bottom: 10px; }
          h2 { color: #606266; margin-top: 30px; margin-bottom: 15px; font-size: 18px; }
          .user-group { margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ebeef5; }
          th { background: #f5f7fa; font-weight: 600; color: #606266; }
          tr:hover { background: #f5f7fa; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
          .badge-user { background: #e1f3d8; color: #67c23a; }
          .badge-org { background: #fdf6ec; color: #e6a23c; }
          .badge-admin { background: #fef0f0; color: #f56c6c; }
          .password { font-family: monospace; background: #f5f7fa; padding: 4px 8px; border-radius: 4px; color: #909399; }
          .notice { background: #ecf5ff; border-left: 4px solid #409eff; padding: 15px; margin-bottom: 20px; border-radius: 4px; }
          .notice h3 { margin: 0 0 10px 0; color: #409eff; font-size: 16px; }
          .notice p { margin: 5px 0; color: #606266; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔐 Mock 测试账号列表</h1>

          <div class="notice">
            <h3>💡 使用说明</h3>
            <p>• 以下账号可直接用于登录测试</p>
            <p>• 普通用户和组织用户密码：<span class="password">123456</span></p>
            <p>• 管理员密码：<span class="password">admin123</span></p>
          </div>

          <div class="user-group">
            <h2>👥 普通用户 (密码: 123456)</h2>
            <table>
              <thead>
                <tr><th>账号</th><th>用户名</th><th>手机号</th><th>角色</th></tr>
              </thead>
              <tbody>
                <tr><td>user001</td><td>张三</td><td>13800138001</td><td><span class="badge badge-user">普通用户</span></td></tr>
                <tr><td>user002</td><td>李四</td><td>13800138002</td><td><span class="badge badge-user">普通用户</span></td></tr>
                <tr><td>wangwu</td><td>王五</td><td>13800138003</td><td><span class="badge badge-user">普通用户</span></td></tr>
                <tr><td>zhaoliu</td><td>赵六</td><td>13800138004</td><td><span class="badge badge-user">普通用户</span></td></tr>
                <tr><td>sunqi</td><td>孙七</td><td>13800138005</td><td><span class="badge badge-user">普通用户</span></td></tr>
                <tr><td>zhouba</td><td>周八</td><td>13800138006</td><td><span class="badge badge-user">普通用户</span></td></tr>
                <tr><td>wujiu</td><td>吴九</td><td>13800138007</td><td><span class="badge badge-user">普通用户</span></td></tr>
                <tr><td>zhengshi</td><td>郑十</td><td>13800138008</td><td><span class="badge badge-user">普通用户</span></td></tr>
              </tbody>
            </table>
          </div>

          <div class="user-group">
            <h2>🏢 组织用户 (密码: 123456)</h2>
            <table>
              <thead>
                <tr><th>账号</th><th>用户名</th><th>角色</th></tr>
              </thead>
              <tbody>
                <tr><td>org001</td><td>环保志愿者协会</td><td><span class="badge badge-org">组织用户</span></td></tr>
                <tr><td>org002</td><td>钓鱼俱乐部</td><td><span class="badge badge-org">组织用户</span></td></tr>
                <tr><td>org003</td><td>生态保护基金会</td><td><span class="badge badge-org">组织用户</span></td></tr>
                <tr><td>org004</td><td>自然摄影协会</td><td><span class="badge badge-org">组织用户</span></td></tr>
              </tbody>
            </table>
          </div>

          <div class="user-group">
            <h2>👑 管理员 (密码: admin123)</h2>
            <table>
              <thead>
                <tr><th>账号</th><th>用户名</th><th>角色</th></tr>
              </thead>
              <tbody>
                <tr><td>admin001</td><td>系统管理员</td><td><span class="badge badge-admin">超级管理员</span></td></tr>
                <tr><td>admin002</td><td>内容审核员</td><td><span class="badge badge-admin">管理员</span></td></tr>
                <tr><td>admin003</td><td>用户管理员</td><td><span class="badge badge-admin">管理员</span></td></tr>
              </tbody>
            </table>
          </div>

          <div class="user-group">
            <h2>🔧 测试账号</h2>
            <table>
              <thead>
                <tr><th>账号</th><th>用户名</th><th>密码</th><th>角色</th></tr>
              </thead>
              <tbody>
                <tr><td>admin</td><td>系统管理员</td><td><span class="password">123456</span></td><td><span class="badge badge-admin">管理员</span></td></tr>
                <tr><td>test</td><td>测试用户</td><td><span class="password">123456</span></td><td><span class="badge badge-user">普通用户</span></td></tr>
              </tbody>
            </table>
          </div>

        </div>
      </body>
      </html>
    `)
  }
}

// 打开数据查看器
function openInNewTab() {
  const data = {
    activities: activityStorage.getAll(),
    stats: stats.value,
    exportTime: new Date().toISOString()
  }

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mock 数据查看器</title>
        <style>
          body { font-family: monospace; padding: 20px; }
          pre { background: #f5f5f5; padding: 15px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>Mock 数据查看器</h1>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </body>
      </html>
    `)
  }
}
</script>

<style scoped>
.mock-control-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
}

.control-card {
  border: 2px solid var(--el-color-primary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.control-section {
  margin-bottom: 20px;
}

.control-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--el-text-color-primary);
}
</style>
