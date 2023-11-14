import logging
import logging.config
from CivilWarroomHubWorker.MultiCoreWrapper import MultiCoreWrapper

from CivilWarroomHubWorker.WorkerAgent import WorkerAgent

logging.getLogger("aio_pika.connection").setLevel(logging.WARNING)
logging.getLogger("aio_pika.queue").setLevel(logging.WARNING)
logging.getLogger("aiormq.connection").setLevel(logging.WARNING)
logging.getLogger("aio_pika.channel").setLevel(logging.WARNING)
logging.getLogger("aio_pika.exchange").setLevel(logging.WARNING)

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s  - %(levelname)s - %(message)s')

log = logging.getLogger(__name__)

async def start_worker_agent():
    wa = WorkerAgent()
    await wa.init()
    await wa.start()

if __name__ == "__main__":
    mcw = MultiCoreWrapper(single_instance=True)
    mcw.start_multi(start_worker_agent)
