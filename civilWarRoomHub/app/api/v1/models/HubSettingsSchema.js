const mongoose = require('mongoose');
const logger = require('../../../../utils/logger');
const dataStoreUtils = require('../../../../utils/dataStore')

exports.name = "HubSettings"

exports.mongooseSchema = new mongoose.Schema({
    hubPuKfingerprint: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    publicKey: { type: String, required: true, unique: true },

    allowCreateWarRoomsToRegisterdUsers: {type: Boolean, default: true},
    allowRegisterNewUsers: {type: Boolean, default: true},

    isActive: {type: Boolean, default: false},

}, { timestamps: true });


async function getOrCreateDataHubByIdentity(appContext, warroomhubIdentity ){

    return new Promise(async (resolve,reject)=>{
        
        const dataToSend = {
            hubPuKfingerprint:  warroomhubIdentity.fingerprint,
            name: warroomhubIdentity.name,
            publicKey: warroomhubIdentity.armoredPublicKey,
            isActive: true,
        }
        
        const HubSettings = appContext.get(dataStoreUtils.appContextName).mongoModels[exports.name]

        var hub = await HubSettings.findOne({
          hubPuKfingerprint:  dataToSend['hubPuKfingerprint']
        })

        if(!hub){
          try{
            hub =  new HubSettings(dataToSend)
            await hub.save()
          }catch(ex){
            return reject(ex)
          }
        }
        resolve(hub)        
    })
}

exports.registerDatastoreCommands = (appContext, dataStoreInst) => {
  dataStoreInst.getOrCreateDataHubByIdentity = getOrCreateDataHubByIdentity
}