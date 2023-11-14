const crypto = require('crypto')
const  openpgp = require('openpgp')
const logger = require('./logger')
const utilsTools = require('./tools')
const uuid4 = require('uuid4')
const jwt = require('jsonwebtoken');

exports.generateJWT = (tokenDataObj, secretToken) => {
    return jwt.sign(tokenDataObj, secretToken, { expiresIn: '1800s' });
}
exports.verifyJWT = (jwtToken, secretToken) => {
    return jwt.verify(jwtToken,secretToken)
}

exports.readJWT = (plainJWT) => {
    const b = plainJWT.split(".")
    return {
        "headers": utilsTools.base64ToObj(b[0]),
        "data": utilsTools.base64ToObj(b[1])
    }
}

exports.generateRandomKey = () =>{
    return exports.sha1sum(`t-SALT-${uuid4()}`)
}

exports.sha1sum = (cleartextMessage) => {
    return crypto.createHash('sha1').update(cleartextMessage).digest("hex")
}

exports.md5sum = (cleartextMessage) => {
    return crypto.createHash('md5').update(cleartextMessage).digest("hex")
}

exports.generateKeys = async ( name, email, passphrase) => {
    /*
        Should return [publicKey,privateKey]
    */
    return await openpgp.generateKey({
        type: 'rsa',
        rsaBits: 4096,
        userIDs: [{ name, email }],
        passphrase: passphrase
    });
}
exports.getEncTypeName = () => {
    return "openpgp"
}
exports.getOpenpgpReadKeyByType = async (openpgpKey) => {
    var pkey = null

    switch(typeof openpgpKey){
        case 'string':
            pkey = await exports.openpgpReadKey(openpgpKey)
            break;
        default:
            pkey = openpgpKey
    }
    return pkey
}

exports.getPublicKeyFingerprint = async (openpgpPublicKey) => {
    var pkey = await exports.getOpenpgpReadKeyByType(openpgpPublicKey)
    return pkey.getFingerprint().toUpperCase()
}

exports.getPublicKeyName = async (openpgpPublicKey) => {
    var pkey = await exports.getOpenpgpReadKeyByType(openpgpPublicKey)
    return pkey.users.map((u)=>{ return u.userID.name}).join(',')
}

exports.encryptObject = async (data, openpgpPublicKey, openpgpSigningKey) => {
    const cleartextMessage =  utilsTools.objToBase64(data)
    const unsignedMessage = await openpgp.createMessage({ text: cleartextMessage });
    
    var encryptionKey = await exports.getOpenpgpReadKeyByType(openpgpPublicKey)

    const encOpts = {
        message: unsignedMessage,
        encryptionKeys: encryptionKey
    }
    
    if(openpgpSigningKey)
        encOpts['signingKeys'] = openpgpSigningKey

    return await openpgp.encrypt(encOpts)
}

exports.decryptAndVerifyMessage = async (encryptedObject, openpgpPrivateKey, verificationKey) => {

    const message = await openpgp.readMessage({
        armoredMessage: encryptedObject // parse armored message
    })

    var verificationKeys = await exports.getOpenpgpReadKeyByType(verificationKey)


/*
    switch(typeof verificationKey){
        case 'undefined':
            throw new Error("verificationKey is undefined in validation process")
        case 'string':
            verificationKeys = await exports.openpgpReadKey(verificationKey)
            break;
        default:
            verificationKeys = verificationKey
    }
*/

    const decryptOpts = {
        message,
        decryptionKeys: openpgpPrivateKey,
        expectSigned: true,
        verificationKeys
    }

    const decrypteionData = await openpgp.decrypt(decryptOpts);

    return {
        isVerified: await decrypteionData.signatures[0].verified,
        message: decrypteionData.data
    }
}

exports.decryptObject = async (encryptedObject, openpgpPrivateKey) => {

    const message = await openpgp.readMessage({
        armoredMessage: encryptedObject // parse armored message
    })

    const decryptOpts = {
        message,
        decryptionKeys: openpgpPrivateKey
    }

    const decrypteionData = await openpgp.decrypt(decryptOpts);

    return utilsTools.base64ToObj( decrypteionData.data )
}
exports.signObject = async (objToSign, openpgpSigningKeys) => {

    const cleartextMessage =  utilsTools.objToBase64(objToSign)

    if( logger.isDebugEnabled ){
        let hash = exports.md5sum(cleartextMessage)
        logger.debug(`Sign MD5 of data ${hash}`)
    }

    const unsignedMessage = await openpgp.createMessage({ text: cleartextMessage });
            
    const detachedSignature = await openpgp.sign({
        message: unsignedMessage, // Message object
        signingKeys: openpgpSigningKeys,
        detached: true
    });

    return {data: objToSign, 
        signeture: detachedSignature, 
        fingerprint: openpgpSigningKeys.getFingerprint()}

}

exports.verifyObjectSigneture = async (armoredSignature,objToVerify, verificationKeys) => {
    const signature = await exports.openpgpReadSigneture(armoredSignature)
    const cleartextMessage =  utilsTools.objToBase64(objToVerify)

    if(logger.isDebugEnabled) {
        let hash = crypto.createHash('md5').update(cleartextMessage).digest("hex")
        logger.debug(`verifySign MD5 of data ${hash}`)
    }

    const message = await openpgp.createMessage({ text: cleartextMessage });

    const verificationResult = await openpgp.verify({
        message,
        signature,
        verificationKeys
    });
    
    const { verified, keyID } = verificationResult.signatures[0];

    await verified; // throws on invalid signature

    return {
        verifiedData: objToVerify, 
        signature, 
        fingerprint: wrId.fingerprint,
        signedKey: keyID.toHex()
    }

}

exports.openpgpReadKey = async (armoredKey) => {
    return await openpgp.readKey({ armoredKey: armoredKey });
}

exports.openpgpDecryptPrivateKey = async (armoredPrivateKey, passphrase) => {
    return await openpgp.decryptKey({
        privateKey: await openpgp.readKey({ armoredKey: armoredPrivateKey }),
        passphrase: passphrase,
    });
}

exports.openpgpReadSigneture = async (armoredSignature) =>{
    return await openpgp.readSignature({armoredSignature})
}

