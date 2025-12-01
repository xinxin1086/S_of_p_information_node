//./src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'
import { useMainStore } from '@/store'

// 布局组件
import GuestLayout from '../layouts/GuestLayout.vue'
import UserLayout from '../layouts/UserLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'

// 公共页面组件
import PublicHomeView from '../views/public/HomeView.vue'
import NoticeList from '../views/public/notice/NoticeList.vue'
import NoticeDetail from '../views/public/notice/NoticeDetail.vue'
import ScienceList from '../views/public/science/ScienceList.vue'
import ScienceDetail from '../views/public/science/ScienceDetail.vue'
import ActivityList from '../views/public/activity/PublicActivityList.vue'
import ActivityDetail from '../views/public/activity/PublicActivityDetail.vue'
import AboutView from '../views/public/AboutView.vue'
import SearchView from '../views/SearchView.vue'

// 独立页面组件
import LoginView from '../views/public/LoginView.vue'
import RegisterView from '../views/public/RegisterView.vue'

// 用户页面组件
import UserDashboard from '../views/user/common/HomeView.vue'
import ProfileView from '../views/user/common/ProfileView.vue'
import SettingsView from '../views/user/common/SettingsView.vue'
import UserActivityHome from '../views/user/activity/ActivityHome.vue'
import UserActivityDetail from '../views/user/activity/ActivityDetail.vue'

// 组织用户专属组件
import FisherDashboard from '../views/user/fisher/FisherDashboard.vue'
import CreateActivity from '../views/user/fisher/CreateActivity.vue'
import EditActivity from '../views/user/fisher/EditActivity.vue'
import MyActivities from '../views/user/fisher/MyActivities.vue'

// 管理员页面组件
import AdminDashboard from '../views/admin/AdminMainContent.vue'

// 内容管理组件
import AdminNotice from '../views/admin/content/AdminNotice.vue'
import AdminNoticeDetail from '../views/admin/content/NoticeDetail.vue'
import NoticeReview from '../views/admin/content/NoticeReview.vue'
import ScienceManage from '../views/admin/content/ScienceManage.vue'
import ScienceReview from '../views/admin/content/ScienceReview.vue'
import ActivityReview from '../views/admin/content/ActivityReview.vue'
import ActivityManage from '../views/admin/content/ActivityManage.vue'

// 公告编辑组件
import AdminNoticeEditor from '../views/admin/content/AdminNoticeEditor.vue'

// 用户管理组件
import AdminUserAdmin from '../views/admin/user/AdminUserAdmin.vue'
import AdminUserAdd from '../views/admin/user/AdminUserAdd.vue'
import AdminUserEdit from '../views/admin/user/AdminUserEdit.vue'
import UserUserAdmin from '../views/admin/user/UserUserAdmin.vue'
import UserUserAdd from '../views/admin/user/UserUserAdd.vue'
import UserUserEdit from '../views/admin/user/UserUserEdit.vue'
import UserStats from '../views/admin/user/UserStats.vue'


// 404页面
import NotFound from '../views/public/NotFound.vue'

