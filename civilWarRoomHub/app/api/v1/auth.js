const express = require('express')
const router = express.Router()
const logger = require('../../../utils/logger');
const apiUtils = require('../v1/utils')
const warroomhubIdentityTools = require('../../warroomhub-identity-tools')
const encTools = require('../../../utils/encryption') //' ../utils/encryption')
const securityTool = require('../../../utils/security')
const CACHE_AUTH_REQUSETS_NAMESPACE='hub-auth-requests'
const CACHE_AUTHED_SESSIONS='hub-authed-sessions'
//const UserSchemaModel = require('./models/UserSchema')
const dataStoreUtils = require('../../../utils/dataStore')
const UserModel = require('./models/UserModel')
const WarRoomModel = require('./models/WarRoomModel')

const rpcUserService = require("./services/RpcUserService")
const rpcWarroomService = require("./services/RpcWarroomService")


function authResponseProcess(appContext, req, resp){
    const srcInventation = "registration"
    /*
        should be message like:
        :EncryptedJson(HubPuK, {
            session random string, 
            selectedWarRoom}, signature);

     */

    // decrypt mesg
    warroomhubIdentityTools.getIdentity(appContext).then(async identity => {

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

    var usrFromDb = await UserModel.getActiveUser(appContext,userFP)
    
    if(!usrFromDb){

        if(!identity.allowRegisterNewUsers)  {
            // If allowed register new users
            return resp.status(401).send({
                success: false, 
                errorCode: "not-allowed-register-users",
                message:"New users not allowed to register"})
        }

        // register new user
        var hasError = false

        var userObjN = {
            displayName: await encTools.getPublicKeyName(authReqCachedObj.userPublicKey),
            isActive: true,
            
            publicKeyFingerprint:userFP,
            publicKeyType: "openpgp",
            publicKey: authReqCachedObj.userPublicKey,
            

            srcInventation: srcInventation,
            hubPublicKey: identity.armoredPublicKey,
            hubPublicKeyType: identity.publicKeyType
        }
        
        var _errM = ""

        await rpcUserService.register(appContext,userObjN)
            .then(resResp=>{
                usrFromDb=resResp
                hasError = false
            })
            .catch(e=>{
                _errM = e
                hasError = true
            })

        if(hasError)
            return resp.status(401).send({
                success: false, 
                errorCode: "error-registration-user",
                message:`Error: ${_errM}`})
    
    }

    // Verifiy selected room
    // If new room
    //      If Allowed register new room
    var warroomFromDb = null;
    var currentWarroom = null;

    if(!sessionResponseMessage.selectedWarRoom.id){

        if(!identity.allowCreateWarRoomsToRegisterdUsers)
            return resp.status(401).send({
            success: false, 
            errorCode: "not-allowed-create-warrooms",
            message:"Not allowed to register new WarRooms"})

        
        var passphrase =    encTools.generateRandomKey()
        const warroom_keys =  await encTools.generateKeys(sessionResponseMessage.selectedWarRoom.name, "non@dummy-domain.co",passphrase)

        const warroomdata = {
            "displayName": sessionResponseMessage.selectedWarRoom.name,
            "ownerFingerprint": userFP,
            "ownerFingerprintType":encTools.getEncTypeName(),
            "isActive": true,
            "isPublic": true,
            "publicKeyFingerprint": await encTools.getPublicKeyFingerprint(warroom_keys['publicKey']),
            "publicKey": warroom_keys['publicKey'],
            "publicKeyType": encTools.getEncTypeName(),               
            "privateKey": warroom_keys['privateKey'],
            "privateKeyType": encTools.getEncTypeName(),
            "privateKeyPass": passphrase
        }

        currentWarroom = await rpcWarroomService.register(appContext,warroomdata )
        warroomFromDb = currentWarroom['warroom']

    } else {
        warroomFromDb = await WarRoomModel.getActivePublicWarRoom(appContext, sessionResponseMessage.selectedWarRoom.id)
        // warroomFromDb = await dataStore.getWarRoom(appContext, sessionResponseMessage.selectedWarRoom.id)

        if(!warroomFromDb.isActive)
            return resp.status(404).send({
                success: false, 
                errorCode: "warrooms-not-available",
                message:`WarRoom id : ${sessionResponseMessage.selectedWarRoom.id} not found or not active`})
           
        if(!warroomFromDb.isPublic)
            throw new Error("TBD - need implement on exisiting policy")
        // build groups
        // build roles

        // Complie permissions

        //  If not user has permission to room
        //       throw 401

        // Check permissions
    }

    const jwtData = {
        issuer:identity.name,
        displayName: usrFromDb.displayName,

        userPuKFingerprint: usrFromDb.publicKeyFingerprint,
        warRoomFingerprint: warroomFromDb.publicKeyFingerprint,
        warRoomDisplayName: warroomFromDb.displayName,
        dataHubFingerprint: identity.fingerprint,
        
        roles: ['user'] //TODO : Set roles
    }

    const jwtToken =encTools.generateJWT(jwtData,jwtSecretPass)
    

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

    apiUtils.createPlainResponseObject(appContext,dataToSend).then( async data=> {
        resp.send(data)
        await rpcUserService.loginSuccess(appContext,{
            "jwt":jwtToken,
            "publicKeyFingerprint": usrFromDb.publicKeyFingerprint
        })
    })
 
    })

}


function authVerifyProcess(appContext, req, resp){

    // decrypt mesg
    warroomhubIdentityTools.getIdentity(appContext).then(async identity => {

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
    warroomhubIdentityTools.getIdentity(appContext).then(async identity => {

        let sessionKey = encTools.generateRandomKey()
       
        // All public
        // var publicWarRooms = await dataStore.getPublicWarRooms(appContext)

        const publicWarRooms = await require('./models/WarRoomModel').getActivePublicWarRooms(appContext)


        var availableWarRooms  = {}
        if(publicWarRooms)
            publicWarRooms.map(c=>{
                availableWarRooms[`${c.publicKeyFingerprint}`] = c.displayName
            })
        

        // not public and has ACL
        // TODO

        const messageToEncrypt = {
            sessionKey,
            hubPublicKey: identity.armoredPublicKey,
            availableWarRooms
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