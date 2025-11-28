<!-- ./src/views/admin/components/AdminSidebar.vue -->
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

        <!-- 二级菜单 -->
        <ul
            v-if="menu.children"
            :class="{ 'sub-menu': true, 'open': isOpen[index] }"
        >
          <li v-for="(sub, i) in menu.children" :key="i" class="sub-menu-item">
            <div
                class="sub-menu-title"
                :class="{ active: isSubOpen[index]?.[i] }"
                @click="handleSubMenuClick(sub, index, i)"
            >
              <span class="text">{{ sub.title }}</span>
              <span v-if="sub.children" class="arrow">{{ isSubOpen[index]?.[i] ? '↑' : '↓' }}</span>
            </div>

            <!-- 三级菜单 -->
            <ul
                v-if="sub.children"
                :class="{ 'third-menu': true, 'open': isSubOpen[index]?.[i] }"
            >
              <li v-for="(third, j) in sub.children" :key="j">
                <router-link :to="third.path" class="third-link">
                  {{ third.title }}
                </router-link>
              </li>
            </ul>
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

// 一级菜单展开状态
const isOpen = ref(
    sidebarMenus.map(menu => {
        if (!menu.children) return false
        // 检查当前路径是否匹配该菜单下的任意子菜单路径
        return menu.children.some(sub => {
            if (sub.path) {
                return route.path.startsWith(sub.path)
            }
            if (sub.children) {
                return sub.children.some(third => route.path.startsWith(third.path))
            }
            return false
        })
    })
)

// 二级菜单展开状态
const isSubOpen = ref(
    sidebarMenus.map(menu =>
        menu.children?.map(sub => {
            if (!sub.children) return false
            return sub.children.some(third => route.path.startsWith(third.path))
        }) || []
    )
)

const toggleMainMenu = (index) => {
  if (sidebarMenus[index].children) {
    isOpen.value[index] = !isOpen.value[index]
  }
}

const toggleSubMenu = (mainIndex, subIndex) => {
  const subMenu = sidebarMenus[mainIndex].children[subIndex]
  if (subMenu.children) {
    // 创建新数组以避免响应式问题
    const newIsSubOpen = [...isSubOpen.value]
    newIsSubOpen[mainIndex] = [...(newIsSubOpen[mainIndex] || [])]
    newIsSubOpen[mainIndex][subIndex] = !newIsSubOpen[mainIndex][subIndex]
    isSubOpen.value = newIsSubOpen
  }
}

const handleMenuClick = (menu, index) => {
  if (!menu.children && menu.path) {
    router.push(menu.path)
  } else {
    toggleMainMenu(index)
  }
}

const handleSubMenuClick = (sub, mainIndex, subIndex) => {
  if (!sub.children && sub.path) {
    router.push(sub.path)
  } else {
    toggleSubMenu(mainIndex, subIndex)
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

/* 一级菜单样式 */
.menu-title {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 14px 24px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.3s ease;
  font-weight: 600;
}

.menu-title:hover {
  background-color: #f8fafc;
  color: #409EFF;
}

/* 二级菜单样式 */
.sub-menu-item {
  border-bottom: 1px solid #f0f0f0;
}

.sub-menu-title {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 24px 12px 30px;
  cursor: pointer;
  font-size: 13px;
  color: #555;
  transition: all 0.3s ease;
}

.sub-menu-title:hover {
  background-color: #f8fafc;
  color: #409EFF;
}

/* 三级菜单容器 */
.third-menu {
  list-style: none;
  background-color: #f9fafc;
  padding: 0;
  margin: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

/* 子菜单展开样式 */
.sub-menu.open,
.third-menu.open {
  max-height: 600px;
}

/* 三级菜单链接样式 */
.third-link {
  display: block;
  padding: 10px 24px 10px 60px;
  font-size: 12px;
  color: #666;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

/* 三级菜单hover/激活样式 */
.third-link:hover,
.third-link.router-link-exact-active {
  color: #409EFF;
  background-color: #f0f9ff;
  border-left-color: #409EFF;
}

/* 箭头样式 */
.arrow {
  font-size: 12px;
  color: #999;
  margin-left: auto;
  transition: transform 0.3s ease;
}

/* 展开时箭头旋转 */
.menu-title.active .arrow,
.sub-menu-title.active .arrow {
  transform: rotate(180deg);
}

.menu-title:hover .arrow,
.sub-menu-title:hover .arrow {
  color: #409EFF;
}
</style>