const routes = [
  // 独立功能页面（无布局）
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },

  // 公共页面路由（使用 GuestLayout）
  {
    path: '/',
    component: GuestLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: PublicHomeView
      },
      {
        path: 'notice',
        name: 'noticeList',
        component: NoticeList
      },
      {
        path: 'notice/:id',
        name: 'noticeDetail',
        component: NoticeDetail
      },
      {
        path: 'science',
        name: 'scienceList',
        component: ScienceList
      },
      {
        path: 'science/:id',
        name: 'scienceDetail',
        component: ScienceDetail
      },
      {
        path: 'activities',
        name: 'publicActivities',
        component: ActivityList
      },
      {
        path: 'activities/:id',
        name: 'publicActivityDetail',
        component: ActivityDetail
      },
      {
        path: 'about',
        name: 'about',
        component: AboutView
      },
      {
        path: 'search',
        name: 'search',
        component: SearchView
      }
    ]
  },

  // 用户页面路由（使用 UserLayout）
  {
    path: '/user',
    component: UserLayout,
    meta: { requiresAuth: true },
    children: [
      // 普通用户功能
      {
        path: 'dashboard',
        name: 'userDashboard',
        component: UserDashboard
      },
      {
        path: 'profile',
        name: 'profile',
        component: ProfileView
      },
      {
        path: 'settings',
        name: 'settings',
        component: SettingsView
      },
      // 活动功能
      {
        path: 'activities',
        name: 'activityHome',
        component: UserActivityHome
      },
      {
        path: 'activities/:id',
        name: 'activityDetail',
        component: UserActivityDetail
      },

      // 组织用户专属功能 (/user/weave/*)
      {
        path: 'weave/dashboard',
        name: 'fisherDashboard',
        meta: { requiresFisher: true },
        component: FisherDashboard
      },
      {
        path: 'weave/create-activity',
        name: 'createActivity',
        meta: { requiresFisher: true },
        component: CreateActivity
      },
      {
        path: 'weave/edit-activity/:id',
        name: 'editActivity',
        meta: { requiresFisher: true },
        component: EditActivity
      },
      {
        path: 'weave/my-activities',
        name: 'myActivities',
        meta: { requiresFisher: true },
        component: MyActivities
      }
    ]
  },

  // 管理员后台路由（使用 AdminLayout）
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      // 管理员控制台
      {
        path: 'dashboard',
        name: 'adminDashboard',
        component: AdminDashboard
      },

      // 内容管理模块
      {
        path: 'content/notice',
        name: 'adminNotice',
        component: AdminNotice
      },
      {
        path: 'content/notice/:id',
        name: 'adminNoticeDetail',
        component: AdminNoticeDetail
      },
      {
        path: 'notice/editor',
        name: 'noticeEditor',
        component: AdminNoticeEditor
      },
      {
        path: 'notice/editor/:id',
        name: 'noticeEditorEdit',
        component: AdminNoticeEditor
      },
      {
        path: 'content/notice-review',
        name: 'noticeReview',
        component: NoticeReview
      },
      {
        path: 'content/science',
        name: 'scienceManage',
        component: ScienceManage
      },
      {
        path: 'content/science-review',
        name: 'scienceReview',
        component: ScienceReview
      },
      {
        path: 'content/activity-review',
        name: 'activityReview',
        component: ActivityReview
      },
      {
        path: 'content/activity',
        name: 'activityManage',
        component: ActivityManage
      },

      // 用户管理模块
      {
        path: 'user/admin',
        name: 'adminUserAdmin',
        component: AdminUserAdmin
      },
      {
        path: 'user/admin/add',
        name: 'adminUserAdd',
        component: AdminUserAdd
      },
      {
        path: 'user/admin/edit',
        name: 'adminUserEdit',
        component: AdminUserEdit
      },
      {
        path: 'user/admin/edit/:id',
        name: 'adminUserEditById',
        component: AdminUserEdit
      },
      {
        path: 'user/user',
        name: 'userUserAdmin',
        component: UserUserAdmin
      },
      {
        path: 'user/user/add',
        name: 'userUserAdd',
        component: UserUserAdd
      },
      {
        path: 'user/user/edit',
        name: 'userUserEdit',
        component: UserUserEdit
      },
      {
        path: 'user/user/edit/:id',
        name: 'userUserEditById',
        component: UserUserEdit
      },
      {
        path: 'user/stats',
        name: 'userStats',
        component: UserStats
      }
    ]
  },

  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 导入路由守卫
import { beforeEachGuard, afterEachGuard, onErrorGuard } from './guards'

// 应用路由守卫
router.beforeEach(beforeEachGuard)
router.afterEach(afterEachGuard)
router.onError(onErrorGuard)

export default router