<template>
  <div class="profile-edit">
    <el-page-header @back="$router.go(-1)">
      <template #content>
        <span class="page-header-title">个人资料管理</span>
      </template>
    </el-page-header>

    <div class="profile-content">
      <el-row :gutter="24">
        <!-- 左侧头像上传区域 -->
        <el-col :span="8">
          <el-card class="avatar-card">
            <template #header>
              <span>头像设置</span>
            </template>
            <div class="avatar-section">
              <el-avatar :size="120" :src="userInfo.avatar" fit="cover">
                <el-icon size="60"><User /></el-icon>
              </el-avatar>
              <div class="avatar-actions">
                <el-upload
                  ref="uploadRef"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleAvatarChange"
                  :before-upload="beforeAvatarUpload"
                  accept="image/*"
                >
                  <el-button type="primary" :loading="avatarLoading">
                    <el-icon><Upload /></el-icon>
                    上传头像
                  </el-button>
                </el-upload>
                <el-button v-if="userInfo.avatar" @click="removeAvatar" type="danger" plain>
                  <el-icon><Delete /></el-icon>
                  删除头像
                </el-button>
              </div>
              <div class="avatar-tips">
                <p>支持 jpg、png 格式</p>
                <p>文件大小不超过 2MB</p>
                <p>建议尺寸 200x200 像素</p>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧基本信息编辑区域 -->
        <el-col :span="16">
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <span>基本信息</span>
                <el-button type="primary" @click="saveProfile" :loading="saving">
                  <el-icon><Check /></el-icon>
                  保存修改
                </el-button>
              </div>
            </template>

            <el-form
              ref="profileFormRef"
              :model="userInfo"
              :rules="profileRules"
              label-width="100px"
              class="profile-form"
            >
              <el-form-item label="用户名">
                <el-input v-model="userInfo.username" disabled>
                  <template #append>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="昵称" prop="nickname">
                <el-input
                  v-model="userInfo.nickname"
                  placeholder="请输入昵称"
                  maxlength="50"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="userInfo.gender">
                  <el-radio value="male">男</el-radio>
                  <el-radio value="female">女</el-radio>
                  <el-radio value="other">其他</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="出生日期" prop="birthday">
                <el-date-picker
                  v-model="userInfo.birthday"
                  type="date"
                  placeholder="选择出生日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  :disabled-date="disabledDate"
                />
              </el-form-item>

              <el-form-item label="邮箱" prop="email">
                <el-input
                  v-model="userInfo.email"
                  placeholder="请输入邮箱地址"
                  type="email"
                >
                  <template #append>
                    <el-button v-if="!userInfo.email_verified" @click="verifyEmail" type="primary">
                      验证
                    </el-button>
                    <el-icon v-else color="#00b42a"><CircleCheck /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="手机号" prop="phone">
                <el-input
                  v-model="userInfo.phone"
                  placeholder="请输入手机号码"
                  maxlength="11"
                >
                  <template #append>
                    <el-button v-if="!userInfo.phone_verified" @click="verifyPhone" type="primary">
                      验证
                    </el-button>
                    <el-icon v-else color="#00b42a"><CircleCheck /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="所在地区" prop="region">
                <el-cascader
                  v-model="userInfo.region"
                  :options="regionOptions"
                  placeholder="请选择所在地区"
                  clearable
                  filterable
                />
              </el-form-item>

              <el-form-item label="职业" prop="occupation">
                <el-input
                  v-model="userInfo.occupation"
                  placeholder="请输入职业"
                  maxlength="50"
                />
              </el-form-item>

              <el-form-item label="个人简介" prop="bio">
                <el-input
                  v-model="userInfo.bio"
                  type="textarea"
                  :rows="4"
                  placeholder="介绍一下自己..."
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>

      <!-- 兴趣爱好设置 -->
      <el-card class="interests-card">
        <template #header>
          <span>兴趣爱好</span>
        </template>
        <div class="interests-section">
          <el-checkbox-group v-model="userInfo.interests" class="interests-group">
            <el-checkbox
              v-for="interest in interestOptions"
              :key="interest.value"
              :value="interest.value"
              :label="interest.label"
            />
          </el-checkbox-group>
        </div>
      </el-card>
    </div>

    <!-- 图片裁剪对话框 -->
    <el-dialog
      v-model="cropperVisible"
      title="裁剪头像"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="cropper-container">
        <vue-cropper
          ref="cropperRef"
          :img="cropperImage"
          :output-size="1"
          :output-type="'png'"
          :can-scale="true"
          :auto-crop="true"
          :auto-crop-width="200"
          :auto-crop-height="200"
          :fixed-box="true"
          :can-move="true"
          :can-move-box="true"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cropperVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmCrop">确认裁剪</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  Upload,
  Delete,
  Check,
  Lock,
  CircleCheck
} from '@element-plus/icons-vue'
import { VueCropper } from 'vue-cropper'

