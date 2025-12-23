/**
 * 全局类型定义
 * 为JavaScript项目提供TypeScript类型支持
 */

// Vue相关类型扩展
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $ errorHandler: any
    $apiHelper: any
  }
}

// 环境变量类型
declare interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_ENV: 'development' | 'production' | 'staging'
  readonly VITE_ENABLE_MOCK: string
}

// 环境变量接口
declare interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 全局错误处理
declare global {
  interface Window {
    errorHandler: any
    appConfig: {
      apiBaseUrl: string
      version: string
      environment: string
    }
  }
}

export {}