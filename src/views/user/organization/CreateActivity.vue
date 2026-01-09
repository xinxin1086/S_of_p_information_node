<template>
  <div class="create-activity">
    <div class="page-header">
      <h1>创建活动</h1>
      <p>发布您的精彩活动，与更多钓友分享</p>
    </div>

    <el-card class="form-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        label-position="top"
      >
        <el-row :gutter="30">
          <!-- 基本信息 -->
          <el-col :lg="16" :md="16" :sm="24">
            <el-form-item label="活动标题" prop="title">
              <el-input
                v-model="form.title"
                placeholder="请输入活动标题，建议简洁明了"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="活动类型" prop="type">
              <el-select
                v-model="form.type"
                placeholder="请选择活动类型"
                style="width: 100%"
              >
                <el-option label="科普讲座" value="science_lecture" />
                <el-option label="钓鱼比赛" value="fishing_competition" />
                <el-option label="生态游览" value="ecology_tour" />
                <el-option label="技能培训" value="workshop" />
                <el-option label="展览活动" value="exhibition" />
                <el-option label="其他活动" value="other" />
              </el-select>
            </el-form-item>

            <el-form-item label="活动描述" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="3"
                placeholder="请简要描述活动内容，将显示在活动列表中"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="活动详情" prop="content">
              <el-input
                v-model="form.content"
                type="textarea"
                :rows="8"
                placeholder="请详细描述活动内容、流程、亮点等信息"
                maxlength="2000"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="参与要求" prop="requirements">
              <el-input
                v-model="form.requirements"
                type="textarea"
                :rows="4"
                placeholder="请说明参与活动的要求（年龄、技能、装备等）"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="联系方式" prop="contact_info">
              <el-input
                v-model="form.contact_info"
                placeholder="请输入联系电话或其他联系方式"
                maxlength="100"
              />
            </el-form-item>
          </el-col>

          <!-- 时间地点设置 -->
          <el-col :lg="8" :md="8" :sm="24">
            <el-form-item label="活动地点" prop="location">
              <el-input
                v-model="form.location"
                placeholder="请输入具体活动地点"
                maxlength="100"
              />
            </el-form-item>

            <el-form-item label="开始时间" prop="start_time">
              <el-date-picker
                v-model="form.start_time"
                type="datetime"
                placeholder="选择开始时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
                :disabled-date="disabledDate"
              />
            </el-form-item>

            <el-form-item label="结束时间" prop="end_time">
              <el-date-picker
                v-model="form.end_time"
                type="datetime"
                placeholder="选择结束时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
                :disabled-date="disabledEndDate"
              />
            </el-form-item>

            <el-form-item label="参与人数" prop="max_participants">
              <el-input-number
                v-model="form.max_participants"
                :min="1"
                :max="1000"
                placeholder="不限"
                style="width: 100%"
              />
              <div class="form-tip">设置活动最大参与人数，留空表示不限制</div>
            </el-form-item>

            <el-form-item label="活动标签">
              <el-select
                v-model="form.tags"
                multiple
                filterable
                allow-create
                placeholder="选择或创建标签"
                style="width: 100%"
                :max-limit="5"
              >
                <el-option
                  v-for="tag in tagOptions"
                  :key="tag"
                  :label="tag"
                  :value="tag"
                />
              </el-select>
              <div class="form-tip">最多添加5个标签，回车确认</div>
            </el-form-item>

            <el-form-item label="活动图片">
              <el-upload
                v-model:file-list="fileList"
                :action="uploadUrl"
                :headers="uploadHeaders"
                :before-upload="beforeUpload"
                :on-success="handleUploadSuccess"
                :on-remove="handleRemove"
                :limit="5"
                list-type="picture-card"
                accept="image/*"
              >
                <el-icon><Plus /></el-icon>
                <template #tip>
                  <div class="upload-tip">
                    最多上传5张图片，每张不超过2MB
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 操作按钮 -->
        <el-form-item class="form-actions">
          <el-button @click="handleCancel">取消</el-button>
          <el-button
            type="primary"
            @click="handleSaveDraft"
            :loading="submitting"
          >
            保存草稿
          </el-button>
          <el-button
            type="success"
            @click="handlePublish"
            :loading="submitting"
          >
            立即发布
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

