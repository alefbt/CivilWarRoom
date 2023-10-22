<template>

      <q-page class="flex flex-center bg-grey-2">
        <q-stepper
            v-model="step"
            vertical
            color="primary"
            animated
          >
              <q-step
                :name="1"
                :title="$t('LoginPage.SelectLoginMethod')"
                icon="settings"
                :done="step > 1"
              >

               

                <q-list>
                  <!-- <q-item>
                    <q-btn @click="selectMethod(1)" color="primary" :label="$t('LoginPage.MethodSocialNetworks')" disabled="true" />
                  </q-item>
                  <q-item>
                    <q-btn @click="selectMethod(1)" color="primary" :label="$t('LoginPage.MethodUserNamePassword')" disabled="true" />
                  </q-item> -->
                  <q-item>
                    <q-btn @click="selectMethod(1)" color="primary" :label="$t('LoginPage.MethodPublicKey')" disabled="true"/>
                  </q-item>
                  
                </q-list>
                
                <q-stepper-navigation>
                  <div class="text-grey-8">{{ $t('LoginPage.signup desc') }}
                    <router-link :to="'/auth/register'" class="text-dark text-weight-bold" style="text-decoration: none">{{ $t('LoginPage.signup here') }}</router-link>
                  </div>                  

                  <br/>

                  <LanguageSwitch/>
                </q-stepper-navigation>
              </q-step>
        </q-stepper>
<!--
        <q-card class="q-pa-md shadow-2 my_card" bordered>
          <q-card-section class="text-center">
            <div class="text-grey-9 text-h5 text-weight-bold">{{ $t('LoginPage.Sign in') }}</div>
            <div class="text-grey-8">{{ $t('LoginPage.Sign in description') }}</div>
          </q-card-section>
          <q-card-section>
            <q-input  type="textarea" dense outlined v-model="userPuK" :label="$t('LoginPage.public key')"></q-input>            
          </q-card-section>
          <q-card-section>
            <q-btn style="
  border-radius: 8px;" color="dark" rounded size="md" :label="$t('LoginPage.signin button')" no-caps class="full-width"></q-btn>
          </q-card-section>
          <q-card-section class="text-center q-pt-none">
            <div class="text-grey-8">{{ $t('LoginPage.signup desc') }}
              <router-link :to="'/auth/register'" class="text-dark text-weight-bold" style="text-decoration: none">{{ $t('LoginPage.signup here') }}</router-link>
=            </div>
          </q-card-section>

          <q-card-section class="text-center q-pt-none">
            <div class="text-grey-8">
            <LanguageSwitch/>
            </div>
          </q-card-section>
        </q-card>

      -->
      </q-page>
  </template>
  
  <script>
  import { defineComponent,inject,  ref, watch } from 'vue'
  import { useIdentityStore } from 'stores/identity-store';
  import { storeToRefs } from 'pinia';
  import LanguageSwitch from 'components/LanguageSwitch.vue'

  
  export default defineComponent({
    name: 'AuthLoginPage',
    components: {
        LanguageSwitch
    },

    setup () {
      const step = ref(1)
    //   const {testT} = storeToRefs(useIdentityStore())
    //   const cbus = inject('bus')
    //   const testName = ref("TEST 1")
  
    //   cbus.on('some-event', (arg1) => {
    //     // do some work
    //     console.log("ON some-event:" + arg1)
    //       testName.value = arg1
    //       testT.value = "TEST2"
    //     })
        const userPuK = "";
        const password = "";
      return {
        userPuK,
        password,
        step
      }
    }
  })
  </script>
  