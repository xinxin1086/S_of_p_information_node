//./src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'
import { defineAsyncComponent } from 'vue'
import { useMainStore } from '@/stores'

// 异步组件配置 - 实现代码分割和懒加载
import {
  AdminComponents,
  UserComponents,
  PublicComponents
} from '@/utils/asyncComponents'

// 布局组件 (保持同步加载，因为它们被频繁使用)
import GuestLayout from '../layouts/GuestLayout.vue'
import UserLayout from '../layouts/UserLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'

// 核心页面组件 (首屏关键组件保持同步加载)
import PublicHomeView from '../views/public/HomeView.vue'
import LoginView from '../views/public/LoginView.vue'
import RegisterView from '../views/public/RegisterView.vue'

// 其他组件使用异步加载优化性能
const NoticeList = PublicComponents.NoticeList
const ScienceList = PublicComponents.ScienceList
const ActivityList = PublicComponents.ActivityList
const AboutView = PublicComponents.AboutView

// 创建异步组件辅助函数
// 注意: 直接返回 loader 函数,让 Vue Router 自动处理异步组件
// 这样可以避免 "defineAsyncComponent(() => import())" 的嵌套警告
const createAsyncComponent = (loader, options = {}) => {
  return loader
}

// 用户页面组件使用异步加载
const ProfileView = UserComponents.ProfileView
const SettingsView = UserComponents.SettingsView
const UserActivityHome = UserComponents.UserActivityHome
const UserActivityDetail = UserComponents.UserActivityDetail
const MyBookings = UserComponents.MyBookings
const BookingHistory = createAsyncComponent(() =>
  import('@/views/user/activity/BookingHistory.vue')
)

// 公告详情、科学详情等 (使用异步组件)
const NoticeDetail = AdminComponents.NoticeDetail
const ScienceDetail = PublicComponents.ScienceDetail
const ActivityDetail = PublicComponents.ActivityDetail
const DiscussionList = PublicComponents.DiscussionList
const DiscussionDetail = PublicComponents.DiscussionDetail
const SearchView = PublicComponents.SearchView

// 大型用户组件 (使用异步组件)
const UserDashboard = UserComponents.UserDashboard
const FisherDashboard = UserComponents.FisherDashboard
const CreateActivity = UserComponents.CreateActivity
const EditActivity = UserComponents.EditActivity
const MyActivities = UserComponents.MyActivities

// 大型管理员组件 (使用异步组件)
const AdminDashboard = AdminComponents.AdminDashboard
const AdminNotice = AdminComponents.AdminNotice
const AdminNoticeDetail = AdminComponents.AdminNoticeDetail
const NoticeReview = AdminComponents.NoticeReview
const ScienceManage = AdminComponents.ScienceManage
const ScienceReview = AdminComponents.ScienceReview
const ActivityReview = AdminComponents.ActivityReview
const ActivityManage = AdminComponents.ActivityManage
const ActivityRatingManage = AdminComponents.ActivityRatingManage
const ActivityDiscussionManage = AdminComponents.ActivityDiscussionManage
const DiscussCommentManage = AdminComponents.ActivityDiscussionManageView
const AdminNoticeEditor = AdminComponents.AdminNoticeEditor

// 用户管理组件 (使用异步组件)
const AdminUserAdmin = AdminComponents.AdminUserAdmin
const AdminUserAdd = AdminComponents.AdminUserAdd
const AdminUserEdit = AdminComponents.AdminUserEdit
const UserUserAdmin = AdminComponents.UserUserAdmin
const UserUserAdd = AdminComponents.UserUserAdd
const UserUserEdit = AdminComponents.UserUserEdit
const UserStats = AdminComponents.UserStats


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
        path: 'discussion',
        name: 'discussionList',
        component: DiscussionList
      },
      {
        path: 'discussion/:id',
        name: 'discussionDetail',
        component: DiscussionDetail
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
      {
        path: 'activities/my-bookings',
        name: 'myBookings',
        component: MyBookings
      },
      {
        path: 'activities/booking-history',
        name: 'bookingHistory',
        component: BookingHistory
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
      {
        path: 'activity-ratings',
        name: 'activityRatingManage',
        component: ActivityRatingManage
      },
      {
        path: 'activity-discussions',
        name: 'activityDiscussionManage',
        component: ActivityDiscussionManage
      },
      {
        path: 'discuss-comments',
        name: 'discussCommentManage',
        component: DiscussCommentManage
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