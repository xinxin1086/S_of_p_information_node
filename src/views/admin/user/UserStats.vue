<template>
  <div class="user-stats">
    <div class="stats-header">
      <h2>用户统计</h2>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleDateChange"
          class="date-picker"
        />
        <el-button type="primary" @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              <el-icon size="32"><User /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats.totalUsers }}</h3>
              <p>总用户数</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
              <el-icon size="32"><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats.activeUsers }}</h3>
              <p>活跃用户</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
              <el-icon size="32"><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats.newUsersToday }}</h3>
              <p>今日新增</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
              <el-icon size="32"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats.growthRate }}%</h3>
              <p>增长率</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-section">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用户增长趋势</span>
              <el-radio-group v-model="trendPeriod" size="small" @change="loadTrendData">
                <el-radio-button label="week">周</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
                <el-radio-button label="year">年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="growthChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>用户角色分布</span>
          </template>
          <div ref="roleChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户活跃度分析 -->
    <el-row :gutter="20" class="charts-section">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>用户活跃度</span>
          </template>
          <div ref="activityChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>用户注册来源</span>
          </template>
          <div ref="sourceChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <div class="header-filters">
            <el-select v-model="roleFilter" placeholder="角色筛选" style="width: 150px" clearable @change="loadUsers">
              <el-option label="全部" value="" />
              <el-option label="普通用户" value="USER" />
              <el-option label="管理员" value="ADMIN" />
              <el-option label="超级管理员" value="SUPER_ADMIN" />
            </el-select>
            <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 150px" clearable @change="loadUsers">
              <el-option label="全部" value="" />
              <el-option label="活跃" value="active" />
              <el-option label="禁用" value="inactive" />
            </el-select>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索用户名/邮箱"
              style="width: 200px"
              clearable
              @clear="loadUsers"
              @keyup.enter="loadUsers"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <el-table :data="users" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="32" :src="row.avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="username">{{ row.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="role" label="角色" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">
              {{ getRoleText(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="activityCount" label="活动数" width="100" align="center" />
        <el-table-column prop="loginCount" label="登录次数" width="100" align="center" />
        <el-table-column prop="lastLoginTime" label="最后登录" width="180">
          <template #default="{ row }">
            {{ formatTime(row.lastLoginTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '活跃' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">
              查看详情
            </el-button>
            <el-button type="warning" link size="small" @click="editUser(row)">
              编辑
            </el-button>
            <el-button
              :type="row.status === 'active' ? 'danger' : 'success'"
              link
              size="small"
              @click="toggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import {
  User,
  UserFilled,
  Calendar,
  TrendCharts,
  Download,
  Search
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, onMounted, onBeforeUnmount } from 'vue'

import api from '@/api'

defineOptions({ name: 'UserStats' })

// 响应式数据
const loading = ref(false)
const dateRange = ref([
  dayjs().subtract(30, 'day').toDate(),
  dayjs().toDate()
])
const trendPeriod = ref('month')
const searchKeyword = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 统计数据
const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  newUsersToday: 0,
  growthRate: 0
})

// 用户列表
const users = ref([])

// 图表引用
const growthChartRef = ref(null)
const roleChartRef = ref(null)
const activityChartRef = ref(null)
const sourceChartRef = ref(null)
let growthChart = null
let roleChart = null
let activityChart = null
let sourceChart = null

// 方法
const loadStats = async () => {
  try {
    loading.value = true
    // 这里应该调用真实的API
    // const response = await api.adminApi.getUserStatistics({
    //   startDate: dayjs(dateRange.value[0]).format('YYYY-MM-DD'),
    //   endDate: dayjs(dateRange.value[1]).format('YYYY-MM-DD')
    // })

    // 模拟数据
    stats.value = {
      totalUsers: 1234,
      activeUsers: 856,
      newUsersToday: 15,
      growthRate: 12.5
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.value = false
  }
}

const loadUsers = async () => {
  try {
    loading.value = true
    // 这里应该调用真实的API
    // const response = await api.adminApi.getUsers({
    //   page: currentPage.value,
    //   size: pageSize.value,
    //   role: roleFilter.value,
    //   status: statusFilter.value,
    //   keyword: searchKeyword.value
    // })

    // 模拟数据
    users.value = Array.from({ length: pageSize.value }, (_, i) => ({
      id: (currentPage.value - 1) * pageSize.value + i + 1,
      username: `用户${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: ['USER', 'ADMIN', 'SUPER_ADMIN'][i % 3],
      activityCount: Math.floor(Math.random() * 20),
      loginCount: Math.floor(Math.random() * 100),
      lastLoginTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      status: i % 5 === 0 ? 'inactive' : 'active',
      createdAt: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000),
      avatar: ''
    }))
    total.value = 500
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const initGrowthChart = () => {
  if (!growthChartRef.value) return

  growthChart = echarts.init(growthChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['新增用户', '活跃用户']
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增用户',
        type: 'bar',
        data: [50, 80, 60, 90, 100, 120],
        itemStyle: { color: '#667eea' }
      },
      {
        name: '活跃用户',
        type: 'line',
        data: [40, 70, 50, 80, 90, 110],
        smooth: true,
        itemStyle: { color: '#f5576c' }
      }
    ]
  }

  growthChart.setOption(option)
}

const initRoleChart = () => {
  if (!roleChartRef.value) return

  roleChart = echarts.init(roleChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '用户角色',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 1045, name: '普通用户' },
          { value: 150, name: '管理员' },
          { value: 39, name: '超级管理员' }
        ]
      }
    ]
  }

  roleChart.setOption(option)
}

const initActivityChart = () => {
  if (!activityChartRef.value) return

  activityChart = echarts.init(activityChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: ['非常活跃', '活跃', '一般', '不活跃', '休眠']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '用户数',
        type: 'bar',
        data: [120, 350, 400, 250, 114],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }
    ]
  }

  activityChart.setOption(option)
}

const initSourceChart = () => {
  if (!sourceChartRef.value) return

  sourceChart = echarts.init(sourceChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [
      {
        name: '注册来源',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 600, name: '直接注册' },
          { value: 400, name: '邀请链接' },
          { value: 200, name: '社交媒体' },
          { value: 34, name: '其他' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  sourceChart.setOption(option)
}

const handleDateChange = () => {
  loadStats()
}

const handleSizeChange = () => {
  currentPage.value = 1
  loadUsers()
}

const handlePageChange = () => {
  loadUsers()
}

const loadTrendData = () => {
  initGrowthChart()
}

const viewDetail = (user) => {
  console.log('查看用户详情:', user)
}

const editUser = (user) => {
  console.log('编辑用户:', user)
}

const toggleStatus = async (user) => {
  const action = user.status === 'active' ? '禁用' : '启用'

  try {
    await ElMessageBox.confirm(
      `确定要${action}用户 "${user.username}" 吗？`,
      '确认操作',
      {
        type: 'warning'
      }
    )

    // 调用API更新用户状态
    // await api.adminApi.updateUserStatus(user.id, {
    //   status: user.status === 'active' ? 'inactive' : 'active'
    // })

    ElMessage.success(`${action}成功`)
    loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新用户状态失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

const exportData = () => {
  ElMessage.info('正在导出用户统计数据...')
}

// 辅助方法
const formatTime = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const getRoleTagType = (role) => {
  const typeMap = {
    'USER': '',
    'ADMIN': 'warning',
    'SUPER_ADMIN': 'danger'
  }
  return typeMap[role] || ''
}

const getRoleText = (role) => {
  const textMap = {
    'USER': '普通用户',
    'ADMIN': '管理员',
    'SUPER_ADMIN': '超级管理员'
  }
  return textMap[role] || role
}

// 处理窗口大小调整
const handleResize = () => {
  growthChart?.resize()
  roleChart?.resize()
  activityChart?.resize()
  sourceChart?.resize()
}

// 生命周期
onMounted(() => {
  loadStats()
  loadUsers()
  initGrowthChart()
  initRoleChart()
  initActivityChart()
  initSourceChart()

  // 响应式调整图表大小
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  growthChart?.dispose()
  roleChart?.dispose()
  activityChart?.dispose()
  sourceChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.user-stats {
  padding: 20px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats-header h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.date-picker {
  width: 280px;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  overflow: hidden;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-info h3 {
  margin: 0 0 5px 0;
  font-size: 28px;
  color: #303133;
}

.stat-info p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.charts-section {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-filters {
  display: flex;
  gap: 10px;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.table-card {
  border-radius: 12px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.username {
  margin-left: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .date-picker {
    width: 100%;
  }

  .stats-cards {
    margin-bottom: 10px;
  }

  .stat-card {
    margin-bottom: 10px;
  }

  .charts-section {
    margin-bottom: 10px;
  }

  .header-filters {
    flex-direction: column;
    width: 100%;
  }

  .header-filters .el-select,
  .header-filters .el-input {
    width: 100% !important;
  }
}
</style>
