<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
              <!-- 头部 -->
              <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div class="flex-1">
                  <DialogTitle as="h3" class="text-xl font-semibold text-gray-900 dark:text-gray-100 pr-8">
                    {{ content?.title }}
                  </DialogTitle>
                  <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span 
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="content?.type === 'ARTICLE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'"
                    >
                      {{ content?.type === 'ARTICLE' ? '文章' : '视频' }}
                    </span>
                    <time>{{ formatDate(content?.createdAt || '') }}</time>
                  </div>
                </div>
                <button
                  @click="closeModal"
                  class="rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <XIcon class="h-6 w-6" />
                </button>
              </div>

              <!-- 内容区域 -->
              <div class="max-h-[70vh] overflow-y-auto">
                <!-- 视频播放器 -->
                <div v-if="content?.type === 'VIDEO' && content.localVideoPath" class="p-6">
                  <div class="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    <video 
                      controls 
                      class="w-full h-full"
                      :src="content.localVideoPath"
                      preload="metadata"
                      @error="handleVideoError"
                    >
                      您的浏览器不支持视频播放。
                    </video>
                  </div>
                  <div v-if="videoError" class="mt-2 text-sm text-red-500">
                    {{ videoError }}
                  </div>
                </div>

                <!-- 文章内容 -->
                <div class="p-6">
                  <div v-if="content?.description" class="text-gray-600 dark:text-gray-400 mb-4">
                    {{ content.description }}
                  </div>
                  
                  <div v-if="content?.content" class="prose dark:prose-invert max-w-none">
                    <div v-html="formatContent(content.content)"></div>
                  </div>

                  <!-- 原始链接 -->
                  <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600 dark:text-gray-400">原始链接:</span>
                      <a 
                        :href="content?.originalUrl" 
                        target="_blank"
                        class="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
                      >
                        <span>查看原文</span>
                        <ExternalLinkIcon class="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <!-- 标签 -->
                  <div v-if="content?.tags && content.tags.length > 0" class="mt-4">
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

                <!-- 评论区域 -->
                <div v-if="content?.comments && content.comments.length > 0" class="border-t border-gray-200 dark:border-gray-700 p-6">
                  <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    评论 ({{ content.comments.length }})
                  </h4>
                  <div class="space-y-4">
                    <div 
                      v-for="comment in content.comments" 
                      :key="comment.id"
                      class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                    >
                      <div class="flex items-center justify-between mb-2">
                        <span class="font-medium text-gray-900 dark:text-gray-100">
                          {{ comment.author || '匿名用户' }}
                        </span>
                        <time class="text-xs text-gray-500 dark:text-gray-400">
                          {{ formatDate(comment.createdAt) }}
                        </time>
                      </div>
                      <p class="text-gray-700 dark:text-gray-300">{{ comment.content }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 底部操作栏 -->
              <div class="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <div class="flex items-center space-x-6">
                  <button 
                    @click="toggleLike"
                    class="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
                    :class="{ 'text-red-500': isLiked }"
                  >
                    <HeartIcon class="w-5 h-5" :class="{ 'fill-current': isLiked }" />
                    <span>{{ formatNumber(likes) }}</span>
                  </button>
                  
                  <button 
                    @click="toggleFavorite"
                    class="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-yellow-500 transition-colors"
                    :class="{ 'text-yellow-500': isFavorited }"
                  >
                    <BookmarkIcon class="w-5 h-5" :class="{ 'fill-current': isFavorited }" />
                    <span>{{ formatNumber(favorites) }}</span>
                  </button>
                  
                  <div class="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <EyeIcon class="w-5 h-5" />
                    <span>{{ formatNumber(content?.views || 0) }}</span>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XIcon, ExternalLinkIcon, HeartIcon, BookmarkIcon, EyeIcon } from 'lucide-vue-next'

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

interface Props {
  isOpen: boolean
  content: ContentItem | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  updateStats: [contentId: string, stats: { likes: number; favorites: number }]
}>()

const isLiked = ref(false)
const isFavorited = ref(false)
const likes = ref(props.content?.likes || 0)
const favorites = ref(props.content?.favorites || 0)
const videoError = ref('')

const closeModal = () => {
  emit('close')
}

const toggleLike = async () => {
  if (!props.content) return
  
  try {
    const auth = useAuth()
    const response = await $fetch(`/api/content/${props.content.id}/like`, { 
      method: 'POST',
      headers: auth.getAuthHeaders()
    })
    isLiked.value = !isLiked.value
    likes.value = response.likes
    emit('updateStats', props.content.id, { likes: likes.value, favorites: favorites.value })
  } catch (error) {
    console.error('Failed to toggle like:', error)
  }
}

const toggleFavorite = async () => {
  if (!props.content) return
  
  try {
    const auth = useAuth()
    const response = await $fetch(`/api/content/${props.content.id}/favorite`, { 
      method: 'POST',
      headers: auth.getAuthHeaders()
    })
    isFavorited.value = !isFavorited.value
    favorites.value = response.favorites
    emit('updateStats', props.content.id, { likes: likes.value, favorites: favorites.value })
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
  }
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

const formatContent = (content: string): string => {
  // 简单的文本格式化，将换行转换为 <br>
  return content.replace(/\n/g, '<br>')
}

// 处理视频加载错误
const handleVideoError = (event) => {
  console.error('Video error:', event)
  videoError.value = '视频加载失败，请检查文件路径或格式'
}

// 监听 content 变化，重置状态
watch(() => props.content, (newContent) => {
  if (newContent) {
    likes.value = newContent.likes
    favorites.value = newContent.favorites
    isLiked.value = false // 这里可以根据用户状态来设置
    isFavorited.value = false // 这里可以根据用户状态来设置
    videoError.value = '' // 重置视频错误状态
  }
})
</script>