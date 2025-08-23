<template>
  <div 
    class="masonry-item card cursor-pointer group animate-fade-in"
    @click="openModal"
  >
    <!-- 卡片头部 -->
    <div class="p-4">
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {{ content.title }}
          </h3>
          <p v-if="content.description" class="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
            {{ content.description }}
          </p>
        </div>
        <div class="ml-3 flex-shrink-0">
          <span 
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="content.type === 'ARTICLE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'"
          >
            {{ content.type === 'ARTICLE' ? '文章' : '视频' }}
          </span>
        </div>
      </div>

      <!-- 标签 -->
      <div v-if="content.tags && content.tags.length > 0" class="flex flex-wrap gap-1 mb-3">
        <span 
          v-for="tag in content.tags.slice(0, 3)" 
          :key="tag.id"
          class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
        >
          {{ tag.name }}
        </span>
        <span v-if="content.tags.length > 3" class="text-xs text-gray-500">
          +{{ content.tags.length - 3 }}
        </span>
      </div>

      <!-- 统计信息 -->
      <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-1">
            <HeartIcon class="w-4 h-4" />
            <span>{{ formatNumber(content.likes) }}</span>
          </div>
          <div class="flex items-center space-x-1">
            <EyeIcon class="w-4 h-4" />
            <span>{{ formatNumber(content.views) }}</span>
          </div>
          <div class="flex items-center space-x-1">
            <BookmarkIcon class="w-4 h-4" />
            <span>{{ formatNumber(content.favorites) }}</span>
          </div>
        </div>
        <time class="text-xs">
          {{ formatDate(content.createdAt) }}
        </time>
      </div>
    </div>

    <!-- 视频缩略图或文章预览 -->
    <div v-if="content.type === 'VIDEO' && content.localVideoPath" class="relative">
      <div class="aspect-video bg-gray-200 dark:bg-gray-700 rounded-b-xl overflow-hidden">
        <video 
          :src="content.localVideoPath" 
          preload="metadata" 
          class="w-full h-full object-cover"
          @error="handleVideoError"
        ></video>
        <div v-if="videoError" class="absolute inset-0 flex items-center justify-center">
          <PlayIcon class="w-12 h-12 text-gray-400" />
        </div>
        <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity">
          <div class="w-16 h-16 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
            <PlayIcon class="w-8 h-8 text-primary-600" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HeartIcon, EyeIcon, BookmarkIcon, PlayIcon } from 'lucide-vue-next'

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
}

interface Props {
  content: ContentItem
}

const props = defineProps<Props>()
const emit = defineEmits<{
  openModal: [content: ContentItem]
}>()

const videoError = ref(false)

const handleVideoError = () => {
  videoError.value = true
}

const openModal = async () => {
  try {
    const auth = useAuth()
    // 增加浏览量
    await $fetch(`/api/content/${props.content.id}/view`, { 
      method: 'POST',
      headers: auth.getAuthHeaders()
    })
  } catch (error) {
    console.error('Failed to update view count:', error)
    // 即使更新浏览量失败，也要打开模态框
  }
  emit('openModal', props.content)
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  if (days < 365) return `${Math.floor(days / 30)}个月前`
  return `${Math.floor(days / 365)}年前`
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>