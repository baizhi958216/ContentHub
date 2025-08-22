import { PrismaClient } from '@prisma/client'
import { defineEventHandler, getRouterParam, createError, getRequestHeaders } from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const contentId = getRouterParam(event, 'id')
    
    if (!contentId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Content ID is required'
      })
    }

    // 获取客户端信息
    const headers = getRequestHeaders(event)
    const ipAddress = headers['x-forwarded-for'] || 'unknown'
    const userAgent = headers['user-agent'] || 'unknown'

    // 记录用户行为
    await prisma.userAction.create({
      data: {
        contentId,
        action: 'view',
        ipAddress,
        userAgent
      }
    })

    // 增加浏览量
    const updatedContent = await prisma.content.update({
      where: { id: contentId },
      data: {
        views: {
          increment: 1
        }
      },
      select: {
        id: true,
        views: true
      }
    })

    return updatedContent
  } catch (error) {
    console.error('Error updating view count:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update view count'
    })
  }
})