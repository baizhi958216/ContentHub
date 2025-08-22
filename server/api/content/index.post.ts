import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { defineEventHandler, createError, readBody } from 'h3'

const prisma = new PrismaClient()

// 获取环境变量
const config = {
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '100') * 1024 * 1024 // 默认100MB
}

export default defineEventHandler(async (event) => {
  try {
    // 使用 readBody 处理请求数据
    const data = await readBody(event)
    
    if (!data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No data provided'
      })
    }

    // 验证必填字段
    if (!data.title || !data.originalUrl || !data.type) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields'
      })
    }

    let localVideoPath = null

    // 处理视频文件上传 - 由于直接处理文件上传有问题，我们使用base64编码的方式
    if (data.type === 'VIDEO' && data.videoBase64) {
      try {
        // 从环境变量中获取上传目录
        const uploadBasePath = config.uploadDir.startsWith('./') 
          ? config.uploadDir.substring(2) // 移除开头的 './'
          : config.uploadDir;
        
        // 确保上传目录存在
        const fullUploadDir = join(process.cwd(), 'public', uploadBasePath, 'videos');
        if (!existsSync(fullUploadDir)) {
          await mkdir(fullUploadDir, { recursive: true });
        }
        
        // 生成唯一文件名
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 10);
        const fileName = `video-${timestamp}-${randomString}.mp4`;
        
        // 构建文件路径
        const filePath = join(fullUploadDir, fileName);
        localVideoPath = `/${uploadBasePath}/videos/${fileName}`;
        
        console.log(`保存视频文件到: ${filePath}`);
        
        // 解码base64并保存文件
        const base64Data = data.videoBase64.split(';base64,').pop();
        if (base64Data) {
          const fileBuffer = Buffer.from(base64Data, 'base64');
          
          // 检查文件大小
          if (fileBuffer.length > config.maxFileSize) {
            throw createError({
              statusCode: 400,
              statusMessage: `File size exceeds the limit of ${config.maxFileSize / (1024 * 1024)}MB`
            });
          }
          
          await writeFile(filePath, fileBuffer);
          console.log(`视频文件已保存，大小: ${fileBuffer.length} 字节`);
        }
      } catch (err) {
        console.error('保存文件失败:', err);
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to save video file'
        });
      }
    }

    // 处理标签
    const tagNames = data.tags || []
    const tagConnections = []

    for (const tagName of tagNames) {
      if (tagName && tagName.trim()) {
        try {
          // 查找或创建标签
          const tag = await prisma.tag.upsert({
            where: { name: tagName.trim() },
            update: {},
            create: { name: tagName.trim() }
          })
          tagConnections.push({ id: tag.id })
        } catch (err) {
          console.error('处理标签失败:', err);
          // 继续处理其他标签
        }
      }
    }

    try {
      // 创建内容
      const content = await prisma.content.create({
        data: {
          title: data.title,
          description: data.description || null,
          originalUrl: data.originalUrl,
          content: data.content || null,
          localVideoPath,
          type: data.type,
          tags: {
            connect: tagConnections.length > 0 ? tagConnections : undefined
          }
        },
        include: {
          tags: true,
          comments: true
        }
      })

      return content
    } catch (err) {
      console.error('创建内容记录失败:', err);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create content record'
      });
    }
  } catch (error: any) {
    console.error('Error creating content:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create content'
    })
  }
})