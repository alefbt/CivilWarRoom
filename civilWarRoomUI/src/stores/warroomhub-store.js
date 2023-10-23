import { defineStore } from 'pinia';
import { readKey } from 'openpgp';

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
    async authenticateUser(userPublicKey){
      // get UI ID

    },
    async setHubPublicKey(hubPublicKey){
      try{
        const publicKey = await readKey({ armoredKey: hubPublicKey });

          function convertUint8_to_hexStr(uint8) {
            return Array.from(uint8)
              .map((i) => i.toString(16).padStart(2, '0'))
              .join('');
          }
                  
          this.hasKey = true;
          this.publicKeyArmored = hubPublicKey,
          this.fingerprint = convertUint8_to_hexStr(publicKey.keyPacket.fingerprint)
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
