<template>
  <div class="about">
    <h1>关于汉江垂钓站</h1>
    <p>系统致力于为捕鱼人提供渔业最新资讯服务</p>
    <p>版本：v1.0.0</p>
    <router-link to="/" class="back-home">返回首页</router-link>
  </div>
</template>

<script setup>
defineOptions({ name: "AboutView" })
</script>

<style scoped>
.about {
  max-width: 1200px;
  margin: 50px auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

p {
  color: #666;
  margin: 10px 0;
}

.back-home {
  display: inline-block;
  margin-top: 30px;
  padding: 10px 20px;
  background-color: #00b42a;
  color: white;
  text-decoration: none;
  border-radius: 6px;
}
</style>