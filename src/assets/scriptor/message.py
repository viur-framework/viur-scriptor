from viur.scriptor import logging

warning = "the 'scriptor' module is deprecated instead use 'viur.scriptor'"
called = False

def print_warning():
    global called
    if not called:
        logging.warning(warning)
        called = True
