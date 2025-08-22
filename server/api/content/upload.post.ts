import { defineEventHandler, readMultipartFormData } from 'h3'
import { randomUUID } from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    // 获取上传的文件数据
    const formData = await readMultipartFormData(event)
    if (!formData) {
      throw new Error('No form data received')
    }

    // 查找视频文件
    const videoFile = formData.find(part => part.name === 'videoFile')
    if (!videoFile || !videoFile.filename) {
      throw new Error('No video file found in request')
    }

    // 获取其他表单数据
    const getFormValue = (name: string) => {
      const part = formData.find(p => p.name === name)
      return part ? part.data.toString() : null
    }

    const type = getFormValue('type') || 'VIDEO'
    const title = getFormValue('title')
    const originalUrl = getFormValue('originalUrl')
    const description = getFormValue('description')
    const content = getFormValue('content')
    const tagsRaw = getFormValue('tags')
    
    if (!title || !originalUrl) {
      throw new Error('Missing required fields')
    }

    // 解析标签
    let tags = []
    if (tagsRaw) {
      try {
        tags = JSON.parse(tagsRaw)
      } catch (e) {
        console.warn('Failed to parse tags:', e)
      }
    }

    // 创建上传目录
    const uploadDir = process.env.UPLOAD_DIR || 'public/uploads/videos'
    await mkdir(join(process.cwd(), uploadDir), { recursive: true })

    // 生成唯一文件名
    const fileExt = videoFile.filename.split('.').pop() || 'mp4'
    const uniqueFilename = `video-${Date.now()}-${randomUUID().slice(0, 8)}.${fileExt}`
    const filePath = join(process.cwd(), uploadDir, uniqueFilename)
    
    // 保存文件
    await writeFile(filePath, videoFile.data)
    
    // 计算相对路径用于存储在数据库
    const relativePath = join(uploadDir.replace(/^public\//, '/'), uniqueFilename)

    // 创建内容记录
    const newContent = await prisma.content.create({
      data: {
        title,
        originalUrl,
        description: description || '',
        content: content || '',
        type: type as any,
        localVideoPath: relativePath,
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
    console.error('Error handling video upload:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to upload video'
    })
  }
})