import { useActivityStore } from '@/stores/activity'
import { tokenManager } from '@/utils/tokenManager'

const router = useRouter()
const activityStore = useActivityStore()

const formRef = ref()
const submitting = ref(false)
const fileList = ref([])

// 表单数据
const form = reactive({
  title: '',
  type: '',
  description: '',
  content: '',
  requirements: '',
  contact_info: '',
  location: '',
  start_time: '',
  end_time: '',
  max_participants: null,
  tags: [],
  images: []
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入活动标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度应在5-100个字符之间', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择活动类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入活动描述', trigger: 'blur' },
    { min: 10, max: 200, message: '描述长度应在10-200个字符之间', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入活动详情', trigger: 'blur' },
    { min: 20, max: 2000, message: '详情长度应在20-2000个字符之间', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入活动地点', trigger: 'blur' }
  ],
  start_time: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  end_time: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  max_participants: [
    { required: true, message: '请设置参与人数', trigger: 'blur' }
  ]
}

// 标签选项
const tagOptions = [
  '新手友好',
  '亲子活动',
  '专业赛事',
  '休闲娱乐',
  '技术培训',
  '环保活动',
  '文化交流',
  '美食分享'
]

// 上传相关配置
const uploadUrl = computed(() => {
  // 这里应该配置实际的上传接口
  return '/api/upload/images'
})

const uploadHeaders = computed(() => {
  const token = tokenManager.getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
})

// 日期限制
const disabledDate = (time) => {
  // 不能选择今天之前的日期
  return time.getTime() < Date.now() - 8.64e7
}

const disabledEndDate = (time) => {
  if (!form.start_time) {
    return time.getTime() < Date.now() - 8.64e7
  }
  return time.getTime() < new Date(form.start_time).getTime()
}

// 上传前验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB!')
    return false
  }
  return true
}

// 上传成功
const handleUploadSuccess = (response, file) => {
  if (response.success) {
    form.images.push(response.data.url)
  } else {
    ElMessage.error('图片上传失败')
  }
}

// 移除图片
const handleRemove = (file, fileList) => {
  form.images = fileList.map(item => item.url || item.response?.data?.url).filter(Boolean)
}

// 保存草稿
const handleSaveDraft = async () => {
  await submitForm('draft')
}

// 发布活动
const handlePublish = async () => {
  await submitForm('published')
}

// 提交表单
const submitForm = async (status) => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 验证时间逻辑
    if (new Date(form.end_time) <= new Date(form.start_time)) {
      ElMessage.error('结束时间必须晚于开始时间')
      return
    }

    submitting.value = true

    const activityData = {
      ...form,
      status,
      tags: form.tags.join(',')
    }

    const result = await activityStore.createActivity(activityData)

    if (result.success) {
      ElMessage.success(status === 'draft' ? '草稿保存成功' : '活动发布成功')
      router.push('/user/weave/my-activities')
    } else {
      ElMessage.error(result.error || '操作失败')
    }
  } catch (error) {
    if (error.message) {
      ElMessage.error('请完善表单信息')
    }
  } finally {
    submitting.value = false
  }
}

// 取消创建
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定要取消创建活动吗？未保存的内容将丢失', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    router.go(-1)
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.create-activity {
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
}

.page-header p {
  color: #606266;
  font-size: 16px;
}

.form-card {
  margin-bottom: 40px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.4;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  text-align: center;
}

.form-actions {
  margin-top: 40px;
  text-align: center;
}

.form-actions .el-button {
  margin: 0 10px;
  min-width: 120px;
}

@media (max-width: 768px) {
  .create-activity {
    padding: 15px;
  }

  .page-header {
    margin-bottom: 20px;
  }

  .form-actions {
    text-align: stretch;
  }

  .form-actions .el-button {
    margin: 5px 0;
    width: 100%;
  }
}
</style>
