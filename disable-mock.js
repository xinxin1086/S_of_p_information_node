/**
 * 禁用 Mock 模式（切换到真实 API）
 * 在浏览器控制台运行此脚本
 */

console.log('🔄 正在禁用 Mock 模式，切换到真实 API...')

// 禁用 Mock 模式
localStorage.removeItem('DEV_ENABLE_MOCK')

console.log('✅ 已切换到真实 API 模式！')
console.log('📝 页面将在 1 秒后自动刷新...')

// 延迟刷新，让用户看到消息
setTimeout(() => {
  console.log('🔄 正在刷新页面...')
  window.location.reload()
}, 1000)
