import { PrismaClient } from '@prisma/client'
import { defineEventHandler, getRouterParam, createError, getHeader } from 'h3'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // 验证用户是否已登录
    const authHeader = getHeader(event, 'Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        isLiked: false,
        isFavorited: false
      }
    }
    
    const token = authHeader.split(' ')[1]
    let decoded
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    } catch (err) {
      return {
        isLiked: false,
        isFavorited: false
      }
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

    // 检查用户是否已点赞
    const existingLike = await prisma.contentLike.findUnique({
      where: {
        userId_contentId: {
          userId,
          contentId
        }
      }
    })

    // 检查用户是否已收藏
    const existingFavorite = await prisma.contentFavorite.findUnique({
      where: {
        userId_contentId: {
          userId,
          contentId
        }
      }
    })

    return {
      isLiked: !!existingLike,
      isFavorited: !!existingFavorite
    }
  } catch (error) {
    console.error('Error checking user actions:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to check user actions'
    })
  }
})