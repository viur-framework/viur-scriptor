from viur.scriptor import logging
from .message import print_warning

def __getattr__(attr: str):
    print_warning()
    import viur
    return getattr(viur.scriptor, attr)
