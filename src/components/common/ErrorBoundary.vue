<template>
  <div v-if="hasError" class="error-boundary">
    <el-result
      icon="error"
      :title="errorTitle"
      :sub-title="errorMessage"
    >
      <template #extra>
        <el-space>
          <el-button type="primary" @click="handleReload">
            刷新页面
          </el-button>
          <el-button @click="handleGoHome">
            返回首页
          </el-button>
        </el-space>
      </template>
    </el-result>

    <!-- 开发环境下显示错误详情 -->
    <el-collapse v-if="isDevelopment && errorDetails" class="error-details">
      <el-collapse-item title="错误详情">
        <pre class="error-stack">{{ errorDetails }}</pre>
      </el-collapse-item>
    </el-collapse>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, computed } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  /** 错误标题 */
  title?: string
  /** 错误描述 */
  message?: string
  /** 是否显示错误详情（仅开发环境） */
  showDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '页面出错了',
  message: '抱歉，页面遇到了一些问题',
  showDetails: true
})

const router = useRouter()
const hasError = ref(false)
const error = ref<Error | null>(null)
const errorInfo = ref<string>('')

// 是否为开发环境
const isDevelopment = computed(() => import.meta.env.DEV)

// 错误标题
const errorTitle = computed(() => {
  if (error.value?.name) {
    return `${props.title}: ${error.value.name}`
  }
  return props.title
})

// 错误消息
const errorMessage = computed(() => {
  if (error.value?.message) {
    return `${props.message}: ${error.value.message}`
  }
  return props.message
})

// 错误详情
const errorDetails = computed(() => {
  if (!error.value) return ''

  const details = [
    `Error: ${error.value.message}`,
    `Stack: ${error.value.stack}`,
  ]

  if (errorInfo.value) {
    details.push(`Component Stack: ${errorInfo.value}`)
  }

  return details.join('\n\n')
})

// 捕获子组件错误
onErrorCaptured((err: Error, instance: any, info: string) => {
  console.error('ErrorBoundary捕获到错误:', err)
  console.error('组件实例:', instance)
  console.error('错误信息:', info)

  hasError.value = true
  error.value = err
  errorInfo.value = info

  // 在生产环境中，可以在这里发送错误报告
  if (!isDevelopment.value) {
    reportError(err, info)
  }

  // 阻止错误继续向上传播
  return false
})

/**
 * 处理重新加载
 */
const handleReload = () => {
  window.location.reload()
}

/**
 * 处理返回首页
 */
const handleGoHome = () => {
  hasError.value = false
  error.value = null
  errorInfo.value = ''
  router.push('/')
}

/**
 * 上报错误到监控服务
 */
const reportError = (err: Error, info: string) => {
  // 这里可以集成错误监控服务，如 Sentry
  try {
    // 示例：发送到错误收集接口
    fetch('/api/error/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: err.message,
        stack: err.stack,
        info,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {
      // 忽略错误上报失败
    })
  } catch {
    // 忽略错误上报失败
  }
}

/**
 * 重置错误状态
 */
const resetError = () => {
  hasError.value = false
  error.value = null
  errorInfo.value = ''
}

// 暴露重置方法供外部调用
defineExpose({
  resetError
})
</script>

<style scoped>
.error-boundary {
  padding: 20px;
}

.error-details {
  margin-top: 20px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.error-stack {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: #333;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
}
</style>