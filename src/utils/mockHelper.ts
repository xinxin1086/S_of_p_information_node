/**
 * Mock 模式统一判断工具
 * 所有适配器都应该使用这个工具来判断是否使用 Mock API
 */

import CONFIG from '@/config'

/**
 * 判断当前是否启用 Mock 模式
 * 优先从 localStorage 读取，其次使用配置文件
 *
 * @returns {boolean} 是否启用 Mock 模式
 */
export function shouldUseMock(): boolean {
  // 开发环境下，检查 localStorage 的设置
  if (import.meta.env.DEV) {
    if (typeof window !== 'undefined') {
      const mockMode = localStorage.getItem('DEV_ENABLE_MOCK')
      return mockMode === 'true'
    }
  }

  // 生产环境或没有设置时，使用配置文件
  return CONFIG.ENABLE_MOCK
}

/**
 * 获取当前 API 类型
 * @returns {'mock' | 'real'}
 */
export function getCurrentApiType(): 'mock' | 'real' {
  return shouldUseMock() ? 'mock' : 'real'
}

/**
 * 显示当前 API 模式提示（开发环境）
 */
export function showApiModeTip(): void {
  if (import.meta.env.DEV) {
    const mode = getCurrentApiType()
    console.log(
      `%c[API] 当前使用 ${mode.toUpperCase()} API`,
      `color: ${mode === 'mock' ? '#e6a23c' : '#67c23a'}; font-weight: bold; font-size: 12px; padding: 4px 8px; border-radius: 4px;`
    )

    if (mode === 'mock') {
      console.log(
        '%c[API] 切换到真实 API: setMockMode(false)',
        'color: #909399; font-size: 11px;'
      )
    } else {
      console.log(
        '%c[API] 切换到 Mock API: setMockMode(true)',
        'color: #909399; font-size: 11px;'
      )
    }

    // 显示所有适配器的状态
    console.log(
      '%c[API] 适配器状态: 活动 ✓ | 用户 ✓',
      'color: #409eff; font-size: 11px;'
    )
  }
}

/**
 * 监听 Mock 模式变化（可选）
 * 当 localStorage 中的 DEV_ENABLE_MOCK 变化时触发回调
 */
export function onMockModeChange(callback: (isMock: boolean) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const handler = (e: StorageEvent) => {
    if (e.key === 'DEV_ENABLE_MOCK') {
      const isMock = e.newValue === 'true'
      callback(isMock)
    }
  }

  window.addEventListener('storage', handler)

  // 返回清理函数
  return () => {
    window.removeEventListener('storage', handler)
  }
}

export default {
  shouldUseMock,
  getCurrentApiType,
  showApiModeTip,
  onMockModeChange
}
