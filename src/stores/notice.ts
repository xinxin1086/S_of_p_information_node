import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { noticeApi } from '@/api'
import { useApiCall } from '@/composables/useApiCall'
import { formatDate } from '@/utils/notice'

export const useNoticeStore = defineStore('notice', () => {
  // 访客端数据
  const publicNotices = ref([])
  const currentNotice = ref(null)

  // 管理员端数据
  const adminNotices = ref([])

  // 分页信息
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
  const { execute: _fetchPublicNotices, loading } = useApiCall(
    noticeApi.getPublicNotices,
    {
      onSuccess: (data, args) => {
        const [params] = args
        const { page = 1, size = 10 } = params

        // 处理响应数据
        let items = []
        let total = 0

        if (data?.items && Array.isArray(data.items)) {
          items = data.items
          total = data.total || 0
        } else if (Array.isArray(data)) {
          items = data
          total = data.length
        } else if (data?.data && Array.isArray(data.data)) {
          items = data.data
          total = data.total || data.data.length
        }

        publicNotices.value = items
        pagination.value = { page, size, total }
      }
    }
  )

  const fetchPublicNotices = async (params: Record<string, unknown> = {}) => {
    const {
      page = 1,
      size = 10,
      title,
      notice_type,
      release_time_start,
      release_time_end
    } = params

    const apiParams: Record<string, unknown> = { page, size }
    if (title) apiParams.title = title
    if (notice_type) apiParams.notice_type = notice_type
    if (release_time_start) apiParams.release_time_start = release_time_start
    if (release_time_end) apiParams.release_time_end = release_time_end

    return await _fetchPublicNotices(apiParams)
  }

  // 访客端：获取单个公告详情
  const { execute: _fetchPublicNotice } = useApiCall(
    noticeApi.getPublicNoticeDetail,
    {
      onSuccess: (data) => {
        currentNotice.value = data
      }
    }
  )

  const fetchPublicNotice = async (id: number | string) => {
    return await _fetchPublicNotice(id)
  }

  // 管理员端：获取公告列表
  const { execute: _fetchAdminNoticesList, loading: adminLoading } = useApiCall(
    noticeApi.getAdminNotices,
    {
      onSuccess: (data, args) => {
        const [params] = args
        const { page = 1, size = 10 } = params

        // 处理响应数据
        let items = []
        let total = 0

        if (data?.items && Array.isArray(data.items)) {
          items = data.items
          total = data.total || 0
        } else if (Array.isArray(data)) {
          items = data
          total = data.length
        } else if (data?.data && Array.isArray(data.data)) {
          items = data.data
          total = data.total || data.data.length
        }

        adminNotices.value = items
        adminPagination.value = { page, size, total }
      }
    }
  )

  const fetchAdminNoticesList = async (params: Record<string, unknown> = {}) => {
    const {
      page = 1,
      size = 10,
      title,
      notice_type,
      expirationStart
    } = params

    const apiParams: Record<string, unknown> = { page, size }
    if (title) apiParams.title = title
    if (notice_type) apiParams.notice_type = notice_type
    if (expirationStart) apiParams.release_time_start = expirationStart

    return await _fetchAdminNoticesList(apiParams)
  }

  // 管理员端：创建公告
  const { execute: _createNotice } = useApiCall(
    noticeApi.createNotice,
    {
      onSuccess: async () => {
        // 刷新管理员公告列表
        await fetchAdminNoticesList({
          page: adminPagination.value.page,
          size: adminPagination.value.size
        })
      }
    }
  )

  const createNotice = async (noticeData: Record<string, unknown>) => {
    return await _createNotice(noticeData)
  }

  // 管理员端：更新公告
  const { execute: _updateNotice } = useApiCall(
    noticeApi.updateNotice,
    {
      onSuccess: (data, args) => {
        const [id, noticeData] = args

        // 更新列表中的对应项
        const index = adminNotices.value.findIndex(notice => notice.id === id)
        if (index !== -1) {
          adminNotices.value[index] = { ...adminNotices.value[index], ...noticeData }
        }

        // 如果当前正在查看该公告详情，也更新详情
        if (currentNotice.value?.id === id) {
          currentNotice.value = { ...currentNotice.value, ...data }
        }
      }
    }
  )

  const updateNotice = async (id: number | string, noticeData: Record<string, unknown>) => {
    return await _updateNotice(id, noticeData)
  }

  // 管理员端：删除公告
  const { execute: _deleteNotice } = useApiCall(
    noticeApi.deleteNotice,
    {
      onSuccess: (data, args) => {
        const [id] = args

        // 从列表中移除
        adminNotices.value = adminNotices.value.filter(notice => notice.id !== id)

        // 如果当前正在查看该公告详情，清空详情
        if (currentNotice.value?.id === id) {
          currentNotice.value = null
        }
      }
    }
  )

  const deleteNotice = async (id: number | string) => {
    return await _deleteNotice(id)
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