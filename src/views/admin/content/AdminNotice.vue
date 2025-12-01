<!-- ./src/views/admin/content/AdminNotice.vue -->
<template>
  <div class="info-container">
    <!-- 查询栏（与管理员组件一致：输入框+查询+重置） -->
    <div class="info-list-query-bar">
      <el-input
          v-model="queryParams.title"
          placeholder="请输入公告标题查询"
          class="info-form-input"
      ></el-input>
      <el-select
          v-model="queryParams.noticeType"
          placeholder="类型默认全部"
          class="info-form-select"
          style="width: 180px; margin-left: 12px;"
      >
        <el-option label="全部" value=""></el-option>
        <el-option label="系统通知" value="系统通知"></el-option>
        <el-option label="活动公告" value="活动公告"></el-option>
        <el-option label="其他公告" value="其他公告"></el-option>
      </el-select>
      <button class="info-btn query-btn" @click="handleQuery" style="margin-left: 12px;">查询</button>
      <button class="info-btn reset-btn" @click="handleReset" style="margin-left: 8px;">重置</button>
    </div>

    <!-- 操作栏（与管理员组件一致：新增+批量删除） -->
    <div class="info-list-action-bar">
      <button class="info-btn add-btn" @click="handleAdd">新增公告</button>
      <button class="info-btn batch-delete-btn" @click="handleBatchDelete" :disabled="selectedIds.length === 0">批量删除</button>
    </div>

    <!-- 错误提示（与管理员组件一致） -->
    <div v-if="errorMessage" class="info-global-error">{{ errorMessage }}</div>

    <!-- 无数据提示（与管理员组件一致） -->
    <div v-if="!showTable && !errorMessage" class="info-list-empty-tip">暂无公告数据</div>

    <!-- 公告表格（与管理员组件结构一致：选择列+序号+字段列+操作列） -->
    <el-table
        :data="noticeList"
        v-if="showTable"
        border
        class="info-list-table"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="60" />
      <!-- 公告字段列（对应管理员组件的tableFields结构） -->
      <el-table-column prop="release_title" label="公告标题" width="200">
        <template #default="scope">{{ scope.row.release_title ?? '-' }}</template>
      </el-table-column>
      <el-table-column prop="notice_type" label="公告类型" width="120">
        <template #default="scope">{{ scope.row.notice_type ?? '-' }}</template>
      </el-table-column>
      <el-table-column prop="release_time" label="发布时间" width="180">
        <template #default="scope">{{ formatDate(scope.row.release_time) ?? '-' }}</template>
      </el-table-column>
      <!-- 新增更新时间列 -->
      <el-table-column prop="update_time" label="更新时间" width="180">
        <template #default="scope">{{ formatDate(scope.row.update_time) ?? '-' }}</template>
      </el-table-column>
      <el-table-column prop="expiration" label="过期时间" width="180">
        <template #default="scope">
          <span :class="scope.row.expiration < new Date() ? 'info-table-text-red' : ''">
            {{ formatDate(scope.row.expiration) ?? '-' }}
          </span>
        </template>
      </el-table-column>
      <!-- 操作列（与管理员组件一致：编辑+删除） -->
      <el-table-column label="操作" width="160">
        <template #default="scope">
          <button class="info-btn edit-btn" @click="handleEdit(scope.row)">编辑</button>
          <button class="info-btn delete-btn" @click="handleDelete(scope.row)">删除</button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页（与管理员组件一致：共x条+上一页+当前页+下一页） -->
    <div class="info-pagination" v-if="showTable">
      <span>共 {{ total }} 条</span>
      <button :disabled="currentPage === 1" @click="handlePageChange(currentPage - 1)">&lt;</button>
      <button class="current-page">{{ currentPage }}</button>
      <button :disabled="currentPage === totalPage" @click="handlePageChange(currentPage + 1)">&gt;</button>
    </div>

    <!-- 新增/编辑弹窗（保持原有逻辑，样式复用info-form） -->
    <el-dialog
        :title="isEdit ? '编辑公告' : '新增公告'"
        v-model="isModalOpen"
        width="600px"
        :close-on-click-modal="false"
        :destroy-on-close="true"
    >
      <div class="info-form">
        <el-form :model="form" :rules="formRules" ref="formRef">
          <el-form-item label="公告标题" required prop="release_title" class="info-form-item">
            <el-input
                v-model="form.release_title"
                placeholder="请输入公告标题"
                :disabled="isLoading"
                class="info-form-input"
            ></el-input>
          </el-form-item>

          <el-form-item label="公告类型" required prop="notice_type" class="info-form-item">
            <el-select
                v-model="form.notice_type"
                placeholder="请选择公告类型"
                :disabled="isLoading"
                class="info-form-select"
            >
              <el-option label="系统通知" value="系统通知"></el-option>
              <el-option label="活动公告" value="活动公告"></el-option>
              <el-option label="其他公告" value="其他公告"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="公告内容" required prop="release_notice" class="info-form-item">
            <el-input
                v-model="form.release_notice"
                placeholder="请输入公告内容"
                :disabled="isLoading"
                type="textarea"
                :rows="5"
                class="info-form-textarea"
            ></el-input>
          </el-form-item>

          <el-form-item label="过期时间" required prop="expiration" class="info-form-item">
            <el-date-picker
                v-model="form.expiration"
                type="datetime"
                placeholder="请选择过期时间"
                :disabled="isLoading"
                class="info-form-input"
                value-format="YYYY-MM-DDTHH:mm:ss"
            ></el-date-picker>
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
import { useNoticeStore } from '@/store/modules/notice';
import { ElMessage } from 'element-plus';

