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

        <!-- 隐私设置标签页 -->
        <el-tab-pane label="隐私设置" name="privacy">
          <el-card class="privacy-card">
            <div class="privacy-section">
              <h3>个人资料可见性</h3>
              <el-form label-width="200px">
                <el-form-item label="邮箱地址可见性">
                  <el-switch
                    v-model="privacySettings.emailVisible"
                    active-text="公开"
                    inactive-text="私密"
                  />
                </el-form-item>

                <el-form-item label="手机号可见性">
                  <el-switch
                    v-model="privacySettings.phoneVisible"
                    active-text="公开"
                    inactive-text="私密"
                  />
                </el-form-item>

                <el-form-item label="生日可见性">
                  <el-select v-model="privacySettings.birthdayVisible" placeholder="选择可见性">
                    <el-option label="完全公开" value="public" />
                    <el-option label="仅显示月日" value="month_day" />
                    <el-option label="完全私密" value="private" />
                  </el-select>
                </el-form-item>

                <el-form-item label="所在地可见性">
                  <el-switch
                    v-model="privacySettings.locationVisible"
                    active-text="公开"
                    inactive-text="私密"
                  />
                </el-form-item>
              </el-form>
            </div>

            <el-divider />

            <div class="privacy-section">
              <h3>互动设置</h3>
              <el-form label-width="200px">
                <el-form-item label="接受私信">
                  <el-switch
                    v-model="privacySettings.allowMessages"
                    active-text="允许"
                    inactive-text="禁止"
                  />
                </el-form-item>

                <el-form-item label="显示在线状态">
                  <el-switch
                    v-model="privacySettings.showOnlineStatus"
                    active-text="显示"
                    inactive-text="隐藏"
                  />
                </el-form-item>

                <el-form-item label="评论通知">
                  <el-switch
                    v-model="privacySettings.commentNotification"
                    active-text="开启"
                    inactive-text="关闭"
                  />
                </el-form-item>

                <el-form-item label="点赞通知">
                  <el-switch
                    v-model="privacySettings.likeNotification"
                    active-text="开启"
                    inactive-text="关闭"
                  />
                </el-form-item>
              </el-form>
            </div>

            <div class="privacy-actions">
              <el-button
                type="primary"
                @click="savePrivacySettings"
                :loading="privacyLoading"
              >
                <el-icon><Check /></el-icon>
                保存隐私设置
              </el-button>
            </div>
          </el-card>
        </el-tab-pane>

        <!-- 账户安全标签页 -->
        <el-tab-pane label="账户安全" name="security">
          <el-card class="security-card">
            <div class="security-section">
              <h3>登录设备管理</h3>
              <div class="device-list">
                <div
                  v-for="device in loginDevices"
                  :key="device.id"
                  class="device-item"
                >
                  <div class="device-info">
                    <div class="device-name">{{ device.name }}</div>
                    <div class="device-details">
                      {{ device.location }} · {{ device.lastLogin }}
                    </div>
                  </div>
                  <div class="device-actions">
                    <el-tag v-if="device.current" type="success">当前设备</el-tag>
                    <el-button
                      v-else
                      size="small"
                      type="danger"
                      @click="removeDevice(device.id)"
                    >
                      移除
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

            <el-divider />

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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Lock,
  Check,
  Delete
} from '@element-plus/icons-vue'

defineOptions({ name: "AccountSettingsView" })

// 表单引用
const passwordFormRef = ref()
const deactivateFormRef = ref()

// 当前激活的标签页
const activeTab = ref('password')

// 加载状态
const passwordLoading = ref(false)
const privacyLoading = ref(false)
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

// 隐私设置
const privacySettings = reactive({
  emailVisible: false,
  phoneVisible: false,
  birthdayVisible: 'private',
  locationVisible: true,
  allowMessages: true,
  showOnlineStatus: true,
  commentNotification: true,
  likeNotification: false
})

// 账户安全设置
const securitySettings = reactive({
  emailVerified: true,
  phoneVerified: false
})

// 登录设备列表
const loginDevices = ref([
  {
    id: 1,
    name: 'Chrome on Windows',
    location: '湖北省武汉市',
    lastLogin: '2024-01-20 14:30',
    current: true
  },
  {
    id: 2,
    name: 'Safari on iPhone',
    location: '广东省深圳市',
    lastLogin: '2024-01-19 10:15',
    current: false
  }
])

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

    // 这里应该调用实际的API
    // await userApi.changePassword(passwordForm)

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('密码修改成功')
    resetPasswordForm()
  } catch (error) {
    if (error.message) {
      ElMessage.error('密码修改失败：' + error.message)
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

// 保存隐私设置
const savePrivacySettings = async () => {
  try {
    privacyLoading.value = true

    // 这里应该调用实际的API
    // await userApi.updatePrivacySettings(privacySettings)

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('隐私设置保存成功')
  } catch (error) {
    ElMessage.error('保存隐私设置失败')
  } finally {
    privacyLoading.value = false
  }
}

// 验证邮箱
const verifyEmail = async () => {
  try {
    ElMessage.info('验证邮件已发送，请检查您的邮箱')
    securitySettings.emailVerified = true
  } catch (error) {
    ElMessage.error('发送验证邮件失败')
  }
}

// 验证手机
const verifyPhone = async () => {
  try {
    ElMessage.info('验证短信已发送，请检查您的手机')
    securitySettings.phoneVerified = true
  } catch (error) {
    ElMessage.error('发送验证短信失败')
  }
}

// 移除设备
const removeDevice = async (deviceId) => {
  try {
    await ElMessageBox.confirm('确定要移除该设备吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 这里应该调用实际的API
    // await userApi.removeDevice(deviceId)

    loginDevices.value = loginDevices.value.filter(device => device.id !== deviceId)
    ElMessage.success('设备已移除')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('移除设备失败')
    }
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

    // 这里应该调用实际的API
    // await userApi.deactivateAccount(deactivateForm)

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))

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
    // 这里应该调用实际的API
    // const response = await userApi.getAccountSettings()
    // Object.assign(privacySettings, response.data.privacy)
    // Object.assign(securitySettings, response.data.security)
    // loginDevices.value = response.data.devices

    // 模拟数据
    console.log('获取账户设置信息...')
  } catch (error) {
    ElMessage.error('获取账户设置失败')
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
.privacy-card,
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

.privacy-section,
.security-section {
  margin-bottom: 24px;
}

.privacy-section h3,
.security-section h3 {
  margin-bottom: 16px;
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.privacy-actions {
  margin-top: 24px;
  text-align: center;
}

.device-list {
  margin-bottom: 16px;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
}

.device-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.device-details {
  font-size: 14px;
  color: #666;
}

.device-actions {
  display: flex;
  align-items: center;
  gap: 12px;
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

  .device-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .device-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>