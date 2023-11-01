import asyncio
from concurrent.futures import ProcessPoolExecutor
import logging
import multiprocessing
import random

log = logging.getLogger(__name__)

class MultiCoreWrapper:
    def __init__(self) -> None:
        pass

    async def fake_crawlers(self, a,b):
        log.debug(a)
        log.debug(b)

        io_delay = round(random.uniform(0.2, 1.0), 2)
        await asyncio.sleep(io_delay)

        result = 0
        for i in range(random.randint(100_000, 500_000)):
            result += i
        return result


    # async def fake_crawlers():
    #     io_delay = round(random.uniform(0.2, 1.0), 2)
    #     await asyncio.sleep(io_delay)

    #     result = 0
    #     for i in range(random.randint(100_000, 500_000)):
    #         result += i
    #     return result

    async def query_concurrently(self, func):
        """ Start concurrent tasks by start and end sequence number """
        tasks = []
        #for _ in range(begin_idx, end_idx, 1):
        tasks.append(asyncio.create_task(func()))

        results = await asyncio.gather(*tasks)
        #results = await asyncio.gather( asyncio.create_task(func(*args)))
        return results

    def run_batch_tasks(self, func):
        """ Execute batch tasks in sub processes """
        results = [result for result in asyncio.run(self.query_concurrently(func))]
        return results

    async def start_multi(self, func):
        loop = asyncio.get_running_loop()
        cpu_cores_count = multiprocessing.cpu_count()
        cpu_cores_count_to_utilize = cpu_cores_count-1 if (cpu_cores_count>2) else 1

        logging.debug(f"cores: {cpu_cores_count} | will try to utilize {cpu_cores_count_to_utilize}")

        with ProcessPoolExecutor() as executor:
            tasks = [loop.run_in_executor(executor, func)
                    for batch_idx in range(cpu_cores_count_to_utilize)]
        
        [result for sub_list in await asyncio.gather(*tasks) for result in sub_list]

        logging.info("Done runing server")