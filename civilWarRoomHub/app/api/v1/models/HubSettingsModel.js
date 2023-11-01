const logger = require('../../../../utils/logger');
const dataStoreUtils = require('../../../../utils/dataStore');

exports.name = "HubSettings"

exports.getHubSettingsByIdentity = async (appContext, warroomhubIdentity) => {
  return new Promise(async (resolve,reject)=>{
    try{
        const mongoDBInstance = appContext.get(dataStoreUtils.appContextName).mongoDBInstance
        const colHubSettings = mongoDBInstance.collection(exports.name);

        var hub = await colHubSettings.findOne({
          hubPuKfingerprint:  warroomhubIdentity.fingerprint
        })
      
        resolve(hub)
      }catch(ex){
        reject(ex)
      }
  })
}


exports.registerDatastoreCommands = (appContext, dataStoreInst) => {
    dataStoreInst[exports.name]={
      getHubSettingsByIdentity: exports.getHubSettingsByIdentity
    }
}