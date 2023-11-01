
import logging

log = logging.getLogger(__name__)

class FibService ():

    def __init__(self) -> None:
        log.debug(f"initing service {self.__class__.__name__}")
        self.service_name = self.__class__.__name__

    def get_func_name(self, f):
        return self.fib.__qualname__.split(".")[1]
    
    async def add_funcs_wrp(self,rpc,fn):
        log.debug(f"adding function {self.__class__.__name__}.{self.get_func_name(fn)}")
        return await rpc.addServiceFunction(self.service_name, self.get_func_name(fn), fn)

    async def add_funcs(self,rpc):
        await self.add_funcs_wrp(rpc,self.fib)
        #await rpc.addServiceFunction(self.service_name, self.get_func_name(self.fib), self.fib)

        
    async def fib(self, n: int) -> int:
        if n == 0:
            return 0
        elif n == 1:
            return 1
        else:
            return await self.fib(n - 1) + await self.fib(n - 2)
    