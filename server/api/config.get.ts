import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  // 从环境变量读取配置，处理带单位的字符串
  const maxFileSizeStr = process.env.MAX_FILE_SIZE || '100MB'
  let maxFileSizeMB = 100 // 默认值
  
  // 解析带单位的文件大小字符串
  if (maxFileSizeStr.toLowerCase().endsWith('mb')) {
    maxFileSizeMB = parseInt(maxFileSizeStr.replace(/mb$/i, ''))
  } else if (maxFileSizeStr.toLowerCase().endsWith('gb')) {
    maxFileSizeMB = parseInt(maxFileSizeStr.replace(/gb$/i, '')) * 1024
  } else {
    // 如果没有单位，假设是MB
    maxFileSizeMB = parseInt(maxFileSizeStr)
  }
  
  const maxFileSize = maxFileSizeMB * 1024 * 1024 // 转换为字节
  
  console.log(`File size config: ${maxFileSizeStr} -> ${maxFileSizeMB}MB -> ${maxFileSize} bytes`)
  
  return {
    maxFileSize,
    maxFileSizeMB,
    uploadDir: process.env.UPLOAD_DIR || 'public/uploads/videos'
  }
})
