
const  openpgp = require('openpgp')
const logger = require('../utils/logger')
const fs = require('fs')
const utilsTools = require('../utils/tools')
const crypto = require('crypto')

const warroomIdentity = {
    initated: false
}

async function generateNewWarRoomCerticiate (appContext) {
    logger.info("Geneating new WarRoom Certificates")

    const pgpKeys = await openpgp.generateKey({
        type: 'rsa',
        rsaBits: 4096,
        userIDs: [{ name: process.env.WARROOM_NAME, 
                    email: process.env.WARROOM_EMAIL }],
        passphrase: process.env.WARROOMHUB_PRIVATE_KEY_SECRET
    });


    fs.writeFileSync(
        process.env.WARROOMHUB_PUBLIC_KEY_FILE, 
        pgpKeys['publicKey'], 'utf8')

    logger.info(`Saved new WarRoom Certificates`)
    appContext.get('keystore').saveKey('warroomhub', 
        process.env.KEYSTORE_SECRET, 
        { privateData: pgpKeys['privateKey'] })
    
    logger.warn(`Geneated new WarRoom Certificates`)

    return pgpKeys
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

    const publicKey = await openpgp.readKey({ armoredKey: armoredPublicKey });
            
    const privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readKey({ armoredKey: armoredPrivateKey }),
        passphrase: process.env.WARROOMHUB_PRIVATE_KEY_SECRET,
    });

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

exports.verifySign = async (appContext, publicKey, armoredSignature, objToVerify) => new Promise((resolve,reject)=>{
    getIdentity(appContext)
        .then(async wrId=> {

            const signature = await openpgp.readSignature({armoredSignature});
            const cleartextMessage =  utilsTools.objToBase64(objToVerify)
            let hash = crypto.createHash('md5').update(cleartextMessage).digest("hex")
            logger.debug(`verifySign MD5 of data ${hash}`)
            const message = await openpgp.createMessage({ text: cleartextMessage });

            
            const verificationResult = await openpgp.verify({
                message,
                signature,
                verificationKeys: wrId.publicKey
            });
            
            const { verified, keyID } = verificationResult.signatures[0];

            try {
                await verified; // throws on invalid signature

                resolve({
                    verifiedData: objToVerify, 
                    signature, 
                    fingerprint: wrId.fingerprint,
                    signedKey: keyID.toHex()
                })

            } catch (e) {
                reject( new Error('Signature could not be verified: ' + e.message))
            }

        })
        .catch(e=>reject(e))
})


exports.sign = async (appContext, data) => new Promise((resolve,reject)=>{
    getIdentity(appContext)
        .then(async wrId=> {

            const cleartextMessage =  utilsTools.objToBase64(data)
            let hash = crypto.createHash('md5').update(cleartextMessage).digest("hex")
            logger.debug(`Sign MD5 of data ${hash}`)

            const unsignedMessage = await openpgp.createMessage({ text: cleartextMessage });
            
            const detachedSignature = await openpgp.sign({
                message: unsignedMessage, // Message object
                signingKeys: wrId.privateKey,
                detached: true
            });

            resolve({data: data, signeture:detachedSignature, fingerprint: wrId.fingerprint})
        })
        .catch(e=>reject(e))
    
})