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
  ENABLE_MOCK: false
}

// 生产环境配置（根据需要修改）
const PROD_CONFIG: AppConfig = {
  BASE_URL: 'https://your-production-domain.com',
  API_BASE_URL: 'https://your-production-domain.com/api',
  WS_BASE_URL: 'wss://your-production-domain.com',
  ENABLE_MOCK: false
}

// 根据环境选择配置
const CONFIG: AppConfig = import.meta.env.DEV ? DEV_CONFIG : PROD_CONFIG

export default CONFIG