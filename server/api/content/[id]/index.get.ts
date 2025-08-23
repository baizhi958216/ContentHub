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

    // 获取内容详情，包含用户信息和标签
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        tags: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!content) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Content not found'
      })
    }

    return content
  } catch (error) {
    console.error('Error fetching content:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch content'
    })
  }
})