const router = useRouter();
const noticeStore = useNoticeStore();
const formRef = ref(null);

// 查询参数（与管理员组件queryParams结构一致）
const queryParams = ref({
  title: '',
  noticeType: ''
});

// 分页参数（与管理员组件完全一致）
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const totalPage = computed(() => Math.ceil(total.value / pageSize.value) || 1);

// 状态控制（与管理员组件一致）
const noticeList = ref([]);
const selectedIds = ref([]); // 批量删除选中ID
const showTable = ref(true); // 控制表格显示
const isLoading = ref(false);
const errorMessage = ref('');
const isModalOpen = ref(false);
const isEdit = ref(false);

// 表单数据
const form = ref({
  id: '',
  release_title: '',
  notice_type: '',
  release_notice: '',
  expiration: ''
});

// 表单验证规则
const formRules = ref({
  release_title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  notice_type: [{ required: true, message: '请选择公告类型', trigger: 'change' }],
  release_notice: [{ required: true, message: '请输入公告内容', trigger: 'blur' }],
  expiration: [{ required: true, message: '请选择过期时间', trigger: 'change' }]
});

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

// 查询公告（适配分页参数）
const fetchNotices = async () => {
  try {
    isLoading.value = true;
    // 确保 queryParams.value 存在，且字段有默认值
    const title = queryParams.value?.title || '';
    const noticeType = queryParams.value?.noticeType || '';

    // 构建查询参数
    const params = {
      page: currentPage.value,
      size: pageSize.value
    };

    // 只添加有值的查询条件
    if (title.trim()) {
      params.title = title.trim();
    }
    if (noticeType) {
      params.notice_type = noticeType;
    }

    console.log('🔄 请求公告列表:', params);

    const response = await noticeStore.fetchAdminNoticesList({
      page: currentPage.value,
      size: pageSize.value,
      title: title.trim() || undefined,
      noticeType: noticeType || undefined
    });

    console.log('📥 收到公告列表响应:', response);

    if (response.success) {
      noticeList.value = response.data?.items || [];
      total.value = response.data?.total || 0;
      showTable.value = true;
      errorMessage.value = '';
    } else {
      errorMessage.value = '查询公告失败：' + (response.error || '未知错误');
      showTable.value = false;
    }
  } catch (error) {
    let errorMsg = '查询公告失败';
    if (error.response?.status === 500) {
      errorMsg = '服务器内部错误，请稍后重试';
    } else if (error.response?.status === 401) {
      errorMsg = '登录已过期，请重新登录';
    } else if (error.response?.status === 403) {
      errorMsg = '没有权限访问该资源';
    } else if (error.message) {
      errorMsg += '：' + error.message;
    }

    errorMessage.value = errorMsg;
    showTable.value = false;
    console.error('公告查询错误：', error);
  } finally {
    isLoading.value = false;
  }
};

