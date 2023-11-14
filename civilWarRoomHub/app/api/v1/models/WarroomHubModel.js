const logger = require('../../../../utils/logger');
const dataStoreUtils = require('../../../../utils/dataStore');

exports.name = "WarroomHubs"


exports.getWarroomHubByFingerprint = async (appContext, fingerprint) => {
  return new Promise(async (resolve,reject)=>{
    try{
        const mongoDBInstance = appContext.get(dataStoreUtils.appContextName).mongoDBInstance
        const colHubSettings = mongoDBInstance.collection(exports.name);
        const fp = `${fingerprint}`.toUpperCase()
        
        var hub = await colHubSettings.findOne({
          publicKeyFingerprint: fp
        })

        resolve(hub)
      }catch(ex){
        reject(ex)
      }
  })
}


exports.getHubSettingsByIdentity = async (appContext, warroomhubIdentity) => {
  return new Promise(async (resolve,reject)=>{
    try{
        const mongoDBInstance = appContext.get(dataStoreUtils.appContextName).mongoDBInstance
        const colHubSettings = mongoDBInstance.collection(exports.name);
        const fp = `${warroomhubIdentity.fingerprint}`.toUpperCase()
        
        var hub = await colHubSettings.findOne({
          publicKeyFingerprint: fp
        })

        resolve(hub)
      }catch(ex){

        reject(ex)
      }
  })
}


exports.registerWarRoomHub = async (appContext, warroomhubIdentity) => {
  return new Promise(async (resolve,reject)=>{
    try{
        const mongoDBInstance = appContext.get(dataStoreUtils.appContextName).mongoDBInstance
        const colHubSettings = mongoDBInstance.collection(exports.name);
        const fp = `${warroomhubIdentity.fingerprint}`.toUpperCase()
        
        var hub = await colHubSettings.findOne({
          publicKeyFingerprint: fp
        })

        resolve(hub)
      }catch(ex){

        reject(ex)
      }
  })
}

exports.registerDatastoreCommands = (appContext, dataStoreInst) => {
    dataStoreInst[exports.name]={
      getHubSettingsByIdentity: exports.getHubSettingsByIdentity,
      getWarroomHubByFingerprint: exports.getWarroomHubByFingerprint
    }
}