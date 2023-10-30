<template>

      <q-page class="flex flex-center bg-grey-2 row">
        


        <q-stepper
        class="col-md-3"
      v-model="step"
      vertical
      color="primary"
      animated
    >

      <q-step
        :name="1"
        :title="$t('RegisterPage.SelectAuthMethod')"
        icon="settings"
        :done="step > 1"
      >

        <q-list>
                <!-- <q-item>
                  <q-btn @click="selectAuthMethod('socialNetworks')" color="primary" :label="$t('RegisterPage.MethodSocialNetworks')" disabled="true" />
                </q-item>
                <q-item>
                  <q-btn @click="selectAuthMethod('usernamePassword')" color="primary" :label="$t('RegisterPage.MethodUserNamePassword')" disabled="true" />
                </q-item> -->
                <q-item>
                  <q-btn @click="selectAuthMethod('publicKey')" color="primary" :label="$t('RegisterPage.MethodPublicKey')"/>
                </q-item>
        </q-list>


        <q-stepper-navigation>
          <LanguageSwitch/>
        </q-stepper-navigation>
      </q-step>

      <q-form 
        @submit.prevent.stop="onSubmitFormPersonalDetails"
        ref="formPersonalDetailsRef"
       >

      <q-step
        :name="2"
        :title="$t('RegisterPage.FillDetails')"
        icon="create_new_folder"
        class="q-gutter-y-md column" 
        :done="step > 2"
      >




              <q-input dense outlined v-model="fullName" :label="$t('RegisterPage.Full Name')"
              :rules="[
                val => !!val || $t('validation.required field')]
                "
                ></q-input>    

              <q-input type="email" dense outlined v-model="email" :label="$t('RegisterPage.Email')"
              :rules="[
                val => !!val || $t('validation.required field')]
                "></q-input>    
  
      
        <q-stepper-navigation>
          <q-btn type="submit" color="primary" :label="$t('next')" />
          <q-btn @click="generateFakeNames" flat color="primary" :label="$t('generate')" class="q-ml-sm" />
          <q-btn  flat @click="step--" color="primary" :label="$t('back')" class="q-ml-sm" />

        </q-stepper-navigation>
      
      </q-step>
    </q-form>

    <q-form 
        @submit.prevent.stop="onSubmitFormPassword"
        ref="formPasswordRef"
       >
      <q-step         :name="3"
        :title="$t('RegisterPage.SelectPassword')"
        class="q-gutter-y-md column" 
        icon="assignment"
        :done="step > 3">

        <q-input type="password"  dense outlined v-model="pw1" :label="$t('RegisterPage.password')"
              
              :rules="[
                val => !!val || $t('validation.required field')
              ]"></q-input>            

              <q-input type="password"  dense outlined v-model="pw2" :label="$t('RegisterPage.password again')"
              :rules="[
                val => !!val || $t('validation.required field'),
                val => val==pw1 || $t('validation.password should same')]"></q-input>


        <q-stepper-navigation>
          <q-btn type="submit" color="primary" :label="$t('next')" />
          <q-btn  flat @click="step--" color="primary" :label="$t('back')" class="q-ml-sm" />
        </q-stepper-navigation>
      </q-step>
    </q-form>

      <q-step
        :name="4"
        :title="$t('RegisterPage.DisplayKeys')"
        icon="assignment"
        :done="step > 4"
      >

        <q-card class="user-generated-keys">


          <q-card-section class="text-center">
            <div class="text-grey-8">{{ $t('RegisterPage.DisplayKeysExplanation') }}</div>
          </q-card-section>
          <q-card-section>
            <q-input dir="ltr" 
            type="textarea" readonly outlined v-model="userPuK" :label="$t('RegisterPage.public key')"></q-input>            
          </q-card-section>

          <q-card-section>
            <q-input  dir="ltr" 
             type="textarea" readonly outlined v-model="userPrK" :label="$t('RegisterPage.private key')"></q-input>            
          </q-card-section>

        
        </q-card>


        <q-stepper-navigation>
          <q-btn @click="stepGeneratedKeys" color="primary" :label="$t('next')" />

          <q-btn flat @click="step--" color="primary" :label="$t('back')" class="q-ml-sm" />
                </q-stepper-navigation>
      </q-step>




     
      <q-step         :name="5"
        :title="$t('RegisterPage.ConfirmationPage')"
        icon="assignment"
        :done="step > 4">
      <div         class="q-gutter-y-md column" 
