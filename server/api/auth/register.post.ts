import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // 验证必填字段
    if (!body.email || !body.password || !body.name) {
      return {
        statusCode: 400,
        body: { error: '邮箱、密码和用户名为必填项' }
      }
    }
    
    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    })
    
    if (existingUser) {
      return {
        statusCode: 400,
        body: { error: '该邮箱已被注册' }
      }
    }
    
    // 密码加密
    const hashedPassword = await bcrypt.hash(body.password, 10)
    
    // 创建用户
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        name: body.name,
        // 默认为普通用户角色
        role: 'USER'
      }
    })
    
    // 不返回密码
    const { password, ...userWithoutPassword } = user
    
    return {
      statusCode: 201,
      body: userWithoutPassword
    }
  } catch (error) {
    console.error('注册失败:', error)
    return {
      statusCode: 500,
      body: { error: '注册失败，请稍后再试' }
    }
  }
})