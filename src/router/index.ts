//./src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'

// 异步组件配置 - 实现代码分割和懒加载
import {
  AdminComponents,
  UserComponents,
  PublicComponents
} from '@/utils/asyncComponents'

// 核心页面组件 (首屏关键组件保持同步加载)
import LoginView from '../views/public/LoginView.vue'
import PublicHomeView from '../views/public/HomeView.vue'

// 布局组件 - 改为懒加载优化首屏性能
const AdminLayout = () => import('../layouts/AdminLayout.vue')
const GuestLayout = () => import('../layouts/GuestLayout.vue')
const UserLayout = () => import('../layouts/UserLayout.vue')

// 其他组件使用异步加载优化性能
const NoticeList = PublicComponents.NoticeList
const ScienceList = PublicComponents.ScienceList
const ActivityList = PublicComponents.ActivityList
const AboutView = PublicComponents.AboutView

// 用户页面组件使用异步加载
const ProfileView = UserComponents.ProfileView
const ProfileEditView = UserComponents.ProfileEditView
const AccountSettingsView = UserComponents.AccountSettingsView
const NotificationView = () => import('@/views/user/common/NotificationView.vue')
const UserActivityHome = UserComponents.UserActivityHome
const UserActivityDetail = UserComponents.UserActivityDetail
const MyBookings = UserComponents.MyBookings
const BookingHistory = () => import('@/views/user/activity/BookingHistory.vue')

// 公告详情、科学详情等 (使用异步组件)
const NoticeDetail = AdminComponents.NoticeDetail
const ScienceDetail = PublicComponents.ScienceDetail
const ActivityDetail = PublicComponents.ActivityDetail
const DiscussionList = PublicComponents.DiscussionList
const DiscussionDetail = PublicComponents.DiscussionDetail
const SearchView = PublicComponents.SearchView

// 大型用户组件 (使用异步组件)
const UserDashboard = UserComponents.UserDashboard
const OrganizationDashboard = UserComponents.OrganizationDashboard
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


// 404页面 - 改为懒加载
const NotFound = () => import('../views/public/NotFound.vue')
const RegisterView = () => import('../views/public/RegisterView.vue')

const routes = [
  // 独立功能页面（无布局）
  {
    path: '/login',
    name: 'login',
    meta: { title: '登录' },
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    meta: { title: '注册' },
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
        meta: { title: '首页' },
        component: PublicHomeView
      },
      {
        path: 'notice',
        name: 'noticeList',
        meta: { title: '公告列表' },
        component: NoticeList
      },
      {
        path: 'notice/:id',
        name: 'noticeDetail',
        meta: { title: '公告详情' },
        component: NoticeDetail
      },
      {
        path: 'science',
        name: 'scienceList',
        meta: { title: '科普列表' },
        component: ScienceList
      },
      {
        path: 'science/:id',
        name: 'scienceDetail',
        meta: { title: '科普详情' },
        component: ScienceDetail
      },
      {
        path: 'activities',
        name: 'publicActivities',
        meta: { title: '活动列表' },
        component: ActivityList
      },
      {
        path: 'activities/:id',
        name: 'publicActivityDetail',
        meta: { title: '活动详情' },
        component: ActivityDetail
      },
      {
        path: 'discussion',
        name: 'discussionList',
        meta: { title: '讨论列表' },
        component: DiscussionList
      },
      {
        path: 'discussion/:id',
        name: 'discussionDetail',
        meta: { title: '讨论详情' },
        component: DiscussionDetail
      },
      {
        path: 'about',
        name: 'about',
        meta: { title: '关于我们' },
        component: AboutView
      },
      {
        path: 'search',
        name: 'search',
        meta: { title: '搜索' },
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
        meta: { title: '用户首页' },
        component: UserDashboard
      },
      {
        path: 'profile',
        name: 'profile',
        meta: { title: '个人资料' },
        component: ProfileView
      },
      {
        path: 'profile/edit',
        name: 'profileEdit',
        meta: { title: '编辑资料' },
        component: ProfileEditView
      },
      {
        path: 'settings',
        name: 'settings',
        meta: { title: '账户设置' },
        component: AccountSettingsView
      },
      {
        path: 'notifications',
        name: 'notifications',
        meta: { title: '通知中心' },
        component: NotificationView
      },
      // 活动功能
      {
        path: 'activities',
        name: 'activityHome',
        meta: { title: '活动中心' },
        component: UserActivityHome
      },
      {
        path: 'activities/:id',
        name: 'activityDetail',
        meta: { title: '活动详情' },
        component: UserActivityDetail
      },
      {
        path: 'activities/my-bookings',
        name: 'myBookings',
        meta: { title: '我的预约' },
        component: MyBookings
      },
      {
        path: 'activities/booking-history',
        name: 'bookingHistory',
        meta: { title: '预约历史' },
        component: BookingHistory
      },

      // 组织用户专属功能 (/user/weave/*)
      {
        path: 'weave/dashboard',
        name: 'organizationDashboard',
        meta: { requiresOrganization: true, title: '控制台' },
        component: OrganizationDashboard
      },
      {
        path: 'weave/create-activity',
        name: 'createActivity',
        meta: { requiresOrganization: true, title: '创建活动' },
        component: CreateActivity
      },
      {
        path: 'weave/edit-activity/:id',
        name: 'editActivity',
        meta: { requiresOrganization: true, title: '编辑活动' },
        component: EditActivity
      },
      {
        path: 'weave/my-activities',
        name: 'myActivities',
        meta: { requiresOrganization: true, title: '我的活动' },
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