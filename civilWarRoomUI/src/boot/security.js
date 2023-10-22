
import { boot } from 'quasar/wrappers'
import { useWarRoomUiStore } from 'stores/warroomui-store'
import { useWarRoomHubStore } from 'stores/warroomhub-store'

import { api } from 'boot/axios'
import { ref } from 'vue'

export default  boot( async ({ app, store }) => {

    const warRoomUiStore = useWarRoomUiStore(store)

    // Generic WarRoomUI (Dev) Public GPG
    const wrUIPuKArmored = ref(`-----BEGIN PGP PUBLIC KEY BLOCK-----

        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
        0LmYYA==
        =O2T0
        -----END PGP PUBLIC KEY BLOCK-----     
    `.replace(/^\s+/gm, '').replace(/-{4}$/gm, '----\n'))
    
    await api.get('./publickey.pgp')
        .then(response => {
            wrUIPuKArmored.value = response.data

            warRoomUiStore
            .setUIPublicKey(wrUIPuKArmored.value)
            .catch((e)=>{
                console.log("eerror",e)
                throw e;
            })
        }).catch(function (error) {
            console.log("WarRoomUI Public key unavailable. considure to generate");
        })
   



    /* Hub */
    const warRoomHubStore = useWarRoomHubStore(store)

    // Generic WarRoom HUB (Dev) Public GPG
    const wrHubPuKArmored = ref(`-----BEGIN PGP PUBLIC KEY BLOCK-----

        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
        =MfdL
        -----END PGP PUBLIC KEY BLOCK-----
        `.replace(/^\s+/gm, '').replace(/-{4}$/gm, '----\n'));


        await api.get('/hub/api/v1/info')
        .then(response => {
            wrHubPuKArmored.value = response.data.data.publicKey
            warRoomHubStore.setHubPublicKey(wrHubPuKArmored.value);

        }).catch(function (error) {
            console.log("WarRoomHub Public key unavailable. considure to generate");
        })
   
     
   
    
   

})