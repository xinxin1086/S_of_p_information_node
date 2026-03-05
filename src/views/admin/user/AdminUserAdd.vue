<!-- ./src/views/admin/user/AdminUserAdd.vue -->
<template>
  <div class="info-container">
    <h3 class="info-form-title">新增管理员</h3>
    <el-form :model="form" class="info-form" :rules="formRules" ref="formRef">
      <!-- 基础表单项不变 -->
      <el-form-item label="账号" required prop="account" class="info-form-item">
        <el-input v-model="form.account" placeholder="请输入登录账号（唯一）" :disabled="isLoading" class="info-form-input"></el-input>
      </el-form-item>

      <el-form-item label="密码" required prop="password" class="info-form-item">
        <el-input type="password" v-model="form.password" placeholder="请输入密码（至少6位）" :disabled="isLoading" class="info-form-input"></el-input>
      </el-form-item>

      <el-form-item label="用户名称" required prop="username" class="info-form-item">
        <el-input v-model="form.username" placeholder="请输入用户名称（唯一）" :disabled="isLoading" class="info-form-input"></el-input>
      </el-form-item>

      <el-form-item label="电话" required prop="phone" class="info-form-item">
        <el-input v-model="form.phone" placeholder="请输入联系电话（不能为空）" :disabled="isLoading" maxlength="20" class="info-form-input"></el-input>
      </el-form-item>

      <el-form-item label="邮箱" prop="email" class="info-form-item">
        <el-input v-model="form.email" placeholder="请输入邮箱（如：xxx@example.com）" :disabled="isLoading" class="info-form-input"></el-input>
      </el-form-item>

      <el-form-item label="角色" required prop="role" class="info-form-item">
        <el-select v-model="form.role" placeholder="请选择角色" :disabled="isLoading" class="info-form-select">
          <el-option label="超级管理员" value="SUPER_ADMIN"></el-option>
          <el-option label="管理员" value="ADMIN"></el-option>
        </el-select>
      </el-form-item>

      <!-- 头像裁剪组件：裁剪后实时预览（修复注释位置 + 标签格式） -->
      <el-form-item label="头像" class="info-form-item">
        <!-- 绑定表单字段，同步预览URL -->
        <ImageCropper
            ref="cropperRef"
            v-model="form.avatar"
            :size="200"
            @cropped-file-ready="onCroppedFileReady"
            @upload-fail="(msg) => (errorMessage.value = msg)"
        />
        <p class="info-tip">支持JPG、PNG格式，大小不超过2MB，将自动调整为200x200px</p>
      </el-form-item>

      <el-form-item class="info-form-item">
        <button type="button" class="info-btn info-submit-btn" @click="handleSubmit" :disabled="isLoading">提交</button>
        <button type="button" class="info-btn info-cancel-btn" @click="handleCancel" :disabled="isLoading">取消</button>
      </el-form-item>
    </el-form>
    <p class="info-global-error" v-if="errorMessage">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

import { getCommonFormRules } from '@/utils/admin/admin_info_edit.js';
import '@/styles/admin/admin_info_edit.css';
import ImageCropper from '@/components/ImageCropper.vue';
import { userAdapter } from '@/services/userAdapter';
import { uploadImage } from '@/utils/upload.js';

const router = useRouter();
const formRef = ref(null);
const cropperRef = ref(null);
const newAdminId = ref(null);

// 表单数据
const form = ref({
  account: '',
  password: '',
  username: '',
  phone: '',
  email: '',
  role: '',
  avatar: ''  // 存储临时预览URL或正式URL
});

// 状态控制
const isLoading = ref(false);
const errorMessage = ref('');
const croppedFile = ref(null);
const tempPreviewUrl = ref(''); // 存储临时预览URL，用于卸载时释放

// 表单验证规则
const formRules = getCommonFormRules([
  { label: '超级管理员', value: 'SUPER_ADMIN' },
  { label: '管理员', value: 'ADMIN' }
]);

// 接收裁剪后的文件，生成临时预览URL
const onCroppedFileReady = (file) => {
  croppedFile.value = file;
  // 重新生成临时URL（避免依赖子组件的URL）
  if (tempPreviewUrl.value) {
    URL.revokeObjectURL(tempPreviewUrl.value); // 先释放旧URL
  }
  tempPreviewUrl.value = URL.createObjectURL(file);
  form.value.avatar = tempPreviewUrl.value; // 同步到表单
};

// 组件卸载时释放临时URL（确保预览期间不释放）
onUnmounted(() => {
  releaseTempUrl();
  // 额外检查子组件的临时URL（可选）
  if (cropperRef.value?.tempCroppedUrl) {
    URL.revokeObjectURL(cropperRef.value.tempCroppedUrl);
  }
});

// 提交逻辑：使用 userAdapter（支持 Mock 模式）
const handleSubmit = async () => {
  if (isLoading.value) return;
  try {
    // 1. 表单验证
    const valid = await formRef.value.validate();
    if (!valid) return;

    isLoading.value = true;
    errorMessage.value = '';

    // 2. 若有裁剪图片，先上传头像
    let avatarUrl = '';
    if (croppedFile.value) {
      avatarUrl = await uploadImage(croppedFile.value);
    }

    // 3. 使用 userAdapter 创建管理员（支持 Mock 模式自动切换）
    const createResponse = await userAdapter.createAdmin({
      account: form.value.account,
      username: form.value.username,
      phone: form.value.phone,
      email: form.value.email || '',
      role: form.value.role,
      avatar: avatarUrl || 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
    });

    if (!createResponse.success) {
      throw new Error(createResponse.message || '创建管理员失败');
    }

    errorMessage.value = '管理员创建成功！';

    // 4. 跳转管理员列表页
    setTimeout(() => {
      router.push('/admin/user/admin');
    }, 1500);
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.message || '提交失败';
  } finally {
    isLoading.value = false;
  }
};

// 取消操作：释放临时URL，避免内存泄漏
const handleCancel = () => {
  releaseTempUrl();
  router.push('/admin/user/admin');
};

// 释放临时预览URL
const releaseTempUrl = () => {
  if (tempPreviewUrl.value) {
    URL.revokeObjectURL(tempPreviewUrl.value);
    tempPreviewUrl.value = '';
    form.value.avatar = '';
  }
};

// 组件卸载时释放临时URL
onUnmounted(() => {
  releaseTempUrl();
});
</script>

<style scoped></style>