// 查询按钮
const handleQuery = () => {
  currentPage.value = 1; // 重置为第1页
  fetchNotices();
};

// 重置按钮
const handleReset = () => {
  queryParams.value = { title: '', noticeType: '' };
  currentPage.value = 1;
  fetchNotices();
};

// 分页切换
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchNotices();
};

// 表格选择事件
const handleSelectionChange = (val) => {
  selectedIds.value = val.map(item => item.id); // 使用新的自增ID
};

// 新增公告 - 跳转到完整编辑页面
const handleAdd = () => {
  router.push('/admin/notice/editor');
};

// 编辑公告 - 跳转到完整编辑页面
const handleEdit = (notice) => {
  router.push(`/admin/notice/editor/${notice.id}`);
};

// 单个删除
const handleDelete = async (notice) => {
  if (!confirm('确定要删除该公告吗？')) return;
  try {
    isLoading.value = true;
    console.log('🗑️ 删除公告:', notice.id);

    const response = await noticeStore.deleteNotice(notice.id);

    if (response.success) {
      ElMessage.success('删除成功！');
      await fetchNotices();
    } else {
      ElMessage.error('删除失败：' + (response.error || '未知错误'));
    }
  } catch (error) {
    console.error('删除公告错误:', error);
    alert('删除失败：' + error.message);
  } finally {
    isLoading.value = false;
  }
};

// 批量删除
const handleBatchDelete = async () => {
  if (!confirm(`确定要删除选中的${selectedIds.value.length}条公告吗？`)) return;
  try {
    isLoading.value = true;
    console.log('🗑️ 批量删除公告:', selectedIds.value);

    // 逐个删除公告（因为后端可能不支持批量删除）
    const deletePromises = selectedIds.value.map(id => noticeStore.deleteNotice(id));
    const results = await Promise.allSettled(deletePromises);

    const successCount = results.filter(result =>
      result.status === 'fulfilled' && result.value.success
    ).length;

    if (successCount === selectedIds.value.length) {
      ElMessage.success('批量删除成功！');
      selectedIds.value = [];
      await fetchNotices();
    } else {
      ElMessage.warning(`成功删除 ${successCount} 条，失败 ${selectedIds.value.length - successCount} 条`);
      await fetchNotices();
    }
  } catch (error) {
    console.error('批量删除公告错误:', error);
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

    let params;

    if (isEdit.value) {
      // 编辑操作需要ID和更新内容
      params = {
        table_name: 'notice',
        operate_type: 'edit',
        id: form.value.id, // 使用自增ID查询
        kwargs: {
          release_title: form.value.release_title.trim(),
          notice_type: form.value.notice_type,
          release_notice: form.value.release_notice.trim(),
          expiration: form.value.expiration
          // 注意：release_time 不可变更，update_time 数据库自动维护
        }
      };
    } else {
      // 新增操作
      params = {
        table_name: 'notice',
        operate_type: 'add',
        kwargs: {
          release_title: form.value.release_title.trim(),
          notice_type: form.value.notice_type,
          release_notice: form.value.release_notice.trim(),
          expiration: form.value.expiration
          // 注意：id、release_time、update_time 均由数据库自动生成
        }
      };
    }

    let response;
    if (isEdit.value) {
      response = await noticeStore.updateNotice(form.value.id, {
        release_title: form.value.release_title.trim(),
        notice_type: form.value.notice_type,
        release_notice: form.value.release_notice.trim(),
        expiration: form.value.expiration
      });
    } else {
      response = await noticeStore.createNotice({
        release_title: form.value.release_title.trim(),
        notice_type: form.value.notice_type,
        release_notice: form.value.release_notice.trim(),
        expiration: form.value.expiration
      });
    }

    if (response.success) {
      ElMessage.success(isEdit.value ? '编辑成功！' : '新增成功！');
      closeModal();
      await fetchNotices();
    } else {
      ElMessage.error(isEdit.value ? '编辑失败：' : '新增失败：' + (response.error || '未知错误'));
    }
  } catch (error) {
    console.error('表单提交错误：', error);
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
  fetchNotices();
});
</script>

<style scoped>
/* 仅补充表格操作按钮间距*/
.edit-btn {
  margin-right: 8px;
}

/* 适配下拉框与输入框对齐 */
.el-select {
  vertical-align: middle;
}
</style>