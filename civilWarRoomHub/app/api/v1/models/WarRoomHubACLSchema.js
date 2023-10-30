const mongoose = require('mongoose');
const logger = require('../../../../utils/logger');
const dataStoreUtils = require('../../../../utils/dataStore')
const eventSourceSchema = require('./EventSourceSchema')


exports.name = "WarRoomHubACL"

exports.PERMISSION_TYPES = {
  ALLOW: 'allow',
  DENY: 'deny'
}

exports.PERMISSIONS = {
  all: "*"
}

exports.PREFIX = {
  user: "usr",
  warroom: "warroom"
}


exports.mongooseSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  resource: { type: String, required: true },
  permission: { type: String, required: true },
  type: { type: String, required: true },


  isActive: {type: Boolean, default: true},
  srcInventation: { type: String },
  srcEventSourceId:  { type: 'ObjectId', ref: eventSourceSchema.name },
  createdAt: { type: Date, default: Date.now },
  });

  
  

function createAllowACL (appContext, subject, resource, permission, srcInventation, srcEventSourceId, ) {
  return new Promise(async (resolve,reject)=>{
      const cACL = appContext.get(dataStoreUtils.appContextName).mongoModels[exports.name]

      const newACL = new cACL(
        {
          subject,
          resource,
          permission,
          type: exports.PERMISSION_TYPES.ALLOW
        }
      )

      if(srcInventation)
        newACL.srcInventation = srcInventation

      if(srcEventSourceId)
        newACL.srcEventSourceId = srcEventSourceId

      await newACL.save()

      resolve(newACL)
  })
}
  

  exports.registerDatastoreCommands = (appContext, dataStoreInst) => {
    dataStoreInst.createAllowACL = createAllowACL
  }

  exports.registerIndexes = (appContext, schema) => {
      schema.index({ subject: 1, resource: 1, permission: 1 }, { unique: true });
  }