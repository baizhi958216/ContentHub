<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 头部导航 -->
    <header class="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/" class="text-2xl font-bold text-gray-900 dark:text-gray-100 hover:text-primary-600">
              内容汇
            </NuxtLink>
            <span class="text-gray-400">|</span>
            <span class="text-gray-600 dark:text-gray-400">内容详情</span>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- 用户认证区域 -->
            <ClientOnly>
              <div v-if="auth.isLoggedIn.value" class="flex items-center space-x-4">
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ auth.user.value?.name || auth.user.value?.email }}</span>
                <div v-if="auth.isAdmin.value" class="relative admin-menu">
                  <button @click="showAdminMenu = !showAdminMenu" class="text-sm text-purple-600 hover:text-purple-800 flex items-center space-x-1">
                    <span>管理面板</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  <div v-if="showAdminMenu" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    <NuxtLink to="/admin/users" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      用户管理
                    </NuxtLink>
                    <NuxtLink to="/admin/content" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      内容管理
                    </NuxtLink>
                  </div>
                </div>
                <button @click="auth.logout()" class="text-sm text-red-600 hover:text-red-800">登出</button>
              </div>
              <div v-else class="flex items-center space-x-4">
                <NuxtLink to="/login" class="text-sm text-blue-600 hover:text-blue-800">登录</NuxtLink>
                <NuxtLink to="/register" class="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">注册</NuxtLink>
              </div>
              <template #fallback>
                <div class="flex items-center space-x-4">
                  <NuxtLink to="/login" class="text-sm text-blue-600 hover:text-blue-800">登录</NuxtLink>
                  <NuxtLink to="/register" class="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">注册</NuxtLink>
                </div>
              </template>
            </ClientOnly>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 加载状态 -->
      <div v-if="pending" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="text-center py-12">
        <div class="mx-auto h-24 w-24 text-gray-400 mb-4">
          <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          内容不存在
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          {{ error }}
        </p>
        <NuxtLink to="/" class="btn-primary">
          返回首页
        </NuxtLink>
      </div>

      <!-- 内容详情 -->
      <div v-else-if="content" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <!-- 头部信息 -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {{ content.title }}
              </h1>
          <ClientOnly>
            <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="content.type === 'ARTICLE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'"
              >
                {{ content.type === 'ARTICLE' ? '文章' : '视频' }}
              </span>
              <span>作者：{{ content.user?.name || content.user?.email || '未知' }}</span>
              <time>{{ formatDate(content.createdAt) }}</time>
            </div>
          </ClientOnly>
            </div>
          </div>

          <!-- 描述 -->
          <div v-if="content.description" class="text-gray-600 dark:text-gray-400 mb-4">
            {{ content.description }}
          </div>

          <!-- 统计信息 -->
          <ClientOnly>
            <div class="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <div class="flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <span>{{ content.likes }}</span>
              </div>
              <div class="flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <span>{{ content.views }}</span>
              </div>
              <div class="flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                </svg>
                <span>{{ content.favorites }}</span>
              </div>
            </div>
            <template #fallback>
              <div class="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div class="flex items-center space-x-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  <span>0</span>
                </div>
                <div class="flex items-center space-x-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  <span>0</span>
                </div>
                <div class="flex items-center space-x-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                  </svg>
                  <span>0</span>
                </div>
              </div>
            </template>
          </ClientOnly>
        </div>

        <!-- 视频播放器 -->
        <div v-if="content.type === 'VIDEO' && content.localVideoPath" class="p-6">
          <div class="aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <video 
              controls 
              class="w-full h-full"
              :src="content.localVideoPath"
              preload="metadata"
            >
              您的浏览器不支持视频播放。
            </video>
          </div>
        </div>

        <!-- 文章内容 -->
        <div class="p-6">
          <div v-if="content.content" class="prose dark:prose-invert max-w-none">
            <div v-html="formatContent(content.content)"></div>
          </div>

          <!-- 原始链接 -->
          <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">原始链接:</span>
              <a 
                :href="content.originalUrl" 
                target="_blank"
                class="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>查看原文</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </a>
            </div>
          </div>

          <!-- 标签 -->
          <div v-if="content.tags && content.tags.length > 0" class="mt-6">
            <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">标签</h3>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="tag in content.tags" 
                :key="tag.id"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              >
                {{ tag.name }}
              </span>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <ClientOnly>
          <div v-if="auth.isLoggedIn.value" class="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <div class="flex items-center space-x-4">
              <button 
                @click="toggleLike"
                class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
                :class="isLiked ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'"
              >
                <svg class="w-5 h-5" :class="{ 'fill-current': isLiked }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <span>{{ isLiked ? '已点赞' : '点赞' }}</span>
              </button>
              
              <button 
                @click="toggleFavorite"
                class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
                :class="isFavorited ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'"
              >
                <svg class="w-5 h-5" :class="{ 'fill-current': isFavorited }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                </svg>
                <span>{{ isFavorited ? '已收藏' : '收藏' }}</span>
              </button>
            </div>
          </div>
        </ClientOnly>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const auth = useAuth()

