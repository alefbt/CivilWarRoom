<template>
  <q-page class="flex flex-center">
    <!-- <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    > -->

    <router-link :to="'/auth/login'">login</router-link>
    
  </q-page>
</template>

<script>
import { defineComponent,inject,  ref, watch } from 'vue'
import { storeToRefs } from 'pinia';


export default defineComponent({
  name: 'IndexPage',
  setup () {
    const cbus = inject('bus')

   
    return {
    }
  }
})
</script>
