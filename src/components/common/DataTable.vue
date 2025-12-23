<template>
  <div class="data-table">
    <!-- 表格工具栏 -->
    <div v-if="showToolbar" class="table-toolbar">
      <div class="toolbar-left">
        <slot name="toolbar-left">
          <el-space>
            <el-button
              v-if="allowCreate"
              type="primary"
              :icon="Plus"
              @click="handleCreate"
            >
              {{ createText }}
            </el-button>
            <el-button
              v-if="selectedRows.length > 0 && allowBatchDelete"
              type="danger"
              :icon="Delete"
              @click="handleBatchDelete"
              :disabled="batchDeleteLoading"
            >
              批量删除 ({{ selectedRows.length }})
            </el-button>
          </el-space>
        </slot>
      </div>
      <div class="toolbar-right">
        <slot name="toolbar-right">
          <el-space>
            <el-input
              v-if="allowSearch"
              v-model="searchKeyword"
              placeholder="搜索..."
              :prefix-icon="Search"
              clearable
              @input="handleSearch"
            />
            <el-button
              v-if="allowRefresh"
              :icon="Refresh"
              @click="handleRefresh"
              :loading="loading"
            >
              刷新
            </el-button>
          </el-space>
        </slot>
      </div>
    </div>

    <!-- 表格主体 -->
    <el-table
      v-loading="loading"
      :data="data"
      :height="height"
      :max-height="maxHeight"
      :stripe="stripe"
      :border="border"
      :show-header="showHeader"
      :highlight-current-row="highlightCurrentRow"
      :row-key="rowKey"
      :default-sort="defaultSort"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <!-- 选择列 -->
      <el-table-column
        v-if="allowSelection"
        type="selection"
        width="55"
        :selectable="selectable"
      />

      <!-- 数据列 -->
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :min-width="column.minWidth"
        :fixed="column.fixed"
        :sortable="column.sortable"
        :align="column.align"
        :show-overflow-tooltip="column.showOverflowTooltip"
      >
        <template #default="scope">
          <slot
            :name="`column-${column.prop}`"
            :row="scope.row"
            :column="column"
            :index="scope.$index"
          >
            {{ formatCell(scope.row[column.prop], column, scope.row) }}
          </slot>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column
        v-if="actions.length > 0"
        label="操作"
        :width="actionColumnWidth"
        :fixed="actionColumnFixed"
      >
        <template #default="scope">
          <el-space>
            <template v-for="action in getAvailableActions(scope.row)" :key="action.key">
              <el-button
                v-if="action.type === 'button'"
                link
                :type="action.buttonType || 'primary'"
                :size="action.size || 'small'"
                :loading="action.loading"
                :disabled="action.disabled"
                @click="handleAction(action, scope.row, scope.$index)"
              >
                <el-icon v-if="action.icon" class="mr-1">
                  <component :is="action.icon" />
                </el-icon>
                {{ action.label }}
              </el-button>
              <el-dropdown
                v-else-if="action.type === 'dropdown'"
                trigger="click"
                @command="(command) => handleDropdownAction(command, action, scope.row, scope.$index)"
              >
                <el-button link type="primary" size="small">
                  更多<el-icon class="ml-1"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-for="item in action.items"
                      :key="item.key"
                      :command="item.key"
                      :disabled="item.disabled"
                    >
                      <el-icon v-if="item.icon" class="mr-1">
                        <component :is="item.icon" />
                      </el-icon>
                      {{ item.label }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-space>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <div v-if="showPagination && pagination" class="table-pagination">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="pagination.pageSizes || [10, 20, 50, 100]"
        :total="pagination.total"
        :layout="paginationLayout"
        :background="paginationBackground"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Delete,
  Search,
  Refresh,
  ArrowDown,
  Edit,
  View,
  Delete as DeleteIcon
} from '@element-plus/icons-vue'
import { useAuthStore, usePermissions } from '@/stores'
import type { UserRole } from '@/types/auth'

// 列配置接口
interface TableColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean | 'custom'
  align?: 'left' | 'center' | 'right'
  showOverflowTooltip?: boolean
  formatter?: (value: any, row: any) => string
}

// 操作配置接口
interface TableAction {
  key: string
  label: string
  type: 'button' | 'dropdown'
  icon?: any
  buttonType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'large' | 'default' | 'small'
  loading?: boolean
  disabled?: boolean
  requiredRole?: UserRole
  requiredPermission?: string
  visible?: (row: any) => boolean
  onClick?: (row: any, index: number) => void
  items?: TableAction[] // dropdown类型的子菜单
}

// 分页配置接口
interface PaginationConfig {
  page: number
  pageSize: number
  total: number
  pageSizes?: number[]
}

