<template>
  <aside class="sidebar">
    <ul class="menu-list">
      <li v-for="(menu, index) in sidebarMenus" :key="index" class="menu-item">
        <div
            class="menu-title"
            :class="{ active: isOpen[index] }"
            @click="handleMenuClick(menu, index)"
        >
          <span class="text">{{ menu.title }}</span>
          <span v-if="menu.children" class="arrow">{{ isOpen[index] ? '↑' : '↓' }}</span>
        </div>
        <ul
            v-if="menu.children"
            :class="{ 'sub-menu': true, 'open': isOpen[index] }"
        >
          <li v-for="(sub, i) in menu.children" :key="i">
            <!-- 严格绑定 sub.path，无任何硬编码 -->
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
import { useRoute, useRouter } from 'vue-router'

const store = useMainStore()
const route = useRoute()
const router = useRouter()
const { sidebarMenus } = store

// 调试打印：确认路径正确
console.log('当前菜单数据:', sidebarMenus);
const userMenu = sidebarMenus.find(m => m.title === '用户管理');
console.log('用户管理子菜单路径:', userMenu?.children?.map(s => s.path));

const isOpen = ref(
    sidebarMenus.map(menu =>
        menu.children?.some(sub => route.path.startsWith(sub.path)) || false
    )
)

const toggleSubMenu = (index) => {
  if (sidebarMenus[index].children) {
    isOpen.value[index] = !isOpen.value[index]
  }
}

const handleMenuClick = (menu, index) => {
  if (!menu.children && menu.path) {
    router.push(menu.path)
  } else {
    toggleSubMenu(index)
  }
}
</script>

<style scoped>
.sidebar {
  width: 220px;
  background-color: #fff;
  border-right: 1px solid #eee;
  height: 100%;
  overflow-y: auto;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
  border-radius: 0 8px 8px 0;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  margin: 0;
  border-bottom: 1px solid #f5f5f5;
}

.menu-title {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 14px 24px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.3s ease;
}

/* 菜单hover样式 */
.menu-title:hover {
  background-color: #f8fafc;
  color: #409EFF;
}

.arrow {
  font-size: 12px;
  color: #999;
  margin-left: auto;
  transition: transform 0.3s ease;
}

/* 展开时箭头旋转 */
.menu-title.active .arrow {
  transform: rotate(180deg);
}

.menu-title:hover .arrow {
  color: #409EFF;
}

.sub-menu {
  list-style: none;
  background-color: #f9fafc;
  padding: 0;
  margin: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

/* 子菜单展开样式 */
.sub-menu.open {
  max-height: 500px;
  padding-left: 10px;
}

.sub-link {
  display: block;
  padding: 12px 24px 12px 56px;
  font-size: 13px;
  color: #666;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

/* 子菜单hover/激活样式（匹配当前路由） */
.sub-link:hover,
.sub-link.router-link-exact-active {
  color: #409EFF;
  background-color: #f0f9ff;
  border-left-color: #409EFF;
}
</style>