

const warroomIdentityTools = require('../../war-room-identity-tools')
const _ = require('lodash')


function pickVerificationObjects(dataObj){
  return _.pick(dataObj,  ['metadata', 'data'])
}

exports.testVerifyResponseObject = function(appContext, armoredPublicKey , data) {
  return new Promise( (mainResolve, mainReject) => {

    const objToVerify = pickVerificationObjects(data)
    const signeture = data['signeture']

    warroomIdentityTools.verifySign(appContext,armoredPublicKey,signeture, objToVerify).then(f=>{
    
      const objToSend =  _.extend(f, {
        isVerified: true
      })
      console.log(objToSend)
      mainResolve(objToSend)
    })

  })
    
}
exports.createResponseObject = function(appContext, data) {

    return new Promise( (mainResolve, mainReject) => {

        const identity = appContext.get('warroomIdentity')
    
        const objToSend = {
            "@schemaVersion": "server-info#1.0.1",
            "metadata": {},
            "data": data,
          }
    
          const objectToVerify = pickVerificationObjects(objToSend, ['metadata', 'data'])

          warroomIdentityTools.sign(appContext,objectToVerify).then(f=>{
    
            objToSend.signeture = f.signeture
    
            mainResolve(objToSend)
          })
    
    })
    
}