
import logging
from uu import Error

from aio_pika import Channel
from aio_pika.abc import AbstractIncomingMessage

from cwrhubworker.RPCHandler import InRpcMessage, RPCHandler
from cwrhubworker.services.BaseService import BaseService
from cwrhubworker.stores.DocumentStore import getDocumentStoreFromContext

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
                    inrpcmsgR = InRpcMessage(message)

                    log.debug(f" [.] Archive {inrpcmsgR.unique_msg_id} to Store")
                    await getDocumentStoreFromContext(self.context).store_eventsource(inrpcmsgR)

                    await message.ack()
                    log.debug(f" [.] Archive ACK {inrpcmsgR.unique_msg_id}")

                except Exception:
                    logging.exception("Processing error for message %r", message)
        
        
    
