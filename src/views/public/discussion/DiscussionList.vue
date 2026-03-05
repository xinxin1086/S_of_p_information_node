<template>
  <div class="discussion-list">
    <div class="page-header">
      <h1>讨论社区</h1>
      <p>交流经验，分享心得，结识钓友</p>
    </div>

    <div class="discussion-toolbar">
      <div class="toolbar-left">
        <el-button
          type="primary"
          :icon="Plus"
          @click="showNewPostDialog = true"
          v-if="authStore.isAuthenticated"
        >
          发布新帖
        </el-button>
        <el-button
          v-else
          @click="handleLoginPrompt"
          :icon="Plus"
        >
          发布新帖
        </el-button>
      </div>

      <div class="toolbar-right">
        <el-select
          v-model="sortBy"
          placeholder="排序方式"
          @change="sortPosts"
        >
          <el-option label="最新回复" value="latest_reply" />
          <el-option label="发布时间" value="created_at" />
          <el-option label="热门" value="popular" />
        </el-select>
      </div>
    </div>

    <div class="posts-container">
      <div v-loading="loading" class="posts-wrapper">
      <div v-if="filteredPosts.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无讨论帖" />
      </div>

      <div v-else-if="filteredPosts.length > 0" class="posts-list">
        <div
          v-for="post in filteredPosts"
          :key="post.id"
          class="post-item"
          @click="goToDetail(post.id)"
        >
          <div class="post-avatar">
            <el-avatar :src="post.author?.avatar" :size="48">
              {{ post.author?.username?.charAt(0)?.toUpperCase() || '?' }}
            </el-avatar>
          </div>

          <div class="post-content">
            <div class="post-header">
              <h3 class="post-title">{{ post.title }}</h3>
              <el-tag
                :type="getCategoryTagType(post.category)"
                size="small"
              >
                {{ getCategoryLabel(post.category) }}
              </el-tag>
            </div>

            <div class="post-summary">
              {{ post.content?.substring(0, 150) + '...' }}
            </div>

            <div class="post-meta">
              <span class="author">{{ post.author?.username || '未知用户' }}</span>
              <span class="time">{{ formatTime(post.created_at) }}</span>
              <div class="stats">
                <span class="stat-item">
                  <el-icon><ChatDotRound /></el-icon>
                  {{ post.reply_count }}
                </span>
                <span class="stat-item">
                  <el-icon><View /></el-icon>
                  {{ post.view_count }}
                </span>
                <span class="stat-item">
                  <el-icon><Star /></el-icon>
                  {{ post.like_count }}
                </span>
              </div>
            </div>

            <div class="post-footer" v-if="post.last_reply">
              <span class="last-reply">
                最后回复：{{ post.last_reply.author }} · {{ formatTime(post.last_reply.time) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
      </div>
    </div>

    <!-- 发布新帖对话框 -->
    <el-dialog
      v-model="showNewPostDialog"
      title="发布新帖"
      width="600px"
      :before-close="handleCloseDialog"
    >
      <el-form
        ref="newPostForm"
        :model="newPost"
        :rules="postRules"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="newPost.title"
            placeholder="请输入帖子标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="分类" prop="category">
          <el-select v-model="newPost.category" placeholder="选择分类">
            <el-option
              v-for="category in categories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input
            v-model="newPost.content"
            type="textarea"
            :rows="8"
            placeholder="分享你的想法..."
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseDialog">取消</el-button>
          <el-button type="primary" @click="submitPost" :loading="submitting">
            发布
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { Plus, ChatDotRound, View, Star } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores'
import { mockForumPosts, mockForumFloors } from '@/mock/forumMockData'
import { addForumPost, getForumPosts } from '@/mock/forumMockStorage'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const posts = ref([])
const sortBy = ref('latest_reply')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const showNewPostDialog = ref(false)
const submitting = ref(false)
const newPostForm = ref(null)

const newPost = ref({
  title: '',
  category: '',
  content: ''
})

const postRules = {
  title: [
    { required: true, message: '请输入帖子标题', trigger: 'blur' },
    {
      min: 5,
      max: 100,
      message: '标题长度为 5 到 100 个字符',
      trigger: 'blur'
    }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入帖子内容', trigger: 'blur' },
    {
      min: 10,
      max: 2000,
      message: '内容长度为 10 到 2000 个字符',
      trigger: 'blur'
    }
  ]
}

// 论坛分类配置（精简为4个主要分类）
const categories = [
  { label: '经验分享', value: '经验分享' },
  { label: '求助问答', value: '求助问答' },
  { label: '活动交流', value: '活动交流' },
  { label: '其他讨论', value: '其他讨论' }
]

const filteredPosts = computed(() => {
  return sortPostList(posts.value)
})

const sortPostList = (postList) => {
  return [...postList].sort((a, b) => {
    switch (sortBy.value) {
      case 'latest_reply':
        return new Date(b.last_reply?.time || b.created_at) - new Date(a.last_reply?.time || a.created_at)
      case 'created_at':
        return new Date(b.created_at) - new Date(a.created_at)
      case 'popular':
        return b.reply_count - a.reply_count
      default:
        return 0
    }
  })
}

/**
 * 从论坛 mock 数据加载帖子
 * 将 mockForumPosts 转换为页面所需的格式
 * 合并静态数据和 localStorage 中的动态数据
 */
const loadForumPosts = () => {
  // 获取 localStorage 中的动态帖子
  const dynamicPosts = getForumPosts()

  // 合并静态帖子和动态帖子（去重）
  const allPosts = [...mockForumPosts]
  dynamicPosts.forEach(post => {
    if (!allPosts.some(p => p.id === post.id)) {
      allPosts.push(post)
    }
  })

  // 获取所有已发布的帖子
  const publishedPosts = allPosts.filter(post => post.status === 'published' && !post.is_deleted)

  // 为每个帖子添加最后回复信息
  const postsWithLastReply = publishedPosts.map(post => {
    // 查找该帖子的所有楼层
    const postFloors = mockForumFloors.filter(floor => floor.post_id === post.id)

    // 找到最新的楼层作为最后回复
    const latestFloor = postFloors.length > 0
      ? postFloors.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
      : null

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category, // 直接使用 mock 数据中的分类（已经是精简后的4个分类）
      author: {
        id: post.author_user_id,
        username: post.author_display,
        avatar: ''
      },
      created_at: post.created_at,
      reply_count: post.comment_count,
      view_count: post.view_count,
      like_count: post.like_count,
      last_reply: latestFloor ? {
        author: latestFloor.author_display,
        time: latestFloor.created_at
      } : null
    }
  })

  // 按创建时间倒序排序（新帖子在前）
  postsWithLastReply.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  posts.value = postsWithLastReply
  total.value = postsWithLastReply.length

  console.log('[DiscussionList] 加载论坛帖子，静态:', mockForumPosts.length, '动态:', dynamicPosts.length, '总计:', total.value)
}

const fetchPosts = async () => {
  loading.value = true
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    loadForumPosts()
  } catch (error) {
    console.error('获取讨论帖失败:', error)
    ElMessage.error('获取讨论帖失败')
  } finally {
    loading.value = false
  }
}

