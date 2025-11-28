<!-- ./src/views/RegisterView.vue -->
<template>
  <div class="register-container">
    <div class="header-top">
      <button class="home-btn" @click="goToHome">
        ← 返回首页
      </button>
    </div>
    <h2>用户注册</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-item">
        <i class="fa fa-user"></i>
        <input type="text" v-model="form.username" placeholder="请输入用户名" required>
      </div>
      <div class="form-item">
        <i class="fa fa-phone"></i>
        <input type="tel" v-model="form.phone" placeholder="请输入手机号" pattern="^1[3-9]\d{9}$" required>
      </div>
      <div class="form-item">
        <i class="fa fa-lock"></i>
        <input type="password" v-model="form.password" placeholder="请输入密码" required>
      </div>
      <div class="form-item">
        <i class="fa fa-lock"></i>
        <input type="password" v-model="form.confirmPwd" placeholder="请确认密码" required>
      </div>
      <!-- 隐藏角色选择，默认为普通用户 -->
      <input type="hidden" v-model="form.role" value="user">
      <button type="submit" class="register-btn">注册</button>
    </form>
    <div class="login-link">
      已有账号？<router-link to="/login">登录</router-link>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "RegisterView" })
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = ref({
  username: '',
  phone: '',
  password: '',
  confirmPwd: '',
  role: 'user'  // 默认为普通用户
})

// 返回首页
const goToHome = () => {
  window.location.href = '/#/'
}

const handleRegister = async () => {
  // 表单完整性验证
  if (!form.value.username || !form.value.phone || !form.value.password || !form.value.confirmPwd) {
    alert('请填写完整信息')
    return
  }

  // 密码一致性验证
  if (form.value.password !== form.value.confirmPwd) {
    alert('两次输入的密码不一致，请重新输入')
    return
  }

  try {
    // 调用注册API（使用用户注册接口）
    const { BASE_URL } = await import('@/config.js')
    const response = await fetch(`${BASE_URL}/api/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: form.value.username,
        phone: form.value.phone,
        password: form.value.password
      })
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        alert('注册成功！即将跳转至登录页')
        router.push('/login')
      } else {
        alert(data.message || '注册失败')
      }
    } else {
      alert('注册失败，请稍后重试')
    }
  } catch (error) {
    console.error('注册错误:', error)
    alert('网络错误，请稍后重试')
  }
}
</script>

<style scoped>
.register-container {
  width: 420px;
  margin: 80px auto;
  padding: 30px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background-color: #fff;
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

h2 {
  text-align: center;
  margin-bottom: 28px;
  font-size: 24px;
  color: #333;
  font-weight: 600;
}

.form-item {
  margin-bottom: 20px;
}

.form-item i {
  margin-right: 12px;
  color: #6b7280;
  font-size: 16px;
}

.form-item input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  transition: border-color 0.2s;
}

.form-item input:focus {
  border-color: #2563eb;
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.role-label {
  display: block;
  margin-bottom: 10px;
  color: #4b5563;
  font-size: 14px;
  font-weight: 500;
}

.radio-group {
  display: flex;
  gap: 32px;
  align-items: center;
  padding: 8px 0;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #4b5563;
  font-size: 14px;
}

.radio-item input {
  width: auto;
  accent-color: #2563eb;
}

.register-btn {
  width: 100%;
  padding: 14px;
  background-color: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.register-btn:hover {
  background-color: #1d4ed8;
}

.login-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #6b7280;
}

.login-link a {
  color: #2563eb;
  text-decoration: none;
  margin-left: 4px;
  transition: color 0.2s;
}

.login-link a:hover {
  color: #1d4ed8;
  text-decoration: underline;
}
</style>