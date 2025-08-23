<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 头部导航 -->
    <header class="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 移动端导航 -->
        <div class="md:hidden">
          <div class="flex items-center justify-between h-16">
            <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">
              内容汇
            </h1>
            
            <div class="flex items-center space-x-2">
              <!-- 用户认证按钮 - 移动端 -->
              <ClientOnly>
                <div v-if="auth.isLoggedIn.value" class="flex items-center space-x-2">
                  <!-- 我的内容按钮 - 移动端 -->
                  <NuxtLink to="/my-content" class="p-2 rounded-lg text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </NuxtLink>
                  
                  <!-- 管理员菜单 - 移动端 -->
                  <div v-if="auth.isAdmin.value" class="relative">
                    <button @click="showMobileAdminMenu = !showMobileAdminMenu" class="p-2 rounded-lg text-purple-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </button>
                    <div v-if="showMobileAdminMenu" class="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                      <NuxtLink to="/admin/users" class="block px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        用户管理
                      </NuxtLink>
                      <NuxtLink to="/admin/content" class="block px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        内容管理
                      </NuxtLink>
                    </div>
                  </div>
                  
                  <button @click="auth.logout()" class="p-2 rounded-lg text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                  </button>
                </div>
                <div v-else class="flex items-center space-x-2">
                  <NuxtLink to="/login" class="text-sm text-blue-600 hover:text-blue-800">登录</NuxtLink>
                  <NuxtLink to="/register" class="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">注册</NuxtLink>
                </div>
                <template #fallback>
                  <div class="flex items-center space-x-2">
                    <NuxtLink to="/login" class="text-sm text-blue-600 hover:text-blue-800">登录</NuxtLink>
                    <NuxtLink to="/register" class="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">注册</NuxtLink>
                  </div>
                </template>
              </ClientOnly>
              
              <!-- 移动端搜索按钮 -->
              <button 
                @click="mobileSearchOpen = !mobileSearchOpen"
                class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <SearchIcon class="w-5 h-5" />
              </button>
              
              <!-- 主题切换 -->
              <button
                @click="toggleColorMode"
                class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <SunIcon v-if="$colorMode.value === 'dark'" class="w-5 h-5" />
                <MoonIcon v-else class="w-5 h-5" />
              </button>
              
              <!-- 添加内容按钮 -->
              <ClientOnly>
                <button
                  v-if="auth.isLoggedIn.value"
                  @click="showAddModal = true"
                  class="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  <PlusIcon class="w-5 h-5" />
                </button>
              </ClientOnly>
            </div>
          </div>
          
          <!-- 移动端搜索栏 -->
          <div v-if="mobileSearchOpen" class="pb-3">
            <div class="relative">
              <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索内容..."
                class="pl-10 pr-4 py-2 w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                @input="handleSearch"
              />
            </div>
            
            <!-- 移动端筛选按钮 -->
            <div class="flex items-center space-x-2 mt-3">
              <button
                @click="filterType = 'ALL'"
                class="flex-1 px-3 py-1.5 text-sm rounded-md transition-colors text-center"
                :class="filterType === 'ALL' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
              >
                全部
              </button>
              <button
                @click="filterType = 'ARTICLE'"
                class="flex-1 px-3 py-1.5 text-sm rounded-md transition-colors text-center"
                :class="filterType === 'ARTICLE' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
              >
                文章
              </button>
              <button
                @click="filterType = 'VIDEO'"
                class="flex-1 px-3 py-1.5 text-sm rounded-md transition-colors text-center"
                :class="filterType === 'VIDEO' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
              >
                视频
              </button>
            </div>
          </div>
        </div>
        
        <!-- 桌面端导航 -->
        <div class="hidden md:block">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center space-x-4">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                内容汇
              </h1>
              <ClientOnly>
                <div class="hidden sm:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>共 {{ totalCount }} 项内容</span>
                </div>
                <template #fallback>
                  <div class="hidden sm:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>共 0 项内容</span>
                  </div>
                </template>
              </ClientOnly>
            </div>
            
            <div class="flex items-center space-x-4">
              <!-- 用户认证区域 - 桌面端 -->
              <ClientOnly>
                <div v-if="auth.isLoggedIn.value" class="flex items-center space-x-4">
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ auth.user.value?.name || auth.user.value?.email }}</span>
                  
                  <!-- 普通用户：我的内容链接 -->
                  <NuxtLink to="/my-content" class="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span>我的内容</span>
                  </NuxtLink>
                  
                  <!-- 管理员菜单 -->
                  <div v-if="auth.isAdmin.value" class="relative">
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
              
              <!-- 搜索框 -->
              <div class="relative">
                <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索内容..."
                  class="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  @input="handleSearch"
                />
              </div>
              
              <!-- 筛选按钮 -->
              <div class="flex items-center space-x-2">
                <button
                  @click="filterType = 'ALL'"
                  class="px-3 py-1.5 text-sm rounded-md transition-colors"
                  :class="filterType === 'ALL' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
                >
                  全部
                </button>
                <button
                  @click="filterType = 'ARTICLE'"
                  class="px-3 py-1.5 text-sm rounded-md transition-colors"
                  :class="filterType === 'ARTICLE' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
                >
                  文章
                </button>
                <button
                  @click="filterType = 'VIDEO'"
                  class="px-3 py-1.5 text-sm rounded-md transition-colors"
                  :class="filterType === 'VIDEO' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
                >
                  视频
                </button>
              </div>
              
              <!-- 主题切换 -->
              <button
                @click="toggleColorMode"
                class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <SunIcon v-if="$colorMode.value === 'dark'" class="w-5 h-5" />
                <MoonIcon v-else class="w-5 h-5" />
              </button>
              
              <!-- 添加内容按钮 -->
              <ClientOnly>
                <button
                  v-if="auth.isLoggedIn.value"
                  @click="showAddModal = true"
                  class="btn-primary flex items-center space-x-2"
                >
                  <PlusIcon class="w-4 h-4" />
                  <span>添加内容</span>
                </button>
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 加载状态 -->
      <div v-if="pending" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredContents.length === 0" class="text-center py-12">
        <div class="mx-auto h-24 w-24 text-gray-400 mb-4">
          <FileTextIcon class="w-full h-full" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {{ searchQuery ? '没有找到匹配的内容' : '还没有收藏任何内容' }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          {{ searchQuery ? '尝试使用不同的关键词搜索' : '开始收藏你喜欢的文章和视频吧' }}
        </p>
        <ClientOnly>
          <button
            v-if="!searchQuery && auth.isLoggedIn.value"
            @click="showAddModal = true"
            class="btn-primary"
          >
            添加第一个内容
          </button>
          <NuxtLink
            v-else-if="!searchQuery && !auth.isLoggedIn.value"
            to="/login"
            class="btn-primary inline-block"
          >
            登录后添加内容
          </NuxtLink>
          <template #fallback>
            <NuxtLink
              v-if="!searchQuery"
              to="/login"
              class="btn-primary inline-block"
            >
              登录后添加内容
            </NuxtLink>
          </template>
        </ClientOnly>
      </div>

      <!-- 内容网格 -->
      <div v-else class="masonry-grid">
        <ContentCard
          v-for="content in filteredContents"
          :key="content.id"
          :content="content"
          @open-modal="openContentModal"
        />
      </div>

      <!-- 加载更多 -->
      <div v-if="hasMore && !pending" class="text-center mt-8">
        <button
          @click="loadMore"
          class="btn-secondary"
          :disabled="loadingMore"
        >
          <span v-if="loadingMore">加载中...</span>
          <span v-else>加载更多</span>
        </button>
      </div>
    </main>

    <!-- 内容详情模态框 -->
    <ContentModal
      :is-open="showContentModal"
      :content="selectedContent"
      @close="closeContentModal"
      @update-stats="updateContentStats"
    />

    <!-- 添加内容模态框 -->
    <AddContentModal
      :is-open="showAddModal"
      @close="showAddModal = false"
      @added="handleContentAdded"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { SearchIcon, SunIcon, MoonIcon, PlusIcon, FileTextIcon } from 'lucide-vue-next'

interface ContentItem {
  id: string
  title: string
  description?: string
  originalUrl: string
  content?: string
  localVideoPath?: string
  type: 'ARTICLE' | 'VIDEO'
  likes: number
  views: number
  favorites: number
  createdAt: string
  tags?: Array<{ id: string; name: string; color?: string }>
  comments?: Array<{ id: string; content: string; author?: string; createdAt: string }>
}

// 用户认证
const auth = useAuth()

// 响应式数据
const contents = ref<ContentItem[]>([])
const searchQuery = ref('')
const filterType = ref<'ALL' | 'ARTICLE' | 'VIDEO'>('ALL')
const showContentModal = ref(false)
const showAddModal = ref(false)
const selectedContent = ref<ContentItem | null>(null)
const pending = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const page = ref(1)
const limit = 20
const mobileSearchOpen = ref(false)
const showAdminMenu = ref(false)
const showMobileAdminMenu = ref(false)

// 计算属性
const filteredContents = computed(() => {
  let filtered = contents.value

  // 类型筛选
  if (filterType.value !== 'ALL') {
    filtered = filtered.filter(content => content.type === filterType.value)
  }

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(content =>
      content.title.toLowerCase().includes(query) ||
      content.description?.toLowerCase().includes(query) ||
      content.tags?.some(tag => tag.name.toLowerCase().includes(query))
    )
  }

  return filtered
})

