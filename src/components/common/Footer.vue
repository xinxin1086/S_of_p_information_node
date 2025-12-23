<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-section">
        <h4>汉江垂钓站</h4>
        <p>专业的垂钓资讯服务平台</p>
        <div class="footer-links">
          <router-link to="/about">关于我们</router-link>
          <router-link to="/contact">联系我们</router-link>
          <router-link to="/help">帮助中心</router-link>
        </div>
      </div>

      <div class="footer-section">
        <h4>快速链接</h4>
        <div class="footer-links">
          <router-link to="/notice">公告通知</router-link>
          <router-link to="/activities">活动预约</router-link>
          <router-link to="/science">科普知识</router-link>
          <router-link to="/search">内容搜索</router-link>
        </div>
      </div>

      <div class="footer-section">
        <h4>用户服务</h4>
        <div class="footer-links">
          <router-link to="/login">用户登录</router-link>
          <router-link to="/register">用户注册</router-link>
          <router-link to="/user/profile">个人资料</router-link>
          <router-link to="/user/settings">账户设置</router-link>
        </div>
      </div>

      <div class="footer-section">
        <h4>联系方式</h4>
        <div class="contact-info">
          <p><el-icon><phone /></el-icon> 400-123-4567</p>
          <p><el-icon><message /></el-icon> info@hanjiangfishing.com</p>
          <p><el-icon><location /></el-icon> 汉江垂钓基地</p>
        </div>
        <div class="social-links">
          <el-button circle size="small">
            <el-icon><chat-dot-round /></el-icon>
          </el-button>
          <el-button circle size="small">
            <el-icon><share /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="footer-bottom-content">
        <p>&copy; 2024 汉江垂钓站. 保留所有权利.</p>
        <div class="footer-bottom-links">
          <a href="#">隐私政策</a>
          <a href="#">使用条款</a>
          <a href="#">网站地图</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { Phone, Message, Location, ChatDotRound, Share } from '@element-plus/icons-vue'

defineOptions({ name: "AppFooter" })
</script>

<style scoped>
.app-footer {
  background: #1e293b;
  color: white;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 20px 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #f1f5f9;
}

.footer-section p {
  margin: 0 0 0.5rem 0;
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.5;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-links a {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
  padding: 0.25rem 0;
}

.footer-links a:hover {
  color: #f1f5f9;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.contact-info p {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.social-links {
  display: flex;
  gap: 0.5rem;
}

.footer-bottom {
  border-top: 1px solid #334155;
  padding: 1.5rem 0;
}

.footer-bottom-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-bottom p {
  margin: 0;
  color: #64748b;
  font-size: 0.85rem;
}

.footer-bottom-links {
  display: flex;
  gap: 1.5rem;
}

.footer-bottom-links a {
  color: #64748b;
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.3s;
}

.footer-bottom-links a:hover {
  color: #94a3b8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1.5rem;
  }

  .footer-bottom-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .footer-bottom-links {
    justify-content: center;
    gap: 1rem;
  }

  .contact-info {
    align-items: center;
  }

  .social-links {
    justify-content: center;
  }
}
</style>