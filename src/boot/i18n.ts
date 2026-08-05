import { defineBoot } from '#q-app'
import { createI18n } from 'vue-i18n'
import { usePreferredLanguages } from '@vueuse/core'
import { default as messages } from '@/i18n'

const preferredLanguages = usePreferredLanguages()

export default defineBoot(({ app }) => {
  const i18n = createI18n({
    locale: preferredLanguages.value[0] || 'en-US',
    fallbackLocale: 'en-US',
    legacy: false,
    messages,
  })

  // Set i18n instance on app
  app.use(i18n)
})
