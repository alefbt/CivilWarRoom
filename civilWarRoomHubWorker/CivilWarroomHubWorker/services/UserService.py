
import logging

from CivilWarroomHubWorker.RPCHandler import InRpcMessage, ResponseRpcMessage
from CivilWarroomHubWorker.services.BaseService import BaseService
from CivilWarroomHubWorker.stores.DocumentStore import DocumentStore, getDocumentStoreFromContext
import bson

log = logging.getLogger(__name__)

mongo_collection="Users"

class UserService (BaseService):
    async def add_funcs(self,rpc):
        await self._add_func(rpc,self.register)

    async def register(self, inmsg: InRpcMessage) -> ResponseRpcMessage:
        outmsg = {
            "success": False
        }        

        try:
            c = inmsg.get_content()

            drv = getDocumentStoreFromContext(self.context).driver
            
            usr = await drv.findOne(mongo_collection, {
                "userPuKfingerprint": c["userPuKfingerprint"]
            })

            if(usr):
                raise Exception("User exists. cannot register user")
            
            if(not usr):
                nc = DocumentStore.generate_standard_docuement(c)
                nc['sourceUniqueMessageId'] = inmsg.unique_msg_id
                usr = await drv.insert(mongo_collection,nc)

                if(not usr):
                    raise Exception("Error. Could not save user")

            outmsg["success"] = True
            outmsg["user"] = bson.decode(usr)

        except Exception as e:
            outmsg["success"] = False
            outmsg["message"] = str(e)

        

        return ResponseRpcMessage(inmsg, outmsg)

        