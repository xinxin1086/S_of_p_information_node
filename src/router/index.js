import { createRouter, createWebHistory } from 'vue-router'
import { useMainStore } from '@/store'
import AdminLayout from '../layouts/AdminLayout.vue'
// 导入管理员和用户信息页面
import AdminUserAdmin from '../views/admin/user/AdminUserAdmin.vue'
import AdminUserAdd from '../views/admin/user/AdminUserAdd.vue'
import AdminUserEdit from '../views/admin/user/AdminUserEdit.vue'
import UserUserAdmin from '../views/admin/user/UserUserAdmin.vue'
import UserUserAdd from '../views/admin/user/UserUserAdd.vue'
import UserUserEdit from '../views/admin/user/UserUserEdit.vue'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue') },
  { path: '/:pathMatch(.*)*', name: 'notFound', component: () => import('../views/NotFound.vue') },

  // 管理员嵌套路由（包含管理员+用户信息页面）
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: 'dashboard', component: () => import('../views/admin/AdminMainContent.vue') },
      { path: 'info/notice', component: () => import('../views/admin/infomanage/AdminNotice.vue') },
      { path: 'info/head', component: () => import('../views/admin/components/AdminHeader.vue') },
      { path: 'apply/poor', component: () => import('../views/admin/components/AdminPoorApply.vue') },
      // 管理员信息页面（原路径不变）
      { path: 'user/admin', component: AdminUserAdmin },
      { path: 'user/admin/add', component: AdminUserAdd },
      { path: 'user/admin/edit', component: AdminUserEdit },
      // 用户信息页面（新路径：/admin/user/user/*）
      { path: 'user/user', component: UserUserAdmin },
      { path: 'user/user/add', component: UserUserAdd },
      { path: 'user/user/edit', component: UserUserEdit }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫（权限控制不变，用户信息页面同样需要管理员权限）
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