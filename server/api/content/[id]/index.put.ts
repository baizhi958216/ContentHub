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

  const id = event.context.params.id
  const data = await readBody(event)

  try {
    // 获取当前内容
    const existingContent = await prisma.content.findUnique({
      where: { id },
      include: {
        tags: true
      }
    })

    if (!existingContent) {
      throw createError({
        statusCode: 404,
        statusMessage: '内容不存在'
      })
    }

    // 检查权限：只有内容创建者或管理员可以编辑
    if (existingContent.userId !== event.context.auth.user.id && event.context.auth.user.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        statusMessage: '您没有权限编辑此内容'
      })
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

    // 更新内容
    const updateData: any = {
      title: data.title,
      description: data.description || null,
      originalUrl: data.originalUrl,
      content: data.content || null,
    }

    // 如果有视频相关更新
    if (data.type === 'VIDEO' && data.videoAssetId && data.videoAssetId !== existingContent.videoId) {
      const asset = await prisma.videoAsset.findUnique({
        where: { id: data.videoAssetId }
      })
      if (asset) {
        updateData.videoId = asset.id
        updateData.localVideoPath = asset.url
      }
    }

    // 更新内容
    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        ...updateData,
        tags: {
          // 先断开所有标签连接
          disconnect: existingContent.tags.map(tag => ({ id: tag.id })),
          // 然后连接新标签
          connect: tagConnections.length > 0 ? tagConnections : undefined
        }
      },
      include: {
        tags: true,
        comments: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return updatedContent
  } catch (error: any) {
    console.error('Error updating content:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to update content'
    })
  }
})