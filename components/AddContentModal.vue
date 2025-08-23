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
            <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
              <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <DialogTitle as="h3" class="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  添加新内容
                </DialogTitle>
                <button
                  @click="closeModal"
                  class="rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <XIcon class="h-6 w-6" />
                </button>
              </div>

              <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
                <!-- 内容类型选择 -->
                <div>
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                    内容类型
                  </label>
                  <div class="flex space-x-4">
                    <label class="flex items-center">
                      <input
                        v-model="form.type"
                        type="radio"
                        value="ARTICLE"
                        class="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">文章</span>
                    </label>
                    <label class="flex items-center">
                      <input
                        v-model="form.type"
                        type="radio"
                        value="VIDEO"
                        class="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">视频</span>
                    </label>
                  </div>
                </div>

                <!-- 标题 -->
                <div>
                  <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    标题 *
                  </label>
                  <input
                    id="title"
                    v-model="form.title"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="请输入内容标题"
                  />
                </div>

                <!-- 原始链接 -->
                <div>
                  <label for="originalUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    原始链接 *
                  </label>
                  <input
                    id="originalUrl"
                    v-model="form.originalUrl"
                    type="url"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com/article"
                  />
                </div>

                <!-- 描述 -->
                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    描述
                  </label>
                  <textarea
                    id="description"
                    v-model="form.description"
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="请输入内容描述"
                  ></textarea>
                </div>

                <!-- 内容 -->
                <div>
                  <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {{ form.type === 'ARTICLE' ? '文章内容' : '视频描述' }}
                  </label>
                  <textarea
                    id="content"
                    v-model="form.content"
                    rows="6"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    :placeholder="form.type === 'ARTICLE' ? '请输入文章内容' : '请输入视频描述'"
                  ></textarea>
                </div>

                <!-- 视频文件上传 -->
                <div v-if="form.type === 'VIDEO'">
                  <label for="video" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    视频文件
                  </label>
                  <div 
                    class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg transition-colors"
                    @dragover.prevent="dragover = true"
                    @dragleave.prevent="dragover = false"
                    @drop.prevent="onDrop"
                    :class="{ 'border-primary-400 bg-primary-50 dark:bg-primary-900/20': dragover }"
                  >
                    <div class="space-y-1 text-center">
                      <UploadIcon class="mx-auto h-12 w-12" :class="dragover ? 'text-primary-500' : 'text-gray-400'" />
                      <div class="flex text-sm text-gray-600 dark:text-gray-400">
                        <label
                          for="video-upload"
                          class="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                        >
                          <span>上传视频文件</span>
                          <input
                            id="video-upload"
                            name="video-upload"
                            type="file"
                            accept="video/*"
                            class="sr-only"
                            @change="handleVideoUpload"
                          />
                        </label>
                        <p class="pl-1">或拖拽到此处</p>
                      </div>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        支持 MP4, WebM, AVI 格式，最大 {{ Math.round(maxFileSize / (1024 * 1024)) }}MB
                      </p>
                    </div>
                  </div>
                  
                  <!-- 文件信息和进度条 -->
                  <div v-if="videoFile" class="mt-3 space-y-2">
                    <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div class="flex items-center">
                        <span class="mr-2">已选择:</span>
                        <span class="font-medium text-primary-600">{{ videoFile.name }}</span>
                        <span class="ml-2 text-xs text-gray-500">({{ formatFileSize(videoFile.size) }})</span>
                      </div>
                      <button 
                        type="button" 
                        @click="clearVideoFile"
                        class="text-gray-500 hover:text-red-500"
                        :disabled="uploadProgress > 0 && uploadProgress < 100"
                      >
                        <XIcon class="w-4 h-4" />
                      </button>
                    </div>
                    
                    <!-- 上传进度条 -->
                    <div v-if="uploadProgress > 0" class="w-full">
                      <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>上传进度</span>
                        <span>{{ uploadProgress }}%</span>
                      </div>
                      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          :style="{ width: uploadProgress + '%' }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 标签 -->
                <div>
                  <label for="tags" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    标签
                  </label>
                  <input
                    id="tags"
                    v-model="tagsInput"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="输入标签，用逗号分隔"
                  />
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    例如: 技术, 前端, Vue.js
                  </p>
                </div>

                <!-- 提交按钮 -->
                <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    @click="closeModal"
                    class="btn-secondary"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    :disabled="isSubmitting"
                    class="btn-primary flex items-center space-x-2"
                  >
                    <span v-if="isSubmitting">提交中...</span>
                    <span v-else>添加内容</span>
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XIcon, UploadIcon } from 'lucide-vue-next'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  added: [content: any]
}>()

