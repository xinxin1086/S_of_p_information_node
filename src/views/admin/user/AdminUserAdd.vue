<template>
  <div class="admin-container">
    <h3 class="form-title">新增管理员</h3>
    <el-form :model="form" label-width="100px" class="form-container" :rules="formRules" ref="formRef">
      <!-- 账号（必填，唯一） -->
      <el-form-item label="账号" required prop="account">
        <el-input v-model="form.account" placeholder="请输入登录账号（唯一）" :disabled="isLoading"></el-input>
      </el-form-item>

      <!-- 密码（必填，至少6位） -->
      <el-form-item label="密码" required prop="password">
        <el-input type="password" v-model="form.password" placeholder="请输入密码（至少6位）" :disabled="isLoading"></el-input>
      </el-form-item>

      <!-- 用户名称（必填，唯一） -->
      <el-form-item label="用户名称" required prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名称（唯一）" :disabled="isLoading"></el-input>
      </el-form-item>

      <!-- 电话（必填，后端约束） -->
      <el-form-item label="电话" required prop="phone">
        <el-input v-model="form.phone" placeholder="请输入联系电话（不能为空）" :disabled="isLoading" maxlength="20"></el-input>
      </el-form-item>

      <!-- 邮箱（可选，格式验证） -->
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱（如：xxx@example.com）" :disabled="isLoading"></el-input>
      </el-form-item>

      <!-- 角色（必填） -->
      <el-form-item label="角色" required prop="role">
        <el-select v-model="form.role" placeholder="请选择角色" :disabled="isLoading">
          <el-option label="管理员" value="admin"></el-option>
          <el-option label="普通管理员" value="normal_admin"></el-option>
        </el-select>
      </el-form-item>

      <!-- 头像（可选） -->
      <el-form-item label="头像">
        <el-upload
            class="avatar-uploader"
            action="#"
            :auto-upload="false"
            :on-change="handleAvatarChange"
            :disabled="isLoading"
            accept="image/jpeg,image/png"
        >
          <img v-if="form.avatar" :src="form.avatar" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
        <p class="tip">支持JPG、PNG格式，大小不超过2MB</p>
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <button class="submit-btn" @click="handleSubmit" :disabled="isLoading">提交</button>
        <button class="cancel-btn" @click="handleCancel" :disabled="isLoading">取消</button>
      </el-form-item>
    </el-form>
    <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { uploadImage } from '@/utils/upload.js' // 引入公共上传方法
import { BASE_URL } from '@/config.js'; // 引入公共域名

const router = useRouter()
const formRef = ref(null)

// 表单数据
const form = ref({
  account: '',
  password: '',
  username: '',
  phone: '',
  email: '',
  role: '',
  avatar: '',        // 本地预览的base64
  avatarFile: null  // 选中的文件对象，用于上传
})

// 状态控制
const isLoading = ref(false)
const errorMessage = ref('')

// 表单验证规则
const formRules = reactive({
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 2, max: 20, message: '账号长度2-20字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度6-32字符', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名称', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名称长度2-20字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '电话不能为空', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$|^0\d{2,3}-\d{7,8}$/, message: '请输入正确的手机号或固定电话', trigger: 'blur' }
  ],
  email: [
    { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
})

// 头像本地预览与文件存储
const handleAvatarChange = (uploadFile) => {
  if (uploadFile.size > 2 * 1024 * 1024) {
    errorMessage.value = '文件大小不能超过2MB'
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.avatar = e.target.result
    errorMessage.value = ''
  }
  reader.readAsDataURL(uploadFile.raw)
  form.value.avatarFile = uploadFile.raw // 存储文件对象
}

// 提交新增（先上传图片，再提交表单）
// 提交新增（先上传图片，再提交表单）
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  isLoading.value = true
  errorMessage.value = ''
  try {
    let avatarUrl = ''
    // 若选择了头像，调用公共方法上传
    if (form.value.avatarFile) {
      avatarUrl = await uploadImage(form.value.avatarFile)
      //console.log('【图片上传】图片链接信息：', avatarUrl)
    }

    // 构造新增参数
    const params = {
      table_name: 'admin_info',
      operate_type: 'add',
      kwargs: {
        ...form.value,
        avatar: avatarUrl, // 上传后的图片URL
      }
    }
    delete params.kwargs.avatarFile // 移除临时文件字段

    const result = await axios.post(`${BASE_URL}/api/admin/operate`, params)
    if (result.data.success) {
      alert('新增管理员成功！')
      router.push('/admin/user/admin')
    } else {
      throw new Error(result.data.message || '新增失败')
    }
  } catch (error) {
    errorMessage.value = error.message || error.response?.data?.message || '网络错误'
    console.error('新增失败：', error)
  } finally {
    isLoading.value = false
  }
}


// 取消操作
const handleCancel = () => {
  router.push('/admin/user/admin')
}
</script>

<style scoped>
@import url('@/styles/admin/admin_common.css');
</style>