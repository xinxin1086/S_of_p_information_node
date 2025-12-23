<!-- ./src/views/admin/user/UserUserAdd.vue -->
<template>
  <div class="info-container">
    <h3 class="info-form-title">新增用户</h3>
    <el-form :model="form" class="info-form" :rules="formRules" ref="formRef">
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
          <el-option label="组织用户" value="organization"></el-option>
          <el-option label="普通用户" value="user"></el-option>
        </el-select>
      </el-form-item>

      <!-- 替换为 ImageCropper 组件（与管理员新增组件一致） -->
      <el-form-item label="头像" class="info-form-item">
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
        <button class="info-btn info-submit-btn" @click="handleSubmit" :disabled="isLoading">提交</button>
        <button class="info-btn info-cancel-btn" @click="handleCancel" :disabled="isLoading">取消</button>
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
import axios from 'axios';
import { BASE_URL } from '@/config';

const router = useRouter();
const formRef = ref(null);
const cropperRef = ref(null);
const newUserId = ref(null);

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
  { label: '组织用户', value: 'organization' },
  { label: '普通用户', value: 'user' }
]);

// 接收裁剪后的文件，生成临时预览URL（与管理员组件一致）
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
  if (cropperRef.value?.tempBlobUrls) {
    cropperRef.value.tempBlobUrls.forEach(url => URL.revokeObjectURL(url));
  }
});

// 提交逻辑：分两步（创建用户→上传头像）（参考管理员组件逻辑）
const handleSubmit = async () => {
  if (isLoading.value) return;
  try {
    // 1. 表单验证
    const valid = await formRef.value.validate();
    if (!valid) return;

    isLoading.value = true;
    errorMessage.value = '';

    // 2. 调用后端"创建用户"接口（使用专用接口）
    const createResponse = await axios.post(`${BASE_URL}/api/user/create`, {
      account: form.value.account,
      password: form.value.password,
      username: form.value.username,
      phone: form.value.phone,
      email: form.value.email || '',
      role: form.value.role
    });

    if (!createResponse.data.success) {
      throw new Error(createResponse.data.message || '创建用户失败');
    }

    newUserId.value = createResponse.data.data.id;
    errorMessage.value = '用户创建成功，正在上传头像...';

    // 3. 若有裁剪图片，调用后端"上传头像"接口（表名改为 user_info）
    if (croppedFile.value) {
      const formData = new FormData();
      formData.append('table_name', 'user_info');
      formData.append('record_id', newUserId.value);
      formData.append('avatar', croppedFile.value);

      const uploadResponse = await axios.post(`${BASE_URL}/api/common/upload/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadResponse.data.success) {
        const officialAvatarUrl = uploadResponse.data.data.avatar_url;
        form.value.avatar = officialAvatarUrl; // 替换为正式URL
        errorMessage.value = '用户创建成功，头像上传完成！';
      } else {
        errorMessage.value = '用户创建成功，头像上传失败：' + uploadResponse.data.message;
      }
    } else {
      errorMessage.value = '用户创建成功（无头像）';
    }

    // 4. 跳转普通用户列表页
    setTimeout(() => {
      router.push('/admin/user/user');
    }, 3000);
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.message || '提交失败';
  } finally {
    isLoading.value = false;
  }
};

// 取消操作：释放临时URL，避免内存泄漏（与管理员组件一致）
const handleCancel = () => {
  releaseTempUrl();
  router.push('/admin/user/user');
};

// 释放临时预览URL（与管理员组件一致）
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