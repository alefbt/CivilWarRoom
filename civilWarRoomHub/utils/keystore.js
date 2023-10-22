const fs = require('fs')
const util = require('util')
const ks = require('key-store');
const logger = require('./logger');
const { log } = require('console');


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

exports.load = function(storePath){
  return createFileStore(storePath)
}

/*

const store = createStore(saveFile, initialData)

await store.saveKey('test-key', 'arbitrary password', { privateKey: 'super secret private key' })

const { privateKey } = store.getPrivateKeyData('test-key', 'arbitrary password')

console.log(`Stored private key: ${privateKey}`)
console.log(`All stored keys' IDs: ${store.getKeyIDs().join(', ')}`)
*/