<template>
  <!-- 模板部分完全不变，保留所有原有结构 -->
  <div class="admin-container">
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
      <button class="batch-delete-btn" @click="handleBatchDelete" :disabled="selectedIds.length === 0">批量删除</button>
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
        @selection-change="handleSelectionChange"
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
                :src="'http://localhost:5000/' + scope.row.avatar"
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
      <button :disabled="currentPage >= totalPage" @click="handlePageChange(currentPage + 1)">&gt;</button>
    </div>
  </div>
</template>

<script setup>
// 原有逻辑基本不变，仅修改数据请求相关代码
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { BASE_URL } from '@/config.js'; // 引入公共域名

const router = useRouter()

// 查询参数（保留原有）
const queryParams = ref({
  account: ''
})

// 分页参数（保留原有）
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPage = computed(() => Math.ceil(total.value / pageSize.value))

// 选中的ID（保留原有）
const selectedIds = ref([])
const handleSelectionChange = (val) => {
  selectedIds.value = val.map(item => item.id)
}

// 动态表格配置（保留原有）
const defaultFields = {
  id: { label: 'ID', width: 80 },
  username: { label: '姓名', width: 120 },
  account: { label: '账号', width: 120 },
  phone: { label: '电话', width: 150 },
  email: { label: '邮箱', width: 200 },
  avatar: { label: '头像', width: 100 },
  role: { label: '角色', width: 100 }
}
const tableFields = ref(defaultFields)
const tableData = ref([])
const showTable = ref(false)
const errorMessage = ref('')

// 核心修改：适配后端独立的 /api/admin/list GET接口
const fetchData = async () => {
  showTable.value = false // 隐藏表格，避免加载中显示旧数据
  try {
    // 调用后端独立查询接口（GET方法）
    const response = await axios.get(`${BASE_URL}/api/admin/list`, {
      params: {
        page: currentPage.value, // 分页参数（后端若未实现分页，可忽略，但保留参数兼容）
        size: pageSize.value,
        account: queryParams.value.account // 账号查询条件
      }
    })

    if (response.data.success) {
      const resData = response.data.data
      // 优先使用后端返回的fields，无则用默认配置（保留动态列功能）
      tableFields.value = resData.fields || defaultFields
      // 赋值表格数据（后端返回的items数组）
      tableData.value = resData.items || []
      // 总条数（后端若未返回，用数据长度替代）
      total.value = resData.total || tableData.value.length
      showTable.value = true // 显示表格
      errorMessage.value = ''
    } else {
      errorMessage.value = response.data.message || '查询失败'
      showTable.value = false
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '网络错误或登录已过期'
    showTable.value = false
    console.error('查询管理员列表失败：', error)
  }
}

// 初始化加载数据（保留原有自动加载功能）
onMounted(() => {
  fetchData()
})

// 查询（保留原有逻辑）
const handleQuery = () => {
  currentPage.value = 1
  fetchData()
}

// 重置（保留原有逻辑）
const handleReset = () => {
  queryParams.value.account = ''
  currentPage.value = 1
  fetchData()
}

// 新增（保留原有逻辑）
const handleAdd = () => {
  router.push('/admin/user/add')
}

// 编辑（保留原有逻辑）
const handleEdit = (row) => {
  router.push({ path: '/admin/user/edit', query: { id: row.id } })
}

// 单个删除（保留原有逻辑，若删除接口还是通用operate，无需修改）
const handleDelete = async (id) => {
  if (!confirm('确定删除该管理员吗？')) return
  // 若删除接口已改为独立接口，需修改此处请求；若仍用通用operate，保持不变
  const params = {
    table_name: 'admin_info',
    operate_type: 'delete',
    kwargs: { id }
  }
  try {
    const response = await axios.post(`${BASE_URL}/api/admin/operate`, params)
    if (response.data.success) {
      alert(response.data.message || '删除成功')
      fetchData() // 重新加载列表
    } else {
      errorMessage.value = response.data.message || '删除失败'
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '删除失败'
    console.error('删除失败：', error)
  }
}

// 批量删除（保留原有逻辑）
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    alert('请选择要删除的管理员')
    return
  }
  if (!confirm(`确定删除选中的${selectedIds.value.length}条记录吗？`)) return

  let successCount = 0
  for (const id of selectedIds.value) {
    const params = {
      table_name: 'admin_info',
      operate_type: 'delete',
      kwargs: { id }
    }
    try {
      const response = await axios.post(`${BASE_URL}/api/admin/operate`, params)
      if (response.data.success) successCount++
    } catch (error) {
      console.error(`删除ID=${id}失败：`, error)
    }
  }
  alert(`批量删除完成，成功删除${successCount}条，失败${selectedIds.value.length - successCount}条`)
  selectedIds.value = []
  fetchData()
}

// 分页切换
const handlePageChange = async (page) => {
  if (currentPage.value >= totalPage.value) {
    errorMessage.value = '您已经到了最后一页'
    return
  }

  try {
    currentPage.value = page
    await fetchData()
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '分页加载失败'
    console.error('分页加载失败：', error)
  }
}

</script>

<style scoped>
/* 引入公共样式，保留原有样式逻辑 */
@import url('@/styles/admin/admin_common.css');

/* 列表页独有样式（无则留空） */
</style>