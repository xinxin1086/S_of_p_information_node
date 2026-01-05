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
          v-model="selectedCategory"
          placeholder="选择分类"
          clearable
          @change="filterPosts"
        >
          <el-option
            v-for="category in categories"
            :key="category.value"
            :label="category.label"
            :value="category.value"
          />
        </el-select>

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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ChatDotRound, View, Star } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const posts = ref([])
const selectedCategory = ref('')
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
    { min: 5, max: 100, message: '标题长度为 5 到 100 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入帖子内容', trigger: 'blur' },
    { min: 10, max: 2000, message: '内容长度为 10 到 2000 个字符', trigger: 'blur' }
  ]
}

const categories = [
  { label: '经验分享', value: 'experience' },
  { label: '装备讨论', value: 'equipment' },
  { label: '钓技交流', value: 'technique' },
  { label: '饵料配方', value: 'bait' },
  { label: '钓点推荐', value: 'spot' },
  { label: '渔获展示', value: 'catch' },
  { label: '闲聊灌水', value: 'chat' },
  { label: '其他', value: 'other' }
]

const filteredPosts = computed(() => {
  let result = [...posts.value]

  if (selectedCategory.value) {
    result = result.filter(post => post.category === selectedCategory.value)
  }

  return sortPostList(result)
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

const generateMockPosts = () => {
  const mockPosts = [
    {
      id: 1,
      title: '分享一个超有效的鲫鱼饵料配方',
      content: '最近研究出一个特别适合钓鲫鱼的饵料配方，主要原料包括玉米面、豆粕、鱼粉等。经过多次试验，效果非常好...',
      category: 'bait',
      author: {
        id: 1,
        username: '钓鱼大师',
        avatar: ''
      },
      created_at: '2024-01-15T10:30:00',
      reply_count: 23,
      view_count: 156,
      like_count: 45,
      last_reply: {
        author: '新手小白',
        time: '2024-01-16T14:20:00'
      }
    },
    {
      id: 2,
      title: '新手入门：如何选择第一套渔具',
      content: '很多朋友刚开始学钓鱼，不知道该买什么样的渔具。今天给大家整理一下新手入门的渔具选择建议...',
      category: 'equipment',
      author: {
        id: 2,
        username: '老司机',
        avatar: ''
      },
      created_at: '2024-01-14T08:45:00',
      reply_count: 18,
      view_count: 234,
      like_count: 32,
      last_reply: {
        author: '菜鸟求带',
        time: '2024-01-15T16:30:00'
      }
    },
    {
      id: 3,
      title: '野钓技巧：判断鱼情的几个要点',
      content: '今天和大家分享一下野钓时如何判断鱼情，包括观察水色、天气变化、风向等对钓鱼的影响...',
      category: 'technique',
      author: {
        id: 3,
        username: '野钓达人',
        avatar: ''
      },
      created_at: '2024-01-13T15:20:00',
      reply_count: 35,
      view_count: 289,
      like_count: 67,
      last_reply: {
        author: '学习中的鱼友',
        time: '2024-01-16T09:15:00'
      }
    },
    {
      id: 4,
      title: '推荐几个周末去的好钓点',
      content: '整理了几个附近适合周末休闲垂钓的地方，水质不错，鱼情也可以，有水库、河流等不同类型...',
      category: 'spot',
      author: {
        id: 4,
        username: '探路者',
        avatar: ''
      },
      created_at: '2024-01-12T11:10:00',
      reply_count: 27,
      view_count: 198,
      like_count: 53,
      last_reply: {
        author: '城市钓鱼人',
        time: '2024-01-15T20:45:00'
      }
    },
    {
      id: 5,
      title: '今天收获不错，晒晒渔获',
      content: '今天去了东郊水库，天气很好，鱼情也不错。早上6点到的，一直钓到中午12点，收获满满...',
      category: 'catch',
      author: {
        id: 5,
        username: '幸运儿',
        avatar: ''
      },
      created_at: '2024-01-11T07:30:00',
      reply_count: 42,
      view_count: 456,
      like_count: 89,
      last_reply: {
        author: '羡慕中',
        time: '2024-01-16T12:00:00'
      }
    }
  ]

  posts.value = mockPosts
  total.value = mockPosts.length
}

const fetchPosts = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    generateMockPosts()
  } catch (error) {
    console.error('获取讨论帖失败:', error)
    ElMessage.error('获取讨论帖失败')
  } finally {
    loading.value = false
  }
}

const filterPosts = () => {
  currentPage.value = 1
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
  if (!newPostForm.value) return

  try {
    await newPostForm.value.validate()
    submitting.value = true

    await new Promise(resolve => setTimeout(resolve, 1000))

    const post = {
      id: Date.now(),
      title: newPost.value.title,
      content: newPost.value.content,
      category: newPost.value.category,
      author: {
        id: authStore.user?.id || 999,
        username: authStore.user?.username || '匿名用户',
        avatar: authStore.user?.avatar || ''
      },
      created_at: new Date().toISOString(),
      reply_count: 0,
      view_count: 0,
      like_count: 0
    }

    posts.value.unshift(post)
    total.value++

    ElMessage.success('发帖成功！')
    showNewPostDialog.value = false
    resetForm()
  } catch (error) {
    console.error('发帖失败:', error)
    ElMessage.error('发帖失败，请重试')
  } finally {
    submitting.value = false
  }
}

const handleCloseDialog = () => {
  showNewPostDialog.value = false
  resetForm()
}

const resetForm = () => {
  newPost.value = {
    title: '',
    category: '',
    content: ''
  }
  if (newPostForm.value) {
    newPostForm.value.clearValidate()
  }
}

const getCategoryLabel = (category) => {
  const item = categories.find(c => c.value === category)
  return item ? item.label : category
}

const getCategoryTagType = (category) => {
  const typeMap = {
    experience: 'success',
    equipment: 'primary',
    technique: 'warning',
    bait: 'danger',
    spot: 'info',
    catch: 'success',
    chat: '',
    other: ''
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