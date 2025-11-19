<template>
  <div class="admin-layout">
    <!-- 顶部栏位：AdminHeader -->
    <AdminHeader />

    <!-- 下方容器：侧边栏 + 主内容区 -->
    <div class="layout-container">
      <!-- 侧边栏位使用正确的Pinia菜单和路由 -->
      <AdminSidebar />

      <!-- 右侧主内容区（保持不变） -->
      <main class="main-content">
        <router-view /> <!-- 动态渲染子页面 -->
      </main>
    </div>
  </div>
</template>

<script setup>
import AdminHeader from '@/views/admin/components/AdminHeader.vue'
// 导入独立的侧边栏组件（不导入会消失）
import AdminSidebar from '@/views/admin/components/AdminSidebar.vue'
defineOptions({ name: "AdminLayout" })
</script>

<style scoped>
.admin-layout {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 整体高度占满视口 */
}

/* 顶部栏位样式（保持不变） */
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

/* 下方容器：侧边栏 + 主内容区（保持不变） */
.layout-container {
  display: flex;
  flex: 1; /* 占据剩余高度 */
  height: calc(100vh - 60px); /* 减去顶部栏位高度 */
}

/* 适配独立侧边栏组件：与原有布局样式统一 */
/* 注意：独立组件已自带 .sidebar 样式，这里仅控制布局间距，避免冲突 */
.layout-container > div:first-child {
  width: 220px; /* 与AdminSidebar.vue的宽度一致（原200px调整为220px，适配组件） */
  flex-shrink: 0; /* 防止侧边栏被压缩 */
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>