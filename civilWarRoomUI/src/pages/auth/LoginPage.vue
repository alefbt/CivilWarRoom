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
                    <q-btn @click="selectAuthMethod('encryption-keys')" color="primary" :label="$t('LoginPage.MethodPublicKey')"/>
                  </q-item>
                  
                </q-list>

                <q-stepper-navigation>
                  <div class="text-grey-8">{{ $t('LoginPage.signup desc') }}
                    <router-link :to="'/auth/register'" class="text-dark text-weight-bold" style="text-decoration: none">{{ $t('LoginPage.signup here') }}</router-link>
                  </div>                  

                  <br/>
                  <br/>

                  <LanguageSwitch/>
                  <br/>

                </q-stepper-navigation>
              </q-step>


                <q-step
                  :name="2"
                  :title="$t('LoginPage.LoginDetails')"
                  icon="settings"
                   
                  :done="step > 2"
                >

                <q-form  @submit.prevent.stop="onLoginWithEncryptionKeys"   
                class="q-gutter-y-md column">

                <q-input type="password"  dense outlined v-model="userPrivateKeyPW" :label="$t('LoginPage.password')" />


                <q-input  dir="ltr" 
             type="textarea" outlined v-model="userPrivateKey" :label="$t('RegisterPage.private key')"></q-input>            



                <q-stepper-navigation>
                  <q-btn type="submit" color="primary" :label="$t('next')" />
                  <q-btn @click="step--" flat :label="$t('back')" />

                </q-stepper-navigation>
                </q-form> 

                </q-step>



                <q-step
                  :name="3"
                  :title="$t('LoginPage.SelectWarRoom')"
                  icon="settings"
                   
                  :done="step > 3"
                >
      <q-select
        filled
        v-model="selectedWarRoom"
        use-input
        hide-selected
        fill-input
        input-debounce="0"
        :options="warroomOptionList"
        @filter="warroomFilterFn"
        @new-value="createNewWarroomFn"

        :label="$t('LoginPage.WarRoom')"
        style="width: 250px; padding-bottom: 32px"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              {{$t('noResults')}}
            </q-item-section>
          </q-item>
        </template>
  
      </q-select>


        <q-stepper-navigation>
          <q-btn @click="selectWarRoom" color="primary" :label="$t('next')" />
          <q-btn @click="step--" flat :label="$t('back')" />

        </q-stepper-navigation>
      </q-step>
        </q-stepper>
      </q-page>
  </template>
  
    
  <script>
  import { defineComponent,inject,  ref, watch } from 'vue'
  import { useUserIdentityStore } from 'stores/user-identity-store';
  import { storeToRefs } from 'pinia';
  import LanguageSwitch from 'components/LanguageSwitch.vue'
  import { useWarRoomUiStore } from 'stores/warroomui-store'
  import { useWarRoomHubStore } from 'stores/warroomhub-store'
  import { useRouter } from 'vue-router'

  
  export default defineComponent({
    name: 'AuthLoginPage',
    components: {
        LanguageSwitch
    },

    setup () {


      const warroomOptionsArr = [
        {label:'test1',value: '11'},
        {label:'test2',value: '22'}
      ]

      const step = ref(1)
      const authType = ref(""),
      userPrivateKeyPW = ref(""),
      userPrivateKey = ref(""),
      warroomOptionList = ref(warroomOptionsArr),
      selectedWarRoom = ref(""),
      sessionKey = ref(""),
      requsetHubPublicKey = ref("")

      const warRoomUiStore = useWarRoomUiStore()
      const warRoomHubStore = useWarRoomHubStore()
      const userIdentityStore =useUserIdentityStore()

      const router = useRouter()

    //   const {testT} = storeToRefs(useIdentityStore())
    //   const cbus = inject('bus')
    //   const testName = ref("TEST 1")
  
    //   cbus.on('some-event', (arg1) => {
    //     // do some work
    //     console.log("ON some-event:" + arg1)
    //       testName.value = arg1
    //       testT.value = "TEST2"
    //     })

    return {
        step,
        authType,
        userPrivateKeyPW,
        userPrivateKey,
        warroomOptionList,
        selectedWarRoom,
        onLoginWithEncryptionKeys() {

          
          warRoomHubStore.authenticateRequestUser(
            null,
            warRoomUiStore.fingerprint,
            userPrivateKey.value,
            userPrivateKeyPW.value
          ).then(resp=>{

            while(warroomOptionsArr.length>0)
              warroomOptionsArr.pop()

              console.log(resp)

            for (var key in resp.availableWarRooms) {
              if (resp.availableWarRooms.hasOwnProperty(key)) { 
                var value = resp.availableWarRooms[key];
                warroomOptionsArr.push({label: value,value: key})
              }
            }

            sessionKey.value = resp.sessionKey
            requsetHubPublicKey.value = resp.hubPublicKey
            step.value ++
          })
                    
        },
        selectAuthMethod(selectedAuthType) {
          authType.value = selectedAuthType
          step.value ++
        },
        selectWarRoom(){
          
          var selectedWarRoomObj = [selectedWarRoom.value].map(f=>{
            return {
              id: f.value,
              name: f.label
            }
          }).pop();


          warRoomHubStore.authenticateResponseSession(
            requsetHubPublicKey.value,
            sessionKey.value,
            selectedWarRoomObj,
            userPrivateKey.value,
            userPrivateKeyPW.value
          ).then(f=>{
            
            userIdentityStore.setUserSessionIdentity(f)
            
            router.push({name:'Homepage'})

          })


        },
        createNewWarroomFn(val,done) {
          const v = {label:val,value:''};
          warroomOptionsArr.push(v)
          done(v)
        },
        warroomFilterFn (val, update, abort) {
          if (val === '') {
            update(() => {
              warroomOptionList.value = warroomOptionsArr
            })
            return
          }

          update(() => {
            const needle = val.toLowerCase()
            warroomOptionList.value = warroomOptionsArr.filter(v => {
              return ((v.label.toLowerCase().indexOf(needle) > -1)
              || (v.value.toLowerCase().indexOf(needle) > -1))
            })
          })
        }
      }
    }
  })
  </script>
  