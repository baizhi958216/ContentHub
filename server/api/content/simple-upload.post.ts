import { defineEventHandler, createError, readRawBody, getHeader } from 'h3'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    // 获取请求头
    const contentType = getHeader(event, 'content-type') || ''
    
    if (!contentType.includes('multipart/form-data')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Content type must be multipart/form-data'
      })
    }

    // 读取原始请求体
    const body = await readRawBody(event)
    if (!body) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No data received'
      })
    }

    // 解析multipart数据
    const boundary = contentType.split('boundary=')[1]
    if (!boundary) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No boundary found in content type'
      })
    }

    // 确保 body 是 Buffer 类型
    const bodyBuffer = Buffer.isBuffer(body) ? body : Buffer.from(body)
    const parts = parseMultipartData(bodyBuffer, boundary)
    
    // 提取表单字段
    const getField = (name: string) => {
      const part = parts.find(p => p.name === name)
      return part ? part.data.toString() : null
    }

    const title = getField('title')
    const originalUrl = getField('originalUrl')
    const description = getField('description')
    const content = getField('content')
    const type = getField('type') || 'VIDEO'
    const tagsRaw = getField('tags')

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

    // 查找视频文件
    const videoFile = parts.find(p => p.name === 'videoFile' && p.filename)
    let localVideoPath = null

    if (videoFile) {
      // 创建上传目录
      const uploadDir = process.env.UPLOAD_DIR || 'public/uploads/videos'
      await mkdir(join(process.cwd(), uploadDir), { recursive: true })

      // 生成唯一文件名
      const fileExt = videoFile.filename?.split('.').pop() || 'mp4'
      const uniqueFilename = `video-${Date.now()}-${randomUUID().slice(0, 8)}.${fileExt}`
      const filePath = join(process.cwd(), uploadDir, uniqueFilename)
      
      // 保存文件 - 确保data是Buffer类型
      const fileBuffer = Buffer.isBuffer(videoFile.data) ? videoFile.data : Buffer.from(videoFile.data)
      await writeFile(filePath, fileBuffer)
      
      // 计算相对路径，确保使用正斜杠
      const relativePath = uploadDir.replace(/^public[\/\\]/, '/').replace(/\\/g, '/')
      localVideoPath = `${relativePath}/${uniqueFilename}`
    }

    // 创建内容记录
    const newContent = await prisma.content.create({
      data: {
        title,
        originalUrl,
        description: description || '',
        content: content || '',
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
    console.error('Error handling upload:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to upload'
    })
  }
})

// 简单的multipart解析器
function parseMultipartData(buffer: Buffer | string, boundary: string) {
  // 确保 buffer 是 Buffer 类型
  const bufferData = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
  const parts = []
  const boundaryBuffer = Buffer.from(`--${boundary}`)
  const endBoundaryBuffer = Buffer.from(`--${boundary}--`)
  
  let start = 0
  let end = bufferData.indexOf(boundaryBuffer, start)
  
  while (end !== -1) {
    if (start > 0) {
      const partData = bufferData.slice(start, end)
      const part = parseMultipartPart(partData)
      if (part) {
        parts.push(part)
      }
    }
    
    start = end + boundaryBuffer.length
    end = bufferData.indexOf(boundaryBuffer, start)
    
    // 检查是否到达结束边界
    if (bufferData.indexOf(endBoundaryBuffer, start) === start) {
      break
    }
  }
  
  return parts
}

function parseMultipartPart(buffer: Buffer | string) {
  // 确保 buffer 是 Buffer 类型
  const bufferData = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
  const headerEnd = bufferData.indexOf(Buffer.from('\r\n\r\n'))
  if (headerEnd === -1) return null
  
  const headerSection = bufferData.slice(0, headerEnd).toString()
  
  // 对于文件数据，我们需要更精确地处理边界
  let dataSection = bufferData.slice(headerEnd + 4)
  
  // 如果这是文件数据，移除末尾可能的 \r\n，但要小心不要截断实际的文件数据
  const dispositionMatch = headerSection.match(/Content-Disposition: form-data; name="([^"]+)"(?:; filename="([^"]+)")?/)
  if (!dispositionMatch) return null
  
  // 只有在非文件字段时才移除末尾的 \r\n
  if (!dispositionMatch[2]) {
    // 这是普通表单字段，移除末尾的 \r\n
    if (dataSection.length >= 2 && dataSection[dataSection.length - 2] === 0x0D && dataSection[dataSection.length - 1] === 0x0A) {
      dataSection = dataSection.slice(0, -2)
    }
  }
  
  return {
    name: dispositionMatch[1],
    filename: dispositionMatch[2] || null,
    data: dataSection
  }
}