const content = ref(null)
const pending = ref(true)
const error = ref(null)
const showAdminMenu = ref(false)
const isLiked = ref(false)
const isFavorited = ref(false)

// 获取内容详情
const fetchContent = async () => {
  try {
    pending.value = true
    error.value = null
    
    const response = await $fetch(`/api/content/${route.params.id}`)
    content.value = response
    
    // 增加浏览量
    try {
      await $fetch(`/api/content/${route.params.id}/view`, { method: 'POST' })
      if (content.value) {
        content.value.views++
      }
    } catch (viewError) {
      console.error('Failed to update view count:', viewError)
    }
    
    // 如果用户已登录，检查用户是否已点赞或收藏
    if (auth.isLoggedIn.value) {
      try {
        const userActions = await $fetch(`/api/content/${route.params.id}/user-actions`, {
          headers: auth.getAuthHeaders()
        })
        isLiked.value = userActions.isLiked
        isFavorited.value = userActions.isFavorited
      } catch (actionsError) {
        console.error('Failed to fetch user actions:', actionsError)
      }
    }
    
  } catch (err) {
    console.error('Failed to fetch content:', err)
    error.value = '内容不存在或已被删除'
  } finally {
    pending.value = false
  }
}

// 点赞
const toggleLike = async () => {
  if (!content.value) return
  
  try {
    const response = await $fetch(`/api/content/${content.value.id}/like`, { 
      method: 'POST',
      headers: auth.getAuthHeaders()
    })
    isLiked.value = !isLiked.value
    content.value.likes = response.likes
  } catch (error) {
    console.error('Failed to toggle like:', error)
  }
}

// 收藏
const toggleFavorite = async () => {
  if (!content.value) return
  
  try {
    const response = await $fetch(`/api/content/${content.value.id}/favorite`, { 
      method: 'POST',
      headers: auth.getAuthHeaders()
    })
    isFavorited.value = !isFavorited.value
    content.value.favorites = response.favorites
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
  }
}

// 格式化日期
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 格式化内容
const formatContent = (content: string): string => {
  return content.replace(/\n/g, '<br>')
}

// 页面加载时获取数据
onMounted(() => {
  fetchContent()
  
  // 点击外部关闭管理菜单
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.admin-menu')) {
      showAdminMenu.value = false
    }
  })
})

// SEO
useHead({
  title: computed(() => content.value ? `${content.value.title} - 内容汇` : '内容详情 - 内容汇'),
  meta: [
    { name: 'description', content: computed(() => content.value?.description || '查看内容详情') }
  ]
})
</script>

<style scoped>
.btn-primary {
  @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors;
}

.prose {
  @apply text-gray-900 dark:text-gray-100;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  @apply text-gray-900 dark:text-gray-100;
}

.prose p {
  @apply text-gray-700 dark:text-gray-300;
}

.prose a {
  @apply text-primary-600 hover:text-primary-700;
}
</style>