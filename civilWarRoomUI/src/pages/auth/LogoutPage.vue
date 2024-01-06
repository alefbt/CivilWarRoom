<template>
...
</template>
  
    
  <script>
  import { defineComponent,inject,  ref, watch } from 'vue'
  import { useUserIdentityStore } from 'stores/user-identity-store';
  import { storeToRefs } from 'pinia';
  import { useWarRoomUiStore } from 'stores/warroomui-store'
  import { useWarRoomHubStore } from 'stores/warroomhub-store'
  import { useRouter } from 'vue-router'

  
  export default defineComponent({
    name: 'AuthLogoutPage',

    setup () {

      const warRoomUiStore = useWarRoomUiStore()
      const warRoomHubStore = useWarRoomHubStore()
      const userIdentityStore =useUserIdentityStore()

      userIdentityStore.logout()

      const router = useRouter()
      const cbus = inject('bus')
      router.push({name:'Homepage'})
      


    return {
      }
    }
  })
  </script>
  