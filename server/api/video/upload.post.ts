import { defineEventHandler, createError } from 'h3'
import { IncomingForm } from 'formidable'
import { mkdir, copyFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { prisma } from '~/lib/prisma'

// 解析文件大小字符串，如 "800MB", "1GB" 等
function parseFileSize(sizeStr: string): number {
  const units: Record<string, number> = {
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024
  }
  
  const match = sizeStr.match(/^(\d+)([A-Za-z]+)$/)
  if (!match) return 800 * 1024 * 1024 // 默认800MB
  
  const size = parseInt(match[1], 10)
  const unit = match[2].toUpperCase()
  
  return size * (units[unit] || 1)
}

export default defineEventHandler(async (event) => {
  try {
    // 从环境变量获取最大文件大小，默认为800MB
    const maxFileSizeStr = process.env.MAX_FILE_SIZE || '800MB'
    const maxFileSize = parseFileSize(maxFileSizeStr)
    
    const form = new IncomingForm({
      maxFileSize: maxFileSize,
      keepExtensions: true,
      multiples: false
    })

    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(event.node.req, (err, fields, files) => {
        if (err) reject(err)
        else resolve([fields, files])
      })
    })

    const getFieldValue = (field: any) => (Array.isArray(field) ? field[0] : field)
    const videoFile = getFieldValue(files.videoFile)

    if (!videoFile) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No video file provided'
      })
    }

    const uploadDir = process.env.UPLOAD_DIR || 'public/uploads/videos'
    await mkdir(join(process.cwd(), uploadDir), { recursive: true })

    const originalName: string | undefined = videoFile.originalFilename
    const ext = (originalName?.split('.').pop() || 'mp4').toLowerCase()
    const uniqueFilename = `video-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`
    const finalPath = join(process.cwd(), uploadDir, uniqueFilename)

    // formidable 已保存到临时路径，这里复制到最终路径
    await copyFile(videoFile.filepath, finalPath)

    // 对外可访问的相对URL（去掉 public 前缀，统一正斜杠）
    const relativeBase = uploadDir.replace(/^public[\/\\]/, '/').replace(/\\/g, '/')
    const publicUrl = `${relativeBase}/${uniqueFilename}`

    const asset = await prisma.videoAsset.create({
      data: {
        url: publicUrl,
        path: finalPath,
        filename: originalName || uniqueFilename,
        size: typeof videoFile.size === 'number' ? Math.trunc(videoFile.size) : null,
        mimeType: typeof videoFile.mimetype === 'string' ? videoFile.mimetype : null
      }
    })

    return {
      id: asset.id,
      url: asset.url,
      filename: asset.filename,
      size: asset.size,
      mimeType: asset.mimeType
    }
  } catch (error: any) {
    console.error('Video upload failed:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to upload video'
    })
  }
})