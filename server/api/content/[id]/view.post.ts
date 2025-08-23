import { PrismaClient } from '@prisma/client'
import { defineEventHandler, getRouterParam, createError } from 'h3'

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

    // 增加浏览量
    const updatedContent = await prisma.content.update({
      where: { id: contentId },
      data: {
        views: { increment: 1 }
      },
      select: {
        id: true,
        views: true
      }
    })

    return updatedContent
  } catch (error) {
    console.error('Error updating view count:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update view count'
    })
  }
})