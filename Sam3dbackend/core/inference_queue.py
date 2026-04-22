import asyncio
class GpuQueue:
    _lock = asyncio.Lock()
    @classmethod
    async def waitInLine(cls):
        await cls._lock.acquire()
    @classmethod
    def doneProcessing(cls):
        cls._lock.release()