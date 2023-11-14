
import logging
import pprint
from CivilWarroomHubWorker.Encryption import Encryption

from CivilWarroomHubWorker.RPCHandler import InRpcMessage, ResponseRpcMessage
from CivilWarroomHubWorker.models.warroomhub import WarRoomHubModel
from CivilWarroomHubWorker.services.BaseService import BaseService

log = logging.getLogger(__name__)

warroomhub_mongo_collection="WarroomHubs"

class WarRoomHubService (BaseService):
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

    async def _register(self, data: WarRoomHubModel):
        m = data.get_model()

        publicKeyFingerprint = str(m['publicKeyFingerprint']).upper()
        
        doc = await self.find_one(publicKeyFingerprint)
        
        if (doc):
            raise Exception(f"User fingerprint {publicKeyFingerprint} already exists")
        
        return await self.documentStore.save(warroomhub_mongo_collection, data)


    async def register(self, inmsg: InRpcMessage) -> ResponseRpcMessage:
        outmsg = {
            "success": False
        }        

        try:
            model = WarRoomHubModel(self.context, inmsg.get_content())
            outmsg["warroomhub"] = model.get_model()
            m = await self._register(model)
            outmsg["success"] = m.acknowledged

        except Exception as e:
            outmsg["success"] = False
            outmsg["message"] = str(e)

        return ResponseRpcMessage(inmsg, outmsg)
    

    # async def register(self, data: InRpcMessage) -> ResponseRpcMessage:
    #     m = data.get_model()
    #     print(m)
    #     publicKeyFingerprint = data.get_model()['publicKeyFingerprint']
        
    #     doc = await self.find_one(publicKeyFingerprint)
        
    #     if (doc):
    #         raise Exception(f"User fingerprint {publicKeyFingerprint} already exists")
        
    #     return await self.documentStore.save(warroomhub_mongo_collection, data)