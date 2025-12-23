<template>
  <div class="pagination-container">
    <div class="pagination-info">
      <span>共 {{ total }} 条记录</span>
      <span v-if="total > 0">，第 {{ currentPage }} / {{ totalPages }} 页</span>
    </div>

    <div class="pagination-controls">
      <el-button
        :disabled="currentPage <= 1"
        @click="handlePageChange(currentPage - 1)"
        size="small"
        class="pagination-btn"
      >
        上一页
      </el-button>

      <div class="page-numbers">
        <el-button
          v-for="page in visiblePages"
          :key="page"
          :type="currentPage === page ? 'primary' : 'default'"
          :disabled="page === '...'"
          @click="handlePageChange(page)"
          size="small"
          class="pagination-btn page-btn"
        >
          {{ page }}
        </el-button>
      </div>

      <el-button
        :disabled="currentPage >= totalPages"
        @click="handlePageChange(currentPage + 1)"
        size="small"
        class="pagination-btn"
      >
        下一页
      </el-button>
    </div>

    <div class="pagination-size" v-if="showSizeChanger">
      <span>每页显示</span>
      <el-select
        v-model="pageSize"
        @change="handleSizeChange"
        size="small"
        class="size-select"
      >
        <el-option
          v-for="size in pageSizes"
          :key="size"
          :label="size"
          :value="size"
        />
      </el-select>
      <span>条</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: {
    type: Number,
    default: 1
  },
  total: {
    type: Number,
    default: 0
  },
  pageSize: {
    type: Number,
    default: 20
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  showSizeChanger: {
    type: Boolean,
    default: true
  },
  showQuickJumper: {
    type: Boolean,
    default: false
  },
  showTotal: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['change', 'sizeChange'])

const currentPage = computed(() => props.current)
const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

// 计算可见的页码
const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages = []

  // 总是显示第一页
  pages.push(1)

  // 计算中间部分
  if (current <= 4) {
    // 当前页在前面
    for (let i = 2; i <= 5; i++) {
      pages.push(i)
    }
  } else if (current >= total - 3) {
    // 当前页在后面
    for (let i = total - 4; i <= total - 1; i++) {
      pages.push(i)
    }
  } else {
    // 当前页在中间
    for (let i = current - 1; i <= current + 1; i++) {
      pages.push(i)
    }
  }

  // 添加省略号和最后一页
  if (!pages.includes(total - 1)) {
    pages.push('...')
  }
  if (!pages.includes(total)) {
    pages.push(total)
  }

  // 去重并排序
  return [...new Set(pages)].sort((a, b) => {
    if (a === '...') return 1
    if (b === '...') return -1
    return a - b
  })
})

const handlePageChange = (page) => {
  if (page === '...' || page < 1 || page > totalPages.value) {
    return
  }
  emit('change', page)
}

const handleSizeChange = (size) => {
  emit('sizeChange', size)
}

defineOptions({ name: "Pagination" })
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  gap: 1rem;
  flex-wrap: wrap;
}

.pagination-info {
  color: #64748b;
  font-size: 0.9rem;
  white-space: nowrap;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
}

.pagination-btn {
  min-width: 32px;
  border-radius: 6px;
}

.page-btn {
  padding: 0 8px;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 2px;
}

.pagination-size {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.9rem;
  white-space: nowrap;
}

.size-select {
  width: 80px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
  }

  .pagination-controls {
    order: 1;
    width: 100%;
    justify-content: center;
  }

  .pagination-info {
    order: 2;
    font-size: 0.85rem;
  }

  .pagination-size {
    order: 3;
    font-size: 0.85rem;
  }

  .page-numbers {
    flex-wrap: wrap;
    justify-content: center;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .page-numbers {
    max-width: 250px;
  }

  .pagination-btn {
    min-width: 28px;
    padding: 0 6px;
    font-size: 0.85rem;
  }

  .size-select {
    width: 70px;
  }
}

/* 暗色主题 */
.dark .pagination-info {
  color: #cbd5e1;
}

.dark .pagination-size {
  color: #cbd5e1;
}
</style>