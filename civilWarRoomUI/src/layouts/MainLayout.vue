<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
      
        <!-- <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        /> -->
      

        <q-toolbar-title>
          {{ $t('Civil War Room') }} 
        </q-toolbar-title>

        <div class="text-h4">
          {{ ctime }}
        </div>

        <div style="padding-left: 1em; padding-right: 1em;">
          {{ cdate }}
        </div>


        <div class="bg-white">
          <LanguageSwitch/>
        </div>

        <div style="padding-left: 1em; padding-right: 1em;">
          {{ loggedinUser }}
        </div>

        <q-btn
          flat
          dense
          round
          icon="logout"
          aria-label="Logout"
          :to="'/auth/logout'"
        />
        
        <!--
        <div> v{{ $q.version }}</div>
-->
      </q-toolbar>

      <!-- <q-tabs v-model="tab">
        <q-tab name="main" label="Home" />
      </q-tabs> -->
    </q-header>

   
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'
// import EssentialLink from 'components/EssentialLink.vue'
import LanguageSwitch from 'components/LanguageSwitch.vue'
import { inject } from 'vue'
import { useUserIdentityStore } from 'stores/user-identity-store'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'MainLayout',

  components: {
    LanguageSwitch
  },

  data () {
      return {
          ctime: "HH:MM:SS-1",
          cdate: "dd/mm/yyyy",
      }
  },

  created () {
      this.updateNow()
      this.scheduleUpdateNow();
  },

  methods: {
      updateNow() {
          const a = new Date()
          this.ctime = a.toTimeString().split(" ")[0]
          this.cdate = a.toLocaleString().split(',')[0]
          this.scheduleUpdateNow();
      },
      scheduleUpdateNow() {
          setTimeout(this.updateNow, 1000);
      }
  },
  setup () {
    const leftDrawerOpen = ref(false)

    const userIdentityStore =useUserIdentityStore()
    userIdentityStore.loadCachedSessionIdentity()
    console.log(userIdentityStore.displayName)
    // const loggedinUser = ref(userIdentityStore.displayName)

    const bus = inject('bus') // inside setup()

    console.log("WS connect ....")

    const so = new WebSocket('ws://localhost:9000/ws/main')

    console.log(so)
    so.onmessage = (event) => {
      console.log("E",event)
    };
    so.onclose = ( e,x,y ) => {
      console.log("onerror",e,x,y)
    }
    so.onerror = ( e,x,y ) => {
      console.log("onerror",e,x,y)
    }
    so.onopen = ( e,x,y ) => {
      console.log(e,x,y)
      so.send("test from ui");
    }

    return {     
      loggedinUser:  userIdentityStore.displayName,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
        bus.emit('some-event', 'arg1SMMMSMS')

      }
    }
  }
})
</script>
