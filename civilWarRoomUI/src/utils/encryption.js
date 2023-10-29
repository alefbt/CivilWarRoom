import * as openpgp from 'openpgp'
import * as utilsTools from './tools'
import jwt_decode from "jwt-decode";


export function openJWT (jwtToken) {
    return {
        headers: jwt_decode(jwtToken, { header: true }),
        data: jwt_decode(jwtToken)
    }
}

export const generateKeys = async (name, email, passphrase) =>{
    return await openpgp.generateKey({
        type: 'rsa',
        rsaBits: 4096,
        userIDs: [{ name, email }], 
        passphrase
    });
}


export const readKey = async (armoredKey) => {
    return await openpgp.readKey({ armoredKey })
}

export async function openpgpDecryptPrivateKey (armoredKey, passphrase)  {
    return await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey }),
        passphrase
    })
}

export async function getPublicKeyFromArmoredPrivateKey(armoredPrivateKey, passphrase){
    console.log("getPublicKeyFromArmoredPrivateKey")
    var privateKey =  await openpgpDecryptPrivateKey(armoredPrivateKey, passphrase)
    return await privateKey.toPublic().armor()
    
}

// export const openpgpDecryptPrivateKey = openpgpDecryptPrivateKey

export const decryptObject = async (encryptedObject, armoredPrivateKey, passphrase) => {

    const message = await openpgp.readMessage({
        armoredMessage: encryptedObject // parse armored message
    })

    const key = await openpgpDecryptPrivateKey(armoredPrivateKey,passphrase)

    const { data: decrypted } = await openpgp.decrypt({
        message,
        decryptionKeys: key
    });

    return utilsTools.base64ToObj( decrypted )
}


export const encryptObject = async (objectToEnc, 
    encryptionPublicKey,
    signingPrivateKey, 
    passphrase) => {



    const message = await openpgp.createMessage({
        text: utilsTools.objToBase64( objectToEnc )
    })

    var encryptionKey = null

    switch(typeof encryptionPublicKey){
        case 'string':
            encryptionKey = await readKey(encryptionPublicKey)
            break
        default:
            encryptionKey = encryptionPublicKey;
    }


    var signingKey = null

    switch(typeof signingPrivateKey){
        case 'string':
            signingKey = await openpgp.decryptKey({
                privateKey: await openpgp.readKey({ armoredKey: signingPrivateKey }),
                passphrase
            })
            break
        default:
            signingKey = encryptionPublicKey;
    }

    const encrypted = await openpgp.encrypt({
        message, 
        encryptionKeys: encryptionKey,
        signingKeys: signingKey
    });


    return encrypted
}