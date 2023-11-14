// const mongoose = require('mongoose');
const logger = require('../../../../utils/logger');
const dataStoreUtils = require('../../../../utils/dataStore')
const rpcServiceUser = require('../services/RpcUserService')

exports.name = "Users"

// exports.mongooseSchema = new mongoose.Schema({
//     userPuKfingerprint: { type: String, required: true, unique: true },
//     publicKey: { type: String, required: true, unique: true },
//     displayName: { type: String },    
//     isActive: {type: Boolean, default: false},
//     srcEventSourceId:  { type: 'ObjectId', ref: eventSourceSchema.name },
//     srcInventation: { type: String },
//     lastlogin: { type: Date, default: Date.now }


// }, { timestamps: true })

// function getUser (appContext, userPuKfingerprint) {
//   return new Promise(async (resolve,reject)=>{
//       const User = appContext.get(dataStoreUtils.appContextName).mongoModels[exports.name]

//       resolve(await User.findOne({
//         userPuKfingerprint  
//       }))
//   })
// }
// function createUser(appContext, userObj) {
//   return new Promise(async (resolve,reject)=>{
//     const User = appContext.get(dataStoreUtils.appContextName).mongoModels[exports.name]
//     const newUser = new User(userObj)
//     resolve(await newUser.save())
// })
// }

// exports.registerDatastoreCommands = (appContext, dataStoreInst) => {
//   dataStoreInst.getUser = getUser
//   dataStoreInst.createUser = createUser
// }


/*
{
        userObj:
                    userPuKfingerprint:userFP,
                    publicKey: authReqCachedObj.userPublicKey,
                    displayName: await encTools.getPublicKeyName(authReqCachedObj.userPublicKey),
                    isActive: true,
                    srcInventation: srcInventation
                }
*/
exports.createUser = (appContext, userObj) => {
  return new Promise(async (resolve,reject)=>{    
    return await rpcServiceUser.createUser(appContext,userObj)
        .then(resolve)
        .catch(reject)
      })
}


exports.getActiveUser = (appContext, userPublicKeyFingerprint) => {
  return new Promise(async (resolve,reject)=>{
    try{
        const mongoDBInstance = appContext.get(dataStoreUtils.appContextName).mongoDBInstance
        const colUsers = mongoDBInstance.collection(exports.name);
        var usr = await colUsers.findOne({
          isActive: true,
          publicKeyFingerprint:  userPublicKeyFingerprint
        })
        resolve(usr)
      }catch(ex){
        reject(ex)
      }
  })
}


exports.registerDatastoreCommands = (appContext, dataStoreInst) => {
    dataStoreInst[exports.name]={
      getActiveUser: exports.getActiveUser,
      createUser: exports.createUser
    }
}