from js import eval as js_eval, self as _self, Blob
import manager
import time
from js import console
from scriptor import print

async def wait():
    while manager.resultValue is None:
        await manager.sleep(250)

async def alert(text: str):
    _self.postMessage(type="alert", text=text)
    await wait();
    manager.reset()
    manager.resultValue = None

async def confirm(title: str, text: str, cancel: bool = False) -> str:
    _self.postMessage(type="confirm", title=title, text=text, cancel=cancel)
    await wait(); 
    tmp = manager.copyResult()
    manager.reset()
    manager.resultValue = None

    return tmp

# time = true
# datetim-picker local
import datetime
import time
import math

async def input(title: str, text: str, type: str, use_time: bool = False, empty: bool = False):
    _self.postMessage(type="input", title=title, text=text, input_type=type, use_time=use_time, empty=empty)
    await wait(); 
    tmp = manager.copyResult()
    manager.reset()
    manager.resultValue = None

    if type == "date":
        console.error(tmp)
        return datetime.datetime.fromtimestamp(math.floor(tmp/1000.0))
    
    return tmp

async def input_date(*args, **kwargs):
    kwargs.update({"type": "date"})
    return await input(*args, **kwargs)

async def input_number(*args, **kwargs):
    kwargs.update({"type": "number"})
    return await input(*args, **kwargs)

async def input_string(*args, **kwargs):
    kwargs.update({"type": "string"})
    return await input(*args, **kwargs)

async def input_text(*args, **kwargs):
    kwargs.update({"type": "text"})
    return await input(*args, **kwargs)

input.date = input_date
input.number = input_number
input.text = input_text
input.string = input_string

from pyodide.ffi import to_js


async def select(title: str, text: str, choices: list[int], multiple: bool = False):
    _self.postMessage(type="select", title=title, text=text, choices=to_js(choices), multiple=multiple)
    await wait(); 

    tmp = manager.resultValue
    if multiple:
        tmp = list(tmp)
    manager.reset()
    manager.resultValue = None

    if multiple:
        return tmp


    return tmp