const totalCount = computed(() => contents.value.length)

// 方法
const loadContents = async (reset = false) => {
  if (reset) {
    page.value = 1
    contents.value = []
    hasMore.value = true
  }

  pending.value = reset
  loadingMore.value = !reset

  try {
    const response = await $fetch('/api/content', {
      query: {
        page: page.value,
        limit,
        type: filterType.value === 'ALL' ? undefined : filterType.value,
        search: searchQuery.value || undefined
      }
    })

    if (reset) {
      contents.value = response.data || []
    } else {
      contents.value.push(...(response.data || []))
    }

    hasMore.value = (response.data || []).length === limit
    page.value++
  } catch (error) {
    console.error('Failed to load contents:', error)
  } finally {
    pending.value = false
    loadingMore.value = false
  }
}

const loadMore = () => {
  if (!loadingMore.value && hasMore.value) {
    loadContents(false)
  }
}

const handleSearch = useDebounceFn(() => {
  loadContents(true)
}, 300)

const openContentModal = (content: ContentItem) => {
  selectedContent.value = content
  showContentModal.value = true
}

const closeContentModal = () => {
  showContentModal.value = false
  selectedContent.value = null
}

const updateContentStats = (contentId: string, stats: { likes: number; favorites: number }) => {
  const index = contents.value.findIndex(c => c.id === contentId)
  if (index !== -1) {
    contents.value[index].likes = stats.likes
    contents.value[index].favorites = stats.favorites
  }
}

const handleContentAdded = (newContent: ContentItem) => {
  contents.value.unshift(newContent)
  showAddModal.value = false
}

// 主题切换
const { $colorMode } = useNuxtApp()
const toggleColorMode = () => {
  $colorMode.preference = $colorMode.value === 'dark' ? 'light' : 'dark'
}

// 监听筛选类型变化
watch(filterType, () => {
  loadContents(true)
})

// 页面加载时获取数据
onMounted(() => {
  loadContents(true)
})

// SEO
useHead({
  title: '内容汇 - ContentHub',
  meta: [
    { name: 'description', content: '收藏和管理你喜欢的文章和视频内容' }
  ]
})
</script>