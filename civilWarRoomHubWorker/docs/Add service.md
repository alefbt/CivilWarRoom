Add Service
=============

1. create at file `<name>Service.py` in `./src/cwrhubworker/services`
2. add base code:
```py
import logging
from cwrhubworker.services.BaseService import BaseService

log = logging.getLogger(__name__)

class ArchiveService (BaseService):
    async def add_funcs(self,rpc):
        # >>> here you add background tasks
        await self._add_background_task(rpc,self.bg_archive)

        # >>> here you add services
        await self._add_func(rpc,self.fib)

    async def fib(self, inmsg: InRpcMessage) -> ResponseRpcMessage:
        c = inmsg.get_content()

        ## ... something.....

        outmsg = {
            # ADD you content to output
        }
        return ResponseRpcMessage(inmsg, outmsg)

    async def bg_archive(self, rpch: RPCHandler, ch: Channel):
        # Do some thing
        pass
```

3. in `worker.py` file add in `main()` 
```py
async def main():
    # ....
    await YourService().add_funcs(rpc)
    # ...
```