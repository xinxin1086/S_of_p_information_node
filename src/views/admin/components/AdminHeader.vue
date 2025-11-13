<template>
  <div class="admin-header">
    <div class="logo">
      <span>助农扶贫系统 - 管理员后台</span>
    </div>
    <div class="user-info">
      欢迎，{{ user?.name }} <button @click="handleLogout">退出登录</button>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "AdminHeader" })
import { useMainStore } from '@/store'
import { useRouter } from 'vue-router'

const store = useMainStore()
const router = useRouter()
const user = store.user

const handleLogout = () => {
  store.logout() // 清空Pinia用户信息
  localStorage.removeItem('user_token') // 删除令牌
  delete axios.defaults.headers.common['Authorization'] // 清除请求头
  router.push('/login')
}
</script>

<style scoped>
.admin-header {
  height: 60px;
  background-color: #00b42a;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  font-size: 18px;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #fff;
  color: #00b42a;
  font-weight: 500;
  transition: background-color 0.2s;
}

.user-info button:hover {
  background-color: #f0f0f0;
}
</style>