
const logger = require('../utils/logger')
const fs = require('fs')
const utilsTools = require('../utils/tools')
const encTools = require('../utils/encryption')

const warroomIdentity = {
    initated: false
}

async function generateNewWarRoomCerticiate (appContext) {
    logger.info("Geneating new WarRoom Certificates")

    const keys = await encTools.generateKeys(
        process.env.WARROOM_NAME,
        process.env.WARROOM_EMAIL,
        process.env.WARROOMHUB_PRIVATE_KEY_SECRET
    )

    fs.writeFileSync(
        process.env.WARROOMHUB_PUBLIC_KEY_FILE, 
        keys['publicKey'], 'utf8')

    logger.info(`Saved new WarRoom Certificates`)
    
    appContext.get('keystore').saveKey('warroomhub', 
        process.env.KEYSTORE_SECRET, 
        { privateData: keys['privateKey'] })
    
    logger.warn(`Geneated new WarRoom Certificates`)

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

async function setWarroomIdentity(armoredPublicKey, armoredPrivateKey){
    const publicKey = await encTools.openpgpReadKey(armoredPublicKey)
    const privateKey = await encTools.openpgpDecryptPrivateKey(
        armoredPrivateKey,
        process.env.WARROOMHUB_PRIVATE_KEY_SECRET)

    warroomIdentity['publicKey'] = publicKey
    warroomIdentity['armoredPublicKey'] = armoredPublicKey
    warroomIdentity['fingerprint'] =  publicKey.getFingerprint()


    warroomIdentity['privateKey'] = privateKey
    warroomIdentity['armoredPrivateKey'] = armoredPrivateKey
    
    warroomIdentity['name'] = publicKey.users.map((u)=>{ return u.userID.name}).join(',')

    warroomIdentity['initated'] = true;

    return warroomIdentity
}


const getIdentity = async (appContext) => new Promise((resolve,reject)=>{
    
    const filePath = process.env.WARROOMHUB_PUBLIC_KEY_FILE


    if( !fs.existsSync(filePath)) {
        generateNewWarRoomCerticiate(appContext).then(async (newKeysGenerated)=>{

            getCertificates(appContext).then(async (newKeys)=>{
                setWarroomIdentity(
                    newKeys['publicKey'],
                    newKeys['privateKey'])
                    .then((owarroomIdentity)=>{
                        resolve(owarroomIdentity)
                    })
            })
        })
    }
    else if (warroomIdentity['initated'] === true){
        logger.debug(`Cached identity`)
        return resolve(warroomIdentity)
    }
    else {
        getCertificates(appContext).then(async (newKeys)=>{
            setWarroomIdentity(
                newKeys['publicKey'],
                newKeys['privateKey'])
                .then((owarroomIdentity)=>{
                    resolve(owarroomIdentity)
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


exports.sign = async (appContext, data) => new Promise((resolve,reject)=>{
    getIdentity(appContext)
        .then(async wrId=> {
            resolve( await encTools.signObject(data,wrId.privateKey))
        })
        .catch(e=>reject(e))
    
})
