
import logging

from CivilWarroomHubWorker.RPCHandler import InRpcMessage, ResponseRpcMessage
from CivilWarroomHubWorker.services.BaseService import BaseService

log = logging.getLogger(__name__)

class FibService (BaseService):
    async def add_funcs(self,rpc):
        await self._add_func(rpc,self.fib)

    async def fib(self, inmsg: InRpcMessage) -> ResponseRpcMessage:
        log.debug(inmsg)

        c = inmsg.get_content()

        log.debug(f"Content is {c} ")
        if isinstance(c, str):
            log.debug("is inst of str")
            n = int(c)

        outmsg = {
            "fib": await self._fib(n)
        }

        return ResponseRpcMessage(inmsg, outmsg)
    
    async def _fib(self, n: int) -> int:
        if n == 0:
            return 0
        elif n == 1:
            return 1
        else:
            return await self._fib(n - 1) + await self._fib(n - 2)
        