<template>
  <div class="home">
    <h1>农业快讯站 - 首页</h1>
    <div class="nav-links">
      <router-link to="/login">前往登录</router-link>
      <router-link to="/register">用户注册</router-link>
      <router-link to="/about">关于系统</router-link>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "HomeView" })
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 50px auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  color: #00b42a;
  margin-bottom: 30px;
}

.nav-links {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.nav-links a {
  padding: 10px 20px;
  background-color: #2563eb;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.nav-links a:hover {
  background-color: #1d4ed8;
}
</style>