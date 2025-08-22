import { defineEventHandler, createError } from 'h3'
import { IncomingForm } from 'formidable'
import { writeFile, mkdir, copyFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const form = new IncomingForm({
      maxFileSize: 800 * 1024 * 1024, // 800MB
      keepExtensions: true,
      multiples: false
    })

    // 解析表单数据
    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(event.node.req, (err, fields, files) => {
        if (err) reject(err)
        else resolve([fields, files])
      })
    })

    // 提取字段值（formidable返回数组）
    const getFieldValue = (field: any) => {
      return Array.isArray(field) ? field[0] : field
    }

    const title = getFieldValue(fields.title)
    const originalUrl = getFieldValue(fields.originalUrl)
    const description = getFieldValue(fields.description) || ''
    const content = getFieldValue(fields.content) || ''
    const type = getFieldValue(fields.type) || 'VIDEO'
    const tagsRaw = getFieldValue(fields.tags)

    if (!title || !originalUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: title and originalUrl'
      })
    }

    // 处理标签
    let tags = []
    if (tagsRaw) {
      try {
        tags = JSON.parse(tagsRaw)
      } catch (e) {
        console.warn('Failed to parse tags:', e)
      }
    }

    // 处理视频文件
    let localVideoPath = null
    const videoFile = getFieldValue(files.videoFile)

    if (videoFile) {
      console.log('Original file size:', videoFile.size, 'bytes')
      console.log('Original file name:', videoFile.originalFilename)
      
      // 创建上传目录
      const uploadDir = process.env.UPLOAD_DIR || 'public/uploads/videos'
      await mkdir(join(process.cwd(), uploadDir), { recursive: true })

      // 生成唯一文件名
      const fileExt = videoFile.originalFilename?.split('.').pop() || 'mp4'
      const uniqueFilename = `video-${Date.now()}-${randomUUID().slice(0, 8)}.${fileExt}`
      const finalPath = join(process.cwd(), uploadDir, uniqueFilename)
      
      // 复制文件到最终位置（formidable已经处理了文件上传）
      await copyFile(videoFile.filepath, finalPath)
      
      // 计算相对路径，确保使用正斜杠
      const relativePath = uploadDir.replace(/^public[\/\\]/, '/').replace(/\\/g, '/')
      localVideoPath = `${relativePath}/${uniqueFilename}`
      
      console.log('File saved to:', finalPath)
      console.log('Relative path:', localVideoPath)
    }

    // 创建内容记录
    const newContent = await prisma.content.create({
      data: {
        title,
        originalUrl,
        description,
        content,
        type: type as any,
        localVideoPath,
        tags: {
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag }
          }))
        }
      },
      include: {
        tags: true
      }
    })

    return newContent
  } catch (error) {
    console.error('Error handling formidable upload:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to upload'
    })
  }
})