const logger = require('./logger')

const cacheStorage = {}

exports.debug = () => {
    logger.debug(cacheStorage)
}
exports.set = async (catalog, name, data) =>{
    if(catalog in cacheStorage){

    }
    else{
        cacheStorage[catalog] = {}
    }

    cacheStorage[catalog][name ] = data
}

exports.get = async (catalog, name) =>{
    if(catalog in cacheStorage){

    }
    else{
        return null
    }

    return cacheStorage[catalog][name ]
}