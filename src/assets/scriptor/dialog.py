from js import eval as js_eval, self as _self, Blob
import manager
import time
from scriptor import print

async def alert(text: str):
    _self.postMessage(type="alert", id = manager.currentProcessId, text=text)

    print("Starting wating for value...", manager.resultValue)


    while not manager.resultValue:
        await manager.sleep(250)
        #time.sleep(0.25)
    
    print("Result value:", manager.resultValue)


