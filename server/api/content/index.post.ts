import { defineEventHandler, createError, readBody } from 'h3'
import { prisma } from '~/lib/prisma'


export default defineEventHandler(async (event) => {
  // 检查用户是否已登录
  if (!event.context.auth?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: '请先登录'
    })
  }
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
    let videoId: string | null = null

    // 视频提交采用“两步法”：先上传获取视频URL/ID，再以JSON提交
    if (data.type === 'VIDEO') {
      if (data.videoAssetId) {
        const asset = await prisma.videoAsset.findUnique({
          where: { id: data.videoAssetId }
        })
        if (!asset) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Invalid videoAssetId'
          })
        }
        videoId = asset.id
        localVideoPath = asset.url
      } else if (data.videoUrl) {
        try {
          const asset = await prisma.videoAsset.create({
            data: { url: data.videoUrl }
          })
          videoId = asset.id
          localVideoPath = asset.url
        } catch (err) {
          console.error('创建视频资产失败:', err)
          throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create video asset'
          })
        }
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
      // 创建内容，关联到当前用户
      const content = await prisma.content.create({
        data: {
          title: data.title,
          description: data.description || null,
          originalUrl: data.originalUrl,
          content: data.content || null,
          localVideoPath,
          videoId: videoId || undefined,
          type: data.type,
          tags: {
            connect: tagConnections.length > 0 ? tagConnections : undefined
          },
          // 关联到当前用户
          userId: event.context.auth.user.id
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