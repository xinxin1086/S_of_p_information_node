/**
 * 内容过滤工具函数
 */

import { REGEX_PATTERNS } from '@/utils/common/constants'

// 敏感词列表（这里只是示例，实际应该从服务器获取）
const SENSITIVE_WORDS = [
  '违法', '违规', '敏感词1', '敏感词2', '敏感词3'
]

// 垃圾内容模式
const SPAM_PATTERNS = [
  /微信/i,
  /QQ/i,
  /电话/i,
  /联系方式/i,
  /加我/i,
  /私聊/i,
  /赚钱/i,
  /兼职/i,
  /刷单/i,
  /淘宝/i,
  /京东/i,
  /拼多多/i
]

// HTML标签过滤
export const stripHtml = (html) => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '')
}

// 过滤敏感词
export const filterSensitiveWords = (text) => {
  if (!text) return ''

  let filteredText = text
  SENSITIVE_WORDS.forEach(word => {
    const regex = new RegExp(word, 'gi')
    filteredText = filteredText.replace(regex, '**')
  })

  return filteredText
}

// 检测垃圾内容
export const detectSpam = (text) => {
  if (!text) return { isSpam: false, score: 0 }

  let score = 0
  const reasons = []

  // 检查敏感词
  const sensitiveWordCount = SENSITIVE_WORDS.filter(word =>
    text.toLowerCase().includes(word.toLowerCase())
  ).length

  if (sensitiveWordCount > 0) {
    score += sensitiveWordCount * 20
    reasons.push(`包含${sensitiveWordCount}个敏感词`)
  }

  // 检查垃圾内容模式
  SPAM_PATTERNS.forEach(pattern => {
    if (pattern.test(text)) {
      score += 15
      reasons.push('包含垃圾内容模式')
    }
  })

  // 检查是否包含大量特殊字符
  const specialCharCount = (text.match(/[^\w\s\u4e00-\u9fa5]/g) || []).length
  const specialCharRatio = specialCharCount / text.length
  if (specialCharRatio > 0.3) {
    score += 10
    reasons.push('包含大量特殊字符')
  }

  // 检查是否全大写
  if (text === text.toUpperCase() && text.length > 10) {
    score += 5
    reasons.push('全大写文本')
  }

  // 检查重复字符
  const repeatPattern = /(.)\1{4,}/g
  if (repeatPattern.test(text)) {
    score += 10
    reasons.push('包含重复字符')
  }

  // 检查是否为纯数字
  if (/^\d+$/.test(text) && text.length > 5) {
    score += 15
    reasons.push('纯数字内容')
  }

  const isSpam = score >= 30

  return {
    isSpam,
    score,
    reasons,
    level: score >= 50 ? 'high' : score >= 30 ? 'medium' : 'low'
  }
}

// 内容净化
export const cleanContent = (content) => {
  if (!content) return ''

  return content
    .trim() // 去除首尾空格
    .replace(/\s+/g, ' ') // 合并多个空格
    .replace(/\n{3,}/g, '\n\n') // 合并多个换行
    .replace(/ {3,}/g, '  ') // 合并多个空格
}

// 检查内容长度
export const checkContentLength = (content, minLength = 1, maxLength = 10000) => {
  if (!content) {
    return {
      valid: false,
      message: '内容不能为空'
    }
  }

  const length = content.trim().length

  if (length < minLength) {
    return {
      valid: false,
      message: `内容长度不能少于${minLength}个字符`
    }
  }

  if (length > maxLength) {
    return {
      valid: false,
      message: `内容长度不能超过${maxLength}个字符`
    }
  }

  return {
    valid: true,
    length
  }
}

// 提取摘要
export const extractSummary = (content, maxLength = 200) => {
  if (!content) return ''

  const cleanContent = stripHtml(content).replace(/\s+/g, ' ')
  return cleanContent.length > maxLength
    ? cleanContent.substring(0, maxLength) + '...'
    : cleanContent
}

// 检测语言类型
export const detectLanguage = (text) => {
  if (!text) return 'unknown'

  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length
  const totalChars = chineseChars + englishChars

  if (totalChars === 0) return 'unknown'

  const chineseRatio = chineseChars / totalChars

  if (chineseRatio > 0.6) return 'chinese'
  if (chineseRatio < 0.3) return 'english'
  return 'mixed'
}

// 检查是否为有效URL
export const isValidUrl = (url) => {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// 提取URL
export const extractUrls = (text) => {
  if (!text) return []

  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g
  return text.match(urlRegex) || []
}

// 提取@用户
export const extractMentions = (text) => {
  if (!text) return []

  const mentionRegex = /@([a-zA-Z0-9_]+)/g
  const mentions = []
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1])
  }

  return mentions
}

// 提取#话题
export const extractHashtags = (text) => {
  if (!text) return []

  const hashtagRegex = /#([^#\s]+)/g
  const hashtags = []
  let match

  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push(match[1])
  }

  return hashtags
}

// 内容质量评分
export const getContentQualityScore = (content) => {
  if (!content) return 0

  let score = 0
  const cleanText = stripHtml(content).trim()

  // 基础分数
  score += 10

  // 长度分数
  const length = cleanText.length
  if (length >= 50) score += 10
  if (length >= 200) score += 10
  if (length >= 500) score += 10

  // 包含图片加分
  if (/<img/i.test(content)) score += 5

  // 包含链接加分
  if (extractUrls(content).length > 0) score += 3

  // 提及用户加分
  if (extractMentions(content).length > 0) score += 2

  // 话题标签加分
  if (extractHashtags(content).length > 0) score += 2

  // 段落结构加分
  const paragraphs = content.split('\n').filter(p => p.trim().length > 0)
  if (paragraphs.length >= 3) score += 5

  // 语言多样性加分
  const hasChinese = /[\u4e00-\u9fa5]/.test(cleanText)
  const hasEnglish = /[a-zA-Z]/.test(cleanText)
  if (hasChinese && hasEnglish) score += 3

  // 垃圾内容扣分
  const spamResult = detectSpam(cleanText)
  score -= spamResult.score

  return Math.max(0, Math.min(100, score))
}

// 格式化用户输入
export const formatUserInput = (input) => {
  if (!input) return ''

  return input
    .trim()
    .replace(/\r\n/g, '\n') // 统一换行符
    .replace(/\n{3,}/g, '\n\n') // 限制连续换行
    .replace(/ {2,}/g, ' ') // 限制连续空格
}

export default {
  stripHtml,
  filterSensitiveWords,
  detectSpam,
  cleanContent,
  checkContentLength,
  extractSummary,
  detectLanguage,
  isValidUrl,
  extractUrls,
  extractMentions,
  extractHashtags,
  getContentQualityScore,
  formatUserInput
}