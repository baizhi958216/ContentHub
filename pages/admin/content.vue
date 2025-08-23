<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 导航栏 -->
    <nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-2xl font-bold text-gray-900 dark:text-gray-100 hover:text-primary-600">
              内容汇
            </NuxtLink>
          </div>
          
          <div class="flex items-center space-x-4">
            <NuxtLink to="/admin/users" class="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
              用户管理
            </NuxtLink>
            <span class="text-sm text-blue-600 font-medium">内容管理</span>
            <button 
              @click="auth.logout()" 
              class="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="sm:flex sm:items-center">
              <div class="sm:flex-auto">
                <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">内容管理</h1>
                <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  管理系统中的所有内容，包括文章和视频。
                </p>
              </div>
            </div>

            <!-- 搜索和筛选 -->
            <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">搜索</label>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索标题或内容..."
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  @input="debouncedSearch"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">类型</label>
                <select
                  v-model="selectedType"
                  class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  @change="fetchContents"
                >
                  <option value="">全部类型</option>
                  <option value="ARTICLE">文章</option>
                  <option value="VIDEO">视频</option>
                </select>
              </div>
            </div>

            <!-- 内容表格 -->
            <div class="mt-8 flow-root">
              <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table class="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                      <thead class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide">
                            标题
                          </th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide">
                            类型
                          </th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide">
                            作者
                          </th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide">
                            统计
                          </th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide">
                            创建时间
                          </th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <tr v-if="loading">
                          <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            加载中...
                          </td>
                        </tr>
                        <tr v-else-if="!contents || contents.length === 0">
                          <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            暂无内容
                          </td>
                        </tr>
                        <tr v-else v-for="content in contents" :key="content.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">
                              {{ content.title }}
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <span :class="[
                              'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                              content.type === 'ARTICLE' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            ]">
                              {{ content.type === 'ARTICLE' ? '文章' : '视频' }}
                            </span>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {{ content.user?.name || content.user?.username || '未知用户' }}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div class="space-y-1">
                              <div>浏览: {{ content.views || 0 }}</div>
                              <div>点赞: {{ content.likes || 0 }}</div>
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {{ formatDate(content.createdAt) }}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              @click="viewContent(content)"
                              class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              查看
                            </button>
                            <button
                              @click="editContent(content)"
                              class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              编辑
                            </button>
                            <button
                              @click="deleteContent(content)"
                              class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              删除
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div v-if="pagination.totalPages > 1" class="mt-6 flex items-center justify-between">
              <div class="flex-1 flex justify-between sm:hidden">
                <button
                  @click="changePage(pagination.page - 1)"
                  :disabled="pagination.page <= 1"
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <button
                  @click="changePage(pagination.page + 1)"
                  :disabled="pagination.page >= pagination.totalPages"
                  class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
              <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm text-gray-700 dark:text-gray-300">
                    显示第 <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span> 到 
                    <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span> 项，
                    共 <span class="font-medium">{{ pagination.total }}</span> 项
                  </p>
                </div>
                <div>
                  <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      @click="changePage(pagination.page - 1)"
                      :disabled="pagination.page <= 1"
                      class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一页
                    </button>
                    <button
                      v-for="page in getPageNumbers()"
                      :key="page"
                      @click="changePage(page)"
                      :class="[
                        'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                        page === pagination.page
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      ]"
                    >
                      {{ page }}
                    </button>
                    <button
                      @click="changePage(pagination.page + 1)"
                      :disabled="pagination.page >= pagination.totalPages"
                      class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 内容详情弹窗 -->
    <div v-if="showContentModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeContentModal"></div>
        
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="w-full">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                    内容详情
                  </h3>
                  <button
                    @click="closeContentModal"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <div v-if="selectedContent" class="space-y-4">
                  <!-- 标题和基本信息 -->
                  <div>
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {{ selectedContent.title }}
                    </h1>
                    <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        selectedContent.type === 'ARTICLE' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      ]">
                        {{ selectedContent.type === 'ARTICLE' ? '文章' : '视频' }}
                      </span>
                      <span>作者: {{ selectedContent.user?.username || '未知用户' }}</span>
                      <span>{{ formatDate(selectedContent.createdAt) }}</span>
                    </div>
                  </div>

                  <!-- 统计信息 -->
                  <div class="grid grid-cols-3 gap-4 py-4 border-y border-gray-200 dark:border-gray-600">
                    <div class="text-center">
                      <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ selectedContent.views || 0 }}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">浏览量</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ selectedContent.likes || 0 }}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">点赞数</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ selectedContent.favorites || 0 }}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">收藏数</div>
                    </div>
                  </div>

                  <!-- 内容 -->
                  <div>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">内容</h3>
                    <!-- 视频预览 -->
                    <div v-if="selectedContent?.type === 'VIDEO'" class="mb-4">
                      <div v-if="selectedContent?.video?.url" class="mb-4">
                        <h4 class="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">视频预览</h4>
                        <video 
                          :src="selectedContent.video.url" 
                          controls 
                          class="w-full max-h-96 rounded-lg bg-black"
                          preload="metadata"
                        >
                          您的浏览器不支持视频播放。
                        </video>
                      </div>
                      <div v-else-if="selectedContent?.localVideoPath" class="mb-4">
                        <h4 class="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">本地视频</h4>
                        <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                          <p class="text-sm text-gray-600 dark:text-gray-400">
                            本地视频路径: {{ selectedContent.localVideoPath }}
                          </p>
                        </div>
                      </div>
                      <div v-else class="mb-4">
                        <div class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                          <p class="text-sm text-yellow-800 dark:text-yellow-200">
                            暂无视频文件，仅有原始链接
                          </p>
                        </div>
                      </div>
                    </div>
                    <!-- 文本内容 -->
                    <div v-if="selectedContent?.content" class="prose dark:prose-invert max-w-none">
                      <div v-html="formatContent(selectedContent.content)"></div>
                    </div>
                  </div>

                  <!-- 原始链接 -->
                  <div v-if="selectedContent?.originalUrl">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">原始链接</h3>
                    <a 
                      :href="selectedContent.originalUrl" 
                      target="_blank" 
                      class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 break-all"
                    >
                      {{ selectedContent.originalUrl }}
                    </a>
                  </div>

                  <!-- 标签 -->
                  <div v-if="selectedContent?.tags && selectedContent.tags.length > 0">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">标签</h3>
                    <div class="flex flex-wrap gap-2">
                      <span 
                        v-for="tag in selectedContent.tags" 
                        :key="tag.id"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      >
                        {{ tag.name }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="closeContentModal"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑内容弹窗 -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="cancelEdit"></div>
        
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="w-full">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                    编辑内容
                  </h3>
                  <button
                    @click="cancelEdit"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <form @submit.prevent="saveEdit" class="space-y-4">
                  <!-- 标题 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      标题 *
                    </label>
                    <input
                      v-model="editForm.title"
                      type="text"
                      required
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      placeholder="请输入标题"
                    />
                  </div>

                  <!-- 类型 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      类型
                    </label>
                    <select
                      v-model="editForm.type"
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
                      v-model="editForm.description"
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
                      v-model="editForm.originalUrl"
                      type="url"
                      required
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      placeholder="请输入原始链接"
                    />
                  </div>

                  <!-- 视频文件上传 (仅当类型为视频时显示) -->
                  <div v-if="editForm.type === 'VIDEO'">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      视频文件
                    </label>
                    <div class="space-y-3">
                      <!-- 当前视频预览 -->
                      <div v-if="editingContent?.video?.url" class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">当前视频:</p>
                        <video 
                          :src="editingContent.video.url" 
                          controls 
                          class="w-full max-h-48 rounded bg-black"
                          preload="metadata"
                        >
                          您的浏览器不支持视频播放。
                        </video>
                      </div>
                      
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

                  <!-- 内容描述 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {{ editForm.type === 'VIDEO' ? '视频描述' : '文章内容' }}
                    </label>
                    <textarea
                      v-model="editForm.content"
                      rows="8"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                      :placeholder="editForm.type === 'VIDEO' ? '请输入视频描述' : '请输入文章内容'"
                    ></textarea>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="saveEdit"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              保存
            </button>
            <button
              @click="cancelEdit"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-700"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import useAuth from '~/composables/useAuth'
import { useDebounceFn } from '~/composables/useDebounceFn'

// 认证
const auth = useAuth()

// 响应式数据
const contents = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedType = ref('')
const showContentModal = ref(false)
const selectedContent = ref(null)
const showEditModal = ref(false)
const editingContent = ref(null)
const editForm = ref({
  title: '',
  description: '',
  content: '',
  originalUrl: '',
  type: 'ARTICLE'
})

// 视频上传相关
const videoFileInput = ref(null)
const uploadProgress = ref(0)
const selectedVideoFile = ref(null)

// 分页
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

// 获取内容列表
async function fetchContents() {
  try {
    loading.value = true
    
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString()
    })
    
    if (searchQuery.value) {
      params.append('search', searchQuery.value)
    }
    if (selectedType.value) {
      params.append('type', selectedType.value)
    }
    
    const response = await $fetch(`/api/admin/content?${params}`, {
      headers: auth.getAuthHeaders()
    })
    
    contents.value = response.contents || []
    pagination.value = {
      ...pagination.value,
      total: response.pagination?.total || 0,
      totalPages: response.pagination?.totalPages || 0
    }
  } catch (err) {
    console.error('获取内容列表失败:', err)
    alert('获取内容列表失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 防抖搜索
const debouncedSearch = useDebounceFn(() => {
  pagination.value.page = 1
  fetchContents()
}, 500)

// 查看内容详情
async function viewContent(content) {
  try {
    // 获取完整的内容详情
    const response = await $fetch(`/api/content/${content.id}`, {
      headers: auth.getAuthHeaders()
    })
    selectedContent.value = response
    showContentModal.value = true
  } catch (err) {
    console.error('获取内容详情失败:', err)
    alert('获取内容详情失败，请稍后再试')
  }
}

// 关闭内容详情弹窗
function closeContentModal() {
  showContentModal.value = false
  selectedContent.value = null
}

// 格式化内容
function formatContent(content) {
  return content.replace(/\n/g, '<br>')
}

// 编辑内容
function editContent(content) {
  editingContent.value = content
  editForm.value = {
    title: content.title,
    description: content.description || '',
    content: content.content || '',
    originalUrl: content.originalUrl,
    type: content.type
  }
  showEditModal.value = true
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

// 保存编辑 (更新版本支持视频上传)
async function saveEdit() {
  if (!editingContent.value) return
  
  // 验证必填字段
  if (!editForm.value.title.trim()) {
    alert('请输入标题')
    return
  }
  
  if (!editForm.value.originalUrl.trim()) {
    alert('请输入原始链接')
    return
  }
  
  try {
    let videoAsset = null
    
    // 如果是视频类型且选择了新的视频文件，先上传视频
    if (editForm.value.type === 'VIDEO' && selectedVideoFile.value) {
      videoAsset = await uploadVideoFile()
      if (!videoAsset) {
        return // 上传失败，不继续保存
      }
    }
    
    const updateData = {
      title: editForm.value.title.trim(),
      description: editForm.value.description.trim() || null,
      content: editForm.value.content.trim() || null,
      originalUrl: editForm.value.originalUrl.trim(),
      type: editForm.value.type,
      tags: [] // 暂时不处理标签编辑
    }
    
    // 如果上传了新视频，添加视频ID
    if (videoAsset) {
      updateData.videoId = videoAsset.id
    }
    
    await $fetch(`/api/content/${editingContent.value.id}`, {
      method: 'PUT',
      headers: auth.getAuthHeaders(),
      body: updateData
    })
    
    alert('内容更新成功')
    showEditModal.value = false
    editingContent.value = null
    selectedVideoFile.value = null
    uploadProgress.value = 0
    fetchContents()
  } catch (err) {
    console.error('更新内容失败:', err)
    alert('更新内容失败，请稍后再试')
  }
}

// 取消编辑
function cancelEdit() {
  showEditModal.value = false
  editingContent.value = null
  selectedVideoFile.value = null
  uploadProgress.value = 0
  editForm.value = {
    title: '',
    description: '',
    content: '',
    originalUrl: '',
    type: 'ARTICLE'
  }
}

// 删除内容
async function deleteContent(content) {
  if (!confirm(`确定要删除内容"${content.title}"吗？此操作不可撤销。`)) {
    return
  }
  
  try {
    await $fetch(`/api/content/${content.id}`, {
      method: 'DELETE',
      headers: auth.getAuthHeaders()
    })
    
    alert('内容删除成功')
    fetchContents()
  } catch (err) {
    console.error('删除内容失败:', err)
    alert('删除内容失败，请稍后再试')
  }
}

// 格式化日期
function formatDate(dateString) {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 获取页码数组
function getPageNumbers() {
  const pages = []
  const total = pagination.value.totalPages
  const current = pagination.value.page
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
}

// 切换页码
function changePage(page) {
  if (page < 1 || page > pagination.value.totalPages) {
    return
  }
  
  pagination.value.page = page
  fetchContents()
}

// 初始加载
onMounted(() => {
  fetchContents()
})
</script>
