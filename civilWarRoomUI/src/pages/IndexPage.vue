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
import { useIdentityStore } from 'stores/identity-store';
import { storeToRefs } from 'pinia';


export default defineComponent({
  name: 'IndexPage',
  setup () {
    const cbus = inject('bus')
    const testName = ref("TEST 1")

    cbus.on('some-event', (arg1) => {
      // do some work
      console.log("ON some-event:" + arg1)
        testName.value = arg1
      })
    return {
    }
  }
})
</script>