interface Props {
  /** 表格数据 */
  data: any[]
  /** 列配置 */
  columns: TableColumn[]
  /** 操作配置 */
  actions?: TableAction[]
  /** 加载状态 */
  loading?: boolean
  /** 表格高度 */
  height?: string | number
  /** 最大高度 */
  maxHeight?: string | number
  /** 是否显示斑马纹 */
  stripe?: boolean
  /** 是否显示边框 */
  border?: boolean
  /** 是否显示表头 */
  showHeader?: boolean
  /** 是否高亮当前行 */
  highlightCurrentRow?: boolean
  /** 行数据的Key */
  rowKey?: string
  /** 默认排序 */
  defaultSort?: { prop: string; order: string }
  /** 是否显示工具栏 */
  showToolbar?: boolean
  /** 是否允许创建 */
  allowCreate?: boolean
  /** 创建按钮文本 */
  createText?: string
  /** 是否允许搜索 */
  allowSearch?: boolean
  /** 是否允许刷新 */
  allowRefresh?: boolean
  /** 是否允许选择 */
  allowSelection?: boolean
  /** 是否允许批量删除 */
  allowBatchDelete?: boolean
  /** 选择行函数 */
  selectable?: (row: any, index: number) => boolean
  /** 是否显示分页 */
  showPagination?: boolean
  /** 分页配置 */
  pagination?: PaginationConfig
  /** 分页布局 */
  paginationLayout?: string
  /** 分页背景 */
  paginationBackground?: boolean
  /** 操作列宽度 */
  actionColumnWidth?: string | number
  /** 操作列固定方式 */
  actionColumnFixed?: boolean | 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  stripe: true,
  border: true,
  showHeader: true,
  highlightCurrentRow: true,
  rowKey: 'id',
  showToolbar: true,
  allowCreate: true,
  createText: '新建',
  allowSearch: true,
  allowRefresh: true,
  allowSelection: true,
  allowBatchDelete: true,
  showPagination: true,
  paginationLayout: 'total, sizes, prev, pager, next, jumper',
  paginationBackground: true,
  actionColumnWidth: 200,
  actionColumnFixed: 'right'
})

// 计算实际是否显示创建按钮
const shouldShowCreate = computed(() => {
  return props.showCreate !== false && props.allowCreate &&
    (hasPermission('ADMIN') || hasPermission('CONTENT_CREATE'))
})

// 计算实际是否显示批量删除按钮
const shouldShowBatchDelete = computed(() => {
  return props.allowBatchDelete && selectedRows.value.length > 0 &&
    (hasPermission('ADMIN') || hasPermission('CONTENT_DELETE'))
})

const emit = defineEmits<{
  create: []
  refresh: []
  search: [keyword: string]
  'selection-change': [selection: any[]]
  'sort-change': [sort: { column: any; prop: string; order: string }]
  'size-change': [size: number]
  'current-change': [page: number]
  action: [action: TableAction, row: any, index: number]
}>()

const authStore = useAuthStore()
const { hasPermission, hasFeaturePermission } = usePermissions()
const searchKeyword = ref('')
const selectedRows = ref<any[]>([])
const batchDeleteLoading = ref(false)

/**
 * 格式化单元格内容
 */
const formatCell = (value: any, column: TableColumn, row: any) => {
  if (column.formatter) {
    return column.formatter(value, row)
  }
  return value
}

/**
 * 获取可用的操作按钮 - 使用新的统一权限系统
 */
const getAvailableActions = (row: any) => {
  return (props.actions || []).filter(action => {
    // 检查权限
    if (action.requiredRole && !hasPermission(action.requiredRole as UserRole)) {
      return false
    }
    if (action.requiredPermission && !hasFeaturePermission(action.requiredPermission)) {
      return false
    }

    // 检查可见性
    if (action.visible && !action.visible(row)) {
      return false
    }

    return true
  })
}

/**
 * 处理选择变化
 */
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
  emit('selection-change', selection)
}

/**
 * 处理排序变化
 */
const handleSortChange = (sort: { column: any; prop: string; order: string }) => {
  emit('sort-change', sort)
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  emit('search', searchKeyword.value)
}

/**
 * 处理刷新
 */
const handleRefresh = () => {
  emit('refresh')
}

/**
 * 处理创建
 */
const handleCreate = () => {
  emit('create')
}

/**
 * 处理批量删除
 */
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条数据吗？`,
      '批量删除确认',
      {
        type: 'warning'
      }
    )

    batchDeleteLoading.value = true

    // 触发批量删除操作
    const action = props.actions?.find(a => a.key === 'batch-delete')
    if (action?.onClick) {
      await action.onClick(selectedRows.value, -1)
    }

    ElMessage.success('批量删除成功')
    selectedRows.value = []
  } catch (error) {
    // 用户取消操作
  } finally {
    batchDeleteLoading.value = false
  }
}

/**
 * 处理操作按钮点击
 */
const handleAction = (action: TableAction, row: any, index: number) => {
  if (action.onClick) {
    action.onClick(row, index)
  }
  emit('action', action, row, index)
}

/**
 * 处理下拉菜单操作
 */
const handleDropdownAction = (command: string, action: TableAction, row: any, index: number) => {
  const item = action.items?.find(i => i.key === command)
  if (item?.onClick) {
    item.onClick(row, index)
  }
}

/**
 * 处理分页大小变化
 */
const handleSizeChange = (size: number) => {
  emit('size-change', size)
}

/**
 * 处理当前页变化
 */
const handleCurrentChange = (page: number) => {
  emit('current-change', page)
}
</script>

<style scoped>
.data-table {
  background: white;
  border-radius: 6px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.table-pagination {
  display: flex;
  justify-content: center;
  padding: 16px;
  border-top: 1px solid #ebeef5;
}

.mr-1 {
  margin-right: 4px;
}

.ml-1 {
  margin-left: 4px;
}
</style>