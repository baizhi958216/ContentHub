import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // 只对需要认证的API路由进行验证
  const needsAuth = [
    '/api/content',
    '/api/admin',
    '/api/video/upload'
  ]
  
  // 跳过不需要认证的路由
  const skipAuth = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/config'
  ]
  
  // 如果不是API路由，直接跳过
  if (!event.path.startsWith('/api/')) {
    return
  }
  
  // 如果是跳过认证的路由，直接返回
  if (skipAuth.some(path => event.path.startsWith(path))) {
    return
  }
  
  // 对于GET请求的内容API和查看统计API，允许公开访问
  if (event.path.startsWith('/api/content') && event.method === 'GET') {
    return
  }
  
  // 允许查看统计API公开访问
  if (event.path.match(/\/api\/content\/[^\/]+\/view$/) && event.method === 'POST') {
    return
  }
  
  // 检查是否需要认证
  const requiresAuth = needsAuth.some(path => event.path.startsWith(path))
  
  if (!requiresAuth) {
    return
  }
  
  try {
    // 获取请求头中的Authorization
    const authHeader = getRequestHeader(event, 'Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: '未授权访问'
      })
    }
    
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    // 确保 decoded 是一个对象并包含 userId
    if (typeof decoded === 'string' || !decoded.userId) {
      throw createError({
        statusCode: 401,
        statusMessage: '无效的令牌格式'
      })
    }
    
    // 验证用户是否存在且未被禁用
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    
    if (!user || !user.isActive) {
      throw createError({
        statusCode: 403,
        statusMessage: '账户不存在或已被禁用'
      })
    }
    
    // 将用户信息添加到事件上下文中
    event.context.auth = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    }
    
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: '无效的令牌'
    })
  }
})