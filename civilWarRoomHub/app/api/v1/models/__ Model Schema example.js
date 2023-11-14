const mongoose = require('mongoose');
const logger = require('../../../../utils/logger');
const dataStoreUtils = require('../../../../utils/dataStore')


/**
 TODO: 
 1. create model - copy this file and rename it
 2. change exports.name = "< name >" to model name
 3. register model at utils/dataStore.js  in  exports.init 
    add addSchema(this schema)
 */

exports.name = "< name >"

exports.mongooseSchema = new mongoose.Schema({
  /*
    eventType: String,
    etc...
    */
  });

  
  /*

function getUser (appContext, userPuKfingerprint) {
  return new Promise(async (resolve,reject)=>{
      const User = appContext.get(dataStoreUtils.appContextName).mongoModels[exports.name]

      resolve(await User.findOne({
        userPuKfingerprint  
      }))
  })
}
  */

  exports.registerDatastoreCommands = (dataStoreInst, appContext) => {
    // dataStoreInst.getUser = getUser
  }


  exports.registerIndexes = (appContext, schema) => {
    //   unitSchema.index({ type: 1, parent: 1, name: 1 }, { unique: true });
  }