import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 检查是否为管理员
  if (event.context.auth?.user?.role !== 'ADMIN') {
    return createError({
      statusCode: 403,
      message: '权限不足'
    })
  }
  
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            contents: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return {
      statusCode: 200,
      body: users
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return {
      statusCode: 500,
      body: { error: '获取用户列表失败' }
    }
  }
})