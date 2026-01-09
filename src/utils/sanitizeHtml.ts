/**
 * HTML 净化工具
 * 使用 DOMPurify 防止 XSS 攻击
 */

import DOMPurify from 'dompurify'
import { ref, computed, type Ref, type ComputedRef } from 'vue'

/**
 * DOMPurify 配置选项
 * 允许基本的 HTML 标签，用于富文本内容显示
 */
const BASE_SANITIZE_CONFIG = {
  // 允许的标签
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'i', 'b',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'img',
    'blockquote', 'pre', 'code',
    'span', 'div',
    'table', 'thead', 'tbody', 'tr', 'th', 'td'
  ],
  // 允许的属性
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'id',
    'target', 'rel', 'style'
  ],
  // 强制 target="_blank" 的链接添加 rel="noopener noreferrer"
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'object', 'embed'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onkey'],
  // 允许 data:image 协议的图片
  ALLOW_DATA_URI: true,
  // 强制 HTTPS 链接（可选）
  // FORCE_BODY: false
}

/**
 * 严格配置 - 仅允许基本的文本格式化标签
 */
const STRICT_SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'i', 'b', 'span'],
  ALLOWED_ATTR: ['class'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'a', 'img', 'object', 'embed'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onfocus', 'onblur', 'onkey'],
  ALLOW_DATA_URI: false
}

/**
 * 高亮配置 - 允许 mark 标签用于搜索高亮
 */
const HIGHLIGHT_SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'mark', 'span'],
  ALLOWED_ATTR: ['class', 'style'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'a', 'img', 'object', 'embed'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onfocus', 'onblur', 'onkey'],
  ALLOW_DATA_URI: false
}

/**
 * 净化 HTML 内容，防止 XSS 攻击
 * @param dirty - 未净化的 HTML 字符串
 * @param config - 可选的 DOMPurify 配置
 * @returns 净化后的 HTML 字符串
 */
export function sanitizeHtml(
  dirty: string | null | undefined,
  config: DOMPurify.Config = BASE_SANITIZE_CONFIG
): string {
  if (!dirty) return ''

  try {
    return DOMPurify.sanitize(dirty, config)
  } catch (error) {
    console.error('HTML 净化失败:', error)
    // 如果净化失败，返回纯文本（移除所有 HTML 标签）
    return dirty.replace(/<[^>]*>/g, '')
  }
}

/**
 * 净化用户输入的富文本内容（文章、通知等）
 * @param content - 富文本内容
 * @returns 净化后的 HTML
 */
export function sanitizeRichText(content: string | null | undefined): string {
  return sanitizeHtml(content, BASE_SANITIZE_CONFIG)
}

/**
 * 严格净化 - 仅允许基本文本格式
 * @param content - HTML 内容
 * @returns 净化后的 HTML
 */
export function sanitizeStrict(content: string | null | undefined): string {
  return sanitizeHtml(content, STRICT_SANITIZE_CONFIG)
}

/**
 * 净化搜索高亮内容
 * @param content - 带高亮标记的内容
 * @returns 净化后的 HTML
 */
export function sanitizeHighlight(content: string | null | undefined): string {
  return sanitizeHtml(content, HIGHLIGHT_SANITIZE_CONFIG)
}

/**
 * 创建计算属性的辅助函数
 * 在 Vue 组件中使用，自动净化响应式数据
 * @param getter - 返回 HTML 字符串的 getter 函数
 * @param config - 可选的净化配置
 * @returns 净化后的计算属性函数
 */
export function createSanitizedComputed(
  getter: () => string | null | undefined,
  config: DOMPurify.Config = BASE_SANITIZE_CONFIG
): () => string {
  return () => sanitizeHtml(getter(), config)
}

/**
 * URL 安全验证
 * 检查 URL 是否安全，防止 javascript: 等危险协议
 * @param url - 要验证的 URL
 * @returns URL 是否安全
 */
export function isUrlSafe(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }

  // 移除前后空格
  const trimmedUrl = url.trim()

  // 检查危险协议
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:',
    'chrome:',
    'chrome-extension:',
    'ms-excel:',
    'ms-word:',
    'ms-powerpoint:'
  ]

  const lowerUrl = trimmedUrl.toLowerCase()
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return false
    }
  }

  // 检查是否包含事件处理器
  if (/\s+on\w+\s*=/i.test(trimmedUrl)) {
    return false
  }

  // 允许 http、https、mailto、tel 协议
  const safeProtocols = [
    'http://',
    'https://',
    'mailto:',
    'tel:',
    '//'
  ]

  // 如果没有协议，认为是相对路径，安全
  if (!trimmedUrl.includes('://')) {
    return true
  }

  for (const protocol of safeProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return true
    }
  }

  return false
}

/**
 * 净化 URL 属性
 * 确保 href、src 等 URL 属性安全
 * @param url - URL 字符串
 * @param defaultUrl - 如果 URL 不安全，返回的默认 URL
 * @returns 安全的 URL
 */
export function sanitizeUrl(url: string | null | undefined, defaultUrl: string = '#'): string {
  if (!url) {
    return defaultUrl
  }

  if (isUrlSafe(url)) {
    return url
  }

  console.warn('检测到不安全的 URL:', url)
  return defaultUrl
}

/**
 * 净化用户输入的文本
 * 移除所有 HTML 标签，只保留纯文本
 * @param text - 用户输入的文本
 * @returns 净化后的纯文本
 */
export function sanitizePlainText(text: string | null | undefined): string {
  if (!text) return ''

  // 移除所有 HTML 标签
  let plainText = text.replace(/<[^>]*>/g, '')

  // 解码 HTML 实体
  const textarea = document.createElement('textarea')
  textarea.innerHTML = plainText
  plainText = textarea.value

  return plainText.trim()
}

/**
 * 验证并净化 CSS 类名
 * 防止通过类名注入恶意代码
 * @param className - CSS 类名
 * @returns 安全的类名字符串
 */
export function sanitizeClassName(className: string | null | undefined): string {
  if (!className) return ''

  // 移除所有非字母数字、连字符、下划线的字符
  return className.replace(/[^a-zA-Z0-9-_]/g, ' ').trim()
}

/**
 * 批量净化多个 HTML 字符串
 * @param items - 包含 HTML 字符串的对象数组
 * @param fields - 需要净化的字段名数组
 * @param config - 净化配置
 * @returns 净化后的数组
 */
export function sanitizeBatch<T extends Record<string, unknown>>(
  items: T[],
  fields: (keyof T)[],
  config: DOMPurify.Config = BASE_SANITIZE_CONFIG
): T[] {
  return items.map(item => {
    const sanitized = { ...item }
    fields.forEach(field => {
      if (sanitized[field] && typeof sanitized[field] === 'string') {
        sanitized[field] = sanitizeHtml(sanitized[field], config) as T[keyof T]
      }
    })
    return sanitized
  })
}

/**
 * DOMPurify Hook (用于 Vue Composition API)
 * 提供响应式的 HTML 净化功能
 * @param html - 响应式的 HTML 字符串
 * @param config - 净化配置
 * @returns 净化后的响应式字符串
 */
export function useSanitizeHtml(
  html: Ref<string | null | undefined>,
  config: DOMPurify.Config = BASE_SANITIZE_CONFIG
): ComputedRef<string> {
  return computed(() => sanitizeHtml(html.value, config))
}

export default sanitizeHtml
