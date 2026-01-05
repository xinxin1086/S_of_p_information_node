<!-- ./src/views/admin/components/AdminHeader.vue -->
<template>
  <div class="admin-header">
    <div class="logo">
      <span>汉江垂钓站 - 管理员后台</span>
    </div>
    <div class="user-info">
      <div class="user-details">
        <span class="welcome-text">欢迎，{{ formatUserDisplayName(user) }}</span>
        <div class="role-info">
          <el-tag v-if="isSuperAdmin" size="small" type="danger">超级管理员</el-tag>
          <el-tag v-else-if="isAdmin" size="small" type="warning">管理员</el-tag>
          <span class="role-text">({{ currentRole || '未知角色' }})</span>
        </div>
      </div>
      <div class="user-actions">
        <el-button type="primary" size="small" @click="handleLogout">退出登录</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "AdminHeader" })
import { useAuthStore, usePermissions } from '@/stores'
import { useRouter } from 'vue-router'
import { formatUserDisplayName } from '@/utils/userFormat.js'
import { tokenManager } from '@/utils/tokenManager'
import axios from 'axios';
const authStore = useAuthStore()
const router = useRouter()
const user = authStore.user

// 使用新的权限系统
const {
  currentRole,
  isAdmin,
  isSuperAdmin
} = usePermissions()

// 使用统一的用户名格式化函数

const handleLogout = () => {
  try {
    // 1. 清空认证用户信息
    authStore.logout();
    // 2. 删除本地存储令牌
    tokenManager.clearTokens();
    // 3. 清除请求头Authorization（兼容axios实例）
    if (axios.defaults.headers.common) {
      delete axios.defaults.headers.common['Authorization'];
    }
    // 4. 跳转到首页/#/，完全退出登录状态
    window.location.href = '/#/';
  } catch (error) {
    console.error('退出登录失败：', error);
    // 异常时仍强制跳转到首页
    window.location.href = '/#/';
  }
};
</script>

<style scoped>
.admin-header {
  height: 60px;
  background-color: #00b42a;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  font-size: 18px;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.welcome-text {
  font-size: 16px;
  font-weight: 500;
  color: white;
}

.role-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.user-actions {
  display: flex;
  align-items: center;
}

.user-info .el-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.user-info .el-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    height: auto;
    padding: 12px 20px;
    gap: 8px;
  }

  .user-info {
    gap: 12px;
  }

  .user-details {
    align-items: center;
  }

  .welcome-text {
    font-size: 14px;
  }

  .role-info {
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .user-actions .el-button {
    padding: 4px 12px;
    font-size: 12px;
  }
}
</style>