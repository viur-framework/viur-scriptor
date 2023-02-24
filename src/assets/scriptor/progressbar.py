from js import self as _self

def start(total: int, step: int = -1, max_step=-1, txt = ''):
    _self.postMessage(type="progressbar", total=total, step=step, max_step=max_step, txt=txt)

def stop():
    start(100)

def update(*args, **kwargs):
    start(*args, **kwargs)
