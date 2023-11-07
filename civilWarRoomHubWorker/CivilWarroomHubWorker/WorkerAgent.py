import asyncio
from CivilWarroomHubWorker.RPCHandler import RPCHandler
#from cwrhubworker.MultiCoreWrapper import MultiCoreWrapper
from dotenv import dotenv_values
import logging
import logging.config
from CivilWarroomHubWorker.services.ArchiveService import ArchiveService
from CivilWarroomHubWorker.services.UserService import UserService
from CivilWarroomHubWorker.stores.ContextStore import ContextStore
from CivilWarroomHubWorker.stores.DocumentStore import DocumentStore


logging.getLogger("aio_pika.connection").setLevel(logging.WARNING)
logging.getLogger("aio_pika.queue").setLevel(logging.WARNING)
logging.getLogger("aiormq.connection").setLevel(logging.WARNING)
logging.getLogger("aio_pika.channel").setLevel(logging.WARNING)
logging.getLogger("aio_pika.exchange").setLevel(logging.WARNING)

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s  - %(levelname)s - %(message)s')

log = logging.getLogger(__name__)

class WorkerAgent:
    async def start(self, ensure_structure = True):
        """
        docstring
        """
        log.info("Starting worker")

        context = ContextStore()

        config = dotenv_values(".env")
        context.set("config",config)


        rpc = RPCHandler(context)

        # init mongo
        docstore = DocumentStore(context)
        context.set(DocumentStore.__name__,docstore)
        await docstore.ping()

        if(ensure_structure):
            await docstore.ensure_structure()

        # init redis
        redis_inst ={}
        context.set('redis',redis_inst)

        #await FibService(context).add_funcs(rpc)
        await ArchiveService(context).add_funcs(rpc)
        await UserService(context).add_funcs(rpc)

        await rpc.run()

        log.warn("main:Worker has stopped")