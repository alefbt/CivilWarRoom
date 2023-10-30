const express = require('express')
const router = express.Router()
const logger = require('../../../utils/logger');
const apiUtils = require('../v1/utils')
const warroomhuvIdentityTools = require('../../warroomhub-identity-tools')
const encTools = require('../../../utils/encryption') //' ../utils/encryption')
const securityTool = require('../../../utils/security')
const CACHE_AUTH_REQUSETS_NAMESPACE='hub-auth-requests'
const CACHE_AUTHED_SESSIONS='hub-authed-sessions'
//const UserSchemaModel = require('./models/UserSchema')
const dataStoreUtils = require('../../../utils/dataStore')


function authResponseProcess(appContext, req, resp){
    const srcInventation = "registration"
    /*
        should be message like:
        :EncryptedJson(HubPuK, {
            session random string, 
            selectedWarRoom}, signature);

     */

    // decrypt mesg
    warroomhuvIdentityTools.getIdentity(appContext).then(async identity => {

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
        return resp.status(401).send("Auth Request object not verified")

    const jwtSecretPass =  securityTool.getJWTSecretKey(appContext)


    //

    // Register User?
    const userFP = await encTools.getPublicKeyFingerprint(authReqCachedObj.userPublicKey)
    const dataStore = await dataStoreUtils.getDataStore(appContext)
    var usrFromDb = await dataStore.getUser(appContext,userFP)
    
    if(!usrFromDb)
        if(!identity.allowRegisterNewUsers)  {
            // If allowed register new users
            return resp.status(401).send({
                success: false, 
                errorCode: "not-allowed-register-users",
                message:"New users not allowed to register"})
        }
        else
        {
            // register new user
            usrFromDb = 
                await dataStore
                .createUser(appContext, {
                    userPuKfingerprint:userFP,
                    publicKey: authReqCachedObj.userPublicKey,
                    displayName: await encTools.getPublicKeyName(authReqCachedObj.userPublicKey),
                    isActive: true,
                    srcInventation: srcInventation
                })
        }


    // Verifiy selected room
    // If new room
    //      If Allowed register new room
    const warroomHubAclSchema = require('./models/WarRoomHubACLSchema')
    var warroomFromDb = null;

    if(!sessionResponseMessage.selectedWarRoom.id){

        if(!identity.allowCreateWarRoomsToRegisterdUsers)
            return resp.status(401).send({
            success: false, 
            errorCode: "not-allowed-create-warrooms",
            message:"Not allowed to register new WarRooms"})
    
        // Register 
        warroomFromDb = await dataStore.createWarRoom(
            appContext,
            sessionResponseMessage.selectedWarRoom.name,
            userFP
            )


        // Add permissions
        var aclFromDb = await dataStore.createAllowACL(appContext,
            `${warroomHubAclSchema.PREFIX.user}:${usrFromDb.userPuKfingerprint}`,
            `${warroomHubAclSchema.PREFIX.warroom}:${warroomFromDb.warroomPuKfingerprint}`,
            warroomHubAclSchema.PERMISSIONS.all,
            srcInventation,
            null,
        )

    } else {
        throw new Error("TBD - need implement on exisiting policy")
    }

    // Complie permissions

    //  If not user has permission to room
    //       throw 401
    



    // Check permissions

    // 
        //TODO: Add issues, and other metadata
    const jwtToken =encTools.generateJWT({
        issuer:identity.name,
        displayName: usrFromDb.displayName,

        userPuKFingerprint: usrFromDb.userPuKfingerprint,
        warRoomFingerprint: warroomFromDb.warroomPuKfingerprint,
        warRoomName: warroomFromDb.name,
        dataHubFingerprint: identity.fingerprint,
        roles: ['user']
    },jwtSecretPass)
    
    console.log(jwtToken)
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
    warroomhuvIdentityTools.getIdentity(appContext).then(async identity => {

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
    warroomhuvIdentityTools.getIdentity(appContext).then(async identity => {

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