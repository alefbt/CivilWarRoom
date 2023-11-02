import asyncio
import random
from cwrhubworker.RPCHandler import RPCHandler
#from cwrhubworker.MultiCoreWrapper import MultiCoreWrapper
from dotenv import dotenv_values
import logging
import logging.config
from cwrhubworker.services.ArchiveService import ArchiveService

from cwrhubworker.services.FibService import FibService
from cwrhubworker.stores.ContextStore import ContextStore
from cwrhubworker.stores.DocumentStore import DocumentStore

logging.getLogger("aio_pika.connection").setLevel(logging.WARNING)
logging.getLogger("aio_pika.queue").setLevel(logging.WARNING)
logging.getLogger("aiormq.connection").setLevel(logging.WARNING)
logging.getLogger("aio_pika.channel").setLevel(logging.WARNING)
logging.getLogger("aio_pika.exchange").setLevel(logging.WARNING)

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s  - %(levelname)s - %(message)s')

log = logging.getLogger(__name__)



# async def fib(n: int) -> int:
#     if n == 0:
#         return 0
#     elif n == 1:
#         return 1
#     else:
#         return await fib(n - 1) + await fib(n - 2)
    

async def main():
    log.info("Starting worker")

    context = ContextStore()

    config = dotenv_values(".env")
    context.set("config",config)



    rpc = RPCHandler(context)

    # init mongo
    docstore = DocumentStore(context)
    log.debug(f" hhhhhhhhh {DocumentStore.__name__}")
    context.set(DocumentStore.__name__,docstore)

    await docstore.ping()

    # init redis
    redis_inst ={}
    context.set('redis',redis_inst)

    await FibService(context).add_funcs(rpc)
    await ArchiveService(context).add_funcs(rpc)


    await rpc.run()

    log.warn("main:Worker has stopped")

if __name__ == "__main__":
    asyncio.run(main())