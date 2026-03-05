/**
 * 启用 Mock 模式
 * 在浏览器控制台运行此脚本
 */

console.log('🔄 正在启用 Mock 模式...')

// 设置 Mock 模式
localStorage.setItem('DEV_ENABLE_MOCK', 'true')

console.log('✅ Mock 模式已启用！')
console.log('📝 页面将在 1 秒后自动刷新...')

// 延迟刷新，让用户看到消息
setTimeout(() => {
  console.log('🔄 正在刷新页面...')
  window.location.reload()
}, 1000)