const form = reactive({
  type: 'ARTICLE' as 'ARTICLE' | 'VIDEO',
  title: '',
  originalUrl: '',
  description: '',
  content: ''
})

const tagsInput = ref('')
const videoFile = ref<File | null>(null)
const isSubmitting = ref(false)
const dragover = ref(false)
const uploadProgress = ref(0)
// 从环境变量读取文件大小限制，默认100MB
const maxFileSize = ref(100 * 1024 * 1024)

// 在组件挂载时获取服务器配置
onMounted(async () => {
  try {
    const config = await $fetch('/api/config')
    if (config.maxFileSize) {
      maxFileSize.value = config.maxFileSize
    }
  } catch (error) {
    console.warn('Failed to load server config, using default file size limit')
  }
})

const closeModal = () => {
  // 重置表单
  Object.assign(form, {
    type: 'ARTICLE',
    title: '',
    originalUrl: '',
    description: '',
    content: ''
  })
  tagsInput.value = ''
  videoFile.value = null
  dragover.value = false
  emit('close')
}

const handleVideoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    if (validateVideoFile(file)) {
      videoFile.value = file
      uploadProgress.value = 0
    }
  }
}

const onDrop = (event: DragEvent) => {
  dragover.value = false
  if (event.dataTransfer && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0]
    if (file.type.startsWith('video/')) {
      if (validateVideoFile(file)) {
        videoFile.value = file
        uploadProgress.value = 0
      }
    } else {
      alert('请上传视频文件')
    }
  }
}

const validateVideoFile = (file: File): boolean => {
  if (file.size > maxFileSize.value) {
    alert(`文件大小不能超过 ${Math.round(maxFileSize.value / (1024 * 1024))}MB`)
    return false
  }
  return true
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const clearVideoFile = () => {
  videoFile.value = null
  uploadProgress.value = 0
}

const uploadWithProgress = (formData: FormData): Promise<any> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    
    // 监听上传进度
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        uploadProgress.value = Math.round((event.loaded / event.total) * 100)
      }
    })
    
    // 监听请求完成
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          uploadProgress.value = 100
          resolve(response)
        } catch (error) {
          reject(new Error('Invalid response format'))
        }
      } else {
        reject(new Error(`Upload failed with status: ${xhr.status}`))
      }
    })
    
    // 监听错误
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'))
    })
    
    // 发送请求到视频上传端点
    xhr.open('POST', '/api/video/upload')
    xhr.send(formData)
  })
}

const handleSubmit = async () => {
  if (isSubmitting.value) return

  isSubmitting.value = true

  try {
    // 创建请求数据对象
    const requestData: any = {
      type: form.type,
      title: form.title,
      originalUrl: form.originalUrl,
      description: form.description || '',
      content: form.content || ''
    }
    
    // 标签处理
    if (tagsInput.value.trim()) {
      requestData.tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean)
    }
    
    // 视频文件处理 - 使用XMLHttpRequest上传以支持进度条
    if (form.type === 'VIDEO' && videoFile.value) {
      try {
        uploadProgress.value = 0

        // 第一步：仅上传视频文件，获取视频资产ID与URL
        const formData = new FormData()
        formData.append('videoFile', videoFile.value)
        const uploaded = await uploadWithProgress(formData)

        // 第二步：以 JSON 提交内容，关联视频资产
        const response = await $fetch('/api/content', {
          method: 'POST',
          body: {
            ...requestData,
            type: 'VIDEO',
            videoAssetId: uploaded.id
          }
        })

        emit('added', response)
        closeModal()
        return
      } catch (error) {
        console.error('Failed to upload video file:', error)
        alert('视频文件上传失败，请重试')
        isSubmitting.value = false
        uploadProgress.value = 0
        return
      }
    }

    // 处理非视频内容
    const response = await $fetch('/api/content', {
      method: 'POST',
      body: requestData
    })

    emit('added', response)
    closeModal()
  } catch (error) {
    console.error('Failed to add content:', error)
    alert('添加内容失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}
</script>