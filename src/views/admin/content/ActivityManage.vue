<!-- ./src/views/admin/content/ActivityManage.vue -->
<template>
  <div class="info-container">
    <!-- 查询栏（输入框+查询+重置） -->
    <div class="info-list-query-bar">
      <el-input
          v-model="queryParams.title"
          placeholder="请输入活动标题查询"
          class="info-form-input"
      ></el-input>
      <el-select
          v-model="queryParams.status"
          placeholder="状态默认全部"
          class="info-form-select"
          style="width: 180px; margin-left: 12px;"
      >
        <el-option label="全部" value=""></el-option>
        <el-option
          v-for="statusOption in allStatusOptions"
          :key="statusOption.value"
          :label="statusOption.label"
          :value="statusOption.value"
        />
      </el-select>
      <button class="info-btn query-btn" @click="handleQuery" style="margin-left: 12px;">查询</button>
      <button class="info-btn reset-btn" @click="handleReset" style="margin-left: 8px;">重置</button>
    </div>

    <!-- 操作栏（新增+批量删除+更新用户显示） -->
    <div class="info-list-action-bar">
      <button class="info-btn add-btn" @click="handleAdd">新增活动</button>
      <button class="info-btn batch-delete-btn" @click="handleBatchDelete" :disabled="selectedIds.length === 0">批量删除</button>
      <button class="info-btn update-display-btn" @click="handleUpdateUserDisplays" :disabled="isLoading">
        更新用户显示信息
      </button>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="info-global-error">{{ errorMessage }}</div>

    <!-- 无数据提示 -->
    <div v-if="!showTable && !errorMessage" class="info-list-empty-tip">暂无活动数据</div>

    <!-- 活动表格 -->
    <el-table
        :data="activityList"
        v-if="showTable"
        border
        class="info-list-table"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="60" />
      <!-- 活动字段列 -->
      <el-table-column prop="title" label="活动标题" width="200">
        <template #default="scope">{{ scope.row.title ?? '-' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="活动状态" width="120">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ getStatusText(scope.row.status) ?? '-' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="start_time" label="开始时间" width="180">
        <template #default="scope">{{ formatDate(scope.row.start_time) ?? '-' }}</template>
      </el-table-column>
      <el-table-column prop="end_time" label="结束时间" width="180">
        <template #default="scope">{{ formatDate(scope.row.end_time) ?? '-' }}</template>
      </el-table-column>
      <el-table-column prop="location" label="活动地点" width="150">
        <template #default="scope">{{ scope.row.location ?? '-' }}</template>
      </el-table-column>
      <el-table-column prop="organizer_display" label="发布者" width="120">
        <template #default="scope">{{ scope.row.organizer_display ?? '-' }}</template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180">
        <template #default="scope">{{ formatDate(scope.row.created_at) ?? '-' }}</template>
      </el-table-column>
      <!-- 操作列（评分管理+讨论管理+编辑+删除） -->
      <el-table-column label="操作" width="280">
        <template #default="scope">
          <button class="info-btn rating-btn" @click="handleRatingManage(scope.row)" style="margin-right: 4px;">评分管理</button>
          <button class="info-btn discuss-btn" @click="handleDiscussManage(scope.row)" style="margin-right: 4px;">讨论管理</button>
          <button class="info-btn edit-btn" @click="handleEdit(scope.row)" style="margin-right: 4px;">编辑</button>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog
        :title="isEdit ? '编辑活动' : '新增活动'"
        v-model="isModalOpen"
        width="600px"
        :close-on-click-modal="false"
        :destroy-on-close="true"
    >
      <div class="info-form">
        <el-form :model="form" :rules="formRules" ref="formRef">
          <el-form-item label="活动标题" required prop="title" class="info-form-item">
            <el-input
                v-model="form.title"
                placeholder="请输入活动标题"
                :disabled="isLoading"
                class="info-form-input"
            ></el-input>
          </el-form-item>

          <el-form-item label="活动描述" required prop="description" class="info-form-item">
            <el-input
                v-model="form.description"
                placeholder="请输入活动描述"
                :disabled="isLoading"
                type="textarea"
                :rows="4"
                class="info-form-textarea"
            ></el-input>
          </el-form-item>

          <el-form-item label="活动状态" required prop="status" class="info-form-item">
            <el-select
                v-model="form.status"
                placeholder="请选择活动状态"
                :disabled="isLoading"
                class="info-form-select"
            >
              <el-option
                v-for="statusOption in allStatusOptions"
                :key="statusOption.value"
                :label="statusOption.label"
                :value="statusOption.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="开始时间" required prop="start_time" class="info-form-item">
            <el-date-picker
                v-model="form.start_time"
                type="datetime"
                placeholder="请选择开始时间"
                :disabled="isLoading"
                class="info-form-input"
                value-format="YYYY-MM-DDTHH:mm:ss"
            ></el-date-picker>
          </el-form-item>

          <el-form-item label="结束时间" required prop="end_time" class="info-form-item">
            <el-date-picker
                v-model="form.end_time"
                type="datetime"
                placeholder="请选择结束时间"
                :disabled="isLoading"
                class="info-form-input"
                value-format="YYYY-MM-DDTHH:mm:ss"
            ></el-date-picker>
          </el-form-item>

          <el-form-item label="活动地点" required prop="location" class="info-form-item">
            <el-input
                v-model="form.location"
                placeholder="请输入活动地点"
                :disabled="isLoading"
                class="info-form-input"
            ></el-input>
          </el-form-item>

          <el-form-item label="最大人数" required prop="max_participants" class="info-form-item">
            <el-input-number
                v-model="form.max_participants"
                :min="1"
                :max="9999"
                placeholder="请输入最大参与人数"
                :disabled="isLoading"
                class="info-form-input"
            ></el-input-number>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <button type="button" class="info-btn info-cancel-btn" @click="closeModal" :disabled="isLoading">取消</button>
        <button type="button" class="info-btn info-submit-btn" @click="submitForm" :disabled="isLoading">提交</button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { adminApi } from '@/api/index.js';
