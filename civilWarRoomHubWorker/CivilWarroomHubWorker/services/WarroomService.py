
import logging
from uuid import uuid4
from CivilWarroomHubWorker.Encryption import Encryption

from CivilWarroomHubWorker.RPCHandler import InRpcMessage, ResponseRpcMessage
from CivilWarroomHubWorker.models.warroom import WarRoomModel
from CivilWarroomHubWorker.services.BaseService import BaseService

log = logging.getLogger(__name__)

warroomhub_mongo_collection="WarRooms"

class WarRoomService (BaseService):
    async def add_funcs(self,rpc):
        await self._add_func(rpc,self.register)

    async def __example(self, inmsg: InRpcMessage) -> ResponseRpcMessage:
        outmsg = {
            "success": False
        }        

        try:
            #content = inmsg.get_content()
            outmsg["success"] = True

        except Exception as e:
            outmsg["success"] = False
            outmsg["message"] = str(e)

        return ResponseRpcMessage(inmsg, outmsg)

    async def find_one(self, publicKeyFingerprint):
        return await self.documentStore.find_one(warroomhub_mongo_collection,"publicKeyFingerprint",publicKeyFingerprint)

    async def generate(self, displayName, ownerFingerprint, ownerFingerprintType) -> WarRoomModel:
        
        passs = str(uuid4())

        out = Encryption.generate_keys(f"Warroom: ${displayName}",passs)

        data = {
            "displayName": displayName,

            "publicKeyFingerprint": out['fingerprint'],
            "publicKey": out['publicKey'],
            "publicKeyType": Encryption.get_type_name(),

            "ownerFingerprint": ownerFingerprint,
            "ownerFingerprintType": ownerFingerprintType,

            "privateKey": out['privateKey'],
            "privateKeyType": Encryption.get_type_name(),
            "privateKeyPass": passs
        }

        return WarRoomModel(self.context, data)


    async def register(self, inmsg: InRpcMessage) -> ResponseRpcMessage:
        outmsg = {
            "success": False
        }        

        try:
            model = WarRoomModel(self.context, inmsg.get_content())
            outmsg["warroom"] = model.get_model()
            m = await self._register(model)
            outmsg["success"] = m.acknowledged

        except Exception as e:
            outmsg["success"] = False
            outmsg["message"] = str(e)

        return ResponseRpcMessage(inmsg, outmsg)
           
    
    async def _register(self, data: WarRoomModel):
        publicKeyFingerprint = data.get_model()['publicKeyFingerprint']
        
        doc = await self.find_one(publicKeyFingerprint)
        
        if (doc):
            raise Exception(f"WarRoom fingerprint {publicKeyFingerprint} already exists")
        
        return await self.documentStore.save(warroomhub_mongo_collection, data)

