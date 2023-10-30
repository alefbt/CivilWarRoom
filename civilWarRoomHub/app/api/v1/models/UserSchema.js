const mongoose = require('mongoose');
const logger = require('../../../../utils/logger');
const eventSourceSchema = require('./EventSourceSchema')
const dataStoreUtils = require('../../../../utils/dataStore')


exports.name = "User"

exports.mongooseSchema = new mongoose.Schema({
    userPuKfingerprint: { type: String, required: true, unique: true },
    publicKey: { type: String, required: true, unique: true },
    displayName: { type: String },    
    isActive: {type: Boolean, default: false},
    srcEventSourceId:  { type: 'ObjectId', ref: eventSourceSchema.name },
    srcInventation: { type: String },
    createdAt: { type: Date, default: Date.now },
    lastlogin: { type: Date, default: Date.now }


})

function getUser (appContext, userPuKfingerprint) {
  return new Promise(async (resolve,reject)=>{
      const User = appContext.get(dataStoreUtils.appContextName).mongoModels[exports.name]

      resolve(await User.findOne({
        userPuKfingerprint  
      }))
  })
}
function createUser(appContext, userObj) {
  return new Promise(async (resolve,reject)=>{
    const User = appContext.get(dataStoreUtils.appContextName).mongoModels[exports.name]
    const newUser = new User(userObj)
    resolve(await newUser.save())
})
}

exports.registerDatastoreCommands = (appContext, dataStoreInst) => {
  dataStoreInst.getUser = getUser
  dataStoreInst.createUser = createUser
}