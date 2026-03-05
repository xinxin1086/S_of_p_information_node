// ./src/config.ts
// API基础URL配置
// 开发环境使用相对路径，通过 Vite 代理转发到后端
// 生产环境使用完整 URL

/**
 * 配置接口类型定义
 */
interface AppConfig {
  BASE_URL: string
  API_BASE_URL: string
  WS_BASE_URL: string
  ENABLE_MOCK: boolean
}

export const BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000')
export const API_BASE_URL = import.meta.env.DEV ? '/api' : `${BASE_URL}/api`

// 开发环境配置
const DEV_CONFIG: AppConfig = {
  BASE_URL: '', // 使用相对路径，通过 Vite 代理
  API_BASE_URL: '/api', // 使用相对路径，通过 Vite 代理
  WS_BASE_URL: 'ws://localhost:5000',
  ENABLE_MOCK: false // 默认不启用 Mock，可通过 localStorage 切换
}

// 生产环境配置（根据需要修改）
const PROD_CONFIG: AppConfig = {
  BASE_URL: 'https://your-production-domain.com',
  API_BASE_URL: 'https://your-production-domain.com/api',
  WS_BASE_URL: 'wss://your-production-domain.com',
  ENABLE_MOCK: false
}

// 根据环境选择配置
let CONFIG: AppConfig = import.meta.env.DEV ? DEV_CONFIG : PROD_CONFIG

// 从 localStorage 读取 Mock 模式开关（开发时可通过控制台切换）
if (typeof window !== 'undefined') {
  const mockMode = localStorage.getItem('DEV_ENABLE_MOCK')
  if (mockMode === 'true') {
    CONFIG = { ...CONFIG, ENABLE_MOCK: true }
  }
}

/**
 * 动态切换 Mock 模式（仅开发环境）
 * @param enable 是否启用 Mock
 */
export function setMockMode(enable: boolean): void {
  if (import.meta.env.DEV) {
    localStorage.setItem('DEV_ENABLE_MOCK', enable ? 'true' : 'false')
    CONFIG.ENABLE_MOCK = enable
    console.log(`[Config] Mock 模式已${enable ? '启用' : '禁用'}，页面将刷新`)
    setTimeout(() => window.location.reload(), 500)
  } else {
    console.warn('[Config] 生产环境不允许切换 Mock 模式')
  }
}

/**
 * 获取当前 Mock 模式状态
 */
export function isMockMode(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('DEV_ENABLE_MOCK') === 'true'
  }
  return CONFIG.ENABLE_MOCK
}

export default CONFIG