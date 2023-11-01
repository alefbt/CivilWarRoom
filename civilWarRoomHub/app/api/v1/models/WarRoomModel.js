const logger = require('../../../../utils/logger');
const dataStoreUtils = require('../../../../utils/dataStore')
exports.name = "WarRoom"

// exports.mongooseSchema = new mongoose.Schema({
//   warroomPuKfingerprint: { type: String, required: true, unique: true },
//   name: { type: String, required: true, unique: true },
//   publicKey: { type: String, required: true  },
//   privateKey: { type: String, required: true },
//   passcode: { type: String, required: true },
//   admins: [{ type: String }],
//   createdBy: { type: String },
//   isActive: {type: Boolean, default: false},
//   isPublic: {type: Boolean, default: true},
//   srcInventation: { type: String },
// }, { timestamps: true });

  
// function createWarRoom (appContext, name, userPuKFingerprint) {
//   return new Promise(async (resolve,reject)=>{
//             // Generate PW
//             const passcode = encUtils.generateRandomKey()
            
//             // Generate Keys
//             const keys = await encUtils.generateKeys(name,"ihaveno@mail.exists.co",passcode)
            
//             const WarRoom = appContext.get(dataStoreUtils.appContextName).mongoModels[exports.name]

//             const fp =  await encUtils.getPublicKeyFingerprint(keys['publicKey'])

//             const objToSave = new WarRoom({
//                 warroomPuKfingerprint: fp,
//                 name: name,
//                 publicKey: keys['publicKey'],
//                 privateKey: keys['privateKey'],
//                 passcode,
//                 createdBy: userPuKFingerprint,
//                 admins: [ userPuKFingerprint ],
//                 isActive: true,
//                 isPublic: true,
//                 srcInventation: "from-registration"
//             })

//             await objToSave.save()

//             resolve(objToSave)
//         })
// }

// function getWarRoom (appContext, warRoomFingerprint) {
//   return new Promise(async (resolve,reject)=>{
//       const WarRoom = appContext.get(dataStoreUtils.appContextName).mongoModels[exports.name]

//       resolve(await WarRoom.findOne({
//         warroomPuKfingerprint: warRoomFingerprint,
//         isActive: true
//       }))
//   })
// }


  exports.getActivePublicWarRooms = async (appContext) => {
    return new Promise(async (resolve,reject)=>{
      try{
          const mongoDBInstance = appContext.get(dataStoreUtils.appContextName).mongoDBInstance
          const colWarRooms = mongoDBInstance.collection(exports.name);
          
          var hub = await colWarRooms.findOne({
            isPublic: true,
            isActive: true
          },{
            projection: { 
              _id: 0, 
              warroomPuKfingerprint: 1, 
              name: 1 
            }
          })
        
          resolve(hub)
        }catch(ex){
          reject(ex)
        }
    })
  }
  
  
  exports.registerDatastoreCommands = (appContext, dataStoreInst) => {
      dataStoreInst[exports.name]={
        getActivePublicWarRooms: exports.getActivePublicWarRooms
      }
  }