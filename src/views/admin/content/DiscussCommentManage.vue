<!-- ./src/views/admin/content/DiscussCommentManage.vue -->
<template>
  <div class="info-container">
    <!-- 页面标题和返回按钮 -->
    <div class="page-header">
      <el-button type="primary" @click="goBack" class="back-btn">
        <el-icon><ArrowLeft /></el-icon>
        返回讨论管理
      </el-button>
      <div class="page-title">
        <h2>{{ discussionContent || '讨论' }} - 留言管理</h2>
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
          placeholder="请输入留言内容查询"
          class="info-form-input"
          style="width: 250px; margin-left: 12px;"
      ></el-input>
      <el-select
          v-model="queryParams.parent_id"
          placeholder="留言层级"
          class="info-form-select"
          style="width: 120px; margin-left: 12px;"
          clearable
      >
        <el-option label="全部" value=""></el-option>
        <el-option label="主留言" value=""></el-option>
        <el-option label="回复留言" value="has_parent"></el-option>
      </el-select>
      <button class="info-btn query-btn" @click="handleQuery" style="margin-left: 12px;">查询</button>
      <button class="info-btn reset-btn" @click="handleReset" style="margin-left: 8px;">重置</button>
    </div>

    <!-- 操作栏 -->
    <div class="info-list-action-bar">
      <button class="info-btn batch-delete-btn" @click="handleBatchDelete" :disabled="selectedIds.length === 0">
        批量删除留言 ({{ selectedIds.length }})
      </button>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="info-global-error">{{ errorMessage }}</div>

    <!-- 无数据提示 -->
    <div v-if="!showTable && !errorMessage" class="info-list-empty-tip">暂无留言数据</div>

    <!-- 留言表格 -->
    <el-table
        :data="commentList"
        v-if="showTable"
        border
        class="info-list-table"
        @selection-change="handleSelectionChange"
        row-key="id"
        :tree-props="{ children: 'replies', hasChildren: 'hasChildren' }"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="60" />

      <el-table-column prop="user_display" label="用户" width="120">
        <template #default="scope">{{ scope.row.user_display || '-' }}</template>
      </el-table-column>

      <el-table-column prop="content" label="留言内容" min-width="300">
        <template #default="scope">
          <div class="comment-content">
            <!-- 显示回复关系 -->
            <div v-if="scope.row.parent_user_display" class="reply-info">
              <el-tag type="info" size="small">
                回复 @{{ scope.row.parent_user_display }}
              </el-tag>
            </div>
            <div class="content-text">{{ scope.row.content || '-' }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="层级" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.parent_id ? 'warning' : 'success'" size="small">
            {{ scope.row.parent_id ? '回复' : '主留言' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="created_at" label="发布时间" width="180">
        <template #default="scope">{{ formatDate(scope.row.created_at) ?? '-' }}</template>
      </el-table-column>

      <el-table-column prop="updated_at" label="更新时间" width="180">
        <template #default="scope">{{ formatDate(scope.row.updated_at) ?? '-' }}</template>
      </el-table-column>

      <el-table-column label="操作" width="120">
        <template #default="scope">
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
import { ElMessage, ElMessageBox } from 'element-plus';
import { adminApi } from '@/api/index.js';
import { formatErrorMessage } from '@/utils/apiHelper.js';

const router = useRouter();
const route = useRoute();

// 从路由参数获取讨论和活动信息
const discussionId = ref(route.query.discussionId || '');
const activityId = ref(route.query.activityId || '');
const activityTitle = ref(route.query.activityTitle || '');
const discussionContent = ref(route.query.discussionContent || '');

// 查询参数
const queryParams = ref({
  user_display: '',
  content: '',
  parent_id: ''
});

// 分页参数
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const totalPage = computed(() => Math.ceil(total.value / pageSize.value) || 1);

// 状态控制
const commentList = ref([]);
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

// 获取留言列表
const fetchComments = async () => {
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
    if (discussionId.value) {
      filters.discussion_id = discussionId.value;
    }

    const response = await adminApi.discussComment.list({
      page: currentPage.value,
      size: pageSize.value,
      kwargs: filters
    });

    if (response.success) {
      commentList.value = response.items || [];
      total.value = response.total || 0;
      showTable.value = true;
      errorMessage.value = '';
    } else {
      errorMessage.value = '查询留言失败：' + (response.message || '未知错误');
      showTable.value = false;
    }
  } catch (error) {
    errorMessage.value = formatErrorMessage(error, '查询留言失败');
    showTable.value = false;
    console.error('留言查询错误：', error);
  } finally {
    isLoading.value = false;
  }
};

// 查询按钮
const handleQuery = () => {
  currentPage.value = 1;
  fetchComments();
};

// 重置按钮
const handleReset = () => {
  queryParams.value = { user_display: '', content: '', parent_id: '' };
  currentPage.value = 1;
  fetchComments();
};

// 分页切换
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchComments();
};

// 表格选择事件
const handleSelectionChange = (val) => {
  selectedIds.value = val.map(item => item.id);
};

// 单个删除
const handleDelete = async (comment) => {
  const confirmMsg = comment.parent_id
    ? '确定要删除该回复吗？'
    : '确定要删除该留言吗？删除后相关的回复也会被删除。';

  try {
    await ElMessageBox.confirm(
      confirmMsg,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
  } catch {
    return;
  }

  isLoading.value = true;

  try {
    const response = await adminApi.discussComment.delete(comment.id);
    if (response.success) {
      ElMessage.success('删除成功！');
      fetchComments();
    } else {
      ElMessage.error('删除失败：' + (response.message || '未知错误'));
    }
  } catch (error) {
    ElMessage.error('删除失败：' + formatErrorMessage(error, '删除留言失败'));
  } finally {
    isLoading.value = false;
  }
};

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的${selectedIds.value.length}条留言吗？删除后相关的回复也会被删除。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
  } catch {
    return;
  }

  try {
    isLoading.value = true;
    const promises = selectedIds.value.map(id => adminApi.discussComment.delete(id));
    await Promise.all(promises);

    ElMessage.success('批量删除成功！');
    selectedIds.value = [];
    fetchComments();
  } catch (error) {
    ElMessage.error('批量删除失败：' + formatErrorMessage(error, '批量删除留言失败'));
  } finally {
    isLoading.value = false;
  }
};

// 返回讨论管理
const goBack = () => {
  router.push({
    path: '/admin/activity-discussions',
    query: {
      activityId: activityId.value,
      activityTitle: activityTitle.value
    }
  });
};

// 页面挂载时查询数据
onMounted(() => {
  fetchComments();
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

.comment-content {
  line-height: 1.5;
  word-break: break-word;
}

.reply-info {
  margin-bottom: 4px;
}

.content-text {
  color: #303133;
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

/* 表格树形结构样式 */
.el-table .el-table__row {
  cursor: default;
}

.el-table .el-table__row .el-table__cell {
  border-bottom: 1px solid #ebeef5;
}
</style>