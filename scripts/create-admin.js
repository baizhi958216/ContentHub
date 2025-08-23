import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // 检查是否已存在管理员
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (existingAdmin) {
      console.log('管理员账户已存在:', existingAdmin.email)
      return
    }
    
    // 创建管理员账户
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: '系统管理员',
        role: 'ADMIN'
      }
    })
    
    console.log('管理员账户创建成功!')
    console.log('邮箱: admin@example.com')
    console.log('密码: admin123')
    console.log('请登录后立即修改密码')
    
  } catch (error) {
    console.error('创建管理员失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()