<template>
  <div class="notice-editor">
    <!-- 页面头部 -->
    <div class="editor-header">
      <div class="header-left">
        <el-button
          type="text"
          @click="goBack"
          class="back-button"
        >
          <el-icon><ArrowLeft /></el-icon>
          返回公告列表
        </el-button>
      </div>
      <div class="header-title">
        <h1>{{ isEdit ? '编辑公告' : '发布公告' }}</h1>
        <p v-if="isEdit" class="edit-info">
          最后修改：{{ formatDate(noticeData.update_time) }}
        </p>
      </div>
      <div class="header-actions">
        <el-button @click="handlePreview" :disabled="loading">
          <el-icon><View /></el-icon>
          预览
        </el-button>
        <el-button @click="handleSaveDraft" :disabled="loading || !isFormValid">
          <el-icon><Document /></el-icon>
          保存草稿
        </el-button>
        <el-button
          type="primary"
          @click="handlePublish"
          :disabled="loading || !isFormValid"
          :loading="loading"
        >
          <el-icon><Promotion /></el-icon>
          {{ isEdit ? '更新公告' : '发布公告' }}
        </el-button>
      </div>
    </div>

    <!-- 编辑器主体 -->
    <div class="editor-body">
      <!-- 错误提示 -->
      <el-alert
        v-if="errorMessage"
        :title="errorMessage"
        type="error"
        show-icon
        @close="errorMessage = ''"
        class="error-alert"
      />

      <!-- 基本信息表单 -->
      <div class="basic-info-section">
        <h3>基本信息</h3>
        <el-form
          ref="formRef"
          :model="noticeData"
          :rules="formRules"
          label-width="100px"
          class="notice-form"
        >
          <el-row :gutter="20">
            <el-col :span="16">
              <el-form-item label="公告标题" prop="release_title">
                <el-input
                  v-model="noticeData.release_title"
                  placeholder="请输入公告标题"
                  maxlength="100"
                  show-word-limit
                  :disabled="loading"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="公告类型" prop="notice_type">
                <el-select
                  v-model="noticeData.notice_type"
                  placeholder="请选择公告类型"
                  :disabled="loading"
                  style="width: 100%"
                >
                  <el-option label="系统通知" value="系统通知" />
                  <el-option label="活动公告" value="活动公告" />
                  <el-option label="其他公告" value="其他公告" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="过期时间" prop="expiration">
                <el-date-picker
                  v-model="noticeData.expiration"
                  type="datetime"
                  placeholder="请选择过期时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DDTHH:mm:ss"
                  :disabled="loading"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 富文本编辑器 -->
      <div class="content-section">
        <div class="section-header">
          <h3>公告内容</h3>
          <div class="editor-tools">
            <el-button-group>
              <el-button size="small" @click="insertTemplate('announcement')">
                插入公告模板
              </el-button>
              <el-button size="small" @click="insertTemplate('activity')">
                插入活动模板
              </el-button>
              <el-button size="small" @click="insertTemplate('maintenance')">
                插入维护通知模板
              </el-button>
            </el-button-group>
          </div>
        </div>

        <div class="editor-container">
          <!-- 简单的富文本编辑器工具栏 -->
          <div class="editor-toolbar" v-if="!loading">
            <el-button-group size="small">
              <el-button @click="formatText('bold')" :type="isFormatActive('bold') ? 'primary' : 'default'">
                <strong>B</strong>
              </el-button>
              <el-button @click="formatText('italic')" :type="isFormatActive('italic') ? 'primary' : 'default'">
                <em>I</em>
              </el-button>
              <el-button @click="formatText('underline')" :type="isFormatActive('underline') ? 'primary' : 'default'">
                <u>U</u>
              </el-button>
            </el-button-group>

            <el-button-group size="small" class="ml-2">
              <el-button @click="formatText('justifyLeft')" :type="isFormatActive('justifyLeft') ? 'primary' : 'default'">
                左对齐
              </el-button>
              <el-button @click="formatText('justifyCenter')" :type="isFormatActive('justifyCenter') ? 'primary' : 'default'">
                居中
              </el-button>
              <el-button @click="formatText('justifyRight')" :type="isFormatActive('justifyRight') ? 'primary' : 'default'">
                右对齐
              </el-button>
            </el-button-group>

            <el-button-group size="small" class="ml-2">
              <el-button @click="insertHeading(1)">H1</el-button>
              <el-button @click="insertHeading(2)">H2</el-button>
              <el-button @click="insertHeading(3)">H3</el-button>
            </el-button-group>

            <el-button size="small" class="ml-2" @click="clearFormat">
              清除格式
            </el-button>
          </div>

          <!-- 可编辑的内容区域 -->
          <div
            ref="contentEditor"
            class="content-editor"
            :style="{ height: '500px', cursor: loading ? 'not-allowed' : 'text' }"
            :contenteditable="!loading"
            @input="handleContentInput"
            @blur="handleContentBlur"
            @focus="handleContentFocus"
            @keydown="handleKeyDown"
            @paste="handlePaste"
            data-placeholder="请输入公告内容..."
          ></div>
        </div>

        <!-- 字数统计 -->
        <div class="content-stats">
          <span class="word-count">
            字数：{{ wordCount }} 字
          </span>
          <span class="char-count">
            字符：{{ charCount }} 字符
          </span>
        </div>
      </div>

      <!-- 附件管理 -->
      <div class="attachment-section">
        <h3>附件管理</h3>
        <el-upload
          class="attachment-upload"
          :action="uploadUrl"
          :headers="uploadHeaders"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :on-remove="handleRemoveAttachment"
          :file-list="attachments"
          :disabled="loading"
          multiple
        >
          <el-button type="primary" :disabled="loading">
            <el-icon><Plus /></el-icon>
            添加附件
          </el-button>
          <template #tip>
            <div class="upload-tip">
              支持上传图片、文档等文件，单个文件不超过10MB
            </div>
          </template>
        </el-upload>
      </div>
    </div>

    <!-- 预览弹窗 -->
    <el-dialog
      v-model="previewVisible"
      title="公告预览"
      width="80%"
      :destroy-on-close="true"
    >
      <div class="preview-content">
        <div class="preview-header">
          <h2>{{ noticeData.release_title }}</h2>
          <div class="preview-meta">
            <el-tag :type="getNoticeTypeTag(noticeData.notice_type)">
              {{ noticeData.notice_type }}
            </el-tag>
            <span class="preview-time">
              {{ formatDate(noticeData.expiration) }} 过期
            </span>
          </div>
        </div>
        <div class="preview-body" v-html="noticeData.release_notice"></div>
      </div>

      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="primary" @click="handlePublishFromPreview">
          {{ isEdit ? '更新公告' : '发布公告' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  View,
  Document,
  Promotion,
  Plus
} from '@element-plus/icons-vue'
import { useNoticeStore } from '@/store/modules/notice'
import { getNoticeTypeFromText } from '@/utils/notice'
import { BASE_URL } from '@/config.js'
// TinyMCE 已移除，使用基础文本编辑器

const route = useRoute()
const router = useRouter()
const noticeStore = useNoticeStore()
const formRef = ref(null)

// 响应式数据
const loading = ref(false)
const isEdit = ref(false)
const errorMessage = ref('')
const previewVisible = ref(false)

// 编辑器状态控制
const isUserEditing = ref(false)
const isUpdatingFromWatch = ref(false)

// 表单数据
const noticeData = ref({
  id: '',
  release_title: '',
  notice_type: '',
  release_notice: '',
  expiration: '',
  attachments: []
})

// 附件列表
const attachments = ref([])

// 表单验证规则
const formRules = {
  release_title: [
    { required: true, message: '请输入公告标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在2到100个字符之间', trigger: 'blur' }
  ],
  notice_type: [
    { required: true, message: '请选择公告类型', trigger: 'change' }
  ],
  release_notice: [
    { required: true, message: '请输入公告内容', trigger: 'blur' },
    { min: 10, message: '公告内容至少10个字符', trigger: 'blur' }
  ],
  expiration: [
    { required: true, message: '请选择过期时间', trigger: 'change' }
  ]
}

// 计算属性
const isFormValid = computed(() => {
  return noticeData.value.release_title &&
         noticeData.value.notice_type &&
         noticeData.value.release_notice &&
         noticeData.value.expiration
})

const wordCount = computed(() => {
  if (!noticeData.value.release_notice) return 0
  const plainText = getPlainText(noticeData.value.release_notice)
  return plainText.length
})

const charCount = computed(() => {
  if (!noticeData.value.release_notice) return 0
  const plainText = getPlainText(noticeData.value.release_notice)
  return plainText.length
})

const uploadUrl = computed(() => `${BASE_URL}/api/upload/notice`)
const uploadHeaders = computed(() => ({
  'Authorization': `Bearer ${localStorage.getItem('admin_token') || localStorage.getItem('user_token')}`
}))

// 方法
const goBack = () => {
  router.push('/admin/content/notice')
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getNoticeTypeTag = (type) => {
  const typeMap = {
    '系统通知': 'danger',
    '活动公告': 'primary',
    '其他公告': 'info'
  }
  return typeMap[type] || 'info'
}

// 加载公告详情
const loadNoticeDetail = async (id) => {
  if (!id) return

  loading.value = true
  try {
    console.log('🔄 请求公告详情（使用访客接口）:', id)

    // 使用访客接口获取完整的公告详情
    const result = await noticeStore.fetchPublicNotice(id)

    if (result.success && result.data) {
      const notice = result.data
      console.log('📄 公告详情原始数据:', notice)

      noticeData.value = {
        id: notice.id,
        release_title: notice.release_title || notice.title || '未命名公告',
        notice_type: notice.notice_type || notice.type || '其他公告',
        release_notice: notice.release_notice || notice.content || '',
        expiration: notice.expiration || notice.expireTime,
        attachments: notice.attachments || []
      }

      console.log('📝 编辑器表单数据:', noticeData.value)

      // 如果有附件，加载附件列表
      if (notice.attachments && notice.attachments.length > 0) {
        attachments.value = notice.attachments.map(attachment => ({
          name: attachment.name,
          url: attachment.url,
          uid: attachment.id
        }))
      }
    } else {
      ElMessage.error('获取公告详情失败：' + (result.error || '未知错误'))
    }
  } catch (error) {
    console.error('获取公告详情失败:', error)
    ElMessage.error('获取公告详情失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 编辑器相关引用
const contentEditor = ref(null)

// 编辑器初始化
const handleEditorInit = () => {
  console.log('编辑器初始化完成')
}

// 内容变化处理
const handleContentInput = (event) => {
  // 实时更新内容，但不再通过watch监听器反向更新DOM
  const newContent = event.target.innerHTML
  noticeData.value.release_notice = newContent

  // 防止默认的光标位置变化，让浏览器自然处理
  event.stopPropagation?.()
}

// 内容失焦处理
const handleContentBlur = () => {
  // 可以在这里添加失焦时的处理逻辑
}

// 内容聚焦处理
const handleContentFocus = () => {
  // 可以在这里添加聚焦时的处理逻辑
}

// 键盘事件处理
const handleKeyDown = (event) => {
  // 确保编辑器可以正常接收键盘输入
  if (loading.value) {
    event.preventDefault()
    return
  }

  // 处理回车键
  if (event.key === 'Enter') {
    if (!event.shiftKey) {
      // 允许默认行为（创建新段落或换行）
      setTimeout(() => {
        noticeData.value.release_notice = contentEditor.value?.innerHTML || ''
      }, 0)
    }
  }
}

// 粘贴事件处理
const handlePaste = (event) => {
  if (loading.value) {
    event.preventDefault()
    return
  }

  // 允许粘贴但清理格式
  event.preventDefault()
  const text = event.clipboardData.getData('text/plain') || event.clipboardData.getData('text/html')
  document.execCommand('insertText', false, text)
}

// 文本格式化
const formatText = (command) => {
  document.execCommand(command, false, null)
  contentEditor.value?.focus()
}

// 插入标题
const insertHeading = (level) => {
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    const heading = document.createElement(`h${level}`)
    heading.textContent = '标题'
    range.deleteContents()
    range.insertNode(heading)

    // 设置光标位置到标题末尾
    range.selectNodeContents(heading)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  }
  contentEditor.value?.focus()
}

// 清除格式
const clearFormat = () => {
  document.execCommand('removeFormat', false, null)
  document.execCommand('unlink', false, null)
  contentEditor.value?.focus()
}

// 检查格式是否激活
const isFormatActive = (command) => {
  try {
    return document.queryCommandState(command)
  } catch (e) {
    return false
  }
}

// 获取纯文本内容（用于字数统计）
const getPlainText = (html) => {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  return tempDiv.textContent || tempDiv.innerText || ''
}

// 更新内容变化处理（为了兼容原有方法）
const handleContentChange = (content) => {
  noticeData.value.release_notice = content
}

// 插入模板
const insertTemplate = (type) => {
  const templates = {
    announcement: `
<h2>重要公告</h2>
<p>尊敬的用户：</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;根据相关安排，现将有关事项公告如下：</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;【具体内容】</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;请广大用户知悉并相互转告。</p>
<p style="text-align: right;">发布部门</p>
<p style="text-align: right;">${formatDate(new Date())}</p>
    `,
    activity: `
<h2>活动公告</h2>
<p>亲爱的钓友们：</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;为了丰富大家的钓鱼生活，我们特别举办以下活动：</p>
<h3>活动主题</h3>
<p>【活动主题名称】</p>
<h3>活动时间</h3>
<p>开始时间：YYYY-MM-DD HH:mm</p>
<p>结束时间：YYYY-MM-DD HH:mm</p>
<h3>活动地点</h3>
<p>【活动详细地址】</p>
<h3>参与方式</h3>
<p>【参与方法和要求】</p>
<p>欢迎大家踊跃参加！</p>
<p style="text-align: right;">活动组委会</p>
<p style="text-align: right;">${formatDate(new Date())}</p>
    `,
    maintenance: `
<h2>系统维护通知</h2>
<p>尊敬的用户：</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;为了提供更好的服务体验，我们将进行系统维护升级，具体安排如下：</p>
<h3>维护时间</h3>
<p>开始时间：YYYY-MM-DD HH:mm</p>
<p>结束时间：YYYY-MM-DD HH:mm</p>
<h3>影响范围</h3>
<p>【受影响的功能模块】</p>
<h3>注意事项</h3>
<p>维护期间相关功能将暂时无法使用，请提前做好准备。</p>
<p>给您带来的不便，敬请谅解！</p>
<p>感谢您的支持与配合！</p>
<p style="text-align: right;">技术支持团队</p>
<p style="text-align: right;">${formatDate(new Date())}</p>
    `
  }

  if (templates[type]) {
    noticeData.value.release_notice = templates[type]
    // 更新编辑器内容显示
    if (contentEditor.value) {
      contentEditor.value.innerHTML = templates[type]
    }
  }
}

// 预览
const handlePreview = () => {
  if (!noticeData.value.release_title || !noticeData.value.release_notice) {
    ElMessage.warning('请先填写公告标题和内容')
    return
  }
  previewVisible.value = true
}

// 保存草稿
const handleSaveDraft = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    const data = {
      release_title: noticeData.value.release_title.trim(),
      notice_type: noticeData.value.notice_type,
      release_notice: noticeData.value.release_notice,
      expiration: noticeData.value.expiration ? new Date(noticeData.value.expiration).toISOString() : null,
      attachments: noticeData.value.attachments
    }

    console.log('💾 保存草稿:', data)

    let result
    if (isEdit.value) {
      result = await noticeStore.updateNotice(noticeData.value.id, data)
    } else {
      result = await noticeStore.createNotice(data)
    }

    if (result.success) {
      ElMessage.success('草稿保存成功！')
      if (!isEdit.value && result.data?.id) {
        noticeData.value.id = result.data.id
        isEdit.value = true
      }
    } else {
      ElMessage.error('保存失败：' + (result.error || '未知错误'))
    }
  } catch (error) {
    console.error('保存草稿失败:', error)
    ElMessage.error('保存失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 发布公告
const handlePublish = async () => {
  try {
    await formRef.value.validate()

    await ElMessageBox.confirm(
      `确定要${isEdit.value ? '更新' : '发布'}这条公告吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true

    const data = {
      release_title: noticeData.value.release_title.trim(),
      notice_type: noticeData.value.notice_type,
      release_notice: noticeData.value.release_notice,
      expiration: noticeData.value.expiration ? new Date(noticeData.value.expiration).toISOString() : null,
      attachments: noticeData.value.attachments
    }

    console.log('📤 ' + (isEdit.value ? '更新' : '发布') + '公告:', data)

    let result
    if (isEdit.value) {
      result = await noticeStore.updateNotice(noticeData.value.id, data)
    } else {
      result = await noticeStore.createNotice(data)
    }

    if (result.success) {
      ElMessage.success(isEdit.value ? '公告更新成功！' : '公告发布成功！')
      router.push('/admin/content/notice')
    } else {
      ElMessage.error((isEdit.value ? '更新' : '发布') + '失败：' + (result.error || '未知错误'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error((isEdit.value ? '更新' : '发布') + '公告失败:', error)
      ElMessage.error((isEdit.value ? '更新' : '发布') + '失败：' + error.message)
    }
  } finally {
    loading.value = false
  }
}

// 从预览发布
const handlePublishFromPreview = () => {
  previewVisible.value = false
  handlePublish()
}

// 文件上传成功
const handleUploadSuccess = (response, file) => {
  if (response.success) {
    noticeData.value.attachments.push({
      name: file.name,
      url: response.url,
      id: response.id
    })
    ElMessage.success('上传成功')
  } else {
    ElMessage.error('上传失败：' + response.message)
  }
}

// 文件上传失败
const handleUploadError = (error) => {
  ElMessage.error('上传失败：' + error.message)
}

// 删除附件
const handleRemoveAttachment = (file) => {
  const index = noticeData.value.attachments.findIndex(
    attachment => attachment.id === file.uid || attachment.url === file.url
  )
  if (index > -1) {
    noticeData.value.attachments.splice(index, 1)
  }
}

// 监听数据变化，仅在特定情况下更新编辑器内容
watch(() => noticeData.value.release_notice, (newContent, oldContent) => {
  // 只有在编辑器已存在、内容确实不同、且不是用户输入引起的变化时才更新
  if (contentEditor.value &&
      contentEditor.value.innerHTML !== newContent &&
      oldContent !== undefined) {

    // 延迟执行，避免干扰用户输入
    setTimeout(() => {
      if (contentEditor.value && contentEditor.value.innerHTML !== newContent) {
        // 仅在必要时更新内容（如数据加载时）
        contentEditor.value.innerHTML = newContent || ''
      }
    }, 10)
  }
}, { flush: 'post' })

// 监听loading状态，确保编辑器在加载时正确禁用/启用
watch(() => loading.value, (newLoading) => {
  if (contentEditor.value) {
    contentEditor.value.contentEditable = !newLoading
  }
})

// 页面挂载时初始化
onMounted(() => {
  const noticeId = route.params.id
  if (noticeId) {
    isEdit.value = true
    loadNoticeDetail(noticeId)
  } else {
    // 新建公告时设置默认过期时间为7天后
    const defaultExpiration = new Date()
    defaultExpiration.setDate(defaultExpiration.getDate() + 7)
    noticeData.value.expiration = defaultExpiration.toISOString().replace('Z', '+00:00')
  }

  // 编辑器挂载后设置属性
  nextTick(() => {
    if (contentEditor.value) {
      // 确保编辑器可编辑
      contentEditor.value.contentEditable = !loading.value
      console.log('编辑器初始化完成，contentEditable:', contentEditor.value.contentEditable)
    }
  })
})
</script>

<style scoped>
.notice-editor {
  min-height: 100vh;
  background: #f5f7fa;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-button {
  font-size: 14px;
  color: #606266;
}

.header-title h1 {
  margin: 0;
  font-size: 20px;
  color: #303133;
  font-weight: 500;
}

.edit-info {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #909399;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.editor-body {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.error-alert {
  margin-bottom: 24px;
}

.basic-info-section,
.content-section,
.attachment-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.basic-info-section h3,
.content-section h3,
.attachment-section h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.notice-form {
  margin-top: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
}

.editor-toolbar {
  background: #f5f7fa;
  padding: 12px;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.ml-2 {
  margin-left: 8px;
}

.content-editor {
  background: #fff;
  padding: 16px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  border: none;
  outline: none;
  min-height: 500px;
}

.content-editor:empty::before,
.content-editor[data-placeholder]:empty::before {
  content: attr(data-placeholder);
  color: #c0c4cc;
  pointer-events: none;
}

/* 当编辑器为空或只有空白字符时显示占位符 */
.content-editor:not(:focus):empty::before {
  content: attr(data-placeholder);
  color: #c0c4cc;
  pointer-events: none;
}

.content-editor:focus {
  box-shadow: inset 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 编辑器内容样式 */
.content-editor h1,
.content-editor h2,
.content-editor h3,
.content-editor h4,
.content-editor h5,
.content-editor h6 {
  margin: 16px 0 8px 0;
  font-weight: 600;
  color: #303133;
}

.content-editor h1 { font-size: 24px; }
.content-editor h2 { font-size: 20px; }
.content-editor h3 { font-size: 18px; }

.content-editor p {
  margin: 8px 0;
  line-height: 1.6;
}

.content-editor strong {
  font-weight: 600;
}

.content-editor em {
  font-style: italic;
}

.content-editor u {
  text-decoration: underline;
}

.content-editor ul,
.content-editor ol {
  margin: 8px 0;
  padding-left: 24px;
}

.content-editor li {
  margin: 4px 0;
}

.content-editor blockquote {
  margin: 12px 0;
  padding: 8px 16px;
  border-left: 4px solid #409eff;
  background: #f0f9ff;
  color: #606266;
}

.content-editor pre {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  overflow-x: auto;
  margin: 12px 0;
}

.content-editor code {
  background: #f5f7fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
}

.content-stats {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  margin-top: 12px;
  font-size: 12px;
  color: #909399;
}

.attachment-upload {
  margin-top: 16px;
}

.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.preview-content {
  max-height: 70vh;
  overflow-y: auto;
}

.preview-header {
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 20px;
}

.preview-header h2 {
  margin: 0 0 12px 0;
  font-size: 24px;
  color: #303133;
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #606266;
}

.preview-body {
  line-height: 1.6;
  color: #303133;
}

.preview-body :deep(img) {
  max-width: 100%;
  height: auto;
}

.preview-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
}

.preview-body :deep(table th),
.preview-body :deep(table td) {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.preview-body :deep(table th) {
  background-color: #f5f5f5;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 16px;
  }

  .header-actions {
    justify-content: center;
  }

  .editor-body {
    padding: 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-actions {
    flex-wrap: wrap;
  }

  .preview-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>