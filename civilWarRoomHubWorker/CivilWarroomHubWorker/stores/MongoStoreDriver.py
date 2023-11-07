import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

from CivilWarroomHubWorker.stores.ContextStore import ContextStore

class MongoStoreDriver:
     def __init__(self, context: ContextStore) -> None:
         self._scoped_db = context.get("config")['MONGODB_DB']
         self.client = AsyncIOMotorClient(
              context.get("config")['MONGODB_URI'])  
         
         self.db = self.client[self._scoped_db]

     def base_doc(self):
        """
        docstring
        """
        return {
            "created_at": "ts",
        }
     
     async def ping(self):
         await self.client.admin.command('ping')

     async def insert(self, collection,  document):
        return await self.db[collection].insert_one(document)

     async def findOne(self, collection,  filter, *args):
        return await self.db[collection].find_one(filter, *args)