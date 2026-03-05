<template>
  <div class="user-example">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>👥 用户模块使用示例</span>
          <el-tag :type="apiType === 'mock' ? 'warning' : 'success'" size="small">
            {{ apiType === 'mock' ? 'Mock API' : '真实 API' }}
          </el-tag>
        </div>
      </template>

      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="总用户数" :value="stats.total_users" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="普通用户" :value="stats.normal_users" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="组织用户" :value="stats.org_users" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="管理员" :value="stats.admins" />
          </el-card>
        </el-col>
      </el-row>

      <!-- 搜索筛选 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="搜索">
          <el-input
            v-model="searchForm.keyword"
            placeholder="用户名/账号/手机号"
            clearable
            @clear="loadUsers"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="searchForm.role"
            placeholder="选择角色"
            clearable
            @change="loadUsers"
          >
            <el-option label="普通用户" value="USER" />
            <el-option label="组织用户" value="ORG_USER" />
            <el-option label="管理员" value="ADMIN" />
            <el-option label="超级管理员" value="SUPER_ADMIN" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadUsers">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="showCreateDialog">新增用户</el-button>
        </el-form-item>
      </el-form>

      <!-- 用户列表 -->
      <el-table :data="users" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="account" label="账号" width="120" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)" size="small">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
              {{ row.status === 'active' ? '正常' : '已封禁' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">查看</el-button>
            <el-button size="small" type="primary" @click="editUser(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteUser(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadUsers"
          @current-change="loadUsers"
        />
      </div>
    </el-card>

    <!-- 用户详情对话框 -->
    <el-dialog v-model="detailVisible" title="用户详情" width="50%">
      <div v-if="currentUser">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag :type="getRoleType(currentUser.role)" size="small">
              {{ getRoleLabel(currentUser.role) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="账号">{{ currentUser.account }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentUser.phone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentUser.email }}</el-descriptions-item>
          <el-descriptions-item label="状态" :span="2">
            <el-tag :type="currentUser.status === 'active' ? 'success' : 'danger'" size="small">
              {{ currentUser.status === 'active' ? '正常' : '已封禁' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ formatDate(currentUser.created_at) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog v-model="formVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="50%">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="账号">
          <el-input v-model="formData.account" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="formData.username" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="formData.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="formData.role">
            <el-option label="普通用户" value="USER" />
            <el-option label="组织用户" value="ORG_USER" />
            <el-option label="管理员" value="ADMIN" />
            <el-option label="超级管理员" value="SUPER_ADMIN" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userAdapter } from '@/services/userAdapter'
import { getCurrentApiType } from '@/services/activityAdapter'
import type { UserInfo } from '@/types/auth'

const loading = ref(false)
const users = ref<UserInfo[]>([])
const detailVisible = ref(false)
const formVisible = ref(false)
const isEdit = ref(false)
const currentUser = ref<UserInfo | null>(null)
const apiType = ref<'mock' | 'real'>('mock')
const stats = ref({
  total_users: 0,
  normal_users: 0,
  org_users: 0,
  admins: 0,
  deleted_users: 0,
  active_users: 0,
  banned_users: 0
})

const searchForm = ref({
  keyword: '',
  role: ''
})

const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const formData = ref({
  account: '',
  username: '',
  phone: '',
  email: '',
  role: 'USER'
})

onMounted(async () => {
  apiType.value = getCurrentApiType()
  await loadStats()
  await loadUsers()
})

async function loadStats() {
  const response = await userAdapter.getUserStats()
  if (response.success && response.data) {
    stats.value = response.data
  }
}

async function loadUsers() {
  loading.value = true
  try {
    const response = await userAdapter.getUserList({
      page: pagination.value.page,
      size: pagination.value.size,
      keyword: searchForm.value.keyword || undefined,
      role: searchForm.value.role || undefined
    })

    if (response.success && response.data) {
      users.value = response.data.items
      pagination.value.total = response.data.total
    } else {
      ElMessage.error(response.message || '加载失败')
    }
  } catch (error) {
    console.error('加载用户失败:', error)
    ElMessage.error('加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  searchForm.value = {
    keyword: '',
    role: ''
  }
  pagination.value.page = 1
  loadUsers()
}

function viewDetail(user: UserInfo) {
  currentUser.value = user
  detailVisible.value = true
}

function showCreateDialog() {
  isEdit.value = false
  formData.value = {
    account: '',
    username: '',
    phone: '',
    email: '',
    role: 'USER'
  }
  formVisible.value = true
}

function editUser(user: UserInfo) {
  isEdit.value = true
  formData.value = {
    account: user.account,
    username: user.username,
    phone: user.phone,
    email: user.email || '',
    role: user.role
  }
  currentUser.value = user
  formVisible.value = true
}

async function saveUser() {
  try {
    if (isEdit.value && currentUser.value) {
      const response = await userAdapter.updateUser(currentUser.value.id, {
        username: formData.value.username,
        email: formData.value.email,
        phone: formData.value.phone,
        role: formData.value.role
      })

      if (response.success) {
        ElMessage.success('更新成功')
        formVisible.value = false
        loadUsers()
        loadStats()
      } else {
        ElMessage.error(response.message || '更新失败')
      }
    } else {
      const response = await userAdapter.createUser(formData.value)

      if (response.success) {
        ElMessage.success('创建成功')
        formVisible.value = false
        loadUsers()
        loadStats()
      } else {
        ElMessage.error(response.message || '创建失败')
      }
    }
  } catch (error) {
    console.error('保存用户失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

async function deleteUser(user: UserInfo) {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.username}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await userAdapter.deleteUser(user.id)

    if (response.success) {
      ElMessage.success('删除成功')
      loadUsers()
      loadStats()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch {
    // 取消删除
  }
}

function getRoleLabel(role: string): string {
  const roleMap: Record<string, string> = {
    USER: '普通用户',
    ORG_USER: '组织用户',
    ADMIN: '管理员',
    SUPER_ADMIN: '超级管理员'
  }
  return roleMap[role] || role
}

function getRoleType(role: string): any {
  const typeMap: Record<string, any> = {
    USER: '',
    ORG_USER: 'success',
    ADMIN: 'warning',
    SUPER_ADMIN: 'danger'
  }
  return typeMap[role] || ''
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped>
.user-example {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.stats-row {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
