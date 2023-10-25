from viur.scriptor import logging
from .message import print_warning

def __getattr__(attr: str):
    print_warning()
    from viur.scriptor import module
    return getattr(module, attr)

