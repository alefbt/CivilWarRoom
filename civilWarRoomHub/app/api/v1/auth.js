const express = require('express')
const router = express.Router()
const logger = require('../../../utils/logger');
const apiUtils = require('../v1/utils')
const warroomIdentityTools = require('../../war-room-identity-tools')
const encTools = require('../../../utils/encryption') //' ../utils/encryption')
const securityTool = require('../../../utils/security')
const CACHE_AUTH_REQUSETS_NAMESPACE='hub-auth-requests'
const CACHE_AUTHED_SESSIONS='hub-authed-sessions'

function authResponseProcess(appContext, req, resp){

    /*
        should be message like:
        :EncryptedJson(HubPuK, {
            session random string, 
            selectedWarRoom}, signature);

     */

    // decrypt mesg
    warroomIdentityTools.getIdentity(appContext).then(async identity => {

    const verificationResponseMessage = req.body.verificationResponseMessage

    // Decrypt msg
    const sessionResponseMessage = await encTools.decryptObject(verificationResponseMessage,identity.privateKey)
    
    const authReqCachedObj = await appContext.get('cache').get(CACHE_AUTH_REQUSETS_NAMESPACE,
        sessionResponseMessage.sessionKey)
    
    if(!authReqCachedObj)
        {
            resp.status(401)
            throw new Error("Auth Request object not exists")
        }


        // verify signeture
    const messageVerification = await encTools.decryptAndVerifyMessage(
        verificationResponseMessage,
        identity.privateKey,
        authReqCachedObj.userPublicKey)

    if(!messageVerification.isVerified)
        return resp.status(400).send("ERROR")

    const jwtSecretPass =  securityTool.getJWTSecretKey(appContext)

        //TODO: Add issues, and other metadata
    const jwtToken =encTools.generateJWT({
        issue:"test",
        displayName: "GENERIC DISPLAY NAME",
        warRoom: {id:'gggggggg-ggggg-yyyy',name:'WarRoom generic name'},
        roles: ['user']
    },jwtSecretPass)
    
    const messageToEncrypt = {
        sessionKey: sessionResponseMessage.sessionKey,
        jwt: jwtToken,
        validation: {
            type: 'hmac',
            alog: 'HMAC_SHA256',
            passcode: `ssk-${encTools.generateRandomKey()}`
        }
    }

    const cacheMessage = {
        validation: messageToEncrypt.validation
    }

    appContext.get('cache').set(CACHE_AUTHED_SESSIONS,
        sessionResponseMessage.sessionKey, cacheMessage)
    

    const encMessage = await encTools.encryptObject(messageToEncrypt, authReqCachedObj.userPublicKey)

    const dataToSend  = {
        sessionMessage: encMessage
    }

    apiUtils.createPlainResponseObject(appContext,dataToSend).then( data=> {
        resp.send(data)
    })
    
    // resp.send({status:"ok"})
    // verify sign from cache
    })

}


function authVerifyProcess(appContext, req, resp){

    // decrypt mesg
    warroomIdentityTools.getIdentity(appContext).then(async identity => {

    const verificationMessage = req.body.verificationMessage

    // Decrypt msg
    const sessionMessage = await encTools.decryptObject(verificationMessage,identity.privateKey)


    const cachedObj = await appContext.get('cache').get(CACHE_AUTH_REQUSETS_NAMESPACE,
        sessionMessage.sessionKey)
    
    // verify signeture
    const respo = await encTools.decryptAndVerifyMessage(
        verificationMessage,
        identity.privateKey,
        cachedObj.userPublicKey)


        resp.send({status:"ok"})
    // verify sign from cache
    })

}

function authRequestProcess(appContext, req, resp){
    warroomIdentityTools.getIdentity(appContext).then(async identity => {

        let sessionKey = encTools.generateRandomKey()

        const messageToEncrypt = {
            sessionKey,
            hubPublicKey: identity.armoredPublicKey,
            availableWarRooms: {} //TBD - add avalibole warrooms 'id':'name'
        }

        const toCache = {
            userPublicKey: req.body.publicKey
        }
        const sessionMessage = await encTools.encryptObject(messageToEncrypt, toCache.userPublicKey)

        const dataToSend  = {
            sessionMessage
        }

        appContext.get('cache').set(CACHE_AUTH_REQUSETS_NAMESPACE
            ,sessionKey, toCache)

        apiUtils.createPlainResponseObject(appContext,dataToSend).then( data=> {
            resp.send(data)
        })

    
        // appContext.get('cache').debug()
        
    })
}

module.exports.attachRouter = function(appContext, expressRouter) {
    router.post('/', (req,resp)=>{
       
 
        
        switch (req.body.type){
            case 'auth-request':
                return authRequestProcess(appContext,req,resp)

            case 'auth-verify':
                return authVerifyProcess(appContext,req,resp)

            case 'auth-response':
                return authResponseProcess(appContext,req,resp)

            default:
                resp.status(400).send('Bad Request: unknown type')
                return;
        }

       

    })

    expressRouter.use('/auth',router)
}