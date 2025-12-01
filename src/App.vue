<!-- ./src/App.vue -->
<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/store/modules/auth'

const authStore = useAuthStore()

// 应用启动时检查认证状态
onMounted(async () => {
  // 如果本地有token但未认证，尝试恢复登录状态
  if (authStore.token && !authStore.isAuthenticated) {
    try {
      await authStore.checkAuth()
    } catch (error) {
      console.warn('Failed to restore auth state:', error)
    }
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