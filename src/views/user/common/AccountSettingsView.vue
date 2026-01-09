<template>
  <div class="account-settings">
    <el-page-header @back="$router.go(-1)">
      <template #content>
        <span class="page-header-title">账户设置</span>
      </template>
    </el-page-header>

    <div class="settings-content">
      <el-tabs v-model="activeTab" class="settings-tabs">
        <!-- 密码修改标签页 -->
        <el-tab-pane label="密码修改" name="password">
          <el-card class="password-card">
            <el-form
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              label-width="120px"
              class="password-form"
            >
              <el-form-item label="当前密码" prop="currentPassword">
                <el-input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  placeholder="请输入当前密码"
                  show-password
                />
              </el-form-item>

              <el-form-item label="新密码" prop="newPassword">
                <el-input
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="请输入新密码"
                  show-password
                />
                <div class="password-tips">
                  <p>密码要求：</p>
                  <ul>
                    <li>长度不少于8位</li>
                    <li>包含字母和数字</li>
                    <li>建议包含特殊字符</li>
                  </ul>
                </div>
              </el-form-item>

              <el-form-item label="确认新密码" prop="confirmPassword">
                <el-input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  show-password
                />
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  @click="changePassword"
                  :loading="passwordLoading"
                >
                  <el-icon><Lock /></el-icon>
                  修改密码
                </el-button>
                <el-button @click="resetPasswordForm">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>

        <!-- 账户安全标签页 -->
        <el-tab-pane label="账户安全" name="security">
          <el-card class="security-card">
            <div class="security-section">
              <h3>双重验证</h3>
              <el-form label-width="200px">
                <el-form-item label="邮箱验证">
                  <div class="verification-status">
                    <span :class="securitySettings.emailVerified ? 'verified' : 'unverified'">
                      {{ securitySettings.emailVerified ? '已验证' : '未验证' }}
                    </span>
                    <el-button
                      v-if="!securitySettings.emailVerified"
                      type="primary"
                      size="small"
                      @click="verifyEmail"
                    >
                      立即验证
                    </el-button>
                  </div>
                </el-form-item>

                <el-form-item label="手机验证">
                  <div class="verification-status">
                    <span :class="securitySettings.phoneVerified ? 'verified' : 'unverified'">
                      {{ securitySettings.phoneVerified ? '已验证' : '未验证' }}
                    </span>
                    <el-button
                      v-if="!securitySettings.phoneVerified"
                      type="primary"
                      size="small"
                      @click="verifyPhone"
                    >
                      立即验证
                    </el-button>
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </el-tab-pane>

        <!-- 账户注销标签页 -->
        <el-tab-pane label="账户注销" name="deactivate">
          <el-card class="deactivate-card">
            <el-alert
              title="注意：账户注销是不可逆的操作"
              type="warning"
              description="注销账户后，您的所有数据将被永久删除，包括但不限于：个人信息、发布的内容、评论、预约记录等。请谨慎操作！"
              :closable="false"
              show-icon
            />

            <div class="deactivate-content">
              <h3>注销前请注意：</h3>
              <ul class="deactivate-warning">
                <li>账户注销后无法恢复，请谨慎操作</li>
                <li>您的所有数据将被永久删除</li>
                <li>无法接收任何通知或消息</li>
                <li>无法恢复已发布的内容</li>
                <li>手机号和邮箱可以重新注册使用</li>
              </ul>

              <el-form
                ref="deactivateFormRef"
                :model="deactivateForm"
                :rules="deactivateRules"
                label-width="120px"
                class="deactivate-form"
              >
                <el-form-item label="注销原因" prop="reason">
                  <el-select v-model="deactivateForm.reason" placeholder="请选择注销原因">
                    <el-option label="不再需要使用" value="no_longer_needed" />
                    <el-option label="隐私考虑" value="privacy" />
                    <el-option label="换用其他平台" value="other_platform" />
                    <el-option label="使用体验不佳" value="poor_experience" />
                    <el-option label="其他原因" value="other" />
                  </el-select>
                </el-form-item>

                <el-form-item
                  v-if="deactivateForm.reason === 'other'"
                  label="具体原因"
                  prop="otherReason"
                >
                  <el-input
                    v-model="deactivateForm.otherReason"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入具体原因"
                  />
                </el-form-item>

                <el-form-item label="确认密码" prop="password">
                  <el-input
                    v-model="deactivateForm.password"
                    type="password"
                    placeholder="请输入当前密码以确认身份"
                    show-password
                  />
                </el-form-item>

                <el-form-item label="确认操作" prop="confirmed">
                  <el-checkbox v-model="deactivateForm.confirmed">
                    我已了解并同意以上所有风险，确认注销账户
                  </el-checkbox>
                </el-form-item>

                <el-form-item>
                  <el-button
                    type="danger"
                    @click="deactivateAccount"
                    :loading="deactivateLoading"
                    :disabled="!deactivateForm.confirmed"
                  >
                    <el-icon><Delete /></el-icon>
                    确认注销账户
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import {
  Lock,
  Delete
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, reactive, onMounted } from 'vue'

import { userApi } from '@/api'

defineOptions({ name: "AccountSettingsView" })

// 表单引用
const passwordFormRef = ref()
const deactivateFormRef = ref()

