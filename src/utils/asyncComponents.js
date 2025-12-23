/**
 * 异步组件配置
 * 为大型组件实现懒加载，优化首屏加载性能
 */

import { defineAsyncComponent } from 'vue'

// 加载状态组件
export const LoadingComponent = {
  template: `
    <div class="flex items-center justify-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
      <span class="text-gray-600">加载中...</span>
    </div>
  `
}

// 错误状态组件
export const ErrorComponent = {
  template: `
    <div class="flex flex-col items-center justify-center p-8">
      <div class="text-red-500 text-xl mb-4">⚠️ 组件加载失败</div>
      <p class="text-gray-600 mb-4">请刷新页面重试或联系管理员</p>
      <button
        @click="handleRetry"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        刷新页面
      </button>
    </div>
  `,
  methods: {
    handleRetry() {
      window.location.reload()
    }
  }
}

// 公共异步组件配置
const createAsyncComponent = (loader, options = {}) => {
  // 直接返回 loader 函数,让 Vue Router 自动处理异步组件
  // 这样可以避免 "defineAsyncComponent(() => import())" 的嵌套警告
  return loader
}

// 管理员大型组件懒加载
export const AdminComponents = {
  AdminDashboard: createAsyncComponent(() =>
    import('@/views/admin/AdminMainContent.vue')
  ),

  // 内容管理组件
  AdminNotice: createAsyncComponent(() =>
    import('@/views/admin/content/AdminNotice.vue')
  ),
  NoticeDetail: createAsyncComponent(() =>
    import('@/views/admin/content/NoticeDetail.vue')
  ),
  NoticeReview: createAsyncComponent(() =>
    import('@/views/admin/content/NoticeReview.vue')
  ),
  ScienceManage: createAsyncComponent(() =>
    import('@/views/admin/content/ScienceManage.vue')
  ),
  ScienceReview: createAsyncComponent(() =>
    import('@/views/admin/content/ScienceReview.vue')
  ),
  ActivityReview: createAsyncComponent(() =>
    import('@/views/admin/content/ActivityReview.vue')
  ),
  ActivityManage: createAsyncComponent(() =>
    import('@/views/admin/content/ActivityManage.vue')
  ),
  ActivityDiscussionManage: createAsyncComponent(() =>
    import('@/views/admin/content/ActivityDiscussionManage.vue')
  ),
  ActivityRatingManage: createAsyncComponent(() =>
    import('@/views/admin/content/ActivityRatingManage.vue')
  ),
  AdminNoticeEditor: createAsyncComponent(() =>
    import('@/views/admin/content/AdminNoticeEditor.vue')
  ),

  // 用户管理组件
  AdminUserAdmin: createAsyncComponent(() =>
    import('@/views/admin/user/AdminUserAdmin.vue')
  ),
  AdminUserAdd: createAsyncComponent(() =>
    import('@/views/admin/user/AdminUserAdd.vue')
  ),
  AdminUserEdit: createAsyncComponent(() =>
    import('@/views/admin/user/AdminUserEdit.vue')
  ),
  UserUserAdmin: createAsyncComponent(() =>
    import('@/views/admin/user/UserUserAdmin.vue')
  ),
  UserUserAdd: createAsyncComponent(() =>
    import('@/views/admin/user/UserUserAdd.vue')
  ),
  UserUserEdit: createAsyncComponent(() =>
    import('@/views/admin/user/UserUserEdit.vue')
  ),
  UserStats: createAsyncComponent(() =>
    import('@/views/admin/user/UserStats.vue')
  ),
  ActivityDiscussionManageView: createAsyncComponent(() =>
    import('@/views/admin/content/ActivityDiscussionManage.vue')
  )
}

// 用户大型组件懒加载
export const UserComponents = {
  UserDashboard: createAsyncComponent(() =>
    import('@/views/user/DashboardView.vue')
  ),
  ProfileEditView: createAsyncComponent(() =>
    import('@/views/user/common/ProfileEditView.vue')
  ),
  FisherDashboard: createAsyncComponent(() =>
    import('@/views/user/fisher/FisherDashboard.vue')
  ),
  CreateActivity: createAsyncComponent(() =>
    import('@/views/user/fisher/CreateActivity.vue')
  ),
  EditActivity: createAsyncComponent(() =>
    import('@/views/user/fisher/EditActivity.vue')
  ),
  MyActivities: createAsyncComponent(() =>
    import('@/views/user/fisher/MyActivities.vue')
  ),
  // 新增用户组件异步加载
  ProfileView: createAsyncComponent(() =>
    import('@/views/user/common/ProfileView.vue')
  ),
  SettingsView: createAsyncComponent(() =>
    import('@/views/user/common/SettingsView.vue')
  ),
  UserActivityHome: createAsyncComponent(() =>
    import('@/views/user/activity/ActivityHome.vue')
  ),
  UserActivityDetail: createAsyncComponent(() =>
    import('@/views/user/activity/ActivityDetail.vue')
  ),
  MyBookings: createAsyncComponent(() =>
    import('@/views/user/activity/MyBookings.vue')
  )
}

// 公共大型组件懒加载
export const PublicComponents = {
  SearchView: createAsyncComponent(() =>
    import('@/views/SearchView.vue')
  ),
  DiscussionList: createAsyncComponent(() =>
    import('@/views/public/discussion/DiscussionList.vue')
  ),
  DiscussionDetail: createAsyncComponent(() =>
    import('@/views/public/discussion/DiscussionDetail.vue')
  ),
  ActivityDetail: createAsyncComponent(() =>
    import('@/views/public/activity/PublicActivityDetail.vue')
  ),
  ScienceDetail: createAsyncComponent(() =>
    import('@/views/public/science/ScienceDetail.vue')
  ),
  // 新增公共组件异步加载
  NoticeList: createAsyncComponent(() =>
    import('@/views/public/notice/NoticeList.vue')
  ),
  ScienceList: createAsyncComponent(() =>
    import('@/views/public/science/ScienceList.vue')
  ),
  ActivityList: createAsyncComponent(() =>
    import('@/views/public/activity/PublicActivityList.vue')
  ),
  AboutView: createAsyncComponent(() =>
    import('@/views/public/AboutView.vue')
  )
}

// 预加载关键组件（可选）
export const preloadCriticalComponents = async () => {
  try {
    // 预加载用户仪表板
    await import('@/views/user/common/HomeView.vue')
    // 预加载管理员仪表板
    await import('@/views/admin/AdminMainContent.vue')
  } catch (error) {
    console.warn('预加载组件失败:', error)
  }
}

export default {
  AdminComponents,
  UserComponents,
  PublicComponents,
  LoadingComponent,
  ErrorComponent,
  preloadCriticalComponents
}