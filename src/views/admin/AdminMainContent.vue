<template>
  <div class="admin-main">
    <div class="welcome-card">
      <h3>您好，{{ user?.name }}！欢迎使用管理员后台</h3>
      <p>当前登录角色：管理员 | 登录时间：{{ loginTime }}</p>
    </div>
    <div class="notice-card">
      <h4 class="card-title">系统公告</h4>
      <ul class="notice-list">
        <li v-for="notice in notices" :key="notice.id" class="notice-item">
          <span class="date">{{ notice.date }}</span>
          <span class="content">{{ notice.content }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "AdminMainContent" })
import { useMainStore } from '@/store'
import { ref } from 'vue'

const store = useMainStore()
const { user, notices } = store
const loginTime = ref(new Date().toLocaleString())
</script>

<style scoped>
/* 样式保持原逻辑，确保与布局风格一致 */
.admin-main {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.welcome-card h3 {
  color: #333;
  margin-bottom: 10px;
}

.welcome-card p {
  color: #666;
  font-size: 14px;
}

.notice-card {
  margin-top: 20px;
}

.card-title {
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
}

.notice-list {
  list-style: none;
  padding: 0;
}

.notice-item {
  padding: 10px 0;
  border-bottom: 1px dashed #eee;
  display: flex;
  gap: 15px;
}

.date {
  color: #00b42a;
  min-width: 80px;
}

.content {
  flex: 1;
}
</style>