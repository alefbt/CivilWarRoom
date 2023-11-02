


from cwrhubworker.RPCHandler import InRpcMessage
from cwrhubworker.stores.ContextStore import ContextStore
from cwrhubworker.stores.MongoStoreDriver import MongoStoreDriver

class DocumentStore:
    def __init__(self, context: ContextStore) -> None:
        self.driver = MongoStoreDriver(context)
        self.context = context
        self.collections = {
            "EVENTSOURCE": "eventsource_archive"
        }
    
    async def ping(self):
        await self.driver.ping()
    
    async def store_eventsource(self, inmsg: InRpcMessage):
        return await self.driver.insert(
            self.collections["EVENTSOURCE"],
            inmsg.to_event_source_object()
        )


def getDocumentStoreFromContext(ctx:ContextStore) -> DocumentStore:
    return ctx.get(DocumentStore.__name__)