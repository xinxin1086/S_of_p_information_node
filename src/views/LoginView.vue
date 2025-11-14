<template>
  <div class="login-page">
    <!-- 模板部分完全不变，保留原有样式和结构 -->
    <div class="login-card">
      <div class="login-header">
        <h2>助农扶贫系统</h2>
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
              <input type="radio" value="farmer" v-model="role">
              <span>农户</span>
            </label>
            <label class="role-item">
              <input type="radio" value="visitor" v-model="role">
              <span>访客</span>
            </label>
          </div>
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
import { useMainStore } from '@/store'
import axios from 'axios'

const router = useRouter()
const store = useMainStore()

// 表单数据、验证逻辑保留不变
const account = ref('')
const password = ref('')
const role = ref('')
const isLoading = ref(false)
const accountError = ref('')
const passwordError = ref('')
const errorMsg = ref('')

const validateAccount = () => {
  accountError.value = account.value.trim() ? (account.value.length < 3 ? '账号至少3个字符' : '') : '请输入账号'
}
const validatePassword = () => {
  passwordError.value = password.value ? (password.value.length < 6 ? '密码至少6个字符' : '') : '请输入密码'
}

//令牌处理
const handleLogin = async () => {
  //清除残留令牌
  localStorage.removeItem('user_token')

  validateAccount()
  validatePassword()
  if (accountError.value || passwordError.value || !role.value) {
    errorMsg.value = '请完善登录信息'
    return
  }

  try {
    isLoading.value = true
    errorMsg.value = ''
    const apiUrl = 'http://localhost:5000/api/admin/login'
    console.log('【登录请求】地址（检查端口）：', apiUrl)
    console.log('【登录参数】', {
      account: account.value.trim(),
      role: role.value
    })

    // 登录请求：仅传递原始参数，不做任何额外处理
    const response = await axios.post(
        apiUrl,
        {
          account: account.value.trim(),
          password: password.value,
          role: role.value
        },
        {
          timeout: 5000,
          responseType: 'json',
          headers: {
            'Content-Type': 'application/json; charset=utf-8' // 仅保留必要的Content-Type
          }
        }
    )

    if (response.data.success === true) {
      const { token, user } = response.data.data
      console.log('【后端返回原始令牌】', token) // 查看令牌是否为标准JWT格式

      // 核心：直接存储原始令牌（不做任何替换、净化、编码）
      localStorage.removeItem('user_token')
      localStorage.setItem('user_token', token)

      // 存储用户信息+跳转逻辑不变
      store.login({
        id: user.id,
        account: user.account,
        role: role.value
      })

      if (role.value === 'admin') {
        router.push('/admin/dashboard')
      } else if (role.value === 'farmer') {
        router.push('/farmer/dashboard')
      } else {
        router.push('/home')
      }
      alert('登录成功！')
    } else {
      errorMsg.value = response.data.message || '登录失败'
      console.log('【登录失败】后端提示：', errorMsg.value)
    }
  } catch (error) {
    // 精准错误反馈，帮助排查端口/网络问题
    if (error.message.includes('non ISO-8859-1 code point')) {
      errorMsg.value = '令牌包含非法字符（原始令牌不合法）'
      console.log('【错误】原始令牌含非法字符：', localStorage.getItem('user_token'))
    } else if (error.message.includes('timeout')) {
      errorMsg.value = '请求超时（后端未响应，检查端口/服务是否启动）'
    } else if (error.response) {
      errorMsg.value = `登录失败（状态码：${error.response.status}）`
    } else if (error.request) {
      errorMsg.value = '网络连接失败（检查后端端口是否为5000）'
    } else {
      errorMsg.value = `登录出错：${error.message}`
    }
    console.error('【登录错误详情】', error)
  } finally {
    isLoading.value = false
  }
}

// 页面加载逻辑不变（仅恢复登录状态，不处理令牌）
onMounted(() => {
  const token = localStorage.getItem('user_token')
  const user = store.user
  console.log('【页面加载】本地存储令牌：', token)
  if (token && user) {
    if (user.role === 'admin') {
      router.push('/admin/dashboard')
    } else if (user.role === 'farmer') {
      router.push('/farmer/dashboard')
    }
  }
})
</script>

<style scoped>
/* 样式部分完全不变，保留原有样式 */
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