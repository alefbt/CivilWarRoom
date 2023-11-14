from datetime import datetime
import logging

from CivilWarroomHubWorker.Encryption import Encryption
from CivilWarroomHubWorker.RPCHandler import InRpcMessage, ResponseRpcMessage
from CivilWarroomHubWorker.models.user import UserModel
from CivilWarroomHubWorker.services.BaseService import BaseService
from CivilWarroomHubWorker.services.WarRoomHubService import WarRoomHubService

log = logging.getLogger(__name__)

user_mongo_collection="Users"

class UserService (BaseService):
    async def add_funcs(self,rpc):
        await self._add_func(rpc,self.register)
        await self._add_func(rpc,self.loginSuccess)
            

    async def _loginSuccess(self, publicKeyFingerprint):

        publicKeyFingerprint = str(publicKeyFingerprint).upper()        

        return await self.documentStore.update_one(user_mongo_collection,
                                                   {"publicKeyFingerprint":publicKeyFingerprint},
                                                   {"$set": {"lastaccess_at": datetime.now()}}
                                                   )

    
    async def loginSuccess(self, inmsg: InRpcMessage) -> ResponseRpcMessage:
        outmsg = {
            "success": False
        }        

        try:

            c = inmsg.get_content()
            m = await self._loginSuccess(c['publicKeyFingerprint'])
            outmsg["success"] = m.acknowledged

        except Exception as e:
            outmsg["success"] = False
            outmsg["message"] = str(e)

        return ResponseRpcMessage(inmsg, outmsg)
    
            
    async def register(self, inmsg: InRpcMessage) -> ResponseRpcMessage:
        outmsg = {"success": False}

        try:
            content = inmsg.get_content()

            # Check the user fingerprint and public key are same
            usr_PuKFP = Encryption.get_fingerprint(content['publicKey'])
            if(content["publicKeyFingerprint"].upper() != usr_PuKFP):
                raise Exception("Invalid user fingerprint")
            
            userFromDB = await self.find_one(usr_PuKFP)
            if(userFromDB):
                raise Exception("User fingerprint alerady exists")


            hubPublicKeyFingerprint = Encryption.get_fingerprint(content['hubPublicKey'])
            warroomHub = await WarRoomHubService(self.context).find_one(hubPublicKeyFingerprint)
            
            if(not warroomHub):
                raise Exception("WarroomHub not exists")

        
            if ( 'isActive' in warroomHub and not warroomHub['isActive'] ):
                raise Exception("The Hub unactive")

            if ( 'allowCreateWarRoomsToRegisterdUsers' in warroomHub and  not warroomHub['allowCreateWarRoomsToRegisterdUsers'] ):
                raise Exception("The Hub not allowCreateWarRoomsToRegisterdUsers")

            if ( 'allowRegisterNewUsers' in warroomHub and  not warroomHub['allowRegisterNewUsers'] ):
                raise Exception("The Hub not allowRegisterNewUsers")            
            

            userData = {
                "displayName" : Encryption.get_name(content['publicKey']),
                "isActive": True,
                                        
                "publicKeyFingerprint": Encryption.get_fingerprint(content['publicKey']),
                "publicKeyType": Encryption.get_type_name(),
                "publicKey":content['publicKey'],
                                
                "srcInventation": content['srcInventation'],
                                            
                "hubPublicKeyFingerprint": str(warroomHub['publicKeyFingerprint']).upper(),
                "hubPublicKeyType": warroomHub['publicKeyType'],
            }
            userDataModel = UserModel(self.context, userData)
            userDataModelObj = await self.documentStore.save(user_mongo_collection, userDataModel)

            outmsg["success"] = userDataModelObj.acknowledged
            outmsg["user"] = userData


        except Exception as e:
            outmsg["success"] = False
            outmsg["message"] = str(e)

        return ResponseRpcMessage(inmsg, outmsg)


    async def find_one(self, publicKeyFingerprint):
        return await self.documentStore.find_one(user_mongo_collection,"publicKeyFingerprint",publicKeyFingerprint)