// 当前激活的标签页
const activeTab = ref('password')

// 加载状态
const passwordLoading = ref(false)
const deactivateLoading = ref(false)

// 密码修改表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码修改验证规则
const passwordRules = reactive({
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度不少于8位', trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
      message: '密码必须包含字母和数字',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 账户安全设置
const securitySettings = reactive({
  emailVerified: true,
  phoneVerified: false
})

// 账户注销表单
const deactivateForm = reactive({
  reason: '',
  otherReason: '',
  password: '',
  confirmed: false
})

// 账户注销验证规则
const deactivateRules = reactive({
  reason: [
    { required: true, message: '请选择注销原因', trigger: 'change' }
  ],
  otherReason: [
    {
      required: true,
      message: '请输入具体原因',
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (deactivateForm.reason === 'other' && !value) {
          callback(new Error('请输入具体原因'))
        } else {
          callback()
        }
      }
    }
  ],
  password: [
    { required: true, message: '请输入密码以确认身份', trigger: 'blur' }
  ],
  confirmed: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请确认已了解所有风险'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
})

// 修改密码
const changePassword = async () => {
  try {
    await passwordFormRef.value.validate()

    passwordLoading.value = true

    // 调用真实的API
    await userApi.changePassword({
      current_password: passwordForm.currentPassword,
      new_password: passwordForm.newPassword
    })

    ElMessage.success('密码修改成功')
    resetPasswordForm()
  } catch (error) {
    if (error.message) {
      ElMessage.error('密码修改失败：' + error.message)
    } else {
      ElMessage.error('密码修改失败，请检查当前密码是否正确')
    }
  } finally {
    passwordLoading.value = false
  }
}

// 重置密码表单
const resetPasswordForm = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.clearValidate()
}

// 验证邮箱
const verifyEmail = async () => {
  try {
    await userApi.sendEmailVerification()
    ElMessage.success('验证邮件已发送，请检查您的邮箱')
    securitySettings.emailVerified = true
  } catch (error) {
    ElMessage.error('发送验证邮件失败：' + (error.message || '未知错误'))
  }
}

// 验证手机
const verifyPhone = async () => {
  try {
    await userApi.sendPhoneVerification()
    ElMessage.success('验证短信已发送，请检查您的手机')
    securitySettings.phoneVerified = true
  } catch (error) {
    ElMessage.error('发送验证短信失败：' + (error.message || '未知错误'))
  }
}

// 注销账户
const deactivateAccount = async () => {
  try {
    await deactivateFormRef.value.validate()

    await ElMessageBox.confirm(
      '账户注销后将无法恢复，确定要继续吗？',
      '最后确认',
      {
        confirmButtonText: '确定注销',
        cancelButtonText: '取消',
        type: 'error',
        dangerouslyUseHTMLString: true
      }
    )

    deactivateLoading.value = true

    // 调用真实的API
    await userApi.deactivateAccount({
      reason: deactivateForm.reason,
      other_reason: deactivateForm.otherReason,
      password: deactivateForm.password
    })

    ElMessage.success('账户注销申请已提交，将在24小时内处理完成')

    // 这里应该跳转到注销成功页面或登录页面
    // router.push('/login')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('账户注销失败：' + (error.message || '未知错误'))
    }
  } finally {
    deactivateLoading.value = false
  }
}

// 获取账户设置信息
const fetchAccountSettings = async () => {
  try {
    // 获取账户安全设置(验证状态等)
    const userInfo = await userApi.getUserInfo()
    if (userInfo.data) {
      securitySettings.emailVerified = userInfo.data.email_verified ?? true
      securitySettings.phoneVerified = userInfo.data.phone_verified ?? false
    }
  } catch (error) {
    console.error('获取账户设置失败:', error)
    // 不显示错误消息，使用默认值
  }
}

onMounted(() => {
  fetchAccountSettings()
})
</script>

<style scoped>
.account-settings {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header-title {
  font-size: 18px;
  font-weight: 500;
}

.settings-content {
  margin-top: 20px;
}

.settings-tabs {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.password-card,
.security-card,
.deactivate-card {
  margin-top: 20px;
}

.password-form {
  max-width: 500px;
}

.password-tips {
  margin-top: 8px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
}

.password-tips p {
  margin: 0 0 8px 0;
  font-weight: 500;
}

.password-tips ul {
  margin: 0;
  padding-left: 20px;
}

.password-tips li {
  margin-bottom: 4px;
}

.security-section {
  margin-bottom: 24px;
}

.security-section h3 {
  margin-bottom: 16px;
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.verification-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.verified {
  color: #00b42a;
  font-weight: 500;
}

.unverified {
  color: #e6a23c;
  font-weight: 500;
}

.deactivate-content {
  margin-top: 24px;
}

.deactivate-content h3 {
  margin-bottom: 16px;
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.deactivate-warning {
  margin-bottom: 24px;
  padding: 16px;
  background: #fef0f0;
  border: 1px solid #fcd4d4;
  border-radius: 4px;
  color: #f56565;
}

.deactivate-warning li {
  margin-bottom: 8px;
}

.deactivate-form {
  max-width: 500px;
}

@media (max-width: 768px) {
  .account-settings {
    padding: 16px;
  }

  .password-form,
  .deactivate-form {
    max-width: 100%;
  }
}
</style>