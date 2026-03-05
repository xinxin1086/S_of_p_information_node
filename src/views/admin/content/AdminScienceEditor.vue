<template>
  <div class="science-editor">
    <!-- 页面头部 -->
    <div class="editor-header">
      <div class="header-left">
        <el-button
          type="link"
          @click="goBack"
          class="back-button"
          title="返回科普列表"
        >
          <el-icon><ArrowLeft /></el-icon>
          返回科普列表
        </el-button>
      </div>
      <div class="header-title">
        <h1>{{ isEdit ? '编辑科普' : '发布科普' }}</h1>
        <p v-if="isEdit" class="edit-info">
          最后修改：{{ formatDate(scienceData.updated_at) }}
        </p>
      </div>
      <div class="header-actions">
        <el-button @click="handlePreview" :disabled="loading">
          <el-icon><View /></el-icon>
          预览
        </el-button>
        <el-button
          type="primary"
          @click="handlePublish"
          :disabled="loading || !isFormValid"
          :loading="loading"
        >
          <el-icon><Promotion /></el-icon>
          {{ submitButtonText }}
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
          :model="scienceData"
          :rules="formRules"
          label-width="100px"
          class="science-form"
        >
          <el-row :gutter="20">
            <el-col :span="16">
              <el-form-item label="标题" prop="title">
                <el-input
                  v-model="scienceData.title"
                  placeholder="请输入标题"
                  maxlength="100"
                  show-word-limit
                  :disabled="loading"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="状态" prop="status">
                <el-select
                  v-model="scienceData.status"
                  placeholder="请选择状态"
                  :disabled="loading"
                  style="width: 100%"
                >
                  <el-option label="草稿" value="draft">
                    <span>草稿</span>
                    <span style="float: right; color: #909399; font-size: 12px">draft</span>
                  </el-option>
                  <el-option label="待审核" value="pending">
                    <span>待审核</span>
                    <span style="float: right; color: #e6a23c; font-size: 12px">pending</span>
                  </el-option>
                  <el-option label="已发布" value="published">
                    <span>已发布</span>
                    <span style="float: right; color: #67c23a; font-size: 12px">published</span>
                  </el-option>
                  <el-option label="已拒绝" value="rejected">
                    <span>已拒绝</span>
                    <span style="float: right; color: #f56c6c; font-size: 12px">rejected</span>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="封面图片" prop="cover_image">
                <div class="cover-image-upload">
                  <div v-if="scienceData.cover_image" class="cover-preview">
                    <img :src="scienceData.cover_image" alt="封面图片" />
                    <div class="cover-actions">
                      <el-button size="small" @click="removeCoverImage" :disabled="loading">
                        删除图片
                      </el-button>
                    </div>
                  </div>
                  <el-upload
                    v-else
                    class="cover-uploader"
                    :action="uploadUrl"
                    :headers="uploadHeaders"
                    :show-file-list="false"
                    :on-success="handleUploadSuccess"
                    :on-error="handleUploadError"
                    :before-upload="beforeUpload"
                    :disabled="loading"
                    accept="image/*"
                  >
                    <div class="upload-placeholder">
                      <el-icon class="upload-icon"><Plus /></el-icon>
                      <div class="upload-text">点击上传封面图片</div>
                      <div class="upload-tip">支持 jpg、png 格式，建议尺寸 800x600</div>
                    </div>
                  </el-upload>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 富文本编辑器 -->
      <div class="content-section">
        <div class="section-header">
          <h3>科普内容</h3>
          <div class="editor-tools">
            <el-button-group>
              <el-button size="small" @click="insertTemplate('introduction')">
                插入介绍模板
              </el-button>
              <el-button size="small" @click="insertTemplate('tutorial')">
                插入教程模板
              </el-button>
              <el-button size="small" @click="insertTemplate('knowledge')">
                插入知识模板
              </el-button>
            </el-button-group>
          </div>
        </div>

        <div class="editor-container">
          <!-- 简单的富文本编辑器工具栏 -->
          <div class="editor-toolbar" v-if="!loading">
            <el-button-group size="small">
              <el-button @click="formatText('bold')" :type="isFormatActive('bold') ? 'primary' : ''">
                <strong>B</strong>
              </el-button>
              <el-button @click="formatText('italic')" :type="isFormatActive('italic') ? 'primary' : ''">
                <em>I</em>
              </el-button>
              <el-button @click="formatText('underline')" :type="isFormatActive('underline') ? 'primary' : ''">
                <u>U</u>
              </el-button>
            </el-button-group>

            <el-button-group size="small" class="ml-2">
              <el-button @click="formatText('justifyLeft')" :type="isFormatActive('justifyLeft') ? 'primary' : ''">
                左对齐
              </el-button>
              <el-button @click="formatText('justifyCenter')" :type="isFormatActive('justifyCenter') ? 'primary' : ''">
                居中
              </el-button>
              <el-button @click="formatText('justifyRight')" :type="isFormatActive('justifyRight') ? 'primary' : ''">
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
            data-placeholder="请输入科普内容..."
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
    </div>

    <!-- 预览弹窗 -->
    <el-dialog
      v-model="previewVisible"
      title="科普预览"
      width="80%"
      :destroy-on-close="true"
    >
      <div class="preview-content">
        <div v-if="scienceData.cover_image" class="preview-cover">
          <img :src="scienceData.cover_image" alt="封面图片" />
        </div>
        <div class="preview-header">
          <h2>{{ scienceData.title }}</h2>
        </div>
        <!-- eslint-disable-next-line vue/no-v-html -- Content sanitized with DOMPurify -->
        <div class="preview-body" v-html="sanitizedScienceContent"></div>
      </div>

      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="primary" @click="handlePublishFromPreview">
          {{ submitButtonText }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  ArrowLeft,
  View,
  Promotion,
  Plus
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { BASE_URL } from '@/config.js'
import api from '@/api/unified'
import { sanitizeRichText } from '@/utils/sanitizeHtml'
import { tokenManager } from '@/utils/tokenManager'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)

