# ContentHub（内容汇）

把好赤的史放到一起，天天赤！

使用 Nuxt.js + TailwindCSS + Prisma + PostgreSQL。

> [!WARNING]
> 项目大量使用AI进行vibe coding

## 预览

![screenshot2](./public/screenshot-2.png)  
![screenshot3](./public/screenshot-3.png)

## 功能特性

- 📝 **文章收藏**: 保存文章链接、内容和评论
- 🎥 **视频收藏**: 支持视频文件上传和本地存储
- 🏷️ **标签管理**: 为内容添加标签进行分类
- 👍 **互动功能**: 点赞、浏览量、收藏量统计
- 🔍 **搜索筛选**: 支持内容搜索和类型筛选
- 🌙 **深色模式**: 支持明暗主题切换

## 技术栈

- **前端框架**: Nuxt.js 3
- **样式框架**: TailwindCSS
- **UI组件**: Headless UI
- **图标库**: Lucide Vue Next
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **状态管理**: Pinia
- **工具库**: VueUse

## 快速开始

### 1. 环境要求

- Node.js 18+
- PostgreSQL 数据库

### 2. 安装依赖

```bash
pnpm install
```

### 3. 数据库配置

1. 创建 PostgreSQL 数据库
我用Docker
```bash
docker run --name postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
```

2. 复制 `.env.example` 为 `.env`
3. 修改 `.env` 中的数据库连接信息：

```env
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/content_collection?schema=public"
```

### 4. 初始化数据库

```bash
# 生成 Prisma 客户端
npx prisma generate

# 推送数据库模式
npx prisma db push

# 可选：查看数据库
npx prisma studio
```

### 5. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 项目结构

```
content-collection-platform/
├── components/           # Vue 组件
│   ├── ContentCard.vue   # 内容卡片组件
│   ├── ContentModal.vue  # 内容详情模态框
│   └── AddContentModal.vue # 添加内容模态框
├── pages/               # 页面
│   └── index.vue        # 首页
├── server/              # 服务端 API
│   └── api/
│       └── content/     # 内容相关 API
├── prisma/              # 数据库模式
│   └── schema.prisma    # Prisma 模式文件
├── assets/              # 静态资源
│   └── css/
│       └── main.css     # 全局样式
├── composables/         # 组合式函数
├── lib/                 # 工具库
└── public/              # 公共文件
    └── uploads/         # 上传文件存储
```

## API 接口

### 内容管理

- `GET /api/content` - 获取内容列表
- `POST /api/content` - 创建新内容
- `POST /api/content/[id]/view` - 增加浏览量
- `POST /api/content/[id]/like` - 切换点赞状态
- `POST /api/content/[id]/favorite` - 切换收藏状态

### 请求参数

#### 获取内容列表
```
GET /api/content?page=1&limit=20&type=ARTICLE&search=关键词
```

#### 创建内容
```
POST /api/content
Content-Type: multipart/form-data

{
  "type": "ARTICLE|VIDEO",
  "title": "标题",
  "originalUrl": "原始链接",
  "description": "描述",
  "content": "内容",
  "tags": ["标签1", "标签2"],
  "video": File (仅视频类型)
}
```

## 数据库模式

### Content (内容表)
- `id`: 唯一标识符
- `title`: 标题
- `description`: 描述
- `originalUrl`: 原始链接
- `content`: 内容
- `localVideoPath`: 本地视频路径
- `type`: 内容类型 (ARTICLE/VIDEO)
- `likes`: 点赞数
- `views`: 浏览量
- `favorites`: 收藏数
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### Tag (标签表)
- `id`: 唯一标识符
- `name`: 标签名称
- `color`: 标签颜色

### Comment (评论表)
- `id`: 唯一标识符
- `content`: 评论内容
- `author`: 作者
- `contentId`: 关联内容ID

### UserAction (用户行为表)
- `id`: 唯一标识符
- `contentId`: 关联内容ID
- `action`: 行为类型 (like/view/favorite)
- `ipAddress`: IP地址
- `userAgent`: 用户代理

## 开发说明

### 添加新功能

1. 在 `components/` 中创建新组件
2. 在 `server/api/` 中添加 API 接口
3. 更新 Prisma 模式（如需要）
4. 运行 `npx prisma db push` 更新数据库

### 样式定制

- 修改 `tailwind.config.js` 自定义主题
- 在 `assets/css/main.css` 中添加全局样式
- 使用 TailwindCSS 类进行样式设计

### 部署

1. 构建项目：`pnpm build`
2. 设置生产环境数据库
3. 运行数据库迁移：`npx prisma migrate deploy`
4. 启动服务：`pnpm preview`

### prompts
我想要做一个平台来收集我日常刷到的文章以及视频，我希望使用Nuxtjs作为框架，使用tailwindcss和shadcn作样式处理，数据库使用postgresql,搭配prisma使用，数据库需要能够存放原始链接，如果是文章需要保存文章内容和原始链接，如果有评论就需要保存评论，如果是视频，跟文章一样，但是需要新增一个本地视频映射，因为我会把视频放到本地存储，需要为每一个文章或者视频添加点赞量、浏览量、收藏量，同时还需要实现这些功能。前端页面我希望整个首页都是卡片的瀑布流展示，文章卡片需要有标题、文章简介、点击其中一个卡片可以新增浏览量，然后弹窗显示内容，UI设计需要有现代化的风格，流畅的动画

我希望上传的文件位置可以通过.env配置

实现完整的视频文件上传功能，存到本地就好了

332MB的视频上传上去变成了588MB


