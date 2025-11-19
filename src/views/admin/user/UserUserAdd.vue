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
          <el-option label="农户" value="farmer"></el-option>
          <el-option label="访客" value="visitor"></el-option>
          <el-option label="普通用户" value="normal_user"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="头像" class="info-form-item">
        <el-upload
            class="info-avatar-uploader"
            action="#"
            :auto-upload="false"
            :on-change="handleAvatarChange"
            :disabled="isLoading"
            accept="image/jpeg,image/png"
        >
          <img v-if="form.avatar" :src="form.avatar" class="info-avatar">
          <i v-else class="el-icon-plus info-avatar-uploader-icon"></i>
        </el-upload>
        <p class="info-tip">支持JPG、PNG格式，大小不超过2MB</p>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getCommonFormRules, useAvatarHandler, useSubmitCommonLogic } from '@/utils/admin/admin_info_edit.js';
import '@/styles/admin/admin_info_edit.css';

const router = useRouter();
const formRef = ref(null);

// 表单数据
const form = ref({
  account: '',
  password: '',
  username: '',
  phone: '',
  email: '',
  role: '',
  avatar: '',
  avatarFile: null
});

// 状态控制
const isLoading = ref(false);
const errorMessage = ref('');

// 表单验证规则
const formRules = getCommonFormRules([
  { label: '农户', value: 'farmer' },
  { label: '访客', value: 'visitor' },
  { label: '普通用户', value: 'normal_user' }
]);

// 头像处理
const handleAvatarChange = useAvatarHandler(form, errorMessage);

// 提交逻辑
const handleSubmit = useSubmitCommonLogic(
    'user_info',
    form,
    formRef,
    isLoading,
    errorMessage,
    () => router.push('/admin/user/user')
);

// 取消操作
const handleCancel = () => {
  router.push('/admin/user/user');
};
</script>

<style scoped></style>