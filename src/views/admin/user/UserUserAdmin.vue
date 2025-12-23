<!-- ./src/views/admin/user/UserUserAdmin.vue -->
<template>
  <div class="info-container">
    <!-- 查询栏 -->
    <div class="info-list-query-bar">
      <input
          type="text"
          placeholder="请输入账号查询"
          v-model="queryParams.account"
          class="info-form-input"
      >
      <button class="info-btn query-btn" @click="handleQuery">查询</button>
      <button class="info-btn reset-btn" @click="handleReset">重置</button>
    </div>

    <!-- 操作栏 -->
    <div class="info-list-action-bar">
      <button class="info-btn add-btn" @click="handleAdd">新增用户</button>
      <button class="info-btn batch-delete-btn" @click="handleBatchDelete" :disabled="selectedIds.length === 0">批量删除</button>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="info-global-error">{{ errorMessage }}</div>

    <!-- 无数据提示 -->
    <div v-if="!showTable && !errorMessage" class="info-list-empty-tip">暂无用户数据</div>

    <!-- 用户表格 -->
    <el-table
        :data="tableData"
        v-if="showTable"
        border
        class="info-list-table"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="60" />
      <template v-for="(field, key) in tableFields" :key="key">
        <el-table-column v-if="key === 'avatar'" :prop="key" :label="field.label" width="100">
          <template #default="scope">
            <img
                v-if="scope.row.avatar && scope.row.avatar !== '无'"
                :src="formatAvatarUrl(scope.row.avatar)"
                class="info-avatar"
                alt="头像">
            <span v-else class="avatar-placeholder">{{ scope.row.avatar || '无' }}</span>
          </template>
        </el-table-column>
        <el-table-column v-else :prop="key" :label="field.label" :width="field.width || 'auto'">
          <template #default="scope">{{ scope.row[key] ?? '-' }}</template>
        </el-table-column>
      </template>
      <el-table-column label="操作" width="160">
        <template #default="scope">
          <button class="info-btn edit-btn" @click="handleEdit(scope.row)">编辑</button>
          <button class="info-btn delete-btn" @click="handleDelete(scope.row.id)">删除</button>
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
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useListCommonLogic } from '@/utils/admin/admin_info_edit.js';
import '@/styles/admin/admin_info_edit.css';
import {formatAvatarUrl} from "@/utils/common/format.js";

const router = useRouter();
const {
  queryParams, currentPage, total, totalPage,
  selectedIds, tableData, showTable, errorMessage, tableFields,
  handleSelectionChange, fetchData, handleQuery, handleReset,
  handleDelete, handleBatchDelete, handlePageChange
} = useListCommonLogic('user_info');

// 新增跳转
const handleAdd = () => {
  router.push('/admin/user/user/add');
};

// 编辑跳转
const handleEdit = (row) => {
  router.push({ path: '/admin/user/user/edit', query: { id: row.id } });
};

// 初始化加载
onMounted(() => {
  fetchData();
});

</script>

<style scoped></style>