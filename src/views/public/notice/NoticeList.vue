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

      <div v-else class="notice-table-container">
        <!-- 表格头部 -->
        <div class="table-header">
          <div class="header-cell publish-time">发布时间</div>
          <div class="header-cell notice-type">公告类型</div>
          <div class="header-cell notice-title">公告标题</div>
          <div class="header-cell expire-time">过期时间</div>
        </div>

        <!-- 表格内容 -->
        <div class="table-body">
          <div
            v-for="notice in notices"
            :key="notice.id"
            class="table-row"
            @click="goToDetail(notice.id)"
          >
            <div class="cell publish-time">{{ formatDate(notice.createdAt) }}</div>
            <div class="cell notice-type">
              <el-tag :type="getNoticeTypeTag(notice.type)" size="small">
                {{ getNoticeTypeText(notice.type) }}
              </el-tag>
            </div>
            <div class="cell notice-title">{{ notice.title }}</div>
            <div class="cell expire-time">
              {{ notice.expireTime ? formatDate(notice.expireTime) : '永不过期' }}
            </div>
          </div>
        </div>

        <!-- 分页按钮 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading, ElEmpty } from 'element-plus'
import { useNoticeStore } from '@/store/modules/notice'
import {
  getNoticeTypeTag,
  getNoticeTypeText,
  formatDate,
  type NoticeItem
} from '@/utils/notice'

const router = useRouter()
const noticeStore = useNoticeStore()

// 本地分页状态
const currentPage = ref(1)
const pageSize = ref(10)

// 计算属性，从store获取数据
const loading = computed(() => noticeStore.loading)
const notices = computed(() => noticeStore.publicNotices)
const total = computed(() => noticeStore.pagination.total)

/**
 * 获取公告列表数据
 */
const fetchNotices = async () => {
  try {
    console.log('📄 组件开始获取公告列表:', {
      currentPage: currentPage.value,
      pageSize: pageSize.value
    })

    const result = await noticeStore.fetchPublicNotices({
      page: currentPage.value,
      size: pageSize.value
    })

    console.log('📋 组件更新公告数据:', {
      itemsCount: result.data?.items?.length || 0,
      total: result.data?.total || 0,
      currentPage: currentPage.value
    })

    if (!result.success) {
      ElMessage.error(result.error || '获取公告列表失败')
    }
  } catch (error) {
    console.error('💥 组件获取公告失败:', error)
    ElMessage.error('获取公告列表失败')
  }
}

// 分页处理方法
const handleSizeChange = (size: number) => {
  console.log('📏 页面大小改变:', { oldSize: pageSize.value, newSize: size })
  pageSize.value = size
  currentPage.value = 1
  fetchNotices()
}

const handleCurrentChange = (page: number) => {
  console.log('📄 当前页改变:', { oldPage: currentPage.value, newPage: page })
  currentPage.value = page
  fetchNotices()
}

const goToDetail = (id: number | string) => {
  router.push(`/notice/${id}`)
}

// 导出详情获取函数，供其他组件使用
defineExpose({
  fetchNoticeDetail: noticeStore.fetchPublicNotice
})

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

.notice-table-container {
  background: #fff;
  overflow: hidden;
}

/* 表格头部 */
.table-header {
  display: flex;
  background: #fff;
  border-bottom: 2px solid #e74c3c;
  font-weight: bold;
  color: #e74c3c;
}

.header-cell {
  padding: 15px 12px;
  border-right: none;
  font-size: 16px;
  text-align: center;
  justify-content: center;
}

.header-cell:last-child {
  border-right: none;
}

/* 固定宽度列 */
.publish-time {
  width: 160px;
  flex-shrink: 0;
}

.notice-type {
  width: 140px;
  flex-shrink: 0;
}

.expire-time {
  width: 160px;
  flex-shrink: 0;
}

/* 自适应宽度列 */
.notice-title {
  flex: 1;
  min-width: 200px;
}

/* 表格主体 */
.table-body {
  max-height: 600px;
  overflow-y: auto;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #e8e8e8;
  cursor: pointer;
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: #f9f9f9;
}

.table-row:last-child {
  border-bottom: none;
}

.cell {
  padding: 12px;
  border-right: none;
  font-size: 14px;
  color: #333333;
  display: flex;
  align-items: center;
  line-height: 1.4;
  text-align: left;
}

.cell:last-child {
  border-right: none;
}

/* 固定宽度单元格 */
.cell.publish-time {
  color: #666666;
  font-size: 14px;
  text-align: center;
  justify-content: center;
}

.cell.notice-type {
  text-align: center;
  justify-content: center;
}

.cell.expire-time {
  color: #666666;
  font-size: 14px;
  text-align: center;
  justify-content: center;
}

/* 公告标题单元格 */
.cell.notice-title {
  color: #333333;
  font-weight: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  justify-content: flex-start;
}

/* 分页容器 */
.pagination-container {
  padding: 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #e8e8e8;
  background: #fff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notice-list {
    padding: 15px;
  }

  .table-header,
  .table-row {
    flex-direction: column;
  }

  .header-cell,
  .cell {
    width: 100% !important;
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
  }

  .header-cell:last-child,
  .cell:last-child {
    border-bottom: none;
  }

  .publish-time,
  .notice-type,
  .expire-time {
    width: 100% !important;
  }

  .cell.notice-type {
    justify-content: flex-start;
  }

  .cell.notice-title {
    white-space: normal;
    line-height: 1.5;
  }

  .pagination-container {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .notice-list {
    padding: 10px;
  }

  .header-cell,
  .cell {
    padding: 10px 12px;
    font-size: 13px;
  }

  .cell.notice-title {
    font-size: 14px;
  }
}
</style>