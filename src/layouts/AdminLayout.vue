<template>
  <div class="admin-layout">
    <!-- 顶部栏位：AdminHeader -->
    <AdminHeader />

    <!-- 下方容器：侧边栏 + 主内容区 -->
    <div class="layout-container">
      <!-- 左侧侧边栏 -->
      <aside class="sidebar">
        <ul class="menu">
          <li><router-link to="/admin/dashboard">系统首页</router-link></li>
          <li><router-link to="/admin/info/notice">信息管理</router-link></li>
          <li><router-link to="/admin/apply/poor">申请管理</router-link></li>
          <li class="menu-group">
            <span>用户管理</span>
            <ul class="sub-menu">
              <li><router-link to="/admin/user/admin">管理员信息</router-link></li>
              <li><router-link to="/admin/user/info">用户信息</router-link></li>
            </ul>
          </li>
        </ul>
      </aside>

      <!-- 右侧主内容区（红色选框区域） -->
      <main class="main-content">
        <router-view /> <!-- 动态渲染子页面 -->
      </main>
    </div>
  </div>
</template>

<script setup>
import AdminHeader from '@/views/admin/components/AdminHeader.vue' // 导入AdminHeader组件
defineOptions({ name: "AdminLayout" })
</script>

<style scoped>
.admin-layout {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 整体高度占满视口 */
}

/* 顶部栏位样式 */
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

/* 下方容器：侧边栏 + 主内容区 */
.layout-container {
  display: flex;
  flex: 1; /* 占据剩余高度 */
  height: calc(100vh - 60px); /* 减去顶部栏位高度 */
}

.sidebar {
  width: 200px;
  background: #f5f7fa;
  border-right: 1px solid #eaecef;
  padding: 20px 0;
}

.menu {
  list-style: none;
  padding: 0;
}

.menu li {
  margin-bottom: 5px;
}

.menu a {
  display: block;
  padding: 10px 20px;
  color: #333;
  text-decoration: none;
  transition: background 0.2s;
}

.menu a:hover, .menu a.router-link-exact-active {
  background: #e9f7ef;
  color: #00b42a;
}

.menu-group {
  font-weight: 600;
  padding: 10px 20px;
}

.sub-menu {
  list-style: none;
  padding-left: 10px;
}

.sub-menu a {
  padding: 10px 30px;
  font-size: 14px;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>