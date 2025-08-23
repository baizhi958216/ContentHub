import { PrismaClient } from '@prisma/client'
import { defineEventHandler, getQuery, createError, getHeader } from 'h3'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    const type = query.type as string
    const search = query.search as string
    const my = query.my as string // 是否只获取当前用户的内容

    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {}
    
    // 如果是获取我的内容，需要验证用户身份并限制为当前用户
    if (my === 'true') {
      const authHeader = getHeader(event, 'authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Unauthorized'
        })
      }

      const token = authHeader.substring(7)
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
        where.userId = decoded.userId
      } catch (err) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Invalid token'
        })
      }
    }
    
    if (type && type !== 'ALL') {
      where.type = type
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        {
          tags: {
            some: {
              name: { contains: search, mode: 'insensitive' }
            }
          }
        }
      ]
    }

    // 获取内容列表
    const contents = await prisma.content.findMany({
      where,
      include: {
        tags: true,
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: {
          select: { comments: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    // 获取总数
    const total = await prisma.content.count({ where })

    return {
      data: contents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    console.error('Error fetching contents:', error)
    if (error?.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch contents'
    })
  }
})