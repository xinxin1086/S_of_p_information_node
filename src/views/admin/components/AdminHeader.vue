<template>
  <div class="admin-header">
    <div class="logo">
      <span>汉江垂钓站 - 管理员后台</span>
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
import axios from 'axios';
const store = useMainStore()
const router = useRouter()
const user = store.user

const handleLogout = () => {
  try {
    // 1. 清空Pinia用户信息
    store.logout();
    // 2. 删除本地存储令牌
    localStorage.removeItem('user_token');
    // 3. 清除请求头Authorization（兼容axios实例）
    if (axios.defaults.headers.common) {
      delete axios.defaults.headers.common['Authorization'];
    }
    // 4. 跳转登录页（强制替换历史记录，避免回退）
    router.replace('/login');
  } catch (error) {
    console.error('退出登录失败：', error);
    // 异常时仍强制跳转登录页
    router.replace('/login');
  }
};
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