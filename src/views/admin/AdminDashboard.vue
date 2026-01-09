<!--./src/views/admin/AdminDashboard.vue -->
<template>
  <div class="dashboard">
    <AdminHeader />
    <div class="container">
      <AdminSidebar />
      <AdminMainContent />
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "AdminDashboard" })
import AdminMainContent from './AdminMainContent.vue'
import AdminHeader from './components/AdminHeader.vue'
import AdminSidebar from './components/AdminSidebar.vue'
</script>

<style scoped>
.container {
  display: flex;
  height: calc(100vh - 60px);
}
</style>