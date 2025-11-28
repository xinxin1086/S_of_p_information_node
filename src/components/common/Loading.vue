<template>
  <div class="loading-container" :class="{ 'loading-overlay': overlay }">
    <div class="loading-content">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <p v-if="text" class="loading-text">{{ text }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: ''
  },
  overlay: {
    type: Boolean,
    default: false
  }
})

defineOptions({ name: "Loading" })
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 9999;
  padding: 0;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  position: relative;
  width: 48px;
  height: 48px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: 0s;
}

.spinner-ring:nth-child(2) {
  animation-delay: 0.15s;
  border-top-color: #10b981;
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
}

.spinner-ring:nth-child(3) {
  animation-delay: 0.3s;
  border-top-color: #f59e0b;
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
}

.spinner-ring:nth-child(4) {
  animation-delay: 0.45s;
  border-top-color: #ef4444;
  width: 40%;
  height: 40%;
  top: 30%;
  left: 30%;
}

.loading-text {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 小尺寸加载 */
.loading-container.small {
  padding: 1rem;
}

.loading-container.small .loading-spinner {
  width: 32px;
  height: 32px;
}

.loading-container.small .loading-text {
  font-size: 0.85rem;
}

/* 大尺寸加载 */
.loading-container.large {
  padding: 3rem;
}

.loading-container.large .loading-spinner {
  width: 64px;
  height: 64px;
}

.loading-container.large .loading-text {
  font-size: 1rem;
}

/* 暗色主题 */
.dark .loading-text {
  color: #cbd5e1;
}

.dark .loading-overlay {
  background-color: rgba(0, 0, 0, 0.8);
}
</style>