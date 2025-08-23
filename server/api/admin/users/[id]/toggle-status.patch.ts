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
    const id = event.context.params?.id
    
    // 获取当前用户状态
    const user = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!user) {
      return {
        statusCode: 404,
        body: { error: '用户不存在' }
      }
    }
    
    // 不允许管理员禁用自己的账户
    if (user.id === event.context.auth.user.id) {
      return {
        statusCode: 400,
        body: { error: '不能修改自己的账户状态' }
      }
    }
    
    // 切换用户状态
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: !user.isActive
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    return {
      statusCode: 200,
      body: updatedUser
    }
  } catch (error) {
    console.error('切换用户状态失败:', error)
    return {
      statusCode: 500,
      body: { error: '切换用户状态失败' }
    }
  }
})