// 响应式数据
const loading = ref(false)
const isEdit = ref(false)
const errorMessage = ref('')
const previewVisible = ref(false)

// 编辑器状态控制
const isUserEditing = ref(false)
const isUpdatingFromWatch = ref(false)

// 净化后的科普内容（用于预览）
const sanitizedScienceContent = computed(() => {
  return sanitizeRichText(scienceData.value.content)
})

// 表单数据
const scienceData = ref({
  id: '',
  title: '',
  content: '',
  cover_image: null,
  // 保留原有字段，编辑时需要回传
  author_user_id: null,
  author_display: '',
  status: 'draft',
  published_at: null,
  created_at: '',
  updated_at: ''
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在2到100个字符之间', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 20, message: '内容至少20个字符', trigger: 'blur' }
  ]
}

// 计算属性
const isFormValid = computed(() => {
  return scienceData.value.title && scienceData.value.content
})

// 提交按钮文本
const submitButtonText = computed(() => {
  const statusTextMap = {
    'draft': isEdit.value ? '更新草稿' : '保存草稿',
    'pending': isEdit.value ? '重新提交' : '提交审核',
    'published': isEdit.value ? '更新发布' : '发布科普',
    'rejected': isEdit.value ? '更新拒绝' : '标记拒绝'
  }
  return statusTextMap[scienceData.value.status] || (isEdit.value ? '更新科普' : '保存科普')
})

const wordCount = computed(() => {
  if (!scienceData.value.content) return 0
  const plainText = getPlainText(scienceData.value.content)
  return plainText.length
})

const charCount = computed(() => {
  if (!scienceData.value.content) return 0
  const plainText = getPlainText(scienceData.value.content)
  return plainText.length
})

