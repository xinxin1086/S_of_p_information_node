<template>
  <div class="admin-container">
    <h3 class="form-title">编辑管理员</h3>
    <el-form
        :model="form"
        label-width="100px"
        class="form-container"
        :rules="formRules"
        ref="formRef"
    >
      <el-form-item label="账号" required prop="account">
        <el-input v-model="form.account" placeholder="请输入账号" disabled></el-input>
        <p class="tip">账号不可修改</p>
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input
            type="password"
            v-model="form.password"
            placeholder="不输入则保持原密码"
            :disabled="isLoading"
            maxlength="32"
        ></el-input>
        <p class="tip">密码长度6-32字符，为空则不更新</p>
      </el-form-item>

      <el-form-item label="姓名" required prop="username">
        <el-input
            v-model="form.username"
            placeholder="请输入用户名称（唯一）"
            :disabled="isLoading"
            maxlength="20"
        ></el-input>
      </el-form-item>

      <el-form-item label="电话" required prop="phone">
        <el-input
            v-model="form.phone"
            placeholder="请输入联系电话（不能为空）"
            :disabled="isLoading"
            maxlength="20"
        ></el-input>
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input
            v-model="form.email"
            placeholder="请输入邮箱（如：xxx@example.com）"
            :disabled="isLoading"
        ></el-input>
      </el-form-item>

      <el-form-item label="角色" required prop="role">
        <el-select v-model="form.role" placeholder="请选择角色" :disabled="isLoading">
          <el-option label="管理员" value="admin"></el-option>
          <el-option label="普通管理员" value="normal_admin"></el-option>
        </el-select>
      </el-form-item>

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
        <p class="tip">支持JPG、PNG格式，大小不超过2MB；不选择则保持原头像</p>
      </el-form-item>

      <el-form-item>
        <button class="submit-btn" @click="handleSubmit" :disabled="isLoading">提交修改</button>
        <button class="cancel-btn" @click="handleCancel" :disabled="isLoading">取消</button>
      </el-form-item>
    </el-form>
    <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const adminId = route.query.id // 从路由参数获取管理员ID
const formRef = ref(null) // 表单引用，用于验证

// 表单数据（与后端模型字段对应）
const form = ref({
  account: '',
  password: '',
  username: '',
  phone: '',
  email: '',
  role: '',
  avatar: ''
})

// 状态控制
const isLoading = ref(false)
const errorMessage = ref('')
const isLoaded = ref(false) // 标记数据是否加载完成

// 表单验证规则（与新增页一致，适配后端字段约束）
const formRules = reactive({
  account: [
    { required: true, message: '账号不能为空', trigger: 'blur' }
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
  ],
  password: [
    { min: 6, max: 32, message: '密码长度6-32字符（为空则不更新）', trigger: 'blur' }
  ]
})

// 头像上传处理（格式+大小验证）
const handleAvatarChange = (uploadFile) => {
  // 验证文件大小（≤2MB）
  if (uploadFile.size > 2 * 1024 * 1024) {
    errorMessage.value = '文件大小不能超过2MB'
    return
  }
  // 验证文件类型（仅JPG/PNG）
  const fileType = uploadFile.raw.type
  if (!['image/jpeg', 'image/png'].includes(fileType)) {
    errorMessage.value = '仅支持JPG、PNG格式图片'
    return
  }
  // 读取文件为base64预览
  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.avatar = e.target.result
    errorMessage.value = ''
  }
  reader.readAsDataURL(uploadFile.raw)
}

// 加载原有管理员数据（适配后端query接口）
const loadAdminData = async () => {
  if (!adminId) {
    errorMessage.value = '缺少管理员ID，无法编辑'
    return
  }

  isLoading.value = true
  try {
    const params = {
      table_name: 'admin_info',
      operate_type: 'query',
      kwargs: { id: adminId },
      page: 1,
      size: 1
    }
    const result = await axios.post('http://localhost:5000/api/admin/operate', params)

    if (result.data.success && result.data.data.items.length > 0) {
      const adminData = result.data.data.items[0]
      // 回显数据（密码清空，避免泄露）
      form.value = {
        ...adminData,
        password: '' // 密码不回显，空则不更新
      }
      isLoaded.value = true
      errorMessage.value = ''
    } else {
      throw new Error('未查询到该管理员信息，可能已被删除')
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.message || '数据加载失败'
    console.error('加载管理员数据失败：', error)
  } finally {
    isLoading.value = false
  }
}

// 提交修改（对接后端update接口）
const handleSubmit = async () => {
  if (!isLoaded.value) return

  // 先执行表单验证（通过后再提交）
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  isLoading.value = true
  errorMessage.value = ''
  try {
    // 构造更新参数：空密码不更新，移除ID和不可修改字段
    const updateKwargs = { ...form.value }
    if (!updateKwargs.password) delete updateKwargs.password // 空密码不更新
    delete updateKwargs.id // ID禁止修改
    delete updateKwargs.account // 账号禁止修改

    const params = {
      table_name: 'admin_info',
      operate_type: 'update',
      query_kwargs: { id: adminId }, // 目标管理员ID
      update_kwargs: updateKwargs // 待更新字段
    }

    const result = await axios.post('http://localhost:5000/api/admin/operate', params)
    if (result.data.success) {
      alert('修改管理员信息成功！')
      router.push('/admin/user/admin') // 跳回列表页
    } else {
      throw new Error(result.data.message || '修改失败')
    }
  } catch (error) {
    // 捕获后端具体错误（如用户名重复、电话格式错误等）
    errorMessage.value = error.response?.data?.message || error.message || '网络错误'
    console.error('修改失败：', error)
  } finally {
    isLoading.value = false
  }
}

// 取消操作
const handleCancel = () => {
  router.push('/admin/user/admin')
}

// 页面加载时自动加载数据
onMounted(() => {
  loadAdminData()
})
</script>

<style scoped>
/* 引入公共样式，与新增页保持统一 */
@import url('@/styles/admin/admin_common.css');
</style>