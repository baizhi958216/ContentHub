import { defineEventHandler, createError } from 'h3'
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

  try {
    // 获取当前内容
    const existingContent = await prisma.content.findUnique({
      where: { id }
    })

    if (!existingContent) {
      throw createError({
        statusCode: 404,
        statusMessage: '内容不存在'
      })
    }

    // 检查权限：只有内容创建者或管理员可以删除
    if (existingContent.userId !== event.context.auth.user.id && event.context.auth.user.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        statusMessage: '您没有权限删除此内容'
      })
    }

    // 删除内容
    await prisma.content.delete({
      where: { id }
    })

    return {
      success: true,
      message: '内容已成功删除'
    }
  } catch (error: any) {
    console.error('Error deleting content:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to delete content'
    })
  }
})