defineOptions({ name: "ProfileEditView" })

// 表单引用
const profileFormRef = ref()
const uploadRef = ref()
const cropperRef = ref()

// 状态管理
const saving = ref(false)
const avatarLoading = ref(false)
const cropperVisible = ref(false)
const cropperImage = ref('')

// 用户信息
const userInfo = reactive({
  username: '垂钓爱好者',
  nickname: '江边渔夫',
  avatar: '',
  gender: 'male',
  birthday: '1990-01-01',
  email: 'fisher@example.com',
  email_verified: false,
  phone: '13888888888',
  phone_verified: true,
  region: ['湖北省', '武汉市'],
  occupation: '软件工程师',
  bio: '热爱垂钓，享受大自然的美好时光。',
  interests: ['fishing', 'outdoor']
})

// 表单验证规则
const profileRules = reactive({
  nickname: [
    { min: 2, max: 50, message: '昵称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
})

// 地区选项（示例数据）
const regionOptions = [
  {
    value: '湖北省',
    label: '湖北省',
    children: [
      { value: '武汉市', label: '武汉市' },
      { value: '宜昌市', label: '宜昌市' },
      { value: '襄阳市', label: '襄阳市' }
    ]
  },
  {
    value: '广东省',
    label: '广东省',
    children: [
      { value: '广州市', label: '广州市' },
      { value: '深圳市', label: '深圳市' },
      { value: '珠海市', label: '珠海市' }
    ]
  }
]

// 兴趣爱好选项
const interestOptions = [
  { value: 'fishing', label: '垂钓' },
  { value: 'outdoor', label: '户外活动' },
  { value: 'photography', label: '摄影' },
  { value: 'cooking', label: '烹饪' },
  { value: 'reading', label: '阅读' },
  { value: 'travel', label: '旅行' },
  { value: 'sports', label: '运动' },
  { value: 'music', label: '音乐' }
]

// 禁用未来日期
const disabledDate = (time) => {
  return time.getTime() > Date.now()
}

// 头像上传前检查
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('上传头像只能是图片格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传头像大小不能超过 2MB!')
    return false
  }
  return true
}

// 处理头像选择
const handleAvatarChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    cropperImage.value = e.target.result
    cropperVisible.value = true
  }
  reader.readAsDataURL(file.raw)
}

// 确认裁剪
const confirmCrop = () => {
  cropperRef.value.getCropData((data) => {
    userInfo.avatar = data
    cropperVisible.value = false
    ElMessage.success('头像已更新，请点击保存修改')
  })
}

// 删除头像
const removeAvatar = () => {
  ElMessageBox.confirm('确定要删除头像吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userInfo.avatar = ''
    ElMessage.success('头像已删除')
  })
}

// 验证邮箱
const verifyEmail = async () => {
  try {
    // 这里应该调用实际的邮箱验证API
    ElMessage.info('验证邮件已发送，请检查您的邮箱')
  } catch (error) {
    ElMessage.error('发送验证邮件失败')
  }
}

// 验证手机
const verifyPhone = async () => {
  try {
    // 这里应该调用实际的手机验证API
    ElMessage.info('验证短信已发送，请检查您的手机')
  } catch (error) {
    ElMessage.error('发送验证短信失败')
  }
}

// 保存个人资料
const saveProfile = async () => {
  try {
    // 表单验证
    await profileFormRef.value.validate()

    saving.value = true

    // 这里应该调用实际的保存API
    // await userApi.updateProfile(userInfo)

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('个人资料保存成功')
  } catch (error) {
    if (error.message) {
      ElMessage.error('保存失败：' + error.message)
    }
  } finally {
    saving.value = false
  }
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    // 这里应该调用实际的API
    // const response = await userApi.getUserInfo()
    // Object.assign(userInfo, response.data)

    // 模拟数据
    console.log('获取用户信息...')
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-edit {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header-title {
  font-size: 18px;
  font-weight: 500;
}

.profile-content {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.avatar-card {
  height: fit-content;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.avatar-tips {
  text-align: center;
  color: #666;
  font-size: 12px;
  line-height: 1.5;
}

.avatar-tips p {
  margin: 2px 0;
}

.info-card {
  height: fit-content;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-form {
  max-width: 600px;
}

.interests-card {
  margin-top: 20px;
}

.interests-section {
  max-width: 800px;
}

.interests-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.cropper-container {
  width: 100%;
  height: 400px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .profile-edit {
    padding: 16px;
  }

  .el-col {
    width: 100% !important;
  }

  .profile-form {
    max-width: 100%;
  }

  .interests-group {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>

<style>
/* 引入 vue-cropper 样式 */
@import 'vue-cropper/dist/index.css';
</style>