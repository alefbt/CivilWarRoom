import logging
from aio_pika import Message, connect
from aio_pika.abc import AbstractIncomingMessage
from aio_pika import ExchangeType
import asyncio

from cwrhubworker import Utils

log = logging.getLogger(__name__)

class ResponseRpcMessage:
    def __init__(self, inrpc_message,  content) -> None:
        self.content = content
        self.inrpc_message = inrpc_message

    def get_headers(self):
        return {
            "_messageVersion": "1-init",
            "_contentType": "application/json"
        }
    
    def get_content(self):
        return self.content
    
    def get_message_body(self):
        return str(Utils.obj_to_json(self.content)).encode()

class InRpcMessage:
    def __init__(self, headers, content) -> None:
        self.headers = headers
        self.content = content
    
    def get_content(self):
        out = self.content # assuming the default is text/plain

        if('_contentType' in self.headers and self.headers['_contentType'] == "application/json"):
            out = Utils.json_to_obj(self.content)

        return out


class RPCHandler:
    def __init__(self,config) -> None:
        log.debug("initing...")
        self.config = config
        self.serviceFunctions = {}
        self.background_jobs = []
        
    async def __init_channel_definitions(self, channel):
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
        
        await self.__create_service_function_queues(channel)

    async def __create_service_function_queues(self, channel):
        for n in self.serviceFunctions:
            queue = await channel.declare_queue(f"hub-eventsource-exec@{n}")

            await queue.bind(
                self.hubExecutionExchange,
                "",arguments={
                    "HubRPC": n,
                    'x-match': 'any',
                })
            
            self.serviceFunctions[n]['q'] = queue

    async def __start_rpc_listen(self, serviceFuncName):
        log.info(f"Start listen to queue {serviceFuncName}")

        async with self.serviceFunctions[serviceFuncName]["q"].iterator() as qiterator:
            message: AbstractIncomingMessage
            async for message in qiterator:
                try:
                    async with message.process(requeue=False):
                        assert message.reply_to is not None

                        messageBody = message.body.decode()
                        functionParam = messageBody

                        log.debug(f" [.] fib({functionParam}) to {message.reply_to}") 

                        execution_function = self.serviceFunctions[serviceFuncName]["func"]
                        # functionParam
                        funcParam =  InRpcMessage(message.headers, messageBody)
                        task = asyncio.create_task(execution_function(funcParam))
                        outrpc_msg = await task
                        await self.exchangeDefault.publish(
                            Message(
                                body=outrpc_msg.get_message_body(),
                                correlation_id=message.correlation_id,
                                headers=outrpc_msg.get_headers()
                            ),
                            routing_key=message.reply_to,
                        )
                        log.debug(f" [.] request completed {message.reply_to}")
                except Exception:
                    logging.exception("Processing error for message %r", message)

    async def __start_background_task(self, channel, func):
        log.debug("Start background task")
        task = asyncio.create_task(func(self, channel))
        await task

    async def add_service_function(self,serviceName,serviceFunctionName, func):
        cHubRPC = f"{serviceName}.{serviceFunctionName}"
        self.serviceFunctions[cHubRPC] = {
            "name": cHubRPC,
            "func": func,
            "q": {}
        }

    async def add_background_task(self,func):
        self.background_jobs.append(func)

    async def run(self):
        logging.info("starting")
        # Perform connection
        connection = await connect(self.config['AMQ_CONNECTION'])

        async with connection:
            # Creating a channel
            channel = await connection.channel()
            self.exchangeDefault = channel.default_exchange
            
            await self.__init_channel_definitions(channel)


            tasks = []

            for n in self.background_jobs:
                tasks.append(self.__start_background_task(channel,n))
            
            for n in self.serviceFunctions:
                tasks.append(self.__start_rpc_listen(n))



            await asyncio.gather(*tasks)