>
        <q-input readonly dense outlined 
          v-model="infoHubName" :label="$t('RegisterPage.Hub Name')"></q-input>    

        <q-input readonly dense outlined dir="ltr"  class="pgpkeys"
          v-model="infoHubFingerPrint" :label="$t('RegisterPage.Hub FingerPrint')"></q-input>    

        <q-input dir="ltr"   class="pgpkeys"
            type="textarea" readonly outlined v-model="infoHubPuK" 
            :label="$t('RegisterPage.hub public key')"></q-input>            


        <q-input readonly dense outlined  
            v-model="infoUIName" :label="$t('RegisterPage.UI Name')"></q-input>    

            <q-input readonly dense outlined  dir="ltr"   class="pgpkeys"
            v-model="infoUIFingerPrint" :label="$t('RegisterPage.UI FingerPrint')"></q-input>  

          </div>


        <q-stepper-navigation>
          <q-btn   @click="onAcceptHubDetails" color="primary" :label="$t('next')" />
          <q-btn  flat @click="step--" color="primary" :label="$t('back')" class="q-ml-sm" />
        </q-stepper-navigation>
      </q-step>

      <q-inner-loading
            :showing="stepAccestInnerloadingSpinner"
            :label="$t('pleaseWait')"
            label-class="text-teal"
            label-style="font-size: 1.1em"
          />
    </q-stepper>




        
      </q-page>
  </template>
  <style lang="scss">
  div.user-generated-keys, .pgpkeys {
    textarea, input[type="text"] {
      font-family: monospace;
      font-size: 7pt;
    }
  }
  </style>
  <script>
  import { defineComponent,inject,  ref, watch, computed } from 'vue'
  import LanguageSwitch from 'components/LanguageSwitch.vue'
  import * as encryption from '../../utils/encryption'
  import { useWarRoomUiStore } from 'stores/warroomui-store'
  import { useWarRoomHubStore } from 'stores/warroomhub-store'

  import { useQuasar } from 'quasar'
  import { useI18n } from 'vue-i18n'

  import { useRouter } from 'vue-router'
  import { faker } from '@faker-js/faker';

  export default defineComponent({
    name: 'AuthRegisterPage',
    components: {
        LanguageSwitch
    },
    

    setup () {
        const $q = useQuasar()
        const $t = useI18n({ useScope: 'global' }).t
        const router = useRouter()

        const userPuK = ref("")
        const userKeysLoading = ref(false)
        const userPrK = ref("")
        const step = ref(1)
        const selectedAuthMethod = ref("")

        const fullName = ref("")
        const email = ref("")
        const isValidFormPersonalDetails = ref(false)
        const formPersonalDetailsRef = ref(null)

        const pw1 = ref("")
        const pw2 = ref("")
        const formPasswordRef = ref(null)
        const stepAccestInnerloadingSpinner = ref(false)

        const warRoomUiStore = useWarRoomUiStore()
        const warRoomHubStore = useWarRoomHubStore()

        const infoHubName  = ref(warRoomHubStore.hubName)
        const infoHubFingerPrint  = ref(warRoomHubStore.fingerprint)
        const infoHubPuK  = ref(warRoomHubStore.publicKeyArmored)

        const infoUIName  = ref(warRoomUiStore.uiName)
        const infoUIFingerPrint  = ref(warRoomUiStore.fingerprint)


        const gotoStepGenerateKey = function () {
          step.value = 4;
          

          //spinner
          

          (async () => {
            // const identityStore = useIdentityStore();
            
            stepAccestInnerloadingSpinner.value = true

            userKeysLoading.value = true
            const { privateKey, publicKey } = await encryption.generateKeys(fullName.value,email.value,pw1.value)
            userPuK.value = publicKey
            userPrK.value = privateKey
            userKeysLoading.value = false
            stepAccestInnerloadingSpinner.value = false
                            
          })()
        }

      return {
        userKeysLoading,
        userPuK,
        userPrK,
        step,

        pw1,
        pw2,
        formPasswordRef,

        fullName,
        email,
        isValidFormPersonalDetails,
        formPersonalDetailsRef,

        gotoStepGenerateKey,
       
        infoHubName,
        infoHubFingerPrint,
        infoHubPuK,
        infoUIName,
        infoUIFingerPrint,
        stepAccestInnerloadingSpinner, 

        selectAuthMethod (authMethod) {
          selectedAuthMethod.value = authMethod
          step.value = 2
        },
        onSubmitFormPersonalDetails(){
          formPersonalDetailsRef.value.validate().then((isValidForm) => {
            if(isValidForm){
              step.value = 3
            }
          }
          );
        },

        validFormPersonalDetails () {
          formPersonalDetailsRef.value.validate();
        },

        onSubmitFormPassword () {
          formPasswordRef.value.validate().then((isValidForm) => {
             if(isValidForm){
               gotoStepGenerateKey();
             }
          })
        },
        stepGeneratedKeys () {

          $q.dialog({
            title: $t("RegisterPage.KeysWarningTitle"),
            message: $t("RegisterPage.KeysWarningMessage"),
            ok: {
              push: true
            },
            cancel: {
              push: true,
              color: 'negative'
            },
            persistent: true
          }).onOk(() => {
            step.value = 5
          }).onCancel(() => {
          }).onDismiss(() => {
          })

        },

        generateFakeNames () { 
            fullName.value = faker.person.fullName();
            email.value = faker.internet.email();
            formPersonalDetailsRef.value.validate()
        },

        onAcceptHubDetails() {
          stepAccestInnerloadingSpinner.value = true

          // Login?
          // warRoomHubStore.auth(userPrK, passcode) -> puk -> session rky
          // redirect to login page 
           
          warRoomHubStore.authenticateAndVerifyUser(
            userPuK.value, warRoomUiStore.fingerprint, userPrK.value, pw1.value
            ).then(f=>{
            
            
            stepAccestInnerloadingSpinner.value = false

            $q.dialog({
              title: $t("RegisterPage.SuccessfulyRegistration"),
              message: $t("RegisterPage.SuccessfulyRegistrationMessage"),
              ok: {
                push: true
              },
              
              persistent: true
            }).onOk(() => {
              router.push({name:'AuthLogin'})
            })

          }).catch(e=>{
            // show error
            stepAccestInnerloadingSpinner.value = false

          })
        },
        
      }
    }
  })
  </script>
  