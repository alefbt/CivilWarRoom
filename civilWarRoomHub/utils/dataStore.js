const logger = require('./logger');
const  redis = require('redis');
const encryptionUtils = require('./encryption')
const { MongoClient } = require("mongodb");
const warroomhubIdentityTools = require('../app/warroomhub-identity-tools')

// const eventSourceSchema = require('../app/api/v1/models/EventSourceSchema')
// const hubSettingsSchema = require('../app/api/v1/models/HubSettingsSchema')

exports.appContextName = "dataStore"



const dataStore = {
    initiated: false,
    redisInstance: null,
    mongooseInstance: null,
    cmd: {}
}

exports.getDataStore = async (appContext) => {
    if(dataStore.initiated)
        return dataStore
    else{
        const dstore = await appContext.get(exports.appContextName)
        
        if(dstore && dstore.initiated)
            exports.dataStore = dataStore = dstore
        else
            await exports.init(appContext)
    }

    return dataStore
}


function init_commands(dataStoreInst, appContext){

    dataStoreInst.createEvent = (eventType, sourceJWT, data) =>{ 

        // 
        /*

        Should have data:
        source:                 field:
        input:eventType v        eventType
        hubService  v            hubPuKFingerprint

        sourceJWT   v            warRoomPuKFingerprint
        sourceJWT   v            userPuKFingerprint
        sourceJWT   v            sourceJWT
        generated   v            correlationId

        input:data  v            data
         */
        return new Promise((resolve,reject)=>{

            const dataToSend ={
                eventType
            }

            appContext.get(warroomhubIdentityTools.appContextName).then(async (warroomhubIdentity)=>{
                
                dataToSend['hubPuKFingerprint'] = warroomhubIdentity.fingerprint
                dataToSend['sourceJWT'] = sourceJWT
                
                const jwtData =  encryptionUtils.readJWT(sourceJWT)

                dataToSend['userPuKFingerprint'] = jwtData.data.userPuKFingerprint


                // optional
                if(jwtData.data.warRoomFingerprint)
                dataToSend['warRoomPuKFingerprint'] = 
                        jwtData.data.warRoomFingerprint 
        

                dataToSend['data'] = data
                dataToSend['correlationId'] = `corr:${encryptionUtils.generateRandomKey()}`


                const eventSourceItem = new 
                dataStoreInst.mongoModels[eventSourceSchema.name](dataToSend)

                await eventSourceItem.save()
            })
        })
    }

    dataStoreInst.createRoom = (sourceJWT) => {
        return new Promise((resolve,reject)=>{
            dataStoreInst.createEvent(
                eventSourceSchema.eventTypes.CREATE_WARROOM_REQUEST,
                sourceJWT,
            )
        })
    }



}

exports.init = async (appContext) => {
    logger.debug("initing dataStore")
    const datastoreUri = appContext.get("envvar").DATASTORE
    logger.debug("initing mongo instance...")

    dataStore.mongoInstance = new MongoClient(datastoreUri)

    logger.debug("done initing mongo instance")
    dataStore.mongoDBInstance = dataStore.mongoInstance.db(appContext.get("envvar").DATASTORE_DB)

    // init models


     const addSchema = (_schema) => {
         if(_schema.registerDatastoreCommands)
             _schema.registerDatastoreCommands(appContext, dataStore)
    }

    /*
    ///
    /// ADD SCHEMAS
    ///
    */

    
    addSchema(require('../app/api/v1/models/HubSettingsModel'))
    addSchema(require('../app/api/v1/models/WarRoomModel'))
    addSchema(require('../app/api/v1/models/UserModel'))


    // addSchema(eventSourceSchema)
    // addSchema(hubSettingsSchema)
    // addSchema(require('../app/api/v1/models/UserSchema'))
    // addSchema(require('../app/api/v1/models/WarRoomSchema'))
    // addSchema(require('../app/api/v1/models/WarRoomHubACLSchema'))

    //await init_commands(dataStore, appContext)


    logger.debug("initing redis instance...")
    const cacheDatastoreUri = appContext.get("envvar").FASTDATASTORE
    dataStore.redisInstance =  await redis.createClient({
        url: cacheDatastoreUri
    })
        .on('error', err => 
        {
            logger.error("Cannot load redisInsance")
            logger.error(err)
            throw err
        })
        .connect();
    logger.debug("done initing redis instance...")

    dataStore.initiated = true

    return dataStore

}

exports.dataStore = dataStore

