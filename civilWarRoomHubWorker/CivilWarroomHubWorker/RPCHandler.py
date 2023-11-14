import logging
from aio_pika import Message, connect
from aio_pika.abc import AbstractIncomingMessage
from aio_pika import ExchangeType
import asyncio

from CivilWarroomHubWorker import Utils
from CivilWarroomHubWorker.stores.ContextStore import ContextStore

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
    def __init__(self, in_msg: AbstractIncomingMessage) -> None:
        self.headers = in_msg.headers
        
        self.content = in_msg.body.decode()

        self.msg = in_msg
        self.unique_msg_id = in_msg.headers['messageUniqueId']
        self.contentType = in_msg.headers['_contentType']
        self.sourceJwt = in_msg.headers['_jwt'] 
        self.sourceUser = in_msg.headers['_user']
        self.uiFingerprint = in_msg.headers['uiFingerprint']
        self.hubFingerprint = in_msg.headers['hubFingerprint']
        self.sourceUserInfo = in_msg.headers['_userInfo'] 
        self.event = "HubRPC:" + in_msg.headers['HubRPC']

    def to_event_source_object(self):
        return {
            "@version":"EventSourceV1",
            "uniqueMessageId": self.unique_msg_id,
            "event": self.event,
            "userFingerprint": "Not-implemented-yet TBD",
            "hubFingerprint":self.hubFingerprint,
            "uiFingerprint": self.uiFingerprint,

            "source": {
                "user": self.sourceUser,
                "userInfo": self.sourceUserInfo,
                "originalJwt":self.sourceJwt,
                "amqMessageId": self.msg.message_id,

            },
            "data":{
                "contentType":self.contentType,
                "headers": self.headers,
                "content": self.get_content()
            },
            "created_at": self.msg.timestamp if(self.msg.timestamp) else Utils.get_timestamp_str_now()
        }
    
    def get_content(self):
        out = self.content # assuming the default is text/plain

        match self.contentType:
            case "application/json":
                out = Utils.json_to_obj(self.content)

            #already decleard
            #case "plain/text":
            #    out = self.content
            case _:
                pass

        
        return out


class RPCHandler:
    def __init__(self,context: ContextStore) -> None:
        log.debug("initing...")
        self.context = context
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

                        #log.debug(f" [.] fib({functionParam}) to {message.reply_to}") 

                        execution_function = self.serviceFunctions[serviceFuncName]["func"]
                        # functionParam
                        # funcParam =  InRpcMessage(message.headers, messageBody)
                        funcParam =  InRpcMessage(message)
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
        connection = await connect(self.context.get('config')['AMQ_CONNECTION'])

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




