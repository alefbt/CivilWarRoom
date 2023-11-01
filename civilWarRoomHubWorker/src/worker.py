import asyncio
import random
from cwrhubworker.RPCHandler import RPCHandler
#from cwrhubworker.MultiCoreWrapper import MultiCoreWrapper
from dotenv import dotenv_values
import logging
import logging.config

from cwrhubworker.services.FibService import FibService

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

    config = dotenv_values(".env")
    
    log.debug(config)
    rpc = RPCHandler(config)

    await FibService().add_funcs(rpc)

    #await rpc.addServiceFunction("rpc-test-service","fib-func", fib)
    await rpc.run()


    #Assuming that worker should always work
    log.error("Worker stopped")

if __name__ == "__main__":
    asyncio.run(main())