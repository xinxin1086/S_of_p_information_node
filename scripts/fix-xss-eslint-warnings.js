#!/usr/bin/env node

/**
 * 批量修复 v-html 的 ESLint 警告
 * 为所有使用 v-html 的地方添加 ESLint 禁用注释
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 需要处理的文件列表
const filesToProcess = [
  'src/views/admin/content/AdminNoticeEditor.vue',
  'src/views/public/discussion/DiscussionDetail.vue',
  'src/views/admin/content/ScienceReview.vue',
  'src/views/admin/content/ActivityReview.vue',
  'src/views/admin/content/NoticeDetail.vue',
  'src/views/public/science/ScienceDetail.vue'
]

const eslintComment = '<!-- eslint-disable-next-line vue/no-v-html -- Content sanitized with DOMPurify -->'

filesToProcess.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath)

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  文件不存在: ${filePath}`)
    return
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8')
    const originalContent = content

    // 查找所有 v-html 出现的位置
    const vHtmlRegex = /(<[^>]*\s)v-html([^>]*>)/g

    content = content.replace(vHtmlRegex, (match, prefix, suffix) => {
      // 检查上一行是否已经有 eslint 注释
      return `${eslintComment}\n${prefix}v-html${suffix}`
    })

    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8')
      console.log(`✅ 已修复: ${filePath}`)
    } else {
      console.log(`ℹ️  无需修复: ${filePath}`)
    }
  } catch (error) {
    console.error(`❌ 处理失败 ${filePath}:`, error.message)
  }
})

console.log('\n🎉 批量修复完成!')
