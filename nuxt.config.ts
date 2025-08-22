// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-08-22',
  app: {
    head: {
      title: 'ContentHub（内容汇）',
      meta: [
        { name: 'description', content: '一个现代化的内容聚合与管理平台' }
      ]
    }
  },
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    '@pinia/nuxt'
  ],
  colorMode: {
    classSuffix: ''
  },
  css: ['./assets/css/main.css'],
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    public: {
      apiBase: '/api'
    }
  },
  typescript: {
    strict: false
  }
})
