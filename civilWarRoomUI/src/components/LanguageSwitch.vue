<template>
    <q-select
      v-model="lang"
      :options="langOptions"
      label="Language"
      dense
      emit-value
      map-options
      options-dense
      style="min-width: 150px"
    />
  </template>
  
  <script>
  import { useQuasar } from 'quasar'
  import languages from 'quasar/lang/index.json'
  import { defineComponent, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'

  const appLanguages = languages.filter(lang =>
    [ 'he', 'en-US' ].includes(lang.isoName)
  )
  
  const langOptions = appLanguages.map(lang => ({
    label: lang.nativeName, value: lang.isoName
  }))
  
  export default defineComponent({
    name: 'LanguageSwitch',
    setup () {
      const $q = useQuasar()
      const lang = ref($q.lang.isoName)
      const i18n = useI18n({ useScope: 'global' })

      watch(lang, val => {
        // dynamic import, so loading on demand only
          import(
          /* @vite-ignore */
          /* webpackInclude: /(he|en-US)\.js$/ */
          `../../node_modules/quasar/lang/${ val }.mjs`
          ).then(lang => {
            $q.lang.set(lang.default)
            i18n.locale.value = val; // lang.default
          })

      })
  
      return {
        lang,
        langOptions
      }
    }
  })
  </script>
  