import {
  getAllStatusOptions,
  getStatusText,
  getStatusTagType
} from '@/config/activityStatus';
import {
  adminOperate,
  formatErrorMessage,
  formatPaginationParams,
  formatQueryParams,
  formatApiResponse
} from '@/utils/apiHelper.js';

const router = useRouter();
const formRef = ref(null);

// 获取所有状态选项
const allStatusOptions = getAllStatusOptions();

// 查询参数
const queryParams = ref({
  title: '',
  status: ''
});

// 分页参数
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const totalPage = computed(() => Math.ceil(total.value / pageSize.value) || 1);

// 状态控制
const activityList = ref([]);
const selectedIds = ref([]);
const showTable = ref(true);
const isLoading = ref(false);
const errorMessage = ref('');
const isModalOpen = ref(false);
const isEdit = ref(false);

// 表单数据
const form = ref({
  id: '',
  title: '',
  description: '',
  status: '',
  start_time: '',
  end_time: '',
  location: '',
  max_participants: 1
});

// 表单验证规则
const formRules = ref({
  title: [{ required: true, message: '请输入活动标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入活动描述', trigger: 'blur' }],
  status: [{ required: true, message: '请选择活动状态', trigger: 'change' }],
  start_time: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  end_time: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  location: [{ required: true, message: '请输入活动地点', trigger: 'blur' }],
  max_participants: [{ required: true, message: '请输入最大人数', trigger: 'blur' }]
});

// 状态相关函数已从 @/config/activityStatus 导入

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

// 查询活动
const fetchActivities = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    // 标准化分页和查询参数
    const paginationParams = formatPaginationParams(currentPage.value, pageSize.value);
    const filters = formatQueryParams({
      title: queryParams.value?.title,
      status: queryParams.value?.status
    }, ['title', 'status']);

    // 使用统一的API调用辅助工具
    const response = await adminOperate('activities', 'list', {
      ...paginationParams,
      filters: filters
    });

    const formattedResponse = formatApiResponse(response);

    if (formattedResponse.success) {
      activityList.value = formattedResponse.items || [];
      total.value = formattedResponse.total || 0;
      showTable.value = true;
      errorMessage.value = '';
    } else {
      errorMessage.value = '查询活动失败：' + (formattedResponse.message || '未知错误');
      showTable.value = false;
    }
  } catch (error) {
    errorMessage.value = formatErrorMessage(error, '查询活动失败');
    showTable.value = false;
    console.error('活动查询错误：', error);
  } finally {
    isLoading.value = false;
  }
};

// 查询按钮
const handleQuery = () => {
  currentPage.value = 1;
  fetchActivities();
};

// 重置按钮
const handleReset = () => {
  queryParams.value = { title: '', status: '' };
  currentPage.value = 1;
  fetchActivities();
};

// 分页切换
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchActivities();
};

// 表格选择事件
const handleSelectionChange = (val) => {
  selectedIds.value = val.map(item => item.id);
};

// 新增活动
const handleAdd = () => {
  isEdit.value = false;
  form.value = {
    id: '',
    title: '',
    description: '',
    status: '',
    start_time: '',
    end_time: '',
    location: '',
    max_participants: 1
  };
  isModalOpen.value = true;
};

// 编辑活动
const handleEdit = (activity) => {
  isEdit.value = true;
  form.value = {
    id: activity.id,
    title: activity.title,
    description: activity.description,
    status: activity.status,
    start_time: activity.start_time,
    end_time: activity.end_time,
    location: activity.location,
    max_participants: activity.max_participants
  };
  isModalOpen.value = true;
};

