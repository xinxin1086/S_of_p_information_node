<template>
  <div class="activity-stats">
    <div class="stats-header">
      <h2>活动统计</h2>
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
              <el-icon size="32"><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats.totalActivities }}</h3>
              <p>活动总数</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
              <el-icon size="32"><User /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats.totalParticipants }}</h3>
              <p>参与总人数</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
              <el-icon size="32"><Star /></el-icon>
            </div>
            <div class="stat-info">
              <h3>{{ stats.averageRating }}</h3>
              <p>平均评分</p>
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
              <h3>{{ stats.attendanceRate }}%</h3>
              <p>出席率</p>
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
              <span>活动参与趋势</span>
              <el-radio-group v-model="trendPeriod" size="small" @change="loadTrendData">
                <el-radio-button label="week">周</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
                <el-radio-button label="year">年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>活动类型分布</span>
          </template>
          <div ref="categoryChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 活动列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>活动详细统计</span>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索活动名称"
            style="width: 200px"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </template>

      <el-table :data="filteredActivities" style="width: 100%" v-loading="loading">
        <el-table-column prop="title" label="活动名称" width="200" />
        <el-table-column prop="category" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryTagType(row.category)">
              {{ row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="registeredCount" label="报名人数" width="100" align="center" />
        <el-table-column prop="attendedCount" label="出席人数" width="100" align="center" />
        <el-table-column prop="attendanceRate" label="出席率" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getAttendanceRateType(row.attendanceRate)">
              {{ row.attendanceRate }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="averageRating" label="平均评分" width="120" align="center">
          <template #default="{ row }">
            <el-rate v-model="row.averageRating" disabled show-score />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">
              查看详情
            </el-button>
            <el-button type="success" link size="small" @click="downloadReport(row)">
              下载报告
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
  Calendar,
  User,
  Star,
  TrendCharts,
  Download,
  Search
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

import api from '@/api'

defineOptions({ name: 'ActivityStats' })

// 响应式数据
const loading = ref(false)
const dateRange = ref([
  dayjs().subtract(30, 'day').toDate(),
  dayjs().toDate()
])
const trendPeriod = ref('month')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 统计数据
const stats = ref({
  totalActivities: 0,
  totalParticipants: 0,
  averageRating: 0,
  attendanceRate: 0
})

// 活动列表
const activities = ref([])

// 图表引用
const trendChartRef = ref(null)
const categoryChartRef = ref(null)
let trendChart = null
let categoryChart = null

// 计算属性
const filteredActivities = computed(() => {
  if (!searchKeyword.value) return activities.value
  const keyword = searchKeyword.value.toLowerCase()
  return activities.value.filter(activity =>
    activity.title.toLowerCase().includes(keyword)
  )
})

// 方法
const loadStats = async () => {
  try {
    loading.value = true
    // 这里应该调用真实的API
    // const response = await api.activityApi.getStatistics({
    //   startDate: dayjs(dateRange.value[0]).format('YYYY-MM-DD'),
    //   endDate: dayjs(dateRange.value[1]).format('YYYY-MM-DD')
    // })

    // 模拟数据
    stats.value = {
      totalActivities: 45,
      totalParticipants: 1234,
      averageRating: 4.5,
      attendanceRate: 85
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.value = false
  }
}

const loadActivities = async () => {
  try {
    loading.value = true
    // 这里应该调用真实的API
    // const response = await api.activityApi.getMyActivities({
    //   page: currentPage.value,
    //   size: pageSize.value,
    //   startDate: dayjs(dateRange.value[0]).format('YYYY-MM-DD'),
    //   endDate: dayjs(dateRange.value[1]).format('YYYY-MM-DD')
    // })

    // 模拟数据
    activities.value = Array.from({ length: pageSize.value }, (_, i) => ({
      id: i + 1,
      title: `活动 ${i + 1}`,
      category: ['讲座', '比赛', '培训', '娱乐'][i % 4],
      startTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      registeredCount: Math.floor(Math.random() * 50) + 10,
      attendedCount: Math.floor(Math.random() * 40) + 5,
      attendanceRate: Math.floor(Math.random() * 30) + 70,
      averageRating: (Math.random() * 2 + 3).toFixed(1),
      status: i % 3 === 0 ? 'ongoing' : (i % 3 === 1 ? 'completed' : 'draft')
    }))
    total.value = 100
  } catch (error) {
    console.error('加载活动列表失败:', error)
    ElMessage.error('加载活动列表失败')
  } finally {
    loading.value = false
  }
}

const initTrendChart = () => {
  if (!trendChartRef.value) return

  trendChart = echarts.init(trendChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['报名人数', '出席人数']
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
        name: '报名人数',
        type: 'line',
        data: [120, 132, 101, 134, 90, 230],
        smooth: true,
        itemStyle: { color: '#667eea' }
      },
      {
        name: '出席人数',
        type: 'line',
        data: [100, 110, 90, 120, 80, 200],
        smooth: true,
        itemStyle: { color: '#f5576c' }
      }
    ]
  }

  trendChart.setOption(option)
}

const initCategoryChart = () => {
  if (!categoryChartRef.value) return

  categoryChart = echarts.init(categoryChartRef.value)

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
        name: '活动类型',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 12, name: '讲座' },
          { value: 15, name: '比赛' },
          { value: 10, name: '培训' },
          { value: 8, name: '娱乐' }
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

  categoryChart.setOption(option)
}

const handleDateChange = () => {
  loadStats()
  loadActivities()
}

const handleSizeChange = () => {
  currentPage.value = 1
  loadActivities()
}

const handlePageChange = () => {
  loadActivities()
}

const loadTrendData = () => {
  // 根据时间周期重新加载趋势数据
  initTrendChart()
}

const viewDetail = (activity) => {
  // 跳转到活动详情页
  console.log('查看详情:', activity)
}

const downloadReport = (activity) => {
  ElMessage.success(`正在下载活动报告: ${activity.title}`)
}

const exportData = () => {
  ElMessage.info('正在导出统计数据...')
}

// 辅助方法
const formatTime = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const getCategoryTagType = (category) => {
  const typeMap = {
    '讲座': 'primary',
    '比赛': 'success',
    '培训': 'warning',
    '娱乐': 'info'
  }
  return typeMap[category] || ''
}

const getAttendanceRateType = (rate) => {
  if (rate >= 80) return 'success'
  if (rate >= 60) return 'warning'
  return 'danger'
}

const getStatusTagType = (status) => {
  const typeMap = {
    'draft': 'info',
    'ongoing': 'warning',
    'completed': 'success'
  }
  return typeMap[status] || ''
}

const getStatusText = (status) => {
  const textMap = {
    'draft': '草稿',
    'ongoing': '进行中',
    'completed': '已完成'
  }
  return textMap[status] || status
}

// 处理窗口大小调整
const handleResize = () => {
  trendChart?.resize()
  categoryChart?.resize()
}

// 生命周期
onMounted(() => {
  loadStats()
  loadActivities()
  initTrendChart()
  initCategoryChart()

  // 响应式调整图表大小
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  trendChart?.dispose()
  categoryChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.activity-stats {
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

.chart-container {
  width: 100%;
  height: 300px;
}

.table-card {
  border-radius: 12px;
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
}
</style>
