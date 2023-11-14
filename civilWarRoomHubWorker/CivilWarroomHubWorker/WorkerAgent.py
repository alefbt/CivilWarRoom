from CivilWarroomHubWorker.RPCHandler import RPCHandler
#from cwrhubworker.MultiCoreWrapper import MultiCoreWrapper
from dotenv import dotenv_values
import logging
import logging.config
from CivilWarroomHubWorker.services.ArchiveService import ArchiveService
from CivilWarroomHubWorker.services.UserService import UserService
from CivilWarroomHubWorker.services.WarRoomHubService import WarRoomHubService
from CivilWarroomHubWorker.services.WarroomService import WarRoomService
from CivilWarroomHubWorker.stores.ContextStore import ContextStore
from CivilWarroomHubWorker.stores.DocumentStore import DocumentStore
from CivilWarroomHubWorker.stores.SchemaStore import SchemaStore


logging.getLogger("aio_pika.connection").setLevel(logging.WARNING)
logging.getLogger("aio_pika.queue").setLevel(logging.WARNING)
logging.getLogger("aiormq.connection").setLevel(logging.WARNING)
logging.getLogger("aio_pika.channel").setLevel(logging.WARNING)
logging.getLogger("aio_pika.exchange").setLevel(logging.WARNING)
logging.getLogger("asyncio").setLevel(logging.WARNING)

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s  - %(levelname)s - %(message)s')

log = logging.getLogger(__name__)

class WorkerAgent:
    def __init__(self, ensure_structure = True) -> None:
        self.context = ContextStore()
        self.ensure_structure = ensure_structure

    async def init(self):
        """
        docstring
        """
        log.info("Starting worker")

        config = dotenv_values(".env")
        self.context.set("config",config)

        schemaStore = SchemaStore(self.context)
        self.context.set(SchemaStore.__name__, schemaStore)


        # init mongo
        docstore = DocumentStore(self.context)
        self.context.set(DocumentStore.__name__,docstore)
        await docstore.ping()

        if(self.ensure_structure):
            await docstore.ensure_structure()

        # init redis
        redis_inst ={}
        self.context.set('redis',redis_inst)

    async def start(self):
        """
        docstring
        """
       

        rpc = RPCHandler(self.context)
        #await FibService(context).add_funcs(rpc)
        await ArchiveService(self.context).add_funcs(rpc)
        await UserService(self.context).add_funcs(rpc)
        await WarRoomHubService(self.context).add_funcs(rpc)
        await WarRoomService(self.context).add_funcs(rpc)

        await rpc.run()

        log.warn("main:Worker has stopped")