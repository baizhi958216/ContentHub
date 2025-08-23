import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // 验证必填字段
    if (!body.email || !body.password) {
      return {
        statusCode: 400,
        body: { error: '邮箱和密码为必填项' }
      }
    }
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: body.email }
    })
    
    if (!user) {
      return {
        statusCode: 401,
        body: { error: '邮箱或密码不正确' }
      }
    }
    
    // 检查用户是否被禁用
    if (!user.isActive) {
      return {
        statusCode: 403,
        body: { error: '账户已被禁用，请联系管理员' }
      }
    }
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(body.password, user.password)
    
    if (!isPasswordValid) {
      return {
        statusCode: 401,
        body: { error: '邮箱或密码不正确' }
      }
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )
    
    // 不返回密码
    const { password, ...userWithoutPassword } = user
    
    return {
      statusCode: 200,
      body: {
        user: userWithoutPassword,
        token
      }
    }
  } catch (error) {
    console.error('登录失败:', error)
    return {
      statusCode: 500,
      body: { error: '登录失败，请稍后再试' }
    }
  }
})