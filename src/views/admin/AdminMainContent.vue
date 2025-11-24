<template>
  <div class="admin-main">
    <div class="welcome-card">
      <h3>您好，{{ user?.name }}！欢迎使用管理员后台</h3>
      <p>当前登录角色：管理员 | 登录时间：{{ loginTime }}</p>
    </div>
    <div class="notice-card">
      <h4 class="card-title">当期公告</h4>
      <div v-if="isLoading" class="loading">加载中...</div>
      <div v-else-if="errorMsg" class="error">{{ errorMsg }}</div>
      <ul class="notice-list" v-else>
        <li v-for="notice in filteredNotices" :key="notice.release_time" class="notice-item">
          <div class="notice-header">
            <span class="type" :title="notice.notice_type">{{ notice.notice_type }}</span>
            <span class="release-date">：{{ formatDate(notice.release_time) }}</span>
          </div>
          <div class="notice-content">{{ notice.release_title }}</div>
          <div class="notice-footer">
          </div>
        </li>
        <li v-if="filteredNotices.length === 0" class="empty-notice">暂无未过期的系统公告</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "AdminMainContent" })
import { useMainStore } from '@/store'
import { ref, computed, onMounted, onActivated } from 'vue'
import axios from 'axios'
import { BASE_URL } from '@/config.js';

const store = useMainStore()
const { user, notices, setNotices } = store
const loginTime = ref(new Date().toLocaleString())


// 组件内维护公告状态（不再依赖 Pinia 的 notices）
const localNotices = ref([])
const isLoading = ref(false)
const errorMsg = ref('')

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 请求公告数据（直接存储到组件内 localNotices）
const fetchNotices = async () => {
  try {
    isLoading.value = true
    errorMsg.value = ''

    const params = {
      page: 1,
      size: 10,
      release_time_end: new Date().toISOString()
    };

    const response = await axios.get(`${BASE_URL}/api/visit/notice`, {
      params,
      timeout: 5000
    })

    if (response.data.success) {
      localNotices.value = response.data.data?.items || []; // 存储到组件内
    } else {
      errorMsg.value = '公告获取失败：' + (response.data.message || '未知错误')
    }
  } catch (error) {
    if (error.message.includes('timeout')) {
      errorMsg.value = '公告加载超时，请刷新重试'
    } else {
      errorMsg.value = '公告加载失败：' + error.message
    }
    console.error('公告接口请求错误：', error)
  } finally {
    isLoading.value = false
  }
}

// 筛选未过期公告（基于组件内 localNotices）
const filteredNotices = computed(() => {
  const now = new Date();
  return localNotices.value.filter(notice => {
    const expireDate = new Date(notice.expiration);
    return expireDate >= now;
  });
});

// 页面挂载时请求数据
onMounted(() => {
  fetchNotices()
})

// 切换标签返回时刷新数据
onActivated(() => {
  fetchNotices()
})
</script>

<style scoped>
/* 样式保持原逻辑，确保与布局风格一致 */
.admin-main {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.welcome-card h3 {
  color: #333;
  margin-bottom: 10px;
}

.welcome-card p {
  color: #666;
  font-size: 14px;
}

.notice-card {
  margin-top: 20px;
}

.card-title {
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
}

.notice-list {
  list-style: none;
  padding: 0;
}

.notice-item {
  padding: 10px 0;
  border-bottom: 1px dashed #eee;
  display: flex;
  gap: 15px;
}

.date {
  color: #00b42a;
  min-width: 80px;
}

.content {
  flex: 1;
}
</style>