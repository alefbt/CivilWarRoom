import { defineStore } from 'pinia';
import { api } from 'boot/axios'
import * as encryption from '../utils/encryption'
import * as utilTools from '../utils/tools'

export const useWarRoomHubStore = defineStore('WarRoomHub', {
  state: () => ({
    hasKey: false,
    publicKeyArmored: '',
    fingerprint: '',
    keyId: '',
    hubName: '',
  }),
  getters: {
    //doubleCount: (state) => state.counter * 2,
  },
  actions: {


    authenticateAndVerifyUser(
      userPublicKey, 
      uiFingerprint, 
      armoredPrivateKey,
      passphrase){
      return new Promise((resolve,reject)=>{
        api.post('/auth',{
          publicKey: userPublicKey,
          uiFingerprint,
          type: 'auth-request'
        }).then(async a=>{

          var sessionMessage = a.data.data.sessionMessage;

          const sss = await encryption.decryptObject(
            sessionMessage, 
            armoredPrivateKey, 
            passphrase);

          var msg = {
            sessionKey: sss.sessionKey
          }

          const authVerificationMessage = await encryption.encryptObject(
            msg,
            sss.hubPublicKey,
            armoredPrivateKey,
            passphrase
          )

          api.post('/auth',{
            verificationMessage: authVerificationMessage,
            type: 'auth-verify'
          }).then(f=>{
            resolve(a.data)
          })
        })
      });

      // get UI ID

    },

    authenticateResponseSession(
      armoredRequsetHubPublicKey,
      sessionKey,
      selectedWarRoomObj,
      armoredPrivateKey,
      passphrase
    ){
    /*
        should be message like:
        :EncryptedJson(HubPuK, {
            session random string, 
            selectedWarRoom}, signature);

     */
      return new Promise(async (resolve,reject)=>{

        
        const messageToSend = {
          sessionKey: sessionKey,
          selectedWarRoom: selectedWarRoomObj
        } 

        const encryptedMessage = await encryption.encryptObject(
          messageToSend,
          armoredRequsetHubPublicKey,
          armoredPrivateKey,
          passphrase
        )

        api.post('/auth',{
          verificationResponseMessage: encryptedMessage,
          type: 'auth-response'
        }).then(async f=>{
          
          const sessMessage = f.data.data.sessionMessage

          const decryptedObj = await encryption.decryptObject(
            sessMessage, 
            armoredPrivateKey, 
            passphrase);

          resolve(decryptedObj)
        })

      })

    },



    authenticateRequestUser(
      userPublicKey, 
      uiFingerprint, 
      armoredPrivateKey,
      passphrase){

      return new Promise(async (resolve,reject)=>{

        var publicKey =  (userPublicKey)?
        userPublicKey:
        await encryption.getPublicKeyFromArmoredPrivateKey(armoredPrivateKey, passphrase)

 
        api.post('/auth',{
          publicKey,
          uiFingerprint,
          type: 'auth-request'
        }).then(async authResponse=>{

          var sessionMessage = authResponse.data.data.sessionMessage;

          const decryptedObj = await encryption.decryptObject(
            sessionMessage, 
            armoredPrivateKey, 
            passphrase);

          resolve(decryptedObj)
        })
        
      });

    },


    async setHubPublicKey(hubPublicKey){
      try{
        const publicKey = await encryption.readKey(hubPublicKey)

          this.hasKey = true;
          this.publicKeyArmored = hubPublicKey,
          this.fingerprint = utilTools.convertUint8_to_hexStr(publicKey.keyPacket.fingerprint)
          this.keyId =  publicKey.keyPacket.keyID.toHex()
          this.hubName =  publicKey.users.map((u)=>{ return u.userID.name}).join(' ')
          console.log(`WarRoom HUB "${this.hubName}" Public key (fingerprint:  ${this.fingerprint}) successfully loaded`)

      }catch(e){
        console.log("useWarRoomHubStore.setUIPublicKey error: ", e.message);
        this.hasKey = false;
        return e;
      }
    }

  },
});
