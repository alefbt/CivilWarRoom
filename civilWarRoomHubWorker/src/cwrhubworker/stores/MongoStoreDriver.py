import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

from cwrhubworker.stores.ContextStore import ContextStore

class MongoStoreDriver:
     def __init__(self, context: ContextStore) -> None:
         self._scoped_db = context.get("config")['MONGODB_DB']
         self.client = AsyncIOMotorClient(
              context.get("config")['MONGODB_URI'])  
         
         self.db = self.client[self._scoped_db]


     async def ping(self):
         await self.client.admin.command('ping')

     async def insert(self, collection,  document):
        return await self.db[collection].insert_one(document)

