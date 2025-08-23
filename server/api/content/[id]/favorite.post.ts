import { PrismaClient } from '@prisma/client'
import { defineEventHandler, getRouterParam, createError, getHeader } from 'h3'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 验证用户是否已登录
    const authHeader = getHeader(event, 'Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }
    
    const token = authHeader.split(' ')[1]
    let decoded
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    } catch (err) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }
    
    const userId = decoded.userId

    const contentId = getRouterParam(event, 'id')
    
    if (!contentId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Content ID is required'
      })
    }

    // 查找内容
    const content = await prisma.content.findUnique({
      where: { id: contentId }
    })

    if (!content) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Content not found'
      })
    }

    // 检查用户是否已收藏
    const existingFavorite = await prisma.contentFavorite.findUnique({
      where: {
        userId_contentId: {
          userId,
          contentId
        }
      }
    })

    let updatedContent

    if (existingFavorite) {
      // 如果已收藏，则取消收藏
      await prisma.contentFavorite.delete({
        where: {
          userId_contentId: {
            userId,
            contentId
          }
        }
      })

      // 减少收藏数
      updatedContent = await prisma.content.update({
        where: { id: contentId },
        data: {
          favorites: { decrement: 1 }
        },
        select: {
          id: true,
          favorites: true
        }
      })
    } else {
      // 如果未收藏，则添加收藏
      await prisma.contentFavorite.create({
        data: {
          userId,
          contentId
        }
      })

      // 增加收藏数
      updatedContent = await prisma.content.update({
        where: { id: contentId },
        data: {
          favorites: { increment: 1 }
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