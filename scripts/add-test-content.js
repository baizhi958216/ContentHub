import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addTestContent() {
  try {
    // 查找管理员用户
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.log('未找到管理员用户，请先创建管理员用户')
      return
    }

    console.log('找到管理员用户:', adminUser.email)

    // 创建一些测试标签
    const tags = await Promise.all([
      prisma.tag.upsert({
        where: { name: '技术' },
        update: {},
        create: { name: '技术' }
      }),
      prisma.tag.upsert({
        where: { name: '教程' },
        update: {},
        create: { name: '教程' }
      }),
      prisma.tag.upsert({
        where: { name: '前端' },
        update: {},
        create: { name: '前端' }
      }),
      prisma.tag.upsert({
        where: { name: '后端' },
        update: {},
        create: { name: '后端' }
      }),
      prisma.tag.upsert({
        where: { name: '数据库' },
        update: {},
        create: { name: '数据库' }
      })
    ])

    console.log('创建了标签:', tags.map(tag => tag.name))

    // 创建测试文章
    const articles = [
      {
        title: 'Vue.js 3 组合式 API 完全指南',
        description: '深入了解 Vue.js 3 的组合式 API，包括 setup 函数、响应式系统和生命周期钩子。',
        originalUrl: 'https://vuejs.org/guide/extras/composition-api-faq.html',
        content: `# Vue.js 3 组合式 API 完全指南

Vue.js 3 引入了组合式 API，这是一种全新的编写 Vue 组件的方式。

## 什么是组合式 API？

组合式 API 是一套基于函数的 API，允许我们更灵活地组织组件逻辑。

## 主要特性

1. **setup 函数**：组件的入口点
2. **响应式系统**：ref 和 reactive
3. **生命周期钩子**：onMounted、onUpdated 等
4. **计算属性**：computed
5. **侦听器**：watch 和 watchEffect

## 示例代码

\`\`\`javascript
import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const doubleCount = computed(() => count.value * 2)
    
    onMounted(() => {
      console.log('组件已挂载')
    })
    
    return {
      count,
      doubleCount
    }
  }
}
\`\`\`

这种新的 API 设计让代码更加模块化和可复用。`,
        type: 'ARTICLE',
        userId: adminUser.id,
        tags: [tags[0].id, tags[1].id, tags[2].id], // 技术、教程、前端
        views: 156,
        likes: 23
      },
      {
        title: 'Node.js 后端开发最佳实践',
        description: '学习如何构建高性能、可扩展的 Node.js 后端应用程序。',
        originalUrl: 'https://nodejs.org/en/docs/guides/',
        content: `# Node.js 后端开发最佳实践

Node.js 是构建现代后端应用的优秀选择。

## 项目结构

建议使用以下项目结构：

\`\`\`
src/
  controllers/
  models/
  routes/
  middleware/
  utils/
  config/
\`\`\`

## 最佳实践

### 1. 错误处理
使用统一的错误处理中间件：

\`\`\`javascript
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: '服务器内部错误' })
})
\`\`\`

### 2. 环境配置
使用 dotenv 管理环境变量：

\`\`\`javascript
require('dotenv').config()
const port = process.env.PORT || 3000
\`\`\`

### 3. 数据验证
使用 Joi 或 Yup 进行数据验证：

\`\`\`javascript
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
})
\`\`\`

### 4. 安全性
- 使用 helmet 保护应用
- 实施 CORS 策略
- 使用 JWT 进行身份验证
- 对敏感数据进行加密

这些实践将帮助你构建更安全、更可维护的应用。`,
        type: 'ARTICLE',
        userId: adminUser.id,
        tags: [tags[0].id, tags[1].id, tags[3].id], // 技术、教程、后端
        views: 89,
        likes: 15
      },
      {
        title: 'PostgreSQL 数据库优化技巧',
        description: '提高 PostgreSQL 数据库性能的实用技巧和最佳实践。',
        originalUrl: 'https://www.postgresql.org/docs/current/performance-tips.html',
        content: `# PostgreSQL 数据库优化技巧

PostgreSQL 是一个功能强大的开源关系型数据库。

## 索引优化

### 1. B-tree 索引
最常用的索引类型：

\`\`\`sql
CREATE INDEX idx_user_email ON users(email);
\`\`\`

### 2. 复合索引
对多列创建索引：

\`\`\`sql
CREATE INDEX idx_user_name_age ON users(name, age);
\`\`\`

### 3. 部分索引
只对满足条件的行创建索引：

\`\`\`sql
CREATE INDEX idx_active_users ON users(email) WHERE active = true;
\`\`\`

## 查询优化

### 1. 使用 EXPLAIN
分析查询执行计划：

\`\`\`sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
\`\`\`

### 2. 避免 SELECT *
只选择需要的列：

\`\`\`sql
SELECT id, name, email FROM users WHERE active = true;
\`\`\`

### 3. 使用 LIMIT
限制返回的行数：

\`\`\`sql
SELECT * FROM posts ORDER BY created_at DESC LIMIT 10;
\`\`\`

## 配置优化

### 1. shared_buffers
设置为系统内存的 25%：

\`\`\`
shared_buffers = 256MB
\`\`\`

### 2. work_mem
调整工作内存：

\`\`\`
work_mem = 4MB
\`\`\`

### 3. maintenance_work_mem
维护操作内存：

\`\`\`
maintenance_work_mem = 64MB
\`\`\`

通过这些优化技巧，可以显著提高数据库性能。`,
        type: 'ARTICLE',
        userId: adminUser.id,
        tags: [tags[0].id, tags[4].id], // 技术、数据库
        views: 234,
        likes: 31
      }
    ]

    // 创建文章
    for (const articleData of articles) {
      const { tags: tagIds, ...contentData } = articleData
      
      const article = await prisma.content.create({
        data: {
          ...contentData,
          tags: {
            connect: tagIds.map(id => ({ id }))
          }
        }
      })
      
      console.log('创建了文章:', article.title)
    }

    // 创建测试视频
    const videos = [
      {
        title: 'JavaScript 异步编程详解',
        description: '深入理解 JavaScript 中的异步编程，包括 Promise、async/await 等。',
        content: `这个视频详细讲解了 JavaScript 异步编程的核心概念：

1. 回调函数的问题
2. Promise 的使用
3. async/await 语法
4. 错误处理
5. 并发控制

通过实际示例，你将学会如何编写高效的异步代码。`,
        type: 'VIDEO',
        userId: adminUser.id,
        originalUrl: 'https://youtube.com/watch?v=example1',
        views: 445,
        likes: 67
      },
      {
        title: 'React Hooks 实战教程',
        description: '通过实际项目学习 React Hooks 的使用方法。',
        content: `本视频教程包含以下内容：

1. useState Hook 基础
2. useEffect Hook 详解
3. 自定义 Hook 开发
4. Hook 最佳实践
5. 常见陷阱和解决方案

适合有 React 基础的开发者学习。`,
        type: 'VIDEO',
        userId: adminUser.id,
        originalUrl: 'https://youtube.com/watch?v=example2',
        views: 678,
        likes: 89
      }
    ]

    // 创建视频
    for (const videoData of videos) {
      const video = await prisma.content.create({
        data: {
          ...videoData,
          tags: {
            connect: [{ id: tags[0].id }, { id: tags[1].id }, { id: tags[2].id }] // 技术、教程、前端
          }
        }
      })
      
      console.log('创建了视频:', video.title)
    }

    console.log('✅ 测试内容创建完成！')
    
  } catch (error) {
    console.error('❌ 创建测试内容失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestContent()