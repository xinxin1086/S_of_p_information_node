<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="header-top">
            <button class="home-btn" @click="goToHome" title="返回社区首页">
              <el-icon><ArrowLeft /></el-icon>
              返回社区首页
            </button>
          </div>
          <h2>社区交流平台</h2>
          <p>请登录后继续操作</p>
        </div>

        <el-form @submit.prevent="handleLogin" :model="loginForm" :rules="rules" ref="loginFormRef">
          <el-form-item prop="account">
            <el-input
              v-model="loginForm.account"
              placeholder="请输入账号"
              size="large"
              prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item prop="role">
            <el-radio-group v-model="loginForm.role" size="large">
              <el-radio value="admin">管理员</el-radio>
              <el-radio value="user">用户</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="rememberMe">记住账号密码</el-checkbox>
          </el-form-item>

          <el-form-item v-if="errorMessage">
            <el-alert type="error" :title="errorMessage" show-icon />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              style="width: 100%"
              :loading="loading"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>

          <div class="register-link">
            还没有账号？
            <router-link to="/register">立即注册</router-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 表单数据
const loginForm = reactive({
  account: '',
  password: '',
  role: 'user'
})

// 表单验证规则
const rules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, message: '账号至少3个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

const loginFormRef = ref()
const loading = ref(false)
const errorMessage = ref('')
const rememberMe = ref(false)

// 返回首页
const goToHome = () => {
  router.push({ name: 'home' })
}

// 角色路由映射
const roleRoutes = {
  admin: '/admin/dashboard',
  user: '/user/dashboard'
}

// 登录处理
const handleLogin = async () => {
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    loading.value = true
    errorMessage.value = ''

    // 用户和管理员使用统一的登录接口
    // 后端根据账号自动识别用户类型，返回 user_type 字段 ('user' | 'admin')
    // 登录接口: POST /api/user/auth/login

    // 调用登录API
    await authStore.login({
      account: loginForm.account,
      password: loginForm.password,
      role: loginForm.role // UI层保留 role 字段用于界面显示，但后端不使用此参数
    })

    ElMessage.success('登录成功')

    // 保存记住的账号信息
    if (rememberMe.value) {
      localStorage.setItem('remembered_account', loginForm.account)
      localStorage.setItem('remembered_role', loginForm.role)
    } else {
      localStorage.removeItem('remembered_account')
      localStorage.removeItem('remembered_role')
    }

    // 根据后端返回的实际用户类型跳转
    const currentRole = authStore.currentRole
    let targetRoute = '/user/dashboard' // 默认路由

    if (currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN') {
      targetRoute = '/admin/dashboard'
    } else {
      targetRoute = '/user/dashboard'
    }

    router.push(targetRoute)

  } catch (error) {
    console.error('登录错误:', error)

    // 根据错误类型显示不同的错误信息
    if (error.code === 'NETWORK_ERROR') {
      errorMessage.value = '网络连接失败，请检查网络设置'
    } else if (error.isPermissionError) {
      errorMessage.value = '登录失败：权限不足'
    } else if (error.isValidationError) {
      errorMessage.value = '登录失败：输入信息有误'
    } else {
      errorMessage.value = error.message || '登录失败，请检查账号密码和角色'
    }
  } finally {
    loading.value = false
  }
}

// 加载记住的账号信息
onMounted(() => {
  const rememberedAccount = localStorage.getItem('remembered_account')
  const rememberedRole = localStorage.getItem('remembered_role')

  if (rememberedAccount) {
    loginForm.account = rememberedAccount
    rememberMe.value = true
  }

  if (rememberedRole) {
    loginForm.role = rememberedRole
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.header-top {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
}

.home-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.home-btn:hover {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.3);
}

.home-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);
}

.login-header h2 {
  color: #333;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.login-header p {
  color: #666;
  font-size: 14px;
}

.register-link {
  text-align: center;
  color: #666;
  font-size: 14px;
}

.register-link a {
  color: #409eff;
  text-decoration: none;
  margin-left: 5px;
}

.register-link a:hover {
  text-decoration: underline;
}

:deep(.el-radio-group) {
  display: flex;
  justify-content: space-around;
  width: 100%;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-button) {
  border-radius: 8px;
  height: 48px;
  font-size: 16px;
}

@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
  }

  .login-header h2 {
    font-size: 24px;
  }
}
</style>