// 单个删除
const handleDelete = async (activity) => {
  if (!confirm('确定要删除该活动吗？')) return;
  isLoading.value = true;

  try {
    const response = await adminOperate('activities', 'delete', { id: activity.id });
    if (response.success) {
      alert('删除成功！');
      fetchActivities();
    } else {
      alert('删除失败：' + (response.message || '未知错误'));
    }
  } catch (error) {
    alert('删除失败：' + formatErrorMessage(error, '删除活动失败'));
  } finally {
    isLoading.value = false;
  }
};

// 批量删除
const handleBatchDelete = async () => {
  if (!confirm(`确定要删除选中的${selectedIds.value.length}条活动吗？`)) return;
  try {
    isLoading.value = true;
    // 使用统一的API接口调用
    const response = await adminApi.operate({
      table_name: 'activities',
      operate_type: 'batch_delete',
      kwargs: { ids: selectedIds.value }
    });
    if (response.success) {
      alert('批量删除成功！');
      selectedIds.value = [];
      fetchActivities();
    } else {
      alert('批量删除失败：' + (response.message || '未知错误'));
    }
  } catch (error) {
    alert('批量删除失败：' + error.message);
  } finally {
    isLoading.value = false;
  }
};

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value.validate();
    isLoading.value = true;

    let response;
    const activityData = {
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      status: form.value.status,
      start_time: form.value.start_time,
      end_time: form.value.end_time,
      location: form.value.location.trim(),
      max_participants: form.value.max_participants
    };

    if (isEdit.value) {
      // 编辑操作
      response = await adminApi.operate({
        table_name: 'activities',
        operate_type: 'update',
        id: form.value.id,
        kwargs: activityData
      });
    } else {
      // 新增操作
      response = await adminApi.operate({
        table_name: 'activities',
        operate_type: 'add',
        kwargs: activityData
      });
    }
    if (response.success) {
      alert(isEdit.value ? '编辑成功！' : '新增成功！');
      closeModal();
      fetchActivities();
    } else {
      alert(isEdit.value ? '编辑失败：' : '新增失败：' + (response.message || '未知错误'));
    }
  } catch (error) {
    console.error('表单提交错误：', error);
  } finally {
    isLoading.value = false;
  }
};

// 评分管理
const handleRatingManage = (activity) => {
  router.push({
    path: '/admin/activity-ratings',
    query: {
      activityId: activity.id,
      activityTitle: activity.title
    }
  });
};

// 讨论管理
const handleDiscussManage = (activity) => {
  router.push({
    path: '/admin/activity-discussions',
    query: {
      activityId: activity.id,
      activityTitle: activity.title
    }
  });
};

// 更新用户显示信息
const handleUpdateUserDisplays = async () => {
  if (!confirm('确定要更新所有活动的用户显示信息吗？这将处理已注销用户的显示名称。')) return;

  isLoading.value = true;
  try {
    const response = await adminApi.activity.updateUserDisplays();
    if (response.success) {
      alert('用户显示信息更新成功！');
      fetchActivities(); // 重新加载数据以查看更新后的显示信息
    } else {
      alert('更新失败：' + (response.message || '未知错误'));
    }
  } catch (error) {
    alert('更新失败：' + formatErrorMessage(error, '更新用户显示信息失败'));
  } finally {
    isLoading.value = false;
  }
};

// 关闭弹窗
const closeModal = () => {
  isModalOpen.value = false;
  formRef.value.resetFields();
};

// 页面挂载时查询数据
onMounted(() => {
  fetchActivities();
});
</script>

<style scoped>
/* 仅补充表格操作按钮间距*/
.edit-btn {
  margin-right: 4px;
}

/* 评分管理按钮 */
.rating-btn {
  background-color: #67c23a;
  color: white;
  border: 1px solid #67c23a;
}

.rating-btn:hover {
  background-color: #529b2e;
}

/* 讨论管理按钮 */
.discuss-btn {
  background-color: #409eff;
  color: white;
  border: 1px solid #409eff;
}

.discuss-btn:hover {
  background-color: #337ecc;
}

/* 更新用户显示按钮样式 */
.update-display-btn {
  background-color: #17c2c2;
  color: white;
  border: 1px solid #17c2c2;
}

.update-display-btn:hover:not(:disabled) {
  background-color: #138d8d;
}

.update-display-btn:disabled {
  background-color: #c0c4cc;
  border-color: #c0c4cc;
  color: #606266;
  cursor: not-allowed;
}

/* 适配下拉框与输入框对齐 */
.el-select {
  vertical-align: middle;
}
</style>