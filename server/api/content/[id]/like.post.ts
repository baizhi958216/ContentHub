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

    // 检查是否已经点赞过（基于IP地址，简单实现）
    const existingLike = await prisma.userAction.findFirst({
      where: {
        contentId,
        action: 'like',
        ipAddress
      }
    })

    let updatedContent

    if (existingLike) {
      // 取消点赞
      await prisma.userAction.delete({
        where: { id: existingLike.id }
      })

      updatedContent = await prisma.content.update({
        where: { id: contentId },
        data: {
          likes: {
            decrement: 1
          }
        },
        select: {
          id: true,
          likes: true
        }
      })
    } else {
      // 添加点赞
      await prisma.userAction.create({
        data: {
          contentId,
          action: 'like',
          ipAddress,
          userAgent
        }
      })

      updatedContent = await prisma.content.update({
        where: { id: contentId },
        data: {
          likes: {
            increment: 1
          }
        },
        select: {
          id: true,
          likes: true
        }
      })
    }

    return updatedContent
  } catch (error) {
    console.error('Error updating like count:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update like count'
    })
  }
})