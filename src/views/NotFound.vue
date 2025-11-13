<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面不存在或已被移除</p>
    <router-link to="/" class="back-home">返回首页</router-link>
  </div>
</template>

<script setup>
defineOptions({ name: "NotFound" })
</script>

<style scoped>
.not-found {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

h1 {
  font-size: 80px;
  color: #00b42a;
  margin-bottom: 20px;
}

p {
  font-size: 20px;
  color: #666;
  margin-bottom: 30px;
}

.back-home {
  padding: 12px 24px;
  background-color: #2563eb;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 16px;
  transition: background-color 0.2s;
}

.back-home:hover {
  background-color: #1d4ed8;
}
</style>