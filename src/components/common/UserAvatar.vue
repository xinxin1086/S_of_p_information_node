<template>
  <div class="user-avatar">
    <el-avatar
      :size="size"
      :src="displayAvatar"
      :fit="fit"
      @error="handleAvatarError"
    >
      <el-icon :size="size * 0.5">
        <User />
      </el-icon>
    </el-avatar>

    <!-- 调试信息（开发模式下显示） -->
    <div v-if="showDebug" class="avatar-debug-info">
      <small>{{ debugInfo }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { User } from '@element-plus/icons-vue'
import { getAvatarUrl, DEFAULT_AVATAR } from '@/utils/avatar.js'
import { getUserAvatarField } from '@/utils/userFormat.js'

defineOptions({ name: "UserAvatar" })

interface Props {
  /** 头像URL */
  avatar?: string
  /** 头像大小 */
  size?: number
  /** 图片适配方式 */
  fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
  /** 是否显示调试信息 */
  showDebug?: boolean
  /** 用户信息（用于调试） */
  userInfo?: Record<string, unknown>
}

const props = withDefaults(defineProps<Props>(), {
  size: 40,
  fit: 'cover',
  showDebug: false
})

// 处理头像URL的逻辑，支持用户信息对象
const processAvatarUrl = (avatar: string | undefined, userInfo: Record<string, unknown> | undefined): string => {
  let avatarField = avatar

  // 如果直接传入了用户信息对象，从中提取头像字段
  if (!avatarField && userInfo) {
    avatarField = getUserAvatarField(userInfo)
  }

  if (!avatarField || avatarField.trim() === '') {
    return DEFAULT_AVATAR
  }

  // 使用通用工具处理
  const processedUrl = getAvatarUrl(avatarField.trim())
  return processedUrl || DEFAULT_AVATAR
}

// 计算显示的头像URL
const displayAvatar = computed(() => {
  return processAvatarUrl(props.avatar, props.userInfo)
})

// 调试信息
const debugInfo = computed(() => {
  const info = {
    original: props.avatar,
    processed: displayAvatar.value,
    userInfo: props.userInfo
  }
  return JSON.stringify(info, null, 2)
})

// 头像加载失败处理
const handleAvatarError = (e: Event) => {
  console.warn('头像加载失败，使用默认头像:', displayAvatar.value)
  const target = e.target as HTMLImageElement
  target.src = DEFAULT_AVATAR
}

// 调试日志
if (props.showDebug) {
  console.log('=== UserAvatar Debug ===')
  console.log('Props:', props)
  console.log('Original avatar:', props.avatar)
  console.log('Display avatar:', displayAvatar.value)
  console.log('======================')
}
</script>

<style scoped>
.user-avatar {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.avatar-debug-info {
  max-width: 300px;
  word-break: break-all;
  text-align: center;
  background: #f5f5f5;
  padding: 4px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.avatar-debug-info small {
  color: #666;
  font-size: 10px;
  line-height: 1.2;
  font-family: monospace;
  white-space: pre-wrap;
}
</style>