const uploadUrl = computed(() => `${BASE_URL}/api/upload/science`)
const uploadHeaders = computed(() => ({
  'Authorization': `Bearer ${tokenManager.getAccessToken()}`
}))

// 方法
const goBack = () => {
  router.push('/admin/content/science')
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

// 加载科普详情
const loadScienceDetail = async (id) => {
  if (!id) return

  loading.value = true
  try {
    console.log('🔄 请求科普详情:', id)

    const result = await api.admin.science.get(id)

    console.log('📥 API响应:', result)
    console.log('📥 API响应.success:', result.success)
    console.log('📥 API响应.data:', result.data)
    console.log('📥 API响应完整键:', Object.keys(result))

    if (result.success && result.data) {
      const science = result.data
      console.log('📄 科普详情原始数据:', science)

      scienceData.value = {
        id: science.id,
        title: science.title || '',
        content: science.content || '',
        cover_image: science.cover_image || null,
        // 保留原有字段
        author_user_id: science.author_user_id || null,
        author_display: science.author_display || '',
        status: science.status || 'draft',
        published_at: science.published_at || null,
        created_at: science.created_at || '',
        updated_at: science.updated_at || ''
      }

      console.log('📝 编辑器表单数据:', scienceData.value)

      // 在数据加载完成后，手动设置编辑器内容
      await nextTick()
      if (contentEditor.value) {
        const content = scienceData.value.content || ''
        contentEditor.value.innerHTML = content
        console.log('✅ 编辑器内容已手动设置:', content)
      }
    } else {
      const errorMsg = result.message || result.error || '未知错误'
      console.error('❌ 获取科普详情失败:', result)
      ElMessage.error('获取科普详情失败：' + errorMsg)
    }
  } catch (error) {
    console.error('❌ 获取科普详情异常:', error)
    const errorMsg = error.message || error.code || '网络错误'
    ElMessage.error('获取科普详情失败：' + errorMsg)
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
  const newContent = event.target.innerHTML
  scienceData.value.content = newContent
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
  if (loading.value) {
    event.preventDefault()
    return
  }

  if (event.key === 'Enter') {
    if (!event.shiftKey) {
      setTimeout(() => {
        scienceData.value.content = contentEditor.value?.innerHTML || ''
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

// 插入模板
const insertTemplate = async (type) => {
  const templates = {
    introduction: `
<h2>什么是[主题]？</h2>
<p>【主题介绍】</p>
<h3>基本概念</h3>
<p>【基本概念说明】</p>
<h3>主要特点</h3>
<ul>
<li>特点1</li>
<li>特点2</li>
<li>特点3</li>
</ul>
<h3>注意事项</h3>
<p>【注意事项说明】</p>
    `,
    tutorial: `
<h2>[主题]教程</h2>
<p>本教程将详细介绍【主题】的方法和技巧。</p>
<h3>准备工作</h3>
<p>【所需工具和材料】</p>
<h3>步骤说明</h3>
<ol>
<li>第一步操作</li>
<li>第二步操作</li>
<li>第三步操作</li>
</ol>
<h3>常见问题</h3>
<p>【常见问题及解决方案】</p>
    `,
    knowledge: `
<h2>[主题]知识介绍</h2>
<p>【主题概述】</p>
<h3>背景知识</h3>
<p>【背景说明】</p>
<h3>技术要点</h3>
<p>【技术要点说明】</p>
<h3>实践应用</h3>
<p>【实践应用说明】</p>
<h3>总结</h3>
<p>【总结内容】</p>
    `
  }

  if (templates[type]) {
    scienceData.value.content = templates[type]
    await nextTick()
    if (contentEditor.value) {
      contentEditor.value.innerHTML = templates[type]
      console.log('✅ 模板内容已插入编辑器:', type)
    }
  }
}

// 上传前验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

// 上传成功
const handleUploadSuccess = (response) => {
  if (response.success || response.url) {
    scienceData.value.cover_image = response.url || response.data?.url
    ElMessage.success('封面图片上传成功')
  } else {
    ElMessage.error('上传失败：' + (response.message || '未知错误'))
  }
}

// 上传失败
const handleUploadError = (error) => {
  console.error('上传失败:', error)
  ElMessage.error('上传失败：' + error.message)
}

// 删除封面图片
const removeCoverImage = () => {
  scienceData.value.cover_image = null
  ElMessage.success('封面图片已删除')
}

// 预览
const handlePreview = () => {
  if (!scienceData.value.title || !scienceData.value.content) {
    ElMessage.warning('请先填写标题和内容')
    return
  }
  previewVisible.value = true
}

// 发布科普
const handlePublish = async () => {
  try {
    await formRef.value.validate()

    // 根据选择的状态显示不同的确认提示
    const statusTextMap = {
      'draft': '保存为草稿',
      'pending': '提交审核',
      'published': '发布',
      'rejected': '标记为已拒绝'
    }
    const statusText = statusTextMap[scienceData.value.status] || '保存'

    await ElMessageBox.confirm(
      `确定要${statusText}这篇科普吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true

    const submitData = {
      title: scienceData.value.title.trim(),
      content: scienceData.value.content,
      cover_image: scienceData.value.cover_image,
      status: scienceData.value.status
    }

    // 如果是编辑，需要保留原有的 author 字段
    if (isEdit.value) {
      submitData.author_user_id = scienceData.value.author_user_id
      submitData.author_display = scienceData.value.author_display
    }

    console.log('📤 ' + (isEdit.value ? '更新' : '保存') + '科普:', submitData)

    let result
    if (isEdit.value) {
      result = await api.admin.science.update(scienceData.value.id, submitData)
    } else {
      result = await api.admin.science.create(submitData)
    }

    if (result.success) {
      const successTextMap = {
        'draft': '草稿保存成功！',
        'pending': '提交审核成功！',
        'published': '科普发布成功！',
        'rejected': '已标记为拒绝！'
      }
      ElMessage.success(successTextMap[scienceData.value.status] || '操作成功！')
      router.push('/admin/content/science')
    } else {
      ElMessage.error('操作失败：' + (result.error || '未知错误'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('保存科普失败:', error)
      ElMessage.error('操作失败：' + error.message)
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

// 监听loading状态
watch(() => loading.value, (newLoading) => {
  if (contentEditor.value) {
    contentEditor.value.contentEditable = !newLoading
  }
})

// 页面挂载时初始化
onMounted(async () => {
  const scienceId = route.params.id
  if (scienceId) {
    isEdit.value = true
    await loadScienceDetail(scienceId)
  } else {
    // 确保编辑器正确初始化
    await nextTick()
    if (contentEditor.value) {
      contentEditor.value.innerHTML = ''
      console.log('✅ 新建科普编辑器已初始化')
    }
  }

  // 编辑器挂载后设置属性
  await nextTick()
  if (contentEditor.value) {
    contentEditor.value.contentEditable = !loading.value
    console.log('✅ 编辑器初始化完成，contentEditable:', contentEditor.value.contentEditable)
  }
})
</script>

<style scoped>
.science-editor {
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
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #495057;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.3);
}

.back-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);
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
.content-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.basic-info-section h3,
.content-section h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.science-form {
  margin-top: 16px;
}

/* 封面图片上传 */
.cover-image-upload {
  width: 100%;
}

.cover-preview {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.cover-preview img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cover-actions {
  margin-top: 12px;
}

.cover-uploader {
  width: 100%;
  max-width: 400px;
}

.upload-placeholder {
  width: 100%;
  min-height: 200px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 20px;
}

.upload-placeholder:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
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

.preview-content {
  max-height: 70vh;
  overflow-y: auto;
}

.preview-cover {
  margin-bottom: 20px;
}

.preview-cover img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
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
}
</style>
