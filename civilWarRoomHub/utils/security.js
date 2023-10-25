
const encTools = require('./encryption')

const SECRETSTORE_JWT_SECRET_KEY="jwtsecretkey"

var cached_jwt_passcode = ""

exports.getJWTSecretKey = (appContext) => {
    if( typeof process.env.JWT_SECRET !== 'undefined')
        return process.env.JWT_SECRET

    if(cached_jwt_passcode != "")
        cached_jwt_passcode

    const secretstore = appContext.get('keystore')

    if(
        secretstore.getKeyIDs().filter(i=>{
            return i == SECRETSTORE_JWT_SECRET_KEY
        }).length <= 0
    ){
        secretstore.saveKey(SECRETSTORE_JWT_SECRET_KEY,
        process.env.KEYSTORE_SECRET
        ,encTools.generateRandomKey())
    }

    return cached_jwt_passcode = (secretstore.getPrivateKeyData(
        SECRETSTORE_JWT_SECRET_KEY,
        process.env.KEYSTORE_SECRET))
}