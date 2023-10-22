
const express = require('express')
const router = express.Router()
const logger = require('../../utils/logger');
const apiUtils = require('./v1/utils')
const warroomIdentityTools = require('../war-room-identity-tools')
router.use((req, res, next) => {
    logger.debug(`Time: ${Date.now()}`)
    next()
})



module.exports = router
module.exports.attachRouter = function(appContext) {

    const expressApp = appContext.get("expressApp")

    router.get('/info', (request, response) => {
        const identity = appContext.get('warroomIdentity')
        
        const data = {
            "version":  appContext.get("packageConfig").version,
            "service": "warRoomHub",
            "name": identity.name,
            "publicKeyFingerprint": identity.fingerprint,
            "publicKey": identity.armoredPublicKey,
          };



          apiUtils.createResponseObject(appContext, data).then(signedData=>{
            response.send(signedData);
            
            /// TEST VERIFICATION
            // apiUtils.testVerifyResponseObject(appContext,identity.armoredPublicKey, signedData).then(res=>{
            //     logger.debug(res);
            //   })
              
          })
        
      })

      

    logger.debug("Attaching router")
    expressApp.use('/api/v1/', router)
}
