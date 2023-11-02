import logging

log = logging.getLogger(__name__)

class BaseService:
    def __init__(self) -> None:
        log.debug(f"initing service {self.__class__.__name__}")
        self.service_name = self.__class__.__name__

    def _get_func_name(self, f):
        return f.__qualname__.split(".")[1]
    
    async def _add_func(self,rpc,fn):
        log.debug(f"adding function {self.__class__.__name__}.{self._get_func_name(fn)}")
        return await rpc.add_service_function(self.service_name, self._get_func_name(fn), fn)

    async def _add_background_task(self,rpc,fn):
        log.debug(f"adding background task {self.__class__.__name__}.{self._get_func_name(fn)}")
        return await rpc.add_background_task(fn)
    
    async def add_funcs(self,rpc):
        pass