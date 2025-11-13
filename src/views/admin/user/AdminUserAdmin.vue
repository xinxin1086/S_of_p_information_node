<template>
  <div class="admin-user-info">
    <!-- 查询栏 -->
    <div class="query-bar">
      <input
          type="text"
          placeholder="请输入账号查询"
          v-model="queryParams.account"
          class="query-input"
      >
      <button class="query-btn" @click="handleQuery">查询</button>
      <button class="reset-btn" @click="handleReset">重置</button>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <button class="add-btn" @click="handleAdd">新增</button>
      <button class="batch-delete-btn" @click="handleBatchDelete">批量删除</button>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- 无数据提示 -->
    <div v-if="!showTable && !errorMessage" class="empty-tip">
      暂无数据
    </div>

    <!-- 管理员信息表格（动态生成列） -->
    <el-table
        :data="tableData"
        v-if="showTable"
        border
        style="width: 100%; margin-bottom: 15px;"
    >
      <el-table-column
          type="selection"
          width="55"
      />
      <el-table-column
          type="index"
          label="序号"
          width="60"
      />
      <!-- 动态生成表格列 -->
      <template v-for="(field, key) in tableFields" :key="key">
        <!-- 特殊处理头像列 -->
        <el-table-column
            v-if="key === 'avatar'"
            :prop="key"
            :label="field.label"
            width="100"
        >
          <template #default="scope">
            <img
                v-if="scope.row.avatar && scope.row.avatar !== '无'"
                :src="scope.row.avatar"
                class="avatar"
                alt="头像"
            >
            <span v-else class="avatar-placeholder">{{ scope.row.avatar || '无' }}</span>
          </template>
        </el-table-column>

        <!-- 处理其他普通列 -->
        <el-table-column
            v-else
            :prop="key"
            :label="field.label"
            :width="field.width || 'auto'"
        >
          <template #default="scope">
            <!-- 显示null值为"-" -->
            {{ scope.row[key] ?? '-' }}
          </template>
        </el-table-column>
      </template>

      <el-table-column
          label="操作"
          width="120"
      >
        <template #default="scope">
          <button class="edit-btn" @click="handleEdit(scope.row)">编辑</button>
          <button class="delete-btn" @click="handleDelete(scope.row.id)">删除</button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination" v-if="showTable">
      <span>共 {{ total }} 条</span>
      <button :disabled="currentPage === 1" @click="handlePageChange(currentPage - 1)">&lt;</button>
      <button class="current-page">{{ currentPage }}</button>
      <button :disabled="currentPage === totalPage" @click="handlePageChange(currentPage + 1)">&gt;</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMainStore } from '@/store/index.js'
import axios from 'axios'

const router = useRouter()
const store = useMainStore()

// 查询参数
const queryParams = ref({
  account: ''
})

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPage = computed(() => Math.ceil(total.value / pageSize.value))

// 选中的ID
const selectedIds = ref([])
const selectAll = computed({
  get() {
    return tableData.value.length > 0 && selectedIds.value.length === tableData.value.length
  },
  set(val) {
    if (val) {
      selectedIds.value = tableData.value.map(item => item.id)
    } else {
      selectedIds.value = []
    }
  }
})

// 动态表格配置 - 预设字段映射（如果后端没有返回fields信息时使用）
const defaultFields = {
  id: { label: 'ID', width: 80 },
  username: { label: '姓名', width: 120 },
  account: { label: '账号', width: 120 },
  phone: { label: '电话', width: 150 },
  email: { label: '邮箱', width: 200 },
  avatar: { label: '头像', width: 100 },
  role: { label: '角色', width: 100 }
}

// 动态表格配置
const tableFields = ref({})
const tableData = ref([])
const showTable = ref(false)
const errorMessage = ref('')

// 从后端获取数据（无需手动设置请求头，拦截器自动处理）
const fetchData = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/admin/list', {
      params: {
        page: currentPage.value,
        size: pageSize.value,
        account: queryParams.value.account
      }
    })

    if (res.data.success) {
      tableFields.value = res.data.data?.fields || defaultFields
      tableData.value = res.data.data?.items || []
      total.value = res.data.data?.total || 0
      showTable.value = res.data.success && (tableData.value.length > 0 || Object.keys(tableFields.value).length > 0)
      errorMessage.value = ''
    } else {
      showTable.value = false
      errorMessage.value = res.data.message || '获取数据失败'
    }
  } catch (error) {
    showTable.value = false
    errorMessage.value = '网络错误或登录已过期，请重新登录'
    console.error(error)
  }
}

// 初始化加载数据
fetchData()

// 查询
const handleQuery = () => {
  currentPage.value = 1
  fetchData()
}

// 重置
const handleReset = () => {
  queryParams.value.account = ''
  currentPage.value = 1
  fetchData()
}

// 新增
const handleAdd = () => {
  router.push('/admin/user/add')
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) {
    alert('请选择要删除的记录')
    return
  }
  if (confirm('确定批量删除选中的记录吗？')) {
    // 调用批量删除接口
    axios.post('http://localhost:5000/api/admin/batch-delete', {
      ids: selectedIds.value
    }).then(() => {
      fetchData() // 重新加载数据
      selectedIds.value = [] // 清空选中
    }).catch(err => {
      errorMessage.value = err.response?.data?.message || '批量删除失败'
    })
  }
}



// 编辑
const handleEdit = (item) => {
  router.push({ path: '/admin/user/edit', query: { id: item.id } })
}

// 删除
const handleDelete = (id) => {
  if (confirm('确定删除该记录吗？')) {
    // 调用删除接口
    axios.delete(`http://localhost:5000/api/admin/${id}`)
        .then(() => {
          fetchData() // 重新加载数据
        })
        .catch(err => {
          errorMessage.value = err.response?.data?.message || '删除失败'
        })
  }
}

// 分页切换
const handlePageChange = (page) => {
  currentPage.value = page
  fetchData()
}
</script>

<style scoped>
.admin-user-info {
  padding: 20px;
}

.query-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.query-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}

.query-btn {
  padding: 8px 15px;
  background-color: #409EFF;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.reset-btn {
  padding: 8px 15px;
  background-color: #F56C6C;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.add-btn {
  padding: 8px 15px;
  background-color: #67C23A;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.batch-delete-btn {
  padding: 8px 15px;
  background-color: #F56C6C;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.error-message {
  color: red;
  margin-bottom: 15px;
}

.empty-tip {
  text-align: center;
  padding: 20px;
  color: #999;
}

/* 头像样式 */
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  display: inline-block;
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border-radius: 50%;
  background-color: #eee;
  color: #666;
}

.edit-btn {
  padding: 4px 8px;
  background-color: #409EFF;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}

.delete-btn {
  padding: 4px 8px;
  background-color: #F56C6C;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination button {
  padding: 4px 8px;
  border: 1px solid #ddd;
  background-color: #fff;
  cursor: pointer;
}

.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.current-page {
  padding: 4px 8px;
  border: 1px solid #409EFF;
  background-color: #409EFF;
  color: #fff;
}
</style>