<!-- ./src/views/admin/content/ActivityRatingManage.vue -->
<template>
  <div class="info-container">
    <!-- 页面标题和返回按钮 -->
    <div class="page-header">
      <el-button type="primary" @click="goBack" class="back-btn">
        <el-icon><ArrowLeft /></el-icon>
        返回活动管理
      </el-button>
      <div class="page-title">
        <h2>{{ activityTitle || '活动' }} - 评分管理</h2>
      </div>
    </div>

    <!-- 活动评分统计 -->
    <div class="rating-summary-card" v-if="activityId">
      <div class="rating-summary-content">
        <div class="rating-overview">
          <div class="average-rating">
            <div class="average-score">{{ averageRating || '0.0' }}</div>
            <el-rate
              v-model="averageRating"
              disabled
              show-score
              text-color="#ff9900"
              score-template=""
              :max="5"
              :precision="1"
            />
            <div class="rating-count">{{ totalRatings }} 条评分</div>
          </div>
        </div>

        <div class="rating-distribution">
          <div class="distribution-item" v-for="(count, stars) in ratingDistribution" :key="stars">
            <span class="stars-label">{{ stars }}星</span>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: totalRatings > 0 ? (count / totalRatings * 100) + '%' : '0%' }"
              ></div>
            </div>
            <span class="stars-count">{{ count }}</span>
          </div>
        </div>
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
      <el-select
          v-model="queryParams.rating"
          placeholder="评分筛选"
          class="info-form-select"
          style="width: 120px; margin-left: 12px;"
      >
        <el-option label="全部" value=""></el-option>
        <el-option v-for="i in 5" :key="i" :label="`${i}星`" :value="i"></el-option>
      </el-select>
      <button class="info-btn query-btn" @click="handleQuery" style="margin-left: 12px;">查询</button>
      <button class="info-btn reset-btn" @click="handleReset" style="margin-left: 8px;">重置</button>
    </div>

    <!-- 操作栏 -->
    <div class="info-list-action-bar">
      <button class="info-btn batch-delete-btn" @click="handleBatchDelete" :disabled="selectedIds.length === 0">
        批量删除评分 ({{ selectedIds.length }})
      </button>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="info-global-error">{{ errorMessage }}</div>

    <!-- 无数据提示 -->
    <div v-if="!showTable && !errorMessage" class="info-list-empty-tip">暂无评分数据</div>

    <!-- 评分表格 -->
    <el-table
        :data="ratingList"
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

      <el-table-column prop="rating" label="评分" width="100">
        <template #default="scope">
          <el-rate
              v-model="scope.row.rating"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}星"
          />
        </template>
      </el-table-column>

      <el-table-column prop="comment" label="评价内容" min-width="200">
        <template #default="scope">{{ scope.row.comment || '-' }}</template>
      </el-table-column>

      <el-table-column prop="created_at" label="评分时间" width="180">
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
import { adminApi, activityApi } from '@/api/index.js';
import { formatErrorMessage } from '@/utils/apiHelper.js';

const router = useRouter();
const route = useRoute();

// 从路由参数获取活动信息
const activityId = ref(route.query.activityId || '');
const activityTitle = ref(route.query.activityTitle || '');

// 查询参数
const queryParams = ref({
  user_display: '',
  rating: ''
});

// 分页参数
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const totalPage = computed(() => Math.ceil(total.value / pageSize.value) || 1);

// 状态控制
const ratingList = ref([]);
const selectedIds = ref([]);
const showTable = ref(true);
const isLoading = ref(false);
const errorMessage = ref('');

