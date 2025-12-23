<!-- ./src/App.vue -->
<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { preloadCriticalComponents } from '@/utils/asyncComponents'

const authStore = useAuthStore()

// 应用启动时检查认证状态并预加载关键组件
onMounted(async () => {
  try {
    // 初始化统一认证系统
    await authStore.initializeAuth()

    console.log('统一认证系统初始化完成', {
      isAuthenticated: authStore.isAuthenticated,
      user: authStore.user,
      currentRole: authStore.currentRole,
      permissions: authStore.permissions
    })

    // 根据用户权限预加载关键组件
    if (authStore.isAuthenticated) {
      // 异步预加载，不阻塞主流程
      setTimeout(() => {
        preloadCriticalComponents().catch(error => {
          console.warn('预加载组件失败:', error)
        })
      }, 1000) // 延迟1秒预加载，避免影响首屏渲染
    }
  } catch (error) {
    console.error('认证系统初始化失败:', error)
    // 如果初始化失败，尝试清理状态
    await authStore.logout()
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Microsoft YaHei', sans-serif;
}

body {
  background-color: #f5f5f5;
}
</style>