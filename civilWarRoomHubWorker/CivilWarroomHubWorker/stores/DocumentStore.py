


import time
from CivilWarroomHubWorker.RPCHandler import InRpcMessage
from CivilWarroomHubWorker.models.eventsource import EventSourceModel
from CivilWarroomHubWorker.stores.ContextStore import ContextStore
from CivilWarroomHubWorker.stores.MongoStoreDriver import MongoStoreDriver

class DocumentStore:
    def __init__(self, context: ContextStore) -> None:
        self.driver = MongoStoreDriver(context)
        self.context = context
        self.collections = {
            "EVENTSOURCE": "EventSource_archive"
        }
    
    async def ensure_structure(self):
        pass

    async def ping(self):
        await self.driver.ping()
    
    async def store_eventsource(self, inmsg: InRpcMessage):
        model = EventSourceModel(inmsg.to_event_source_object())
        
        model.validate()

        return await self.driver.insert(
            self.collections["EVENTSOURCE"],
            model.get_model()
        )

    def generate_standard_docuement(doc):
        newdoc = {} if(not doc) else doc
        
        newdoc['created_at'] = time.time_ns()

        return newdoc


def getDocumentStoreFromContext(ctx:ContextStore) -> DocumentStore:
    return ctx.get(DocumentStore.__name__)