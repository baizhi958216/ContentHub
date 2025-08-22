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
              <button
                @click="showAddModal = true"
                class="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                <PlusIcon class="w-5 h-5" />
              </button>
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
              <div class="hidden sm:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>共 {{ totalCount }} 项内容</span>
              </div>
            </div>
            
            <div class="flex items-center space-x-4">
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
              <button
                @click="showAddModal = true"
                class="btn-primary flex items-center space-x-2"
              >
                <PlusIcon class="w-4 h-4" />
                <span>添加内容</span>
              </button>
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
        <button
          v-if="!searchQuery"
          @click="showAddModal = true"
          class="btn-primary"
        >
          添加第一个内容
        </button>
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
      contents.value = response.data
    } else {
      contents.value.push(...response.data)
    }

    hasMore.value = response.data.length === limit
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