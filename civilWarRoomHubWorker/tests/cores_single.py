from concurrent.futures import ProcessPoolExecutor
import random
import time
import asyncio
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

async def run_batch_tasks(batch_idx: int, step: int):
    """ Execute batch tasks in sub processes """
    begin = batch_idx * step + 1
    end = begin + step

    results = [result for result in await query_concurrently(begin, end)]
    return results

async def main():
    """ Distribute tasks in batches to be executed in sub-processes """
    start = time.monotonic()

    logging.info("Starting server")

    cpu_cores_count = multiprocessing.cpu_count()

    logging.debug(f"cores: {cpu_cores_count}")

    # with ProcessPoolExecutor() as executor:
    #     tasks = [loop.run_in_executor(executor, run_batch_tasks, batch_idx, 2000)
    #              for batch_idx in range(cpu_cores_count)]

    tasks = [run_batch_tasks(batch_idx, 2000) for batch_idx in range(cpu_cores_count)]
    results = [result for sub_list in await asyncio.gather(*tasks) for result in sub_list]

    print(f"We get {len(results)} results. All last {time.monotonic() - start:.2f} second(s)")

    logging.info("Done runing server")

if __name__ == "__main__":
    asyncio.run(main())