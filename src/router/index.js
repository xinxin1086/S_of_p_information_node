import { createRouter, createWebHistory } from 'vue-router'
import { useMainStore } from '@/store'
import AdminLayout from '../layouts/AdminLayout.vue' // 导入布局组件
import AdminUserAdmin from '../views/admin/user/AdminUserAdmin.vue' // 导入管理员信息页面

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue') },
  { path: '/:pathMatch(.*)*', name: 'notFound', component: () => import('../views/NotFound.vue') },

  // 管理员嵌套路由
  {
    path: '/admin',
    component: AdminLayout, // 布局组件作为父路由
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: 'dashboard', component: () => import('../views/admin/AdminMainContent.vue') },
      { path: 'info/notice', component: () => import('../views/admin/components/AdminNotice.vue') },
      { path: 'info/head', component: () => import('../views/admin/components/AdminHeader.vue') },
      { path: 'apply/poor', component: () => import('../views/admin/components/AdminPoorApply.vue') },
      { path: 'user/admin', component: AdminUserAdmin }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫（权限控制）
router.beforeEach((to, from, next) => {
  const store = useMainStore()
  const requiresAuth = to.meta.requiresAuth
  const requiresAdmin = to.meta.requiresAdmin
  const isLoggedIn = store.user !== null
  const isAdmin = store.user?.role === 'admin'

  if (requiresAuth) {
    if (!isLoggedIn) next('/login')
    else if (requiresAdmin && !isAdmin) next('/login')
    else next()
  } else {
    next()
  }
})

export default router