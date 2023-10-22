import { defineStore } from 'pinia';
import { readKey } from 'openpgp';

export const useWarRoomUiStore = defineStore('WarRoomUi', {
  state: () => ({
    hasKey: false,
    publicKeyArmored: '',
    fingerprint: '',
    keyId: '',
    uiName: '',
  }),
  getters: {
    //doubleCount: (state) => state.counter * 2,
  },
  actions: {
    async setUIPublicKey(userPublicKey){
      
      function convertUint8_to_hexStr(uint8) {
        return Array.from(uint8)
          .map((i) => i.toString(16).padStart(2, '0'))
          .join('');
      }

      return new Promise( async (resolve, reject) => {
        try{
          const publicKey = await readKey({ armoredKey: userPublicKey });

          this.hasKey = true;
          this.publicKeyArmored = userPublicKey,
          this.fingerprint = convertUint8_to_hexStr(publicKey.keyPacket.fingerprint)
          this.keyId =  publicKey.keyPacket.keyID.toHex()
          this.uiName =  publicKey.users.map((u)=>{ return u.userID.name}).join(' ')
          
          console.log(`WarRoom UI "${this.uiName}" Public key (fingerprint:  ${this.fingerprint}) successfully loaded`)
          resolve(this)
        }
        catch(e){
          this.hasKey = false
          this.uiName = ''
          this.keyId = ''
          this.publicKeyArmored = ''
          this.fingerprint = ''

          reject(e)
        }

      })
    
    }

  },
});
