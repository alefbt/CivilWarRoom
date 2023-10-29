
const express = require('express')
const router = express.Router()
const logger = require('../../utils/logger');
const apiUtils = require('./v1/utils')
const v1auth = require('./v1/auth')


module.exports.attachRouter = function(appContext, expressApp) {

    v1auth.attachRouter(appContext, router);

    router.get('/info', (request, response) => {
        const identity = appContext.get('warroomIdentity')
        
        const data = {
            "version":  appContext.get("packageConfig").version,
            "service": "warRoomHub",
            "name": identity.name,
            "publicKeyFingerprint": identity.fingerprint,
            "publicKey": identity.armoredPublicKey,
          };



          apiUtils.createSignedResponseObject(appContext, data).then(signedData=>{
            response.send(signedData);
            
            /// TEST VERIFICATION
            // apiUtils.testVerifyResponseObject(appContext,identity.armoredPublicKey, signedData).then(res=>{
            //     logger.debug(res);
            //   })
              
          })
        
      })

      

    logger.debug("Attaching router")
    expressApp.use('/hub/api/v1/', router)
}
