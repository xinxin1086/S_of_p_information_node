<!-- ./src/views/admin/user/AdminUserEdit.vue -->
<template>
  <div class="info-container">
    <h3 class="info-form-title">编辑管理员</h3>
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
          <el-option label="超级管理员" value="SUPER_ADMIN"></el-option>
          <el-option label="管理员" value="ADMIN"></el-option>
        </el-select>
      </el-form-item>

      <!-- 替换为 ImageCropper 组件（与新增页一致，支持原有头像回显） -->
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
import { formatAvatarUrl } from "@/utils/common/format.js";
import ImageCropper from '@/components/ImageCropper.vue';
import { userAdapter } from '@/services/userAdapter';
import { uploadImage } from '@/utils/upload.js';

const router = useRouter();
const route = useRoute();
const adminId = route.query.id;
const formRef = ref(null);
const cropperRef = ref(null);

// 表单数据（保持原有结构，avatar 存储头像URL，croppedFile 存储裁剪后的新文件）
const form = ref({
  account: '',
  password: '',
  username: '',
  phone: '',
  email: '',
  role: '',
  avatar: '', // 原有头像URL / 裁剪后临时预览URL
  avatarFile: null // 兼容原有提交逻辑（可选）
});

// 状态控制（新增 croppedFile 存储裁剪后的文件，tempPreviewUrl 管理临时URL）
const isLoading = ref(false);
const errorMessage = ref('');
const isLoaded = ref(false);
const croppedFile = ref(null);
const tempPreviewUrl = ref('');

// 表单验证规则
const formRules = getCommonFormRules([
  { label: '超级管理员', value: 'SUPER_ADMIN' },
  { label: '管理员', value: 'ADMIN' }
]);

// 接收裁剪后的文件（与新增页逻辑完全一致）
const onCroppedFileReady = (file) => {
  croppedFile.value = file;
  // 重新生成临时URL（避免依赖子组件，统一管理）
  if (tempPreviewUrl.value) {
    URL.revokeObjectURL(tempPreviewUrl.value);
  }
  tempPreviewUrl.value = URL.createObjectURL(file);
  form.value.avatar = tempPreviewUrl.value; // 同步到表单，更新预览
  form.value.avatarFile = file; // 兼容原有提交逻辑（若 useSubmitCommonLogic 需要）
};

// 提交逻辑：适配裁剪组件，有新裁剪文件则上传，否则保持原有头像
// 提交逻辑：使用 userAdapter（支持 Mock 模式）
const handleSubmit = async () => {
  if (isLoading.value) return;
  try {
    // 1. 表单验证
    const valid = await formRef.value.validate();
    if (!valid) return;

    isLoading.value = true;
    errorMessage.value = '';

    // 2. 若有新裁剪的头像，先上传头像
    if (croppedFile.value) {
      const avatarUrl = await uploadImage(croppedFile.value);
      form.value.avatar = avatarUrl;
    }

    // 3. 组装更新数据
    const updateData = {
      username: form.value.username,
      phone: form.value.phone,
      email: form.value.email || '',
      avatar: form.value.avatar
    };

    // 4. 使用 userAdapter 更新管理员（支持 Mock 模式自动切换）
    const editResponse = await userAdapter.updateUser(parseInt(adminId), updateData);

    if (!editResponse.success) {
      throw new Error(editResponse.message || '编辑管理员失败');
    }

    errorMessage.value = '管理员信息更新成功！';

    // 5. 跳转管理员列表页
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
    // 编辑页取消时不重置 form.avatar（保留原有头像URL）
  }
};

// 组件卸载时释放资源
onUnmounted(() => {
  releaseTempUrl();
  // 额外检查子组件临时URL
  if (cropperRef.value?.tempBlobUrls) {
    cropperRef.value.tempBlobUrls.forEach(url => URL.revokeObjectURL(url));
  }
});

// 加载原有管理员数据（保持不变，form.avatar 会自动回显到 ImageCropper）
onMounted(() => {
  fetchEditData('admin_info', adminId, form, isLoading, errorMessage, isLoaded);
});
</script>

<style scoped></style>