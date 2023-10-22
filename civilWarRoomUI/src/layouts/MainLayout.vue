<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
      
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
      

        <q-toolbar-title>
          {{ $t('Civil War Room') }} -  {{ testT }}
        </q-toolbar-title>


        <div class="bg-white">
          <LanguageSwitch/>
        </div>
        
        <!--
        <div> v{{ $q.version }}</div>
-->
      </q-toolbar>
    </q-header>

    <!--
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Essential Links
        </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>
-->
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
import { useIdentityStore } from 'stores/identity-store';
import { storeToRefs } from 'pinia';


export default defineComponent({
  name: 'MainLayout',

  components: {
    //EssentialLink,
    LanguageSwitch
  },

  setup () {
    const leftDrawerOpen = ref(false)

    const {testT} = storeToRefs(useIdentityStore())
    const bus = inject('bus') // inside setup()

    return {      
      leftDrawerOpen,
      testT,
      toggleLeftDrawer () {
        console.log()
        leftDrawerOpen.value = !leftDrawerOpen.value
        bus.emit('some-event', 'arg1SMMMSMS')

      }
    }
  }
})
</script>
