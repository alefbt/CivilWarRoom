
import logging

from cwrhubworker.RPCHandler import InRpcMessage, ResponseRpcMessage

log = logging.getLogger(__name__)

class FibService ():

    def __init__(self) -> None:
        log.debug(f"initing service {self.__class__.__name__}")
        self.service_name = self.__class__.__name__

    def get_func_name(self, f):
        return self.fib.__qualname__.split(".")[1]
    
    async def add_funcs_wrp(self,rpc,fn):
        log.debug(f"adding function {self.__class__.__name__}.{self.get_func_name(fn)}")
        return await rpc.add_service_function(self.service_name, self.get_func_name(fn), fn)

    async def add_funcs(self,rpc):
        await self.add_funcs_wrp(rpc,self.fib)

        
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
        