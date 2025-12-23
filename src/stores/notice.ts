import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchNoticeList,
  fetchNoticeDetail,
  fetchAdminNoticeList,
  createAdminNotice,
  updateAdminNotice,
  deleteAdminNotice,
  formatDate
} from '@/utils/notice'

export const useNoticeStore = defineStore('notice', () => {
  // 访客端数据
  const publicNotices = ref([])
  const currentNotice = ref(null)
  const loading = ref(false)

  // 管理员端数据
  const adminNotices = ref([])
  const adminLoading = ref(false)
  const pagination = ref({
    page: 1,
    size: 10,
    total: 0
  })

  // 管理员分页信息
  const adminPagination = ref({
    page: 1,
    size: 10,
    total: 0
  })

  // 计算属性
  const hasNotices = computed(() => publicNotices.value.length > 0)
  const hasAdminNotices = computed(() => adminNotices.value.length > 0)

  // 访客端：获取公告列表
  const fetchPublicNotices = async (params = {}) => {
    loading.value = true
    try {
      const {
        page = 1,
        size = 10,
        title,
        noticeType,
        releaseTimeStart,
        releaseTimeEnd
      } = params

      const result = await fetchNoticeList(
        page,
        size,
        title,
        noticeType,
        releaseTimeStart,
        releaseTimeEnd
      )

      publicNotices.value = result.items
      pagination.value = { page, size, total: result.total }

      return { success: true, data: result }
    } catch (error) {
      console.error('获取访客公告列表失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 访客端：获取单个公告详情
  const fetchPublicNotice = async (id) => {
    loading.value = true
    try {
      const notice = await fetchNoticeDetail(id)
      currentNotice.value = notice
      return { success: true, data: notice }
    } catch (error) {
      console.error('获取公告详情失败:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 管理员端：获取公告列表
  const fetchAdminNoticesList = async (params = {}) => {
    adminLoading.value = true
    try {
      const {
        page = 1,
        size = 10,
        title,
        noticeType,
        expirationStart
      } = params

      const result = await fetchAdminNoticeList(
        page,
        size,
        title,
        noticeType,
        expirationStart
      )

      adminNotices.value = result.items
      adminPagination.value = { page, size, total: result.total }

      return { success: true, data: result }
    } catch (error) {
      console.error('获取管理员公告列表失败:', error)
      return { success: false, error: error.message }
    } finally {
      adminLoading.value = false
    }
  }

  // 管理员端：创建公告
  const createNotice = async (noticeData) => {
    try {
      const result = await createAdminNotice(noticeData)

      // 刷新管理员公告列表
      await fetchAdminNoticesList({
        page: adminPagination.value.page,
        size: adminPagination.value.size
      })

      return { success: true, data: result }
    } catch (error) {
      console.error('创建公告失败:', error)
      return { success: false, error: error.message }
    }
  }

  // 管理员端：更新公告
  const updateNotice = async (id, noticeData) => {
    try {
      const result = await updateAdminNotice(id, noticeData)

      // 更新列表中的对应项
      const index = adminNotices.value.findIndex(notice => notice.id === id)
      if (index !== -1) {
        adminNotices.value[index] = { ...adminNotices.value[index], ...noticeData }
      }

      // 如果当前正在查看该公告详情，也更新详情
      if (currentNotice.value?.id === id) {
        currentNotice.value = { ...currentNotice.value, ...noticeData }
      }

      return { success: true, data: result }
    } catch (error) {
      console.error('更新公告失败:', error)
      return { success: false, error: error.message }
    }
  }

  // 管理员端：删除公告
  const deleteNotice = async (id) => {
    try {
      await deleteAdminNotice(id)

      // 从列表中移除
      adminNotices.value = adminNotices.value.filter(notice => notice.id !== id)

      // 如果当前正在查看该公告详情，清空详情
      if (currentNotice.value?.id === id) {
        currentNotice.value = null
      }

      return { success: true }
    } catch (error) {
      console.error('删除公告失败:', error)
      return { success: false, error: error.message }
    }
  }

  // 工具函数：清空当前公告
  const clearCurrentNotice = () => {
    currentNotice.value = null
  }

  // 工具函数：重置访客端数据
  const resetPublicData = () => {
    publicNotices.value = []
    currentNotice.value = null
    pagination.value = { page: 1, size: 10, total: 0 }
  }

  // 工具函数：重置管理员端数据
  const resetAdminData = () => {
    adminNotices.value = []
    adminPagination.value = { page: 1, size: 10, total: 0 }
  }

  return {
    // 访客端数据
    publicNotices,
    currentNotice,
    loading,
    pagination,
    hasNotices,

    // 管理员端数据
    adminNotices,
    adminLoading,
    adminPagination,
    hasAdminNotices,

    // 访客端方法
    fetchPublicNotices,
    fetchPublicNotice,

    // 管理员端方法
    fetchAdminNoticesList,
    createNotice,
    updateNotice,
    deleteNotice,

    // 工具方法
    clearCurrentNotice,
    resetPublicData,
    resetAdminData,
    formatDate
  }
})