<!-- ./src/views/admin/user/UserUserEdit.vue -->
<template>
  <div class="info-container">
    <h3 class="info-form-title">编辑用户</h3>
    <el-form :model="form" class="info-form" :rules="formRules" ref="formRef">
      <el-form-item label="账号" required prop="account" class="info-form-item">
        <el-input v-model="form.account" placeholder="请输入账号" disabled class="info-form-input"></el-input>
        <p class="info-tip">账号不可修改</p>
      </el-form-item>

      <el-form-item label="密码" prop="password" class="info-form-item">
        <el-input
            type="password"
            v-model="form.password"
            placeholder="不输入则保持原密码"
            :disabled="isLoading"
            maxlength="32"
            class="info-form-input"
        ></el-input>
        <p class="info-tip">密码长度6-32字符，为空则不更新</p>
      </el-form-item>

      <el-form-item label="用户名称" required prop="username" class="info-form-item">
        <el-input
            v-model="form.username"
            placeholder="请输入用户名称（唯一）"
            :disabled="isLoading"
            maxlength="20"
            class="info-form-input"
        ></el-input>
      </el-form-item>

      <el-form-item label="电话" required prop="phone" class="info-form-item">
        <el-input
            v-model="form.phone"
            placeholder="请输入联系电话（不能为空）"
            :disabled="isLoading"
            maxlength="20"
            class="info-form-input"
        ></el-input>
      </el-form-item>

      <el-form-item label="邮箱" prop="email" class="info-form-item">
        <el-input
            v-model="form.email"
            placeholder="请输入邮箱（如：xxx@example.com）"
            :disabled="isLoading"
            class="info-form-input"
        ></el-input>
      </el-form-item>

      <el-form-item label="角色" required prop="role" class="info-form-item">
        <el-select v-model="form.role" placeholder="请选择角色" :disabled="isLoading" class="info-form-select">
          <el-option label="组织用户" value="organization"></el-option>
          <el-option label="普通用户" value="user"></el-option>
        </el-select>
      </el-form-item>

      <!-- 替换为 ImageCropper 组件（支持原有头像回显） -->
      <el-form-item label="头像" class="info-form-item">
        <ImageCropper
            ref="cropperRef"
            v-model="form.avatar"
            :size="200"
            @cropped-file-ready="onCroppedFileReady"
            @upload-fail="(msg) => (errorMessage.value = msg)"
        />
        <p class="info-tip">支持JPG、PNG格式，大小不超过2MB，将自动调整为200x200px；不选择则保持原头像</p>
      </el-form-item>

      <el-form-item class="info-form-item">
        <button class="info-btn info-submit-btn" @click="handleSubmit" :disabled="isLoading">提交修改</button>
        <button class="info-btn info-cancel-btn" @click="handleCancel" :disabled="isLoading">取消</button>
      </el-form-item>
    </el-form>
    <p class="info-global-error" v-if="errorMessage">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getCommonFormRules, useSubmitCommonLogic, fetchEditData } from '@/utils/admin/admin_info_edit.js';
import '@/styles/admin/admin_info_edit.css';
import ImageCropper from '@/components/ImageCropper.vue';
import axios from 'axios';
import { BASE_URL } from '@/config.js';

const router = useRouter();
const route = useRoute();
const userId = route.query.id;
const formRef = ref(null);
const cropperRef = ref(null);

// 表单数据
const form = ref({
  account: '',
  password: '',
  username: '',
  phone: '',
  email: '',
  role: '',
  avatar: '', // 存储原有头像URL/裁剪后临时URL
  avatarFile: null // 兼容原有提交逻辑
});

// 状态控制
const isLoading = ref(false);
const errorMessage = ref('');
const isLoaded = ref(false);
const croppedFile = ref(null); // 存储裁剪后的新文件
const tempPreviewUrl = ref(''); // 管理临时预览URL

// 表单验证规则
const formRules = getCommonFormRules([
  { label: '组织用户', value: 'organization' },
  { label: '普通用户', value: 'user' }
]);

// 接收裁剪后的文件（与新增组件逻辑一致）
const onCroppedFileReady = (file) => {
  croppedFile.value = file;
  // 重新生成临时URL，避免依赖子组件
  if (tempPreviewUrl.value) {
    URL.revokeObjectURL(tempPreviewUrl.value);
  }
  tempPreviewUrl.value = URL.createObjectURL(file);
  form.value.avatar = tempPreviewUrl.value; // 同步预览
  form.value.avatarFile = file; // 兼容原有提交逻辑
};

// 自定义提交逻辑（整合裁剪头像上传）
const handleSubmit = async () => {
  if (isLoading.value) return;
  try {
    // 1. 表单验证
    const valid = await formRef.value.validate();
    if (!valid) return;

    isLoading.value = true;
    errorMessage.value = '';

    // 2. 组装提交参数（基础信息）
    const updateData = {
      username: form.value.username,
      phone: form.value.phone,
      email: form.value.email || '',
      role: form.value.role
    };

    // 3. 若输入新密码，添加密码字段
    if (form.value.password) {
      updateData.password = form.value.password;
    }

    // 4. 调用后端"编辑用户"接口（使用专用更新接口）
    const editResponse = await axios.put(`${BASE_URL}/api/user/admin/users/${userId}`, updateData);

    if (!editResponse.data.success) {
      throw new Error(editResponse.data.message || '编辑用户失败');
    }

    errorMessage.value = '用户信息更新成功，正在处理头像...';

    // 5. 若有新裁剪的头像，上传头像
    if (croppedFile.value) {
      const formData = new FormData();
      formData.append('table_name', 'user_info');
      formData.append('record_id', userId);
      formData.append('avatar', croppedFile.value);

      const uploadResponse = await axios.post(`${BASE_URL}/api/common/upload/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadResponse.data.success) {
        errorMessage.value = '用户信息更新成功，头像上传完成！';
      } else {
        errorMessage.value = '用户信息更新成功，头像上传失败：' + uploadResponse.data.message;
      }
    } else {
      errorMessage.value = '用户信息更新成功（保持原头像）';
    }

    // 6. 跳转普通用户列表页
    setTimeout(() => {
      router.push('/admin/user/user');
    }, 3000);
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.message || '提交失败';
  } finally {
    isLoading.value = false;
  }
};

// 取消操作：释放临时URL
const handleCancel = () => {
  releaseTempUrl();
  router.push('/admin/user/user');
};

// 释放临时预览URL
const releaseTempUrl = () => {
  if (tempPreviewUrl.value) {
    URL.revokeObjectURL(tempPreviewUrl.value);
    tempPreviewUrl.value = '';
    // 编辑页取消时不重置 form.avatar（保留原有头像URL）
  }
};

// 加载原有用户数据（保持不变，form.avatar 自动回显到 ImageCropper）
onMounted(() => {
  fetchEditData('user_info', userId, form, isLoading, errorMessage, isLoaded);
});

// 组件卸载时释放资源
onUnmounted(() => {
  releaseTempUrl();
  // 清理子组件临时URL
  if (cropperRef.value?.tempBlobUrls) {
    cropperRef.value.tempBlobUrls.forEach(url => URL.revokeObjectURL(url));
  }
});
</script>

<style scoped></style>