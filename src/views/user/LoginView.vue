<!-- ./src/views/LoginView.vue -->
<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="header-top">
          <button class="home-btn" @click="goToHome">
            ← 返回首页
          </button>
        </div>
        <h2>汉江垂钓站</h2>
        <p>请登录后继续操作</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="account" class="form-label">账号</label>
          <input
              type="text"
              id="account"
              v-model="account"
              placeholder="请输入账号"
              class="form-input"
              :class="{ 'invalid': accountError }"
              @blur="validateAccount"
              required
          >
          <p class="error-tip" v-if="accountError">{{ accountError }}</p>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">密码</label>
          <input
              type="password"
              id="password"
              v-model="password"
              placeholder="请输入密码"
              class="form-input"
              :class="{ 'invalid': passwordError }"
              @blur="validatePassword"
              required
          >
          <p class="error-tip" v-if="passwordError">{{ passwordError }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">角色</label>
          <div class="role-group">
            <label class="role-item">
              <input type="radio" value="admin" v-model="role" required>
              <span>管理员</span>
            </label>
            <label class="role-item">
              <input type="radio" value="user" v-model="role">
              <span>用户</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label class="remember-item">
            <input type="checkbox" v-model="remember">
            <span>记住账号、密码和角色（公共设备请勿勾选）</span>
          </label>
        </div>

        <p class="global-error" v-if="errorMsg">{{ errorMsg }}</p>

        <button
            type="submit"
            class="login-btn"
            :disabled="isLoading"
        >
          <span v-if="isLoading">登录中...</span>
          <span v-else>登录</span>
        </button>

        <div class="register-link">
          还没有账号？<router-link to="/register">立即注册</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMainStore, useAuthStore } from '@/store/index.js'
import axios from 'axios'
import { BASE_URL } from '@/config.js';

const router = useRouter()
const mainStore = useMainStore()
const authStore = useAuthStore()

// 表单数据（新增remember变量）
const account = ref('')
const password = ref('')
const role = ref('')
const remember = ref(false) // 控制是否记住信息
const isLoading = ref(false)
const accountError = ref('')
const passwordError = ref('')
const errorMsg = ref('')

// 返回首页
const goToHome = () => {
  window.location.href = '/#/'
}

// 角色与API路径映射（核心配置：同一端口，不同路径）
const roleApiMap = {
  admin: '/api/admin/login',           // 管理员API路径
  user: '/api/user/login'              // 用户API路径
}

// 表单验证逻辑
const validateAccount = () => {
  accountError.value = account.value.trim() ? (account.value.length < 3 ? '账号至少3个字符' : '') : '请输入账号'
}
const validatePassword = () => {
  passwordError.value = password.value ? (password.value.length < 6 ? '密码至少6个字符' : '') : '请输入密码'
}

// 存储记住的信息到本地存储（密码用Base64简单编码，非加密）
const saveRememberInfo = () => {
  if (remember.value) {
    // Base64编码密码（仅防明文泄露，生产环境建议用加密算法）
    const encodedPwd = btoa(password.value)
    localStorage.setItem('rememberedAccount', account.value.trim())
    localStorage.setItem('rememberedPwd', encodedPwd)
    localStorage.setItem('rememberedRole', role.value)
  } else {
    // 取消记住时清除存储
    localStorage.removeItem('rememberedAccount')
    localStorage.removeItem('rememberedPwd')
    localStorage.removeItem('rememberedRole')
  }
}

// 读取本地存储的记住信息
const loadRememberInfo = () => {
  const savedAccount = localStorage.getItem('rememberedAccount')
  const savedPwd = localStorage.getItem('rememberedPwd')
  const savedRole = localStorage.getItem('rememberedRole')

  if (savedAccount && savedPwd && savedRole) {
    // Base64解码密码
    const decodedPwd = atob(savedPwd)
    account.value = savedAccount
    password.value = decodedPwd
    role.value = savedRole
    remember.value = true // 同步勾选状态
  }
}

// 登录逻辑
const handleLogin = async () => {
  // 清除本地存储的令牌
  //localStorage.removeItem('user_token')

  validateAccount()
  validatePassword()
  if (accountError.value || passwordError.value || !role.value) {
    errorMsg.value = '请完善登录信息'
    return
  }

  try {
    isLoading.value = true
    errorMsg.value = ''

    // 使用auth store的login方法
    const result = await authStore.login({
      account: account.value.trim(),
      password: password.value,
      role: role.value
    })

    if (result.success) {
      // 登录成功后存储记住的信息
      saveRememberInfo()

      const roleRoutes = {
        admin: '/admin/dashboard',
        user: '/user/dashboard'
      }
      router.push(roleRoutes[role.value] || '/user/dashboard')
      //alert('登录成功！')
    } else {
      errorMsg.value = result.error || '登录失败'
      console.log('【登录失败】后端提示：', errorMsg.value)
    }
  } catch (error) {
    if (error.message.includes('non ISO-8859-1 code point')) {
      errorMsg.value = '令牌包含非法字符（原始令牌不合法）'
    } else if (error.message.includes('timeout')) {
      errorMsg.value = '请求超时（后端未响应，检查端口/服务是否启动）'
    } else if (error.response) {
      errorMsg.value = `登录失败（状态码：${error.response.status}）`
    } else if (error.request) {
      errorMsg.value = `API请求失败（路径：${roleApiMap[role.value]}）`
    } else if (error.response?.status === 404) {
      errorMsg.value = `角色API路径不存在（${roleApiMap[role.value]}）`
    } else {
      errorMsg.value = `登录出错：${error.message}`
    }
    console.error('【登录错误详情】', error)
  } finally {
    isLoading.value = false
  }
}

// 页面加载时自动填充记住的信息
onMounted(() => {
  loadRememberInfo() // 读取记住的信息

  const token = localStorage.getItem('user_token')
  const user = authStore.user
  console.log('【页面加载】本地存储令牌：', token)
  if (token && user) {
    const roleRoutes = {
      admin: '/admin/dashboard',
      user: '/user/dashboard'
    }
    router.push(roleRoutes[user.role] || '/user/dashboard')
  }
})
</script>

<style scoped>
/* 原有样式不变，新增记住选项样式 */
.login-page {
  min-height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;
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
  gap: 5px;
  padding: 8px 16px;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.home-btn:hover {
  background-color: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}

.login-header h2 {
  color: #00b42a;
  margin-bottom: 8px;
  font-size: 24px;
}

.login-header p {
  color: #666;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #00b42a;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 180, 42, 0.1);
}

.form-input.invalid {
  border-color: #f56c6c;
}

.error-tip {
  margin: 5px 0 0;
  color: #f56c6c;
  font-size: 12px;
}

.role-group {
  display: flex;
  gap: 20px;
  padding: 5px 0;
}

.role-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
  cursor: pointer;
}

.role-item input {
  accent-color: #00b42a;
}

/* 新增：记住选项样式 */
.remember-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
}

.remember-item input {
  accent-color: #00b42a;
  width: 16px;
  height: 16px;
}

.global-error {
  color: #f56c6c;
  text-align: center;
  margin: 0 0 15px;
  padding: 8px;
  background-color: #fff5f5;
  border-radius: 4px;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #00b42a;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-btn:hover:not(:disabled) {
  background-color: #00a524;
}

.login-btn:disabled {
  background-color: #86c99c;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.register-link a {
  color: #00b42a;
  text-decoration: none;
  margin-left: 5px;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>