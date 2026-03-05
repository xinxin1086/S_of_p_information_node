import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { UserInfo } from '@/types/auth'

/**
 * 主Store - 管理全局状态
 */
export const useMainStore = defineStore('main', () => {
  const user = ref(null)
  const sidebarCollapsed = ref(false)
  const isMobile = ref(false)
  const theme = ref('light')

  // 管理员侧边栏菜单配置
  const sidebarMenus = ref([
    {
      title: '返回首页',
      path: '/'
    },
    {
      title: '管理员控制台',
      path: '/admin/dashboard'
    },
    {
      title: '内容管理模块',
      children: [
        {
          title: '活动审核',
          path: '/admin/content/activity-review'
        },
        {
          title: '内容发布',
          children: [
            { title: '公告管理', path: '/admin/content/notice' },
            { title: '科普管理', path: '/admin/content/science' },
            { title: '活动管理', path: '/admin/content/activity' }
          ]
        }
      ]
    },
    {
      title: '用户管理模块',
      children: [
        {
          title: '管理员管理',
          path: '/admin/user/admin'
        },
        {
          title: '普通用户管理',
          children: [
            { title: '用户列表', path: '/admin/user/user' },
            { title: '添加用户', path: '/admin/user/user/add' }
          ]
        }
      ]
    }
  ])

  // 用户侧边栏菜单配置
  const userMenus = ref([
    {
      title: '用户首页',
      path: '/user'
    },
    {
      title: '活动中心',
      children: [
        { title: '活动列表', path: '/user/activities' },
        { title: '我的预约', path: '/user/bookings' },
        { title: '预约历史', path: '/user/booking-history' }
      ]
    },
    {
      title: '组织用户',
      children: [
        { title: '控制台', path: '/user/weave/dashboard' },
        { title: '我的活动', path: '/user/weave/my-activities' },
        { title: '创建活动', path: '/user/weave/create-activity' }
      ]
    },
    {
      title: '个人设置',
      children: [
        { title: '个人资料', path: '/user/profile' },
        { title: '账户设置', path: '/user/settings' }
      ]
    }
  ])

  // 设置用户信息
  const setUser = (userInfo: UserInfo) => {
    user.value = userInfo
  }

  // 清除用户信息
  const clearUser = () => {
    user.value = null
  }

  // 切换侧边栏
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  // 设置移动端状态
  const setMobile = (mobile: boolean) => {
    isMobile.value = mobile
  }

  // 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return {
    user,
    sidebarCollapsed,
    isMobile,
    theme,
    sidebarMenus,
    userMenus,
    setUser,
    clearUser,
    toggleSidebar,
    setMobile,
    toggleTheme
  }
})