// 评分统计
const averageRating = ref(0);
const totalRatings = ref(0);
const ratingDistribution = ref({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

// 计算评分统计
const calculateRatingStats = (ratings) => {
  if (!ratings || ratings.length === 0) {
    averageRating.value = 0;
    totalRatings.value = 0;
    ratingDistribution.value = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    return;
  }

  const validRatings = ratings.filter(r => r.rating && r.rating > 0);
  totalRatings.value = validRatings.length;

  if (totalRatings.value === 0) {
    averageRating.value = 0;
    ratingDistribution.value = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    return;
  }

  // 计算平均分
  const totalScore = validRatings.reduce((sum, rating) => sum + rating.rating, 0);
  averageRating.value = (totalScore / totalRatings.value).toFixed(1);

  // 计算评分分布
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  validRatings.forEach(rating => {
    const ratingValue = Math.floor(rating.rating);
    if (ratingValue >= 1 && ratingValue <= 5) {
      distribution[ratingValue]++;
    }
  });
  ratingDistribution.value = distribution;
};

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

// 获取评分列表
const fetchRatings = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const filters = {};
    if (queryParams.value.user_display?.trim()) {
      filters.user_display = queryParams.value.user_display.trim();
    }
    if (queryParams.value.rating) {
      filters.rating = queryParams.value.rating;
    }
    if (activityId.value) {
      filters.activity_id = activityId.value;
    }

    // 获取分页的评分数据
    const response = await adminApi.activityRating.list({
      page: currentPage.value,
      size: pageSize.value,
      kwargs: filters
    });

    // 响应拦截器已返回 response.data
    // API返回格式: { success: true, data: { list: [], total: 0 }, message: '' }
    if (response?.success) {
      const resData = response.data || {};
      ratingList.value = resData.list || [];
      total.value = resData.total || 0;
      showTable.value = true;
      errorMessage.value = '';

      // 获取所有评分数据来计算平均分（使用公开接口）
      if (activityId.value) {
        try {
          const allRatingsResponse = await activityApi.getActivityRatings(activityId.value);
          if (allRatingsResponse?.success) {
            const allRatings = allRatingsResponse.data?.items || allRatingsResponse.data || [];
            calculateRatingStats(allRatings);
          } else {
            // 如果公开接口失败，使用当前页的数据计算
            calculateRatingStats(resData.list || []);
          }
        } catch (error) {
          console.warn('获取全部评分数据失败，使用当前页数据计算平均分：', error);
          // 使用当前页的数据计算平均分
          calculateRatingStats(resData.list || []);
        }
      }
    } else {
      errorMessage.value = '查询评分失败：' + (response?.message || '未知错误');
      showTable.value = false;
    }
  } catch (error) {
    errorMessage.value = formatErrorMessage(error, '查询评分失败');
    showTable.value = false;
    console.error('评分查询错误：', error);
  } finally {
    isLoading.value = false;
  }
};

// 查询按钮
const handleQuery = () => {
  currentPage.value = 1;
  fetchRatings();
};

// 重置按钮
const handleReset = () => {
  queryParams.value = { user_display: '', rating: '' };
  currentPage.value = 1;
  fetchRatings();
};

// 分页切换
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchRatings();
};

// 表格选择事件
const handleSelectionChange = (val) => {
  selectedIds.value = val.map(item => item.id);
};

// 单个删除
const handleDelete = async (rating) => {
  if (!confirm('确定要删除该评分吗？')) return;
  isLoading.value = true;

  try {
    const response = await adminApi.activityRating.delete(rating.id);
    if (response.success) {
      alert('删除成功！');
      fetchRatings();
    } else {
      alert('删除失败：' + (response.message || '未知错误'));
    }
  } catch (error) {
    alert('删除失败：' + formatErrorMessage(error, '删除评分失败'));
  } finally {
    isLoading.value = false;
  }
};

// 批量删除
const handleBatchDelete = async () => {
  if (!confirm(`确定要删除选中的${selectedIds.value.length}条评分吗？`)) return;
  try {
    isLoading.value = true;
    const promises = selectedIds.value.map(id => adminApi.activityRating.delete(id));
    await Promise.all(promises);

    alert('批量删除成功！');
    selectedIds.value = [];
    fetchRatings();
  } catch (error) {
    alert('批量删除失败：' + formatErrorMessage(error, '批量删除评分失败'));
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
  fetchRatings();
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

/* 评分统计卡片样式 */
.rating-summary-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  padding: 20px;
}

.rating-summary-content {
  display: flex;
  align-items: center;
  gap: 40px;
}

.rating-overview {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.average-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.average-score {
  font-size: 48px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.rating-count {
  font-size: 14px;
  color: #909399;
}

.rating-distribution {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.distribution-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stars-label {
  min-width: 40px;
  font-size: 14px;
  color: #606266;
  text-align: right;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
  min-width: 100px;
  max-width: 200px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff9900 0%, #ff6600 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.stars-count {
  min-width: 30px;
  font-size: 14px;
  color: #606266;
  text-align: center;
}

/* 评分组件样式调整 */
.el-rate {
  display: flex;
  align-items: center;
}

.el-rate :deep(.el-rate__icon) {
  font-size: 20px;
}
</style>