const sortPosts = () => {
  // 触发重新排序
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const goToDetail = (id) => {
  router.push(`/discussion/${id}`)
}

const handleLoginPrompt = () => {
  ElMessage.info('请先登录后再发布帖子')
  router.push('/login')
}

const submitPost = async () => {
  console.log('[DiscussionList] submitPost 被调用，newPostForm.value:', newPostForm.value)

  if (!newPostForm.value) {
    console.error('[DiscussionList] 表单引用不存在，newPostForm:', newPostForm)
    ElMessage.error('表单未正确加载，请刷新页面重试')
    return
  }

  try {
    // 验证表单
    console.log('[DiscussionList] 开始验证表单，当前数据:', newPost.value)
    const validationResult = await newPostForm.value.validate()
    console.log('[DiscussionList] 表单验证通过，结果:', validationResult)

    submitting.value = true

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 创建新帖子对象
    const newPostData = {
      id: Date.now(),
      title: newPost.value.title,
      content: newPost.value.content,
      category: newPost.value.category,
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author_user_id: authStore.user?.id || 999,
      author_display: authStore.user?.username || '匿名用户',
      is_deleted: false
    }

    // 保存到 localStorage
    addForumPost(newPostData)
    console.log('[DiscussionList] 新帖子已保存到 localStorage:', newPostData)

    // 添加到帖子列表开头
    posts.value.unshift(newPostData)
    total.value++

    console.log('[DiscussionList] 新帖子已发布，当前帖子总数:', total.value)

    ElMessage.success('发帖成功！')
    showNewPostDialog.value = false
    resetForm()
  } catch (error) {
    // 表单验证失败时，Element Plus 会拒绝 Promise 并返回错误对象
    // 格式类似: { title: ['错误信息'], content: ['错误信息'] }
    console.error('[DiscussionList] 表单验证/发帖失败，错误详情:', error)
    console.error('[DiscussionList] 错误类型:', typeof error)
    console.error('[DiscussionList] 错误键:', error ? Object.keys(error) : 'error is null/undefined')

    if (error && typeof error === 'object') {
      // 提取第一个错误信息显示给用户
      const firstField = Object.keys(error)[0]
      console.log('[DiscussionList] 第一个错误字段:', firstField)
      const firstError = error[firstField]
      console.log('[DiscussionList] 第一个错误值:', firstError)

      if (Array.isArray(firstError) && firstError.length > 0) {
        ElMessage.warning(firstError[0])
      } else if (typeof firstError === 'string') {
        ElMessage.warning(firstError)
      } else {
        ElMessage.warning('请检查表单内容，确保所有必填项都已正确填写')
      }
    } else {
      ElMessage.error('发帖失败，请重试')
    }
  } finally {
    submitting.value = false
  }
}

const handleCloseDialog = () => {
  showNewPostDialog.value = false
  resetForm()
}

const resetForm = () => {
  if (newPostForm.value) {
    // 使用 resetFields() 重置表单，这会将字段值重置为初始值，并清除验证状态
    // 这样可以避免 clearValidate() 触发的验证警告
    newPostForm.value.resetFields()
  } else {
    // 如果表单引用不存在，直接清空数据
    newPost.value = {
      title: '',
      category: '',
      content: ''
    }
  }
}

const getCategoryLabel = (category) => {
  const item = categories.find(c => c.value === category)
  return item ? item.label : category
}

const getCategoryTagType = (category) => {
  // 根据论坛分类返回对应的标签类型（仅4个分类）
  const typeMap = {
    '经验分享': 'success',
    '求助问答': 'warning',
    '活动交流': 'primary',
    '其他讨论': 'info'
  }
  return typeMap[category] || ''
}

const formatTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

onMounted(() => {
  fetchPosts()
})
</script>

<style scoped>
.discussion-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  color: #303133;
  margin-bottom: 10px;
  font-size: 32px;
  font-weight: 600;
}

.page-header p {
  color: #606266;
  font-size: 16px;
}

.discussion-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 15px 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.posts-container {
  min-height: 400px;
}

.posts-wrapper {
  min-height: 200px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.post-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
}

.post-avatar {
  flex-shrink: 0;
}

.post-content {
  flex: 1;
  min-width: 0;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.post-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  cursor: pointer;
  transition: color 0.3s;
}

.post-title:hover {
  color: #409eff;
}

.post-summary {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
  font-size: 14px;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 13px;
  color: #909399;
}

.author {
  font-weight: 500;
  color: #409eff;
}

.stats {
  display: flex;
  gap: 15px;
  margin-left: auto;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.post-footer {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: #909399;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式 */
@media (max-width: 768px) {
  .discussion-list {
    padding: 15px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .discussion-toolbar {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
    justify-content: space-between;
  }

  .post-item {
    padding: 15px;
    gap: 12px;
  }

  .post-header {
    flex-direction: column;
    gap: 8px;
  }

  .post-meta {
    flex-wrap: wrap;
    gap: 10px;
  }

  .stats {
    order: 3;
    width: 100%;
    justify-content: space-between;
    margin-left: 0;
    margin-top: 5px;
  }
}

@media (max-width: 480px) {
  .post-avatar {
    display: none;
  }

  .post-content {
    flex: 1;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .page-header p {
    font-size: 14px;
  }
}
</style>