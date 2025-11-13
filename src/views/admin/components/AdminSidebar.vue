<template>
  <aside class="sidebar">
    <ul class="menu-list">
      <li v-for="(menu, index) in sidebarMenus" :key="index" class="menu-item">
        <div class="menu-title" @click="toggleSubMenu(index)">
          <span class="icon">{{ menu.icon }}</span>
          <span class="text">{{ menu.title }}</span>
          <span v-if="menu.children" class="arrow">{{ isOpen[index] ? '↑' : '↓' }}</span>
        </div>
        <ul v-if="menu.children && isOpen[index]" class="sub-menu">
          <li v-for="(sub, i) in menu.children" :key="i">
            <router-link :to="sub.path" class="sub-link">
              {{ sub.title }}
            </router-link>
          </li>
        </ul>
      </li>
    </ul>
  </aside>
</template>

<script setup>
defineOptions({ name: "AdminSidebar" })
import { ref } from 'vue'
import { useMainStore } from '@/store'
import { useRoute } from 'vue-router'

const store = useMainStore()
const route = useRoute()
const { sidebarMenus } = store

// 初始化菜单展开状态（匹配当前路由）
const isOpen = ref(
    sidebarMenus.map(menu => menu.children?.some(sub => sub.path === route.path) || false)
)

// 切换子菜单展开/折叠
const toggleSubMenu = (index) => {
  if (sidebarMenus[index].children) {
    isOpen.value[index] = !isOpen.value[index]
  }
}
</script>

<style scoped>
.sidebar {
  width: 200px;
  background-color: #f5f5f5;
  border-right: 1px solid #e5e5e5;
  height: 100%;
  overflow-y: auto;
}

.menu-list {
  list-style: none;
  padding: 10px 0;
}

.menu-item {
  margin-bottom: 5px;
}

.menu-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.2s;
}

.menu-title:hover {
  background-color: #e9f7ef;
}

.icon {
  display: inline-block;
  width: 20px;
  text-align: center;
}

.arrow {
  font-size: 12px;
  color: #999;
}

.sub-menu {
  list-style: none;
  background-color: #fff;
  padding-left: 10px;
}

.sub-link {
  display: block;
  padding: 10px 20px 10px 40px;
  font-size: 13px;
  color: #666;
  text-decoration: none;
  transition: all 0.2s;
}

.sub-link:hover,
.sub-link.router-link-exact-active {
  color: #00b42a;
  background-color: #f0f9f2;
}
</style>