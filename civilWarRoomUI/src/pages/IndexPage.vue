<template>
  <q-page class="flex">
    <!-- <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    > -->
    <div class="col">
      <q-tabs v-model="tab">
        <q-tab name="images" label="Images" />
        <q-tab name="videos" label="Videos" />
        <q-tab name="articles" label="Articles" />
      </q-tabs>

      
    </div>
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
