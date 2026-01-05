/**
 * 统一日志工具
 * 生产环境只输出 error 级别日志
 * 开发环境可配置输出级别
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

class Logger {
  private currentLevel: number
  private isProduction: boolean

  constructor() {
    this.isProduction = import.meta.env.MODE === 'production'
    this.currentLevel = this.isProduction ? 3 : 0 // 生产环境只输出error
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= this.currentLevel
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.log('[DEBUG]', ...args)
    }
  }

  info(...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info('[INFO]', ...args)
    }
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...args)
    }
  }

  error(...args: unknown[]): void {
    // error 级别始终输出
    console.error('[ERROR]', ...args)
  }

  // API请求专用日志
  api(method: string, url: string, data?: unknown): void {
    if (this.shouldLog('debug')) {
      console.log(`[API] ${method.toUpperCase()} ${url}`, data || '')
    }
  }

  apiError(method: string, url: string, error: unknown): void {
    this.error(`[API] ${method.toUpperCase()} ${url} 失败:`, error)
  }
}

export const logger = new Logger()
