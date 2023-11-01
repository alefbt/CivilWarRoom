from concurrent.futures import ProcessPoolExecutor
import random
import time
import asyncio
#import .cwrhubworker.server
import logging
import multiprocessing

logging.basicConfig( level=logging.DEBUG)


async def fake_crawlers():
    io_delay = round(random.uniform(0.2, 1.0), 2)
    await asyncio.sleep(io_delay)

    result = 0
    for i in range(random.randint(100_000, 500_000)):
        result += i
    return result

async def query_concurrently(begin_idx: int, end_idx: int):
    """ Start concurrent tasks by start and end sequence number """
    tasks = []
    for _ in range(begin_idx, end_idx, 1):
        tasks.append(asyncio.create_task(fake_crawlers()))
    results = await asyncio.gather(*tasks)
    return results

def run_batch_tasks(batch_idx: int, step: int):
    """ Execute batch tasks in sub processes """
    begin = batch_idx * step + 1
    end = begin + step

    results = [result for result in asyncio.run(query_concurrently(begin, end))]
    return results

async def main():
    """ Distribute tasks in batches to be executed in sub-processes """

    logging.info("Starting server")

    loop = asyncio.get_running_loop()
    cpu_cores_count = multiprocessing.cpu_count()
    cpu_cores_count_to_utilize = cpu_cores_count-1 if (cpu_cores_count>2) else 1

    logging.debug(f"cores: {cpu_cores_count} | will try to utilize {cpu_cores_count_to_utilize}")

    with ProcessPoolExecutor() as executor:
        tasks = [loop.run_in_executor(executor, run_batch_tasks, batch_idx)
                 for batch_idx in range(cpu_cores_count_to_utilize)]

    [result for sub_list in await asyncio.gather(*tasks) for result in sub_list]

    logging.info("Done runing server")

if __name__ == "__main__":
    asyncio.run(main())