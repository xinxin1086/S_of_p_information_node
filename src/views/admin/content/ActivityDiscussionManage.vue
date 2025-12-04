<!-- ./src/views/admin/content/ActivityDiscussionManage.vue -->
<template>
  <div class="info-container">
    <!-- 页面标题和返回按钮 -->
    <div class="page-header">
      <el-button type="primary" @click="goBack" class="back-btn">
        <el-icon><ArrowLeft /></el-icon>
        返回活动管理
      </el-button>
      <div class="page-title">
        <h2>{{ activityTitle || '活动' }} - 讨论管理</h2>
      </div>
    </div>

    <!-- 查询栏 -->
    <div class="info-list-query-bar">
      <el-input
          v-model="queryParams.user_display"
          placeholder="请输入用户名查询"
          class="info-form-input"
          style="width: 200px;"
      ></el-input>
      <el-input
          v-model="queryParams.content"
          placeholder="请输入讨论内容查询"
          class="info-form-input"
          style="width: 250px; margin-left: 12px;"
      ></el-input>
      <button class="info-btn query-btn" @click="handleQuery" style="margin-left: 12px;">查询</button>
      <button class="info-btn reset-btn" @click="handleReset" style="margin-left: 8px;">重置</button>
    </div>

    <!-- 操作栏 -->
    <div class="info-list-action-bar">
      <button class="info-btn batch-delete-btn" @click="handleBatchDelete" :disabled="selectedIds.length === 0">
        批量删除讨论 ({{ selectedIds.length }})
      </button>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="info-global-error">{{ errorMessage }}</div>

    <!-- 无数据提示 -->
    <div v-if="!showTable && !errorMessage" class="info-list-empty-tip">暂无讨论数据</div>

    <!-- 讨论表格 -->
    <el-table
        :data="discussionList"
        v-if="showTable"
        border
        class="info-list-table"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="60" />

      <el-table-column prop="user_display" label="用户" width="120">
        <template #default="scope">{{ scope.row.user_display || '-' }}</template>
      </el-table-column>

      <el-table-column prop="content" label="讨论内容" min-width="300">
        <template #default="scope">
          <div class="discussion-content">
            {{ scope.row.content || '-' }}
            <!-- 显示图片缩略图 -->
            <div v-if="scope.row.images && scope.row.images.length > 0" class="images-preview">
              <el-image
                  v-for="(image, index) in scope.row.images.slice(0, 3)"
                  :key="index"
                  :src="image"
                  :preview-src-list="scope.row.images"
                  fit="cover"
                  class="discussion-image"
                  style="width: 40px; height: 40px; margin-right: 4px; border-radius: 4px;"
              />
              <span v-if="scope.row.images.length > 3" class="more-images">
                +{{ scope.row.images.length - 3 }}
              </span>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="评论数" width="80">
        <template #default="scope">
          <el-tag type="info" size="small">{{ scope.row.comment_count || 0 }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="created_at" label="发布时间" width="180">
        <template #default="scope">{{ formatDate(scope.row.created_at) ?? '-' }}</template>
      </el-table-column>

      <el-table-column prop="updated_at" label="更新时间" width="180">
        <template #default="scope">{{ formatDate(scope.row.updated_at) ?? '-' }}</template>
      </el-table-column>

      <el-table-column label="操作" width="200">
        <template #default="scope">
          <button class="info-btn comment-btn" @click="handleViewComments(scope.row)" style="margin-right: 4px;">
            查看评论 ({{ scope.row.comment_count || 0 }})
          </button>
          <button class="info-btn delete-btn" @click="handleDelete(scope.row)">删除</button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="info-pagination" v-if="showTable">
      <span>共 {{ total }} 条</span>
      <button :disabled="currentPage === 1" @click="handlePageChange(currentPage - 1)">&lt;</button>
      <button class="current-page">{{ currentPage }}</button>
      <button :disabled="currentPage === totalPage" @click="handlePageChange(currentPage + 1)">&gt;</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';
import { adminApi } from '@/api/index.js';
import { formatErrorMessage } from '@/utils/apiHelper.js';

const router = useRouter();
const route = useRoute();

// 从路由参数获取活动信息
const activityId = ref(route.query.activityId || '');
const activityTitle = ref(route.query.activityTitle || '');

// 查询参数
const queryParams = ref({
  user_display: '',
  content: ''
});

// 分页参数
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const totalPage = computed(() => Math.ceil(total.value / pageSize.value) || 1);

// 状态控制
const discussionList = ref([]);
const selectedIds = ref([]);
const showTable = ref(true);
const isLoading = ref(false);
const errorMessage = ref('');

// 日期格式化
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取讨论列表
const fetchDiscussions = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const filters = {};
    if (queryParams.value.user_display?.trim()) {
      filters.user_display = queryParams.value.user_display.trim();
    }
    if (queryParams.value.content?.trim()) {
      filters.content = queryParams.value.content.trim();
    }
    if (activityId.value) {
      filters.activity_id = activityId.value;
    }

    const response = await adminApi.activityDiscussion.list({
      page: currentPage.value,
      size: pageSize.value,
      kwargs: filters
    });

    if (response.success) {
      discussionList.value = response.items || [];
      total.value = response.total || 0;
      showTable.value = true;
      errorMessage.value = '';
    } else {
      errorMessage.value = '查询讨论失败：' + (response.message || '未知错误');
      showTable.value = false;
    }
  } catch (error) {
    errorMessage.value = formatErrorMessage(error, '查询讨论失败');
    showTable.value = false;
    console.error('讨论查询错误：', error);
  } finally {
    isLoading.value = false;
  }
};

// 查询按钮
const handleQuery = () => {
  currentPage.value = 1;
  fetchDiscussions();
};

// 重置按钮
const handleReset = () => {
  queryParams.value = { user_display: '', content: '' };
  currentPage.value = 1;
  fetchDiscussions();
};

// 分页切换
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchDiscussions();
};

// 表格选择事件
const handleSelectionChange = (val) => {
  selectedIds.value = val.map(item => item.id);
};

// 查看评论
const handleViewComments = (discussion) => {
  router.push({
    path: '/admin/discuss-comments',
    query: {
      discussionId: discussion.id,
      activityId: activityId.value,
      activityTitle: activityTitle.value,
      discussionContent: discussion.content.substring(0, 50) + (discussion.content.length > 50 ? '...' : '')
    }
  });
};

// 单个删除
const handleDelete = async (discussion) => {
  if (!confirm('确定要删除该讨论吗？删除后相关的评论也会被删除。')) return;
  isLoading.value = true;

  try {
    const response = await adminApi.activityDiscussion.delete(discussion.id);
    if (response.success) {
      alert('删除成功！');
      fetchDiscussions();
    } else {
      alert('删除失败：' + (response.message || '未知错误'));
    }
  } catch (error) {
    alert('删除失败：' + formatErrorMessage(error, '删除讨论失败'));
  } finally {
    isLoading.value = false;
  }
};

// 批量删除
const handleBatchDelete = async () => {
  if (!confirm(`确定要删除选中的${selectedIds.value.length}条讨论吗？删除后相关的评论也会被删除。`)) return;
  try {
    isLoading.value = true;
    const promises = selectedIds.value.map(id => adminApi.activityDiscussion.delete(id));
    await Promise.all(promises);

    alert('批量删除成功！');
    selectedIds.value = [];
    fetchDiscussions();
  } catch (error) {
    alert('批量删除失败：' + formatErrorMessage(error, '批量删除讨论失败'));
  } finally {
    isLoading.value = false;
  }
};

// 返回活动管理
const goBack = () => {
  router.push('/admin/activity-manage');
};

// 页面挂载时查询数据
onMounted(() => {
  fetchDiscussions();
});
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.page-title h2 {
  margin: 0;
  color: #303133;
  font-weight: 500;
}

.discussion-content {
  line-height: 1.5;
  word-break: break-word;
}

.images-preview {
  display: flex;
  align-items: center;
  margin-top: 8px;
  gap: 4px;
}

.discussion-image {
  border: 1px solid #dcdfe6;
}

.more-images {
  color: #909399;
  font-size: 12px;
  margin-left: 4px;
}

/* 查看评论按钮样式 */
.comment-btn {
  background-color: #409eff;
  color: white;
  border: 1px solid #409eff;
  font-size: 12px;
  padding: 4px 8px;
}

.comment-btn:hover {
  background-color: #337ecc;
}

/* 删除按钮样式 */
.delete-btn {
  background-color: #f56c6c;
  color: white;
  border: 1px solid #f56c6c;
}

.delete-btn:hover {
  background-color: #e64242;
}

/* 批量删除按钮样式 */
.batch-delete-btn {
  background-color: #ff4757;
  color: white;
  border: 1px solid #ff4757;
}

.batch-delete-btn:hover:not(:disabled) {
  background-color: #ff3838;
}

.batch-delete-btn:disabled {
  background-color: #c0c4cc;
  border-color: #c0c4cc;
  color: #606266;
  cursor: not-allowed;
}
</style>