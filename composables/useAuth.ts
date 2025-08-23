import { ref, computed } from 'vue'

export default function useAuth() {
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // 检查是否已登录
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  
  // 检查是否为管理员
  const isAdmin = computed(() => isLoggedIn.value && user.value?.role === 'ADMIN')
  
  // 初始化 - 从本地存储加载用户信息
  function init() {
    if (process.client) {
      const storedToken = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('auth_user')
      
      if (storedToken && storedUser) {
        // 检查本地JWT是否过期，过期则清理登录状态
        try {
          const payload = JSON.parse(atob(storedToken.split('.')[1]))
          if (payload?.exp && payload.exp * 1000 <= Date.now()) {
            console.warn('本地token已过期，执行登出')
            logout()
            return
          }
        } catch (e) {
          console.warn('解析本地token失败，执行登出')
          logout()
          return
        }

        token.value = storedToken
        try {
          user.value = JSON.parse(storedUser)
        } catch (e) {
          console.error('解析存储的用户信息失败:', e)
          logout()
        }
      }
    }
  }
  
  // 登录
  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    
    try {
      const response: any = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      
      if (response.body?.token && response.body?.user) {
        token.value = response.body.token
        user.value = response.body.user
        
        // 保存到本地存储
        if (process.client) {
          localStorage.setItem('auth_token', token.value)
          localStorage.setItem('auth_user', JSON.stringify(user.value))
        }
        
        return true
      } else {
        throw new Error('登录响应格式不正确')
      }
    } catch (err: any) {
      console.error('登录失败:', err)
      error.value = err.data?.body?.error || err.message || '登录失败，请稍后再试'
      return false
    } finally {
      loading.value = false
    }
  }
  
  // 注册
  async function register(email: string, password: string, name: string) {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch('/api/auth/register', {
        method: 'POST',
        body: { email, password, name }
      })
      
      if (response.statusCode === 201) {
        // 注册成功后自动登录
        return await login(email, password)
      } else {
        throw new Error('注册响应格式不正确')
      }
    } catch (err: any) {
      console.error('注册失败:', err)
      error.value = err.data?.body?.error || err.message || '注册失败，请稍后再试'
      return false
    } finally {
      loading.value = false
    }
  }
  
  // 登出
  function logout() {
    user.value = null
    token.value = null
    
    // 清除本地存储
    if (process.client) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
  }
  
  // 获取认证头信息，用于API请求
  function getAuthHeaders() {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {}
  }
  
  // 初始化
  init()
  
  return {
    user,
    token,
    loading,
    error,
    isLoggedIn,
    isAdmin,
    login,
    register,
    logout,
    getAuthHeaders
  }
}