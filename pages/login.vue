<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          登录您的账户
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          或者
          <NuxtLink to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
            注册新账户
          </NuxtLink>
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div v-if="auth.error.value" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {{ auth.error.value }}
        </div>
        
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">邮箱地址</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="邮箱地址"
            />
          </div>
          <div>
            <label for="password" class="sr-only">密码</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="密码"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="auth.loading.value"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <span v-if="auth.loading.value" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            </span>
            {{ auth.loading.value ? '登录中...' : '登录' }}
          </button>
        </div>
      </form>
      
      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-50 text-gray-500">默认管理员账户</span>
          </div>
        </div>
        <div class="mt-3 text-center text-sm text-gray-600">
          <p>邮箱: admin@example.com</p>
          <p>密码: admin123</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const auth = useAuth()
const router = useRouter()

const form = ref({
  email: '',
  password: ''
})

async function handleLogin() {
  const success = await auth.login(form.value.email, form.value.password)
  
  if (success) {
    // 登录成功，跳转到首页或管理页面
    if (auth.isAdmin.value) {
      router.push('/admin/users')
    } else {
      router.push('/')
    }
  }
}

// 如果已经登录，重定向
onMounted(() => {
  if (auth.isLoggedIn.value) {
    if (auth.isAdmin.value) {
      router.push('/admin/users')
    } else {
      router.push('/')
    }
  }
})
</script>