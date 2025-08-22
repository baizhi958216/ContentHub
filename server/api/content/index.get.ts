import { PrismaClient } from '@prisma/client'
import { defineEventHandler, getQuery, createError } from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    const type = query.type as string
    const search = query.search as string

    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {}
    
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
  } catch (error) {
    console.error('Error fetching contents:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch contents'
    })
  }
})