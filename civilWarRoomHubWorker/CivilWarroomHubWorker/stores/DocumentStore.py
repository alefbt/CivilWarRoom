from CivilWarroomHubWorker.stores.ContextStore import ContextStore
from CivilWarroomHubWorker.RPCHandler import InRpcMessage
from CivilWarroomHubWorker.models.basemodel import BaseModel
from CivilWarroomHubWorker.models.eventsource import EventSourceModel
from CivilWarroomHubWorker.stores.MongoStoreDriver import MongoStoreDriver
from datetime import datetime


class DocumentStore:
    def __init__(self, context: ContextStore) -> None:
        self.driver = MongoStoreDriver(context)
        self.context = context
        self.collections = {
            "EVENTSOURCE": "EventSource"
        }
    
    async def ensure_structure(self):
        pass

    async def ping(self):
        await self.driver.ping()
    
    async def find_one(self, collection_name, field_name, value):
        return await self.driver.findOne(collection_name,{field_name: value})

    async def update_one(self, collection_name, filter, update):
        return await self.driver.updateOne(collection_name,filter, update)
     
    def _enrich_doc(self, doc: dict) -> dict:
        ret = doc
        if ('_created_at' not in ret.keys()):
            ret['_created_at'] = datetime.now()
        ret['_updated_at'] = datetime.now()
        return ret

    async def save(self, collection_name, model: BaseModel):
        model.validate()

        doc = self._enrich_doc(model.get_model())
        return await self.driver.insert(collection_name, doc)

    async def store_eventsource(self, inmsg: InRpcMessage):
        model = EventSourceModel(self.context,  inmsg.to_event_source_object())
        return await self.save(self.collections["EVENTSOURCE"],model)
    
def getDocumentStoreFromContext(ctx:ContextStore) -> DocumentStore:
    return ctx.get(DocumentStore.__name__)