<template>
    <q-layout view="lHh Lpr lFf">
      <q-page-container>
        <router-view />
      </q-page-container>
    </q-layout>
  </template>
  
  <script>
  import { defineComponent, ref, computed } from 'vue'
    // import EssentialLink from 'components/EssentialLink.vue'
    //  import LanguageSwitch from 'components/LanguageSwitch.vue'
  import { inject } from 'vue'
  import { storeToRefs } from 'pinia';
  
  
  export default defineComponent({
    name: 'MainLayout',
  
    components: {
      //EssentialLink,
      //LanguageSwitch
    },
  
    setup () {
      const leftDrawerOpen = ref(false)
      const bus = inject('bus') // inside setup()
  
      return {      
        leftDrawerOpen,
        toggleLeftDrawer () {
          console.log()
          leftDrawerOpen.value = !leftDrawerOpen.value
          bus.emit('some-event', 'arg1SMMMSMS')
  
        }
      }
    }
  })
  </script>
  