<template>
  <div v-if="hasAccess">
    <slot />
  </div>
  <div v-else-if="showFallback" class="permission-fallback">
    <el-empty
      :image-size="120"
      description="权限不足"
    >
      <template #description>
        <p class="text-gray-500">{{ fallbackMessage }}</p>
      </template>
      <el-button
        v-if="showBackButton"
        type="primary"
        @click="handleGoBack"
      >
        返回
      </el-button>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import type { UserRole } from '@/types/auth'

interface Props {
  /** 需要的角色权限 */
  requiredRole?: UserRole
  /** 需要的功能权限 */
  requiredPermission?: string
  /** 是否显示权限不足的提示 */
  showFallback?: boolean
  /** 权限不足时的提示信息 */
  fallbackMessage?: string
  /** 是否显示返回按钮 */
  showBackButton?: boolean
  /** 空状态下的插槽内容 */
  fallbackSlot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showFallback: true,
  fallbackMessage: '您没有访问此页面的权限，请联系管理员',
  showBackButton: true
})

const router = useRouter()
const authStore = useAuthStore()

// 检查是否有访问权限
const hasAccess = computed(() => {
  // 如果用户未登录，没有访问权限
  if (!authStore.isAuthenticated) {
    return false
  }

  // 检查角色权限
  if (props.requiredRole && !authStore.hasPermission(props.requiredRole)) {
    return false
  }

  // 检查功能权限
  if (props.requiredPermission && !authStore.hasFeaturePermission(props.requiredPermission)) {
    return false
  }

  return true
})

// 处理返回操作
const handleGoBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.permission-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 20px;
}
</style>