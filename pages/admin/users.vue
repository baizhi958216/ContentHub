<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">用户管理</h1>
    
    <div v-if="loading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>
    
    <div v-else>
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                用户名
              </th>
              <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                邮箱
              </th>
              <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                角色
              </th>
              <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                内容数
              </th>
              <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                注册时间
              </th>
              <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">
                {{ user.name || '未设置' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ user.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                      :class="user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'">
                  {{ user.role === 'ADMIN' ? '管理员' : '普通用户' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                      :class="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ user.isActive ? '正常' : '已禁用' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ user._count?.contents || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ new Date(user.createdAt).toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="toggleUserStatus(user)"
                  class="text-indigo-600 hover:text-indigo-900 mr-4"
                  :disabled="isCurrentUser(user) || statusLoading[user.id]">
                  {{ user.isActive ? '禁用' : '启用' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $toast } = useNuxtApp()
const router = useRouter()
const auth = useAuth()

// 检查是否为管理员
onMounted(() => {
  if (!auth.user.value || auth.user.value.role !== 'ADMIN') {
    $toast.error('您没有权限访问此页面')
    router.push('/')
  }
})

const users = ref([])
const loading = ref(true)
const error = ref(null)
const statusLoading = ref({})

// 获取用户列表
async function fetchUsers() {
  loading.value = true
  error.value = null
  
  try {
    const response = await $fetch('/api/admin/users', {
      headers: auth.getAuthHeaders()
    })
    users.value = response.body || []
  } catch (err) {
    console.error('获取用户列表失败:', err)
    error.value = '获取用户列表失败，请稍后再试'
  } finally {
    loading.value = false
  }
}

// 切换用户状态
async function toggleUserStatus(user) {
  if (isCurrentUser(user)) {
    $toast.error('不能修改自己的账户状态')
    return
  }
  
  statusLoading.value[user.id] = true
  
  try {
    await $fetch(`/api/admin/users/${user.id}/toggle-status`, {
      method: 'PATCH',
      headers: auth.getAuthHeaders()
    })
    
    // 重新获取用户列表
    await fetchUsers()
    $toast.success(`用户 ${user.name || user.email} 已${user.isActive ? '禁用' : '启用'}`)
  } catch (err) {
    console.error('切换用户状态失败:', err)
    $toast.error('操作失败，请稍后再试')
  } finally {
    statusLoading.value[user.id] = false
  }
}

// 检查是否为当前用户
function isCurrentUser(user) {
  return auth.user.value && auth.user.value.id === user.id
}

// 初始加载
onMounted(() => {
  fetchUsers()
})
</script>