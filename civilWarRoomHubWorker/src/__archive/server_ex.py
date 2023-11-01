import asyncio
import logging


from aio_pika import Message, connect
from aio_pika.abc import AbstractIncomingMessage
from aio_pika import ExchangeType

from dotenv import dotenv_values
config = dotenv_values(".env")

def fib(n: int) -> int:
    if n == 0:
        return 0
    elif n == 1:
        return 1
    else:
        return fib(n - 1) + fib(n - 2)


async def main() -> None:
    # Perform connection
    connection = await connect("amqp://rabbitmq:rabbitmq@localhost/")

    async with connection:
        # Creating a channel
        channel = await connection.channel()
        exchangeDefault = channel.default_exchange

        # exchange = await channel.declare_exchange('hub-eventsource1', ExchangeType.FANOUT)

        exchangeHub = await channel.declare_exchange('hub-eventsource', ExchangeType.FANOUT)
        
        #          arc-q
        #  xhub-es 
        #           xhub-es-exec

        # ARCHIVE
        archiveQueue = await channel.declare_queue("hub-eventsource-archive-q")
        await archiveQueue.bind(exchangeHub)

        

        # Execution

        exchangeExec = await channel.declare_exchange('hub-eventsource-exec', ExchangeType.HEADERS)
        await exchangeExec.bind(exchangeHub)


        execQueue = await channel.declare_queue("hub-eventsource-exec-q")
        await execQueue.bind(
            exchangeExec,
            "",arguments={
                'x-match': 'any',
            })
        

        # execQueue2 = await channel.declare_queue("hub-eventsource-exec-routed-q")
        # await execQueue2.bind(exchangeExec)

        #exchangeArchive = await channel.declare_exchange('hub-eventsource-archive', ExchangeType.DIRECT)
        #await exchangeArchive.bind(exchange)


        queue = await channel.declare_queue("hub-eventsource-exec-q-test-service-fib-func")

        # await queue.bind(
        #     exchange, 
        #     routing_key="HubRPC:rpc-test-service.fib-func")

        await queue.bind(
            exchangeExec,
            "",arguments={
                "HubRPC": "rpc-test-service.fib-func",
                'x-match': 'any',
            })
        print(" [x] Awaiting RPC requests")

        # Start listening the queue with name 'hello'
        async with queue.iterator() as qiterator:
            message: AbstractIncomingMessage
            async for message in qiterator:
                try:
                    async with message.process(requeue=False):
                        assert message.reply_to is not None
                        n = int(message.body.decode())

                        print(f" [.] fib({n}) to {message.reply_to}")
                        response = str(fib(n)).encode()

                        await exchangeDefault.publish(
                            Message(
                                body=response,
                                correlation_id=message.correlation_id,
                            ),
                            routing_key=message.reply_to,
                        )
                        print("Request complete")
                except Exception:
                    logging.exception("Processing error for message %r", message)

if __name__ == "__main__":
    asyncio.run(main())
