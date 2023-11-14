const fs = require('fs')
const ks = require('key-store');
const logger = require('./logger');

function createFileStore (filePath) {
  
  const saveKeys =  (data) => {
    logger.info(`Keystore save keys to ${filePath}`)
    return  fs.writeFileSync(filePath, JSON.stringify(data), 'utf8')
  }

  const readKeys =  () => {
    logger.debug(`Keystore read keys from ${filePath}`)
    if( fs.existsSync(filePath)) {
      return JSON.parse( fs.readFileSync(filePath, 'utf8'))
    }
    else
      return {}
  }
  
  return ks.createStore(saveKeys, readKeys())
}

exports.createFileStore = createFileStore

exports.appContextName = "keystore"

exports.load = function(storePath){
  return createFileStore(storePath)
}
