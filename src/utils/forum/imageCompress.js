/**
 * 图片压缩工具函数
 */

import { FILE_SIZE_LIMITS } from '@/utils/common/constants'

// 压缩图片
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      outputFormat = 'image/jpeg'
    } = options

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      reject(new Error('文件必须是图片类型'))
      return
    }

    // 创建FileReader
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        // 创建canvas
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // 计算压缩后的尺寸
        const { width, height } = calculateCompressedSize(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        )

        canvas.width = width
        canvas.height = height

        // 绘制压缩后的图片
        ctx.drawImage(img, 0, 0, width, height)

        // 转换为Blob
        canvas.toBlob((blob) => {
          // 创建新的File对象
          const compressedFile = new File([blob], file.name, {
            type: outputFormat,
            lastModified: Date.now()
          })

          // 计算压缩信息
          const compressionInfo = {
            originalSize: file.size,
            compressedSize: compressedFile.size,
            compressionRatio: ((file.size - compressedFile.size) / file.size * 100).toFixed(2),
            originalDimensions: { width: img.width, height: img.height },
            compressedDimensions: { width, height }
          }

          resolve({
            file: compressedFile,
            info: compressionInfo
          })
        }, outputFormat, quality)
      }

      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }

      img.src = e.target.result
    }

    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    reader.readAsDataURL(file)
  })
}

// 计算压缩后的尺寸
function calculateCompressedSize(originalWidth, originalHeight, maxWidth, maxHeight) {
  let { width, height } = { width: originalWidth, height: originalHeight }

  // 如果原尺寸在限制范围内，不需要压缩
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height }
  }

  // 计算缩放比例
  const widthRatio = maxWidth / width
  const heightRatio = maxHeight / height
  const ratio = Math.min(widthRatio, heightRatio)

  width = Math.round(width * ratio)
  height = Math.round(height * ratio)

  return { width, height }
}

// 多级压缩
export const multiStageCompress = async (file, maxSizeKB = FILE_SIZE_LIMITS.IMAGE) => {
  const maxSize = maxSizeKB * 1024 // 转换为字节
  const originalFile = file

  // 如果原文件大小已经满足要求，直接返回
  if (file.size <= maxSize) {
    return {
      file,
      info: {
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0,
        stages: ['无需压缩']
      }
    }
  }

  let compressedFile = file
  const stages = []
  const qualities = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3]

  for (let i = 0; i < qualities.length; i++) {
    const quality = qualities[i]

    try {
      const result = await compressImage(compressedFile, {
        quality,
        maxWidth: 1920,
        maxHeight: 1080
      })

      compressedFile = result.file
      stages.push(`质量${Math.round(quality * 100)}%: ${formatFileSize(result.file.size)}`)

      if (compressedFile.size <= maxSize) {
        break
      }
    } catch (error) {
      console.error(`压缩阶段 ${i} 失败:`, error)
      break
    }
  }

  // 如果压缩后仍然太大，尝试减小尺寸
  if (compressedFile.size > maxSize) {
    const sizeStages = [1200, 800, 600, 400]

    for (const size of sizeStages) {
      try {
        const result = await compressImage(originalFile, {
          quality: 0.8,
          maxWidth: size,
          maxHeight: size
        })

        compressedFile = result.file
        stages.push(`尺寸${size}px: ${formatFileSize(result.file.size)}`)

        if (compressedFile.size <= maxSize) {
          break
        }
      } catch (error) {
        console.error(`尺寸压缩阶段 ${size} 失败:`, error)
        break
      }
    }
  }

  return {
    file: compressedFile,
    info: {
      originalSize: originalFile.size,
      compressedSize: compressedFile.size,
      compressionRatio: ((originalFile.size - compressedFile.size) / originalFile.size * 100).toFixed(2),
      stages
    }
  }
}

// 批量压缩图片
export const batchCompressImages = async (files, options = {}) => {
  const results = []
  const { maxSizeKB = FILE_SIZE_LIMITS.IMAGE, maxConcurrency = 3 } = options

  // 分批处理，避免浏览器崩溃
  for (let i = 0; i < files.length; i += maxConcurrency) {
    const batch = files.slice(i, i + maxConcurrency)
    const batchPromises = batch.map(file =>
      multiStageCompress(file, maxSizeKB).catch(error => ({
        file,
        error: error.message
      }))
    )

    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)

    // 让浏览器有时间处理其他任务
    if (i + maxConcurrency < files.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return results
}

// 生成图片预览URL
export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('文件必须是图片类型'))
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      resolve(e.target.result)
    }

    reader.onerror = () => {
      reject(new Error('图片预览生成失败'))
    }

    reader.readAsDataURL(file)
  })
}

// 检查图片格式
export const getImageFormat = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const arr = new Uint8Array(e.target.result).subarray(0, 4)
      let header = ''

      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16)
      }

      let format = 'unknown'

      switch (header) {
        case '89504e47':
          format = 'png'
          break
        case '47494638':
          format = 'gif'
          break
        case 'ffd8ffe0':
        case 'ffd8ffe1':
        case 'ffd8ffe2':
        case 'ffd8ffe3':
        case 'ffd8ffe8':
          format = 'jpg'
          break
        case '52494646':
          format = 'webp'
          break
        default:
          format = 'unknown'
      }

      resolve(format)
    }

    reader.onerror = () => {
      reject(new Error('图片格式检测失败'))
    }

    reader.readAsArrayBuffer(file.slice(0, 4))
  })
}

// 获取图片信息
export const getImageInfo = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio: (img.width / img.height).toFixed(2),
        size: file.size,
        type: file.type,
        name: file.name
      })
    }

    img.onerror = () => {
      reject(new Error('图片信息获取失败'))
    }

    img.src = URL.createObjectURL(file)
  })
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 压缩配置
export const COMPRESSION_CONFIGS = {
  avatar: {
    maxWidth: 200,
    maxHeight: 200,
    quality: 0.9,
    maxSizeKB: FILE_SIZE_LIMITS.AVATAR
  },
  post: {
    maxWidth: 800,
    maxHeight: 600,
    quality: 0.85,
    maxSizeKB: FILE_SIZE_LIMITS.IMAGE
  },
  gallery: {
    maxWidth: 1200,
    maxHeight: 900,
    quality: 0.8,
    maxSizeKB: FILE_SIZE_LIMITS.IMAGE
  },
  thumbnail: {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.9,
    maxSizeKB: 100
  }
}

// 根据用途压缩图片
export const compressForPurpose = async (file, purpose = 'post') => {
  const config = COMPRESSION_CONFIGS[purpose] || COMPRESSION_CONFIGS.post

  // 先调整尺寸
  const sizedResult = await compressImage(file, {
    maxWidth: config.maxWidth,
    maxHeight: config.maxHeight,
    quality: 0.95
  })

  // 再根据大小限制压缩
  const finalResult = await multiStageCompress(sizedResult.file, config.maxSizeKB)

  return {
    file: finalResult.file,
    info: {
      ...finalResult.info,
      purpose,
      config
    }
  }
}

export default {
  compressImage,
  multiStageCompress,
  batchCompressImages,
  createImagePreview,
  getImageFormat,
  getImageInfo,
  compressForPurpose,
  COMPRESSION_CONFIGS
}