/**
 * 异步组件配置
 * 为大型组件实现懒加载，优化首屏加载性能
 */

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

// 管理员大型组件懒加载
export const AdminComponents = {
  AdminDashboard: () => import('@/views/admin/AdminMainContent.vue'),

  // 内容管理组件
  AdminNotice: () => import('@/views/admin/content/AdminNotice.vue'),
  NoticeDetail: () => import('@/views/admin/content/NoticeDetail.vue'),
  NoticeReview: () => import('@/views/admin/content/NoticeReview.vue'),
  ScienceManage: () => import('@/views/admin/content/ScienceManage.vue'),
  ScienceReview: () => import('@/views/admin/content/ScienceReview.vue'),
  ActivityReview: () => import('@/views/admin/content/ActivityReview.vue'),
  ActivityManage: () => import('@/views/admin/content/ActivityManage.vue'),
  ActivityDiscussionManage: () => import('@/views/admin/content/ActivityDiscussionManage.vue'),
  ActivityRatingManage: () => import('@/views/admin/content/ActivityRatingManage.vue'),
  AdminNoticeEditor: () => import('@/views/admin/content/AdminNoticeEditor.vue'),

  // 用户管理组件
  AdminUserAdmin: () => import('@/views/admin/user/AdminUserAdmin.vue'),
  AdminUserAdd: () => import('@/views/admin/user/AdminUserAdd.vue'),
  AdminUserEdit: () => import('@/views/admin/user/AdminUserEdit.vue'),
  UserUserAdmin: () => import('@/views/admin/user/UserUserAdmin.vue'),
  UserUserAdd: () => import('@/views/admin/user/UserUserAdd.vue'),
  UserUserEdit: () => import('@/views/admin/user/UserUserEdit.vue'),
  UserStats: () => import('@/views/admin/user/UserStats.vue'),
  ActivityDiscussionManageView: () => import('@/views/admin/content/ActivityDiscussionManage.vue')
}

// 用户大型组件懒加载
export const UserComponents = {
  UserDashboard: () => import('@/views/user/DashboardView.vue'),
  ProfileEditView: () => import('@/views/user/common/ProfileEditView.vue'),
  AccountSettingsView: () => import('@/views/user/common/AccountSettingsView.vue'),
  OrganizationDashboard: () => import('@/views/user/organization/OrganizationDashboard.vue'),
  CreateActivity: () => import('@/views/user/organization/CreateActivity.vue'),
  EditActivity: () => import('@/views/user/organization/EditActivity.vue'),
  MyActivities: () => import('@/views/user/organization/MyActivities.vue'),
  // 新增用户组件异步加载
  ProfileView: () => import('@/views/user/common/ProfileView.vue'),
  SettingsView: () => import('@/views/user/common/SettingsView.vue'),
  UserActivityHome: () => import('@/views/user/activity/ActivityHome.vue'),
  UserActivityDetail: () => import('@/views/user/activity/ActivityDetail.vue'),
  MyBookings: () => import('@/views/user/activity/MyBookings.vue')
}

// 公共大型组件懒加载
export const PublicComponents = {
  SearchView: () => import('@/views/SearchView.vue'),
  DiscussionList: () => import('@/views/public/discussion/DiscussionList.vue'),
  DiscussionDetail: () => import('@/views/public/discussion/DiscussionDetail.vue'),
  ActivityDetail: () => import('@/views/public/activity/PublicActivityDetail.vue'),
  ScienceDetail: () => import('@/views/public/science/ScienceDetail.vue'),
  // 新增公共组件异步加载
  NoticeList: () => import('@/views/public/notice/NoticeList.vue'),
  ScienceList: () => import('@/views/public/science/ScienceList.vue'),
  ActivityList: () => import('@/views/public/activity/PublicActivityList.vue'),
  AboutView: () => import('@/views/public/AboutView.vue')
}

// 预加载关键组件（可选）
export const preloadCriticalComponents = async () => {
  try {
    // 预加载管理员仪表板（用户仪表板已是同步加载，无需预加载）
    await import('@/views/admin/AdminMainContent.vue')
  } catch (error) {
    console.warn('预加载组件失败:', error)
    // 预加载失败不影响功能，只是性能优化
    // 调用方会根据需要决定是否向用户提示
    throw error // 重新抛出错误，让调用方决定如何处理
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