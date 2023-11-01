import logging
from aio_pika import Message, connect
from aio_pika.abc import AbstractIncomingMessage
from aio_pika import ExchangeType
import asyncio


log = logging.getLogger(__name__)

class RPCHandler:
    def __init__(self,config) -> None:
        log.debug("initing...")
        self.config = config
        self.serviceFunctions = {}
        
    async def init_channel_definitions(self, channel):
        # EventSource (exchangeHub)
        self.eventsourceExchange = await channel.declare_exchange('hub-eventsource', ExchangeType.FANOUT)
        
        # ARCHIVE
        self.archiveQueue = await channel.declare_queue("hub-eventsource-archive-q")
        await self.archiveQueue.bind(self.eventsourceExchange)
        
        # Execution (exchangeExec)
        self.hubExecutionExchange = await channel.declare_exchange('hub-eventsource-exec', ExchangeType.HEADERS)
        await self.hubExecutionExchange.bind(self.eventsourceExchange)


        # Execution catch-all queue (execQueue)
        self.hubExecutionQueueCatchall = await channel.declare_queue("hub-eventsource-exec-q-catchall")
        await self.hubExecutionQueueCatchall.bind(
            self.hubExecutionExchange,
            "",arguments={
                'x-match': 'any',
            })

    async def addServiceFunction(self,serviceName,serviceFunctionName, func):
        cHubRPC = f"{serviceName}.{serviceFunctionName}"
        self.serviceFunctions[cHubRPC] = {
            "name": cHubRPC,
            "func": func,
            "q": {}
        }

    async def create_service_function_queues(self, channel):
        for n in self.serviceFunctions:
            queue = await channel.declare_queue(f"hub-eventsource-exec@{n}")

            await queue.bind(
                self.hubExecutionExchange,
                "",arguments={
                    "HubRPC": n,
                    'x-match': 'any',
                })
            
            self.serviceFunctions[n]['q'] = queue

    async def start_listen(self, serviceFuncName):
        log.info(f"Start listen to queue {serviceFuncName}")

        async with self.serviceFunctions[serviceFuncName]["q"].iterator() as qiterator:
            message: AbstractIncomingMessage
            async for message in qiterator:
                try:
                    async with message.process(requeue=False):
                        assert message.reply_to is not None
                        n = int(message.body.decode())

                        log.debug(f" [.] fib({n}) to {message.reply_to}")


                        fu = self.serviceFunctions[serviceFuncName]["func"]
                        task = asyncio.create_task(fu(n))
                        response = str(await task).encode()

                        await self.exchangeDefault.publish(
                            Message(
                                body=response,
                                correlation_id=message.correlation_id,
                            ),
                            routing_key=message.reply_to,
                        )
                        log.debug(f" [.] request completed {message.reply_to}")
                except Exception:
                    logging.exception("Processing error for message %r", message)

        pass

    async def run(self):
        logging.info("starting")
        # Perform connection
        connection = await connect(self.config['AMQ_CONNECTION'])

        async with connection:
            # Creating a channel
            channel = await connection.channel()
            self.exchangeDefault = channel.default_exchange
            
            await self.init_channel_definitions(channel)

            await self.create_service_function_queues(channel)

            tasks = []
            for n in self.serviceFunctions:
                tasks.append(self.start_listen(n))

            await asyncio.gather(*tasks)




