import { defineEventHandler, createError, getQuery } from 'h3'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  // 检查是否为管理员
  if (event.context.auth?.user?.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: '权限不足'
    })
  }

  try {
    const query = getQuery(event)
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const skip = (page - 1) * limit
    const type = query.type as string || undefined
    const search = query.search as string || undefined

    // 构建查询条件
    const where: any = {}
    
    if (type) {
      // 将前端传来的小写类型转换为大写枚举值
      const typeMap: { [key: string]: string } = {
        'article': 'ARTICLE',
        'video': 'VIDEO'
      }
      where.type = typeMap[type.toLowerCase()] || type.toUpperCase()
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 获取内容列表
    const contents = await prisma.content.findMany({
      where,
      include: {
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // 获取总数
    const total = await prisma.content.count({ where })

    return {
      contents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    console.error('Error fetching admin contents:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch contents'
    })
  }
})