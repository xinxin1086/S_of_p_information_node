<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <div class="error-code">404</div>
      <div class="error-message">页面未找到</div>
      <div class="error-description">抱歉，您访问的页面不存在或已被移除</div>

      <div class="action-buttons">
        <el-button type="primary" size="large" @click="goHome" title="返回首页">
          <el-icon><House /></el-icon>
          返回首页
        </el-button>
        <el-button size="large" @click="goBack" title="返回上一页">
          <el-icon><ArrowLeft /></el-icon>
          返回上页
        </el-button>
      </div>

      <div class="help-links">
        <div class="help-title">您可能在寻找：</div>
        <div class="link-grid">
          <router-link to="/" class="help-link">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </router-link>
          <router-link to="/notice" class="help-link">
            <el-icon><Bell /></el-icon>
            <span>公告中心</span>
          </router-link>
          <router-link to="/science" class="help-link">
            <el-icon><Reading /></el-icon>
            <span>科普知识</span>
          </router-link>
          <router-link to="/activities" class="help-link">
            <el-icon><Calendar /></el-icon>
            <span>活动信息</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { House, ArrowLeft, Bell, Reading, Calendar } from '@element-plus/icons-vue'

const router = useRouter()

// 返回首页
const goHome = () => {
  router.push('/')
}

// 返回上一页
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.not-found-container {
  text-align: center;
  color: white;
  max-width: 600px;
  width: 100%;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  animation: float 3s ease-in-out infinite;
}

.error-message {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 16px;
}

.error-description {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 40px;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 60px;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  border-radius: 8px;
  height: 44px;
  padding: 0 24px;
  font-size: 16px;
}

.help-links {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 30px;
  backdrop-filter: blur(10px);
}

.help-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
}

.link-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.help-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  text-decoration: none;
  color: white;
  transition: all 0.3s ease;
}

.help-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.help-link .el-icon {
  font-size: 24px;
}

.help-link span {
  font-size: 14px;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-code {
    font-size: 80px;
  }

  .error-message {
    font-size: 24px;
  }

  .error-description {
    font-size: 14px;
    margin-bottom: 30px;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .action-buttons .el-button {
    width: 200px;
  }

  .link-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .error-code {
    font-size: 60px;
  }

  .error-message {
    font-size: 20px;
  }

  .help-links {
    padding: 20px;
  }

  .help-link {
    padding: 15px;
  }
}
</style>