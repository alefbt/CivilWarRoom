import asyncio
from concurrent.futures import ProcessPoolExecutor
import logging
import multiprocessing

log = logging.getLogger(__name__)

class MultiCoreWrapper:
    def __init__(self, single_instance=False, run_forever=True) -> None:
        self.run_forever = run_forever
        self.single_instance = single_instance

    def __get_max_workers(self):
        if(self.single_instance):
            return 1
        
        cpu_cores_count = multiprocessing.cpu_count()
        logging.info(f"cores: {cpu_cores_count}")
        return cpu_cores_count-1 if (cpu_cores_count>2) else 1

    async def __query_concurrently(self, func):
        """ Start concurrent tasks by start and end sequence number """
        
        is_first_run = True

        while(self.run_forever or is_first_run ):
            log.debug("while forever!!!!!")

            tasks = [asyncio.create_task(func())]
            await asyncio.gather(*tasks)
            
            if ( self.run_forever and is_first_run):
                is_first_run = False

    def _run_batch_tasks(self, func):
        """ Execute batch tasks in sub processes """
        log.debug("run quert conc")
        asyncio.run(self.__query_concurrently(func))

    async def _start_multi(self, func):
        log.debug("Get event loop")

        loop = asyncio.get_running_loop()
        
        cpu_cores_count_to_utilize = self.__get_max_workers()

        logging.debug(f"will try to utilize {cpu_cores_count_to_utilize}")

        with ProcessPoolExecutor(max_workers=cpu_cores_count_to_utilize) as executor:
            log.debug(f"ProcessPoolExecutor max={cpu_cores_count_to_utilize}")

            tasks = [loop.run_in_executor(executor, self._run_batch_tasks, func)
                    for batch_idx in range(cpu_cores_count_to_utilize)]
        
            await asyncio.gather(*tasks)

            # [result for sub_list in await asyncio.gather(*tasks) for result in sub_list]

        logging.info("Done runing server")
    
    def start_multi(self, func):
            log.debug("Starting multi")
            asyncio.run(self._start_multi(func))
