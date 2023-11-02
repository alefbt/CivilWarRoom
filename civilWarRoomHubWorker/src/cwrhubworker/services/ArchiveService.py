
import logging

from aio_pika import Channel
from aio_pika.abc import AbstractIncomingMessage

from cwrhubworker.RPCHandler import InRpcMessage, RPCHandler, ResponseRpcMessage
from cwrhubworker.services.BaseService import BaseService

log = logging.getLogger(__name__)

class ArchiveService (BaseService):
    async def add_funcs(self,rpc):
        await self._add_background_task(rpc,self.bg_archive)
    
    async def bg_archive(self, rpch: RPCHandler, ch: Channel):
        log.info(f"Start listen to queue {rpch.archiveQueue}")

        async with rpch.archiveQueue.iterator() as qiterator:
            message: AbstractIncomingMessage
            async for message in qiterator:
                try:
                    async with message.process(requeue=False):
                        messageBody = message.body.decode()
                        # TODO Save as Eventsource on mongo
                        log.debug(f" [.] Archive {messageBody}") 
                except Exception:
                    logging.exception("Processing error for message %r", message)
        
        
    
