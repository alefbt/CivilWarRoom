
const logger = require('../utils/logger')
const fs = require('fs')
const encTools = require('../utils/encryption')
const dataStoreUtils = require('../utils/dataStore')
const warroomhubIdentity = {
    initated: false
}

async function generateNewWarRoomHubCerticiate (appContext) {
    logger.info("Geneating new WarRoomHub Certificates")

    const keys = await encTools.generateKeys(
        process.env.WARROOMHUB_NAME,
        process.env.WARROOMHUB_EMAIL,
        process.env.WARROOMHUB_PRIVATE_KEY_SECRET
    )

    fs.writeFileSync(
        process.env.WARROOMHUB_PUBLIC_KEY_FILE, 
        keys['publicKey'], 'utf8')

    logger.info(`Saved new WarRoomHub Certificates`)
    
    appContext.get('keystore').saveKey('warroomhub', 
        process.env.KEYSTORE_SECRET, 
        { privateData: keys['privateKey'] })
    
    logger.warn(`Geneated new WarRoomHub Certificates`)

    return keys
}

async function getCertificates(appContext){
    logger.debug(`getCertificates()`)

    const newKeys = {}

    newKeys['publicKey'] = await fs.readFileSync(process.env.WARROOMHUB_PUBLIC_KEY_FILE, 'utf-8')
    newKeys['privateKey'] = await appContext.get('keystore')
        .getPrivateKeyData('warroomhub', process.env.KEYSTORE_SECRET)
        .privateData

   return newKeys
}

async function setWarroomHubIdentity(appContext, armoredPublicKey, armoredPrivateKey){
    const publicKey = await encTools.openpgpReadKey(armoredPublicKey)
    const privateKey = await encTools.openpgpDecryptPrivateKey(
        armoredPrivateKey,
        process.env.WARROOMHUB_PRIVATE_KEY_SECRET)

    warroomhubIdentity['publicKey'] = publicKey
    warroomhubIdentity['publicKeyType'] = "openpgp"
    warroomhubIdentity['armoredPublicKey'] = armoredPublicKey
    warroomhubIdentity['fingerprint'] =  await encTools.getPublicKeyFingerprint(publicKey)


    warroomhubIdentity['privateKey'] = privateKey
    warroomhubIdentity['armoredPrivateKey'] = armoredPrivateKey
    
    // DEFAULT VALUES
    warroomhubIdentity['name'] =  await encTools.getPublicKeyName(publicKey) //publicKey.users.map((u)=>{ return u.userID.name}).join(',')
    warroomhubIdentity['isActive'] = true
    warroomhubIdentity['allowCreateWarRoomsToRegisterdUsers'] = true
    warroomhubIdentity['allowRegisterNewUsers'] = true
    warroomhubIdentity['initated'] = true;

    // Overwrite if exist value
    var hubSettings = await require('./api/v1/models/WarroomHubModel')
        .getWarroomHubByFingerprint(
            appContext,warroomhubIdentity.fingerprint)

    if(!hubSettings){
        // Register
        const rpcWarroomHubService = require('./api/v1/services/RpcWarroomHubService')
        try{
            const hubSettingsObj = await rpcWarroomHubService.register(appContext,{
                "displayName" : warroomhubIdentity['name'],
                "isActive": warroomhubIdentity['isActive'],
                "publicKeyFingerprint": warroomhubIdentity['fingerprint'],
                "publicKeyType": warroomhubIdentity['publicKeyType'],
                "publicKey":warroomhubIdentity['armoredPublicKey'],
        
                "ownerFingerprint": "self-generated",
                "ownerFingerprintType": "text",
        
                "allowCreateWarRoomsToRegisterdUsers": warroomhubIdentity['allowCreateWarRoomsToRegisterdUsers'],
                "allowRegisterNewUsers": warroomhubIdentity['allowRegisterNewUsers'],
            })

            if(!hubSettingsObj['success'])
                throw new Error("Couldnot create WarroomHub : " + hubSettingsObj)

            hubSettings = hubSettingsObj['warroomhub']
        }catch(e){
            throw new Error("Couldnot create WarRoomHub in warroomhub-identity-tools.setWarroomHubIdentity() ERR: "+ e.message)
        }

    }

    if(hubSettings){ // over write values
        warroomhubIdentity['name'] = hubSettings.displayName
        warroomhubIdentity['isActive'] = hubSettings.isActive
        warroomhubIdentity['allowCreateWarRoomsToRegisterdUsers'] = hubSettings.allowCreateWarRoomsToRegisterdUsers
        warroomhubIdentity['allowRegisterNewUsers'] = hubSettings.allowRegisterNewUsers    
    }

    
    return warroomhubIdentity

}


const getIdentity = async (appContext) => new Promise((resolve,reject)=>{
    
    const filePath = process.env.WARROOMHUB_PUBLIC_KEY_FILE


    if (warroomhubIdentity['initated'] === true){
        logger.debug(`Cached identity`)
        return resolve(warroomhubIdentity)
    }
    else if( !fs.existsSync(filePath)) {
        generateNewWarRoomHubCerticiate(appContext).then(async (newKeysGenerated)=>{

            getCertificates(appContext).then(async (newKeys)=>{
                setWarroomHubIdentity(
                    appContext,
                    newKeys['publicKey'],
                    newKeys['privateKey'])
                    .then((owrhubIdentity)=>{
                        resolve(owrhubIdentity)
                    })
                    .catch( (e) => {
                        reject(e)
                    })
            })
        })
    }
    else {
        getCertificates(appContext).then(async (newKeys)=>{
            setWarroomHubIdentity(
                appContext,
                newKeys['publicKey'],
                newKeys['privateKey'])
                .then((owrhubIdentity)=>{
                    resolve(owrhubIdentity)
                })
                .catch( (e) => {
                    reject("Cannot setWarroomHubIdentity :" + e)
                })
        })
    }


})
exports.getIdentity = getIdentity

exports.verifySign = async (appContext, publicKey, armoredSignature, objToVerify) =>
 new Promise((resolve,reject)=>{
    getIdentity(appContext)
        .then(async wrId=> {
            try {
                resolve(await encTools.verifyObjectSigneture(
                    armoredSignature,
                    objToVerify,
                    wrId.publicKey
                    ))

            } catch (e) {
                reject( new Error('Signature could not be verified: ' + e.message))
            }
        })
        .catch(e=>reject(e))
})

exports.appContextName = 'warroomHubIdentity'

exports.sign = async (appContext, data) => new Promise((resolve,reject)=>{
    getIdentity(appContext)
        .then(async wrId=> {
            resolve( await encTools.signObject(data,wrId.privateKey))
        })
        .catch(e=>reject(e))
    
})
