<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>
      
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
      
      <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                  添加内容
                </h3>
                <button
                  @click="$emit('close')"
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <form @submit.prevent="submitForm" class="space-y-4">
                <!-- 标题 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    标题 *
                  </label>
                  <input
                    v-model="form.title"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="请输入标题"
                  />
                </div>

                <!-- 类型 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    类型 *
                  </label>
                  <select
                    v-model="form.type"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="ARTICLE">文章</option>
                    <option value="VIDEO">视频</option>
                  </select>
                </div>

                <!-- 描述 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    描述
                  </label>
                  <textarea
                    v-model="form.description"
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="请输入描述"
                  ></textarea>
                </div>

                <!-- 原始链接 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    原始链接 *
                  </label>
                  <input
                    v-model="form.originalUrl"
                    type="url"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="请输入原始链接"
                  />
                </div>

                <!-- 视频文件上传 (仅当类型为视频时显示) -->
                <div v-if="form.type === 'VIDEO'">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    视频文件
                  </label>
                  <div class="space-y-3">
                    <!-- 视频文件上传 -->
                    <div>
                      <input
                        ref="videoFileInput"
                        type="file"
                        accept="video/*"
                        @change="handleVideoFileChange"
                        class="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
                      />
                      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        支持 MP4, WebM, AVI 等视频格式，最大 100MB
                      </p>
                    </div>
                    
                    <!-- 上传进度 -->
                    <div v-if="uploadProgress > 0 && uploadProgress < 100" class="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        :style="{ width: uploadProgress + '%' }"
                      ></div>
                      <p class="text-xs text-gray-500 mt-1">上传进度: {{ uploadProgress }}%</p>
                    </div>
                  </div>
                </div>

                <!-- 内容 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {{ form.type === 'VIDEO' ? '视频描述' : '文章内容' }} *
                  </label>
                  <textarea
                    v-model="form.content"
                    rows="8"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    :placeholder="form.type === 'VIDEO' ? '请输入视频描述' : '请输入文章内容'"
                  ></textarea>
                </div>

                <!-- 标签 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    标签
                  </label>
                  <input
                    v-model="tagInput"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="输入标签，用逗号分隔"
                  />
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    例如：技术,教程,前端
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="submitForm"
            :disabled="submitting"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submitting ? '提交中...' : '添加内容' }}
          </button>
          <button
            @click="$emit('close')"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-700"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import useAuth from '~/composables/useAuth'

// 定义 props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// 定义事件
const emit = defineEmits(['close', 'success', 'added'])

// 认证
const auth = useAuth()

// 表单数据
const form = ref({
  title: '',
  type: 'ARTICLE',
  description: '',
  originalUrl: '',
  content: ''
})

const tagInput = ref('')
const submitting = ref(false)

// 视频上传相关
const videoFileInput = ref(null)
const uploadProgress = ref(0)
const selectedVideoFile = ref(null)

// 重置表单函数
function resetForm() {
  form.value = {
    title: '',
    type: 'ARTICLE',
    description: '',
    originalUrl: '',
    content: ''
  }
  tagInput.value = ''
  selectedVideoFile.value = null
  uploadProgress.value = 0
  if (videoFileInput.value) {
    videoFileInput.value.value = ''
  }
}

// 处理视频文件选择
function handleVideoFileChange(event) {
  const file = event.target.files[0]
  if (!file) return
  
  // 检查文件类型
  if (!file.type.startsWith('video/')) {
    alert('请选择视频文件')
    return
  }
  
  // 检查文件大小 (100MB)
  const maxSize = 100 * 1024 * 1024
  if (file.size > maxSize) {
    alert('视频文件大小不能超过 100MB')
    return
  }
  
  selectedVideoFile.value = file
}

// 上传视频文件
async function uploadVideoFile() {
  if (!selectedVideoFile.value) return null
  
  const formData = new FormData()
  formData.append('videoFile', selectedVideoFile.value)
  
  try {
    uploadProgress.value = 0
    
    const response = await $fetch('/api/video/upload', {
      method: 'POST',
      headers: auth.getAuthHeaders(),
      body: formData
    })
    
    uploadProgress.value = 100
    return response
  } catch (error) {
    console.error('视频上传失败:', error)
    alert('视频上传失败，请稍后再试')
    uploadProgress.value = 0
    return null
  }
}

// 提交表单
async function submitForm() {
  if (submitting.value) return
  
  // 验证必填字段
  if (!form.value.title.trim()) {
    alert('请输入标题')
    return
  }
  
  if (!form.value.originalUrl.trim()) {
    alert('请输入原始链接')
    return
  }
  
  if (!form.value.content.trim()) {
    alert('请输入内容')
    return
  }
  
  try {
    submitting.value = true
    let videoAsset = null
    
    // 如果是视频类型且选择了视频文件，先上传视频
    if (form.value.type === 'VIDEO' && selectedVideoFile.value) {
      videoAsset = await uploadVideoFile()
      if (!videoAsset) {
        return // 上传失败，不继续提交
      }
    }
    
    // 处理标签
    const tags = tagInput.value
      ? tagInput.value.split(',').map(tag => tag.trim()).filter(tag => tag)
      : []
    
    const contentData = {
      title: form.value.title.trim(),
      type: form.value.type,
      description: form.value.description.trim() || null,
      originalUrl: form.value.originalUrl.trim(),
      content: form.value.content.trim(),
      tags: tags
    }
    
    // 如果上传了视频，添加视频ID
    if (videoAsset) {
      contentData.videoId = videoAsset.id
    }
    
    const response = await $fetch('/api/content', {
      method: 'POST',
      headers: auth.getAuthHeaders(),
      body: contentData
    })
    
    alert('内容添加成功')
    resetForm()
    emit('success')
    emit('added', response)
    emit('close')
  } catch (err) {
    console.error('添加内容失败:', err)
    alert('添加内容失败，请稍后再试')
  } finally {
    submitting.value = false
    uploadProgress.value = 0
  }
}
</script>