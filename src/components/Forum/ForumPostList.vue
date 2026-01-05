<template>
  <div class="forum-post-list">
    <!-- 页面标题和操作栏 -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">论坛帖子</h2>
      <div class="flex gap-4">
        <el-button
          v-if="canCreatePost"
          type="primary"
          @click="handleCreatePost"
        >
          发布帖子
        </el-button>
        <el-button
          v-if="hasAdminRights"
          type="warning"
          @click="handleBatchManage"
        >
          批量管理
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选栏 -->
    <div class="flex gap-4 mb-6">
      <el-input
        v-model="searchParams.keyword"
        placeholder="搜索帖子..."
        @input="handleSearch"
        clearable
        style="width: 300px"
      />
      <el-select
        v-model="searchParams.category"
        placeholder="选择分类"
        @change="handleSearch"
        clearable
      >
        <el-option
          v-for="category in categories"
          :key="category.value"
          :label="category.label"
          :value="category.value"
        />
      </el-select>
      <el-select
        v-model="searchParams.sort_by"
        @change="handleSearch"
      >
        <el-option label="最新发布" value="created_at" />
        <el-option label="最后回复" value="last_reply_at" />
        <el-option label="浏览最多" value="view_count" />
        <el-option label="回复最多" value="reply_count" />
      </el-select>
    </div>

    <!-- 帖子列表 -->
    <div v-loading="loading" class="space-y-4">
      <div
        v-for="post in posts"
        :key="post.id"
        class="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
      >
        <!-- 帖子头部 -->
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <el-tag
                v-if="post.is_pinned"
                type="warning"
                size="small"
              >
                置顶
              </el-tag>
              <el-tag
                v-if="post.is_locked"
                type="danger"
                size="small"
              >
                已锁定
              </el-tag>
              <el-tag
                :type="getCategoryTagType(post.category)"
                size="small"
              >
                {{ getCategoryLabel(post.category) }}
              </el-tag>
            </div>
            <h3
              class="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
              @click="handleViewPost(post.id)"
            >
              {{ post.title }}
            </h3>
          </div>
          <div class="flex items-center gap-2">
            <!-- 操作按钮 -->
            <el-button
              v-if="canEditPost(post.author_id)"
              type="text"
              size="small"
              @click="handleEditPost(post)"
            >
              编辑
            </el-button>
            <el-button
              v-if="canDeletePost(post.author_id)"
              type="text"
              size="small"
              @click="handleDeletePost(post)"
            >
              删除
            </el-button>
            <el-dropdown v-if="hasAdminRights">
              <el-button type="text" size="small">
                管理
                <el-icon class="ml-1"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handlePinPost(post)">
                    {{ post.is_pinned ? '取消置顶' : '置顶' }}
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleLockPost(post)">
                    {{ post.is_locked ? '解锁' : '锁定' }}
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleHidePost(post)">
                    隐藏
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <!-- 帖子内容预览 -->
        <div class="text-gray-600 mb-4 line-clamp-2">
          {{ post.content }}
        </div>

        <!-- 帖子元信息 -->
        <div class="flex justify-between items-center text-sm text-gray-500">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <el-avatar
                :size="24"
                :src="post.author_info?.avatar"
              >
                {{ post.author_info?.username?.charAt(0) || '?' }}
              </el-avatar>
              <span>{{ post.author_info?.username || post.author_info?.account || '未知用户' }}</span>
            </div>
            <span>{{ formatTime(post.created_at) }}</span>
          </div>
          <div class="flex items-center gap-6">
            <span class="flex items-center gap-1">
              <el-icon><view /></el-icon>
              {{ post.view_count }}
            </span>
            <span class="flex items-center gap-1 cursor-pointer hover:text-blue-600" @click="handleLikePost(post)">
              <el-icon><heart /></el-icon>
              {{ post.like_count }}
            </span>
            <span class="flex items-center gap-1">
              <el-icon><chat-dot-round /></el-icon>
              {{ post.reply_count }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="mt-8 flex justify-center">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.page_size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>

    <!-- 空状态 -->
    <el-empty
      v-if="!loading && posts.length === 0"
      description="暂无帖子"
      :image-size="200"
    >
      <el-button
        v-if="canCreatePost"
        type="primary"
        @click="handleCreatePost"
      >
        发布第一个帖子
      </el-button>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/utils/permissions'
import { forumApi } from '@/api/extended'
import type { ForumPost, ForumPostListParams } from '@/types/forum'
import { formatTime } from '@/utils/format'
import { ArrowDown, View, Heart, ChatDotRound } from '@element-plus/icons-vue'

// Composition API
const router = useRouter()
const authStore = useAuthStore()
const { checkPermission, hasAdminRights, getCurrentRole } = usePermissions()

// 响应式数据
const loading = ref(false)
const posts = ref<ForumPost[]>([])
const categories = ref([
  { label: '公告', value: 'announcement' },
  { label: '讨论', value: 'discussion' },
  { label: '问答', value: 'question' },
  { label: '分享', value: 'sharing' },
  { label: '反馈', value: 'feedback' }
])

// 搜索参数
const searchParams = reactive<ForumPostListParams>({
  page: 1,
  page_size: 20,
  keyword: '',
  category: undefined,
  sort_by: 'created_at',
  sort_order: 'desc'
})

// 分页信息
const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0
})

// 权限检查
const canCreatePost = computed(() => {
  return authStore.isAuthenticated && checkPermission('forum_post', 'create')
})

const canEditPost = (authorId: number) => {
  if (!authStore.isAuthenticated) return false

  // 检查是否是作者或有管理权限
  const isAuthor = authStore.user?.id === authorId
  const canManage = checkPermission('forum_post', 'update') ||
                   checkPermission('forum_moderate', 'moderate')

  return isAuthor || canManage
}

const canDeletePost = (authorId: number) => {
  if (!authStore.isAuthenticated) return false

  const isAuthor = authStore.user?.id === authorId
  const canManage = checkPermission('forum_post', 'delete') ||
                   checkPermission('forum_moderate', 'moderate')

  return isAuthor || canManage
}

// 方法定义
const fetchPosts = async () => {
  loading.value = true
  try {
    const response = await forumApi.getPostList({
      ...searchParams,
      page: pagination.page,
      page_size: pagination.page_size
    })

    posts.value = response?.data || []
    pagination.total = response?.meta?.total || 0
  } catch (error) {
    console.error('获取帖子列表失败:', error)
    ElMessage.error('获取帖子列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchPosts()
}

const handleSizeChange = (size: number) => {
  pagination.page_size = size
  pagination.page = 1
  fetchPosts()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchPosts()
}

const handleViewPost = (postId: number) => {
  router.push(`/forum/post/${postId}`)
}

const handleCreatePost = () => {
  router.push('/forum/create')
}

const handleEditPost = (post: ForumPost) => {
  router.push(`/forum/edit/${post.id}`)
}

const handleDeletePost = async (post: ForumPost) => {
  try {
    await ElMessageBox.confirm('确定要删除这个帖子吗？', '确认删除', {
      type: 'warning'
    })

    await forumApi.deletePost(post.id)
    ElMessage.success('删除成功')
    fetchPosts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除帖子失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleLikePost = async (post: ForumPost) => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    await forumApi.toggleLike({
      target_type: 'post',
      target_id: post.id
    })

    // 更新点赞数
    post.like_count += post.is_liked ? -1 : 1
    post.is_liked = !post.is_liked

    ElMessage.success(post.is_liked ? '点赞成功' : '取消点赞')
  } catch (error) {
    console.error('点赞失败:', error)
    ElMessage.error('操作失败')
  }
}

const handlePinPost = async (post: ForumPost) => {
  try {
    // 这里需要调用管理员的置顶接口
    ElMessage.success(post.is_pinned ? '取消置顶成功' : '置顶成功')
    fetchPosts()
  } catch (error) {
    console.error('置顶操作失败:', error)
    ElMessage.error('操作失败')
  }
}

const handleLockPost = async (post: ForumPost) => {
  try {
    // 这里需要调用管理员的锁定接口
    ElMessage.success(post.is_locked ? '解锁成功' : '锁定成功')
    fetchPosts()
  } catch (error) {
    console.error('锁定操作失败:', error)
    ElMessage.error('操作失败')
  }
}

const handleHidePost = async (post: ForumPost) => {
  try {
    await ElMessageBox.confirm('确定要隐藏这个帖子吗？', '确认隐藏', {
      type: 'warning'
    })

    // 这里需要调用管理员的隐藏接口
    ElMessage.success('隐藏成功')
    fetchPosts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('隐藏帖子失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

const handleBatchManage = () => {
  router.push('/forum/admin/manage')
}

const getCategoryTagType = (category: string) => {
  const typeMap: Record<string, string> = {
    announcement: 'danger',
    discussion: 'primary',
    question: 'warning',
    sharing: 'success',
    feedback: 'info'
  }
  return typeMap[category] || 'info'
}

const getCategoryLabel = (category: string) => {
  const categoryItem = categories.value.find(c => c.value === category)
  return categoryItem?.label || category
}

// 生命周期
onMounted(() => {
  fetchPosts()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>