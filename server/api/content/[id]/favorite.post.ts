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

    // 检查是否已经收藏过（基于IP地址，简单实现）
    const existingFavorite = await prisma.userAction.findFirst({
      where: {
        contentId,
        action: 'favorite',
        ipAddress
      }
    })

    let updatedContent

    if (existingFavorite) {
      // 取消收藏
      await prisma.userAction.delete({
        where: { id: existingFavorite.id }
      })

      updatedContent = await prisma.content.update({
        where: { id: contentId },
        data: {
          favorites: {
            decrement: 1
          }
        },
        select: {
          id: true,
          favorites: true
        }
      })
    } else {
      // 添加收藏
      await prisma.userAction.create({
        data: {
          contentId,
          action: 'favorite',
          ipAddress,
          userAgent
        }
      })

      updatedContent = await prisma.content.update({
        where: { id: contentId },
        data: {
          favorites: {
            increment: 1
          }
        },
        select: {
          id: true,
          favorites: true
        }
      })
    }

    return updatedContent
  } catch (error) {
    console.error('Error updating favorite count:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update favorite count'
    })
  }
})