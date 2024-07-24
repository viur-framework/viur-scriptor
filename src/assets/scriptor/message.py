from viur.scriptor import logger

warning = "the 'scriptor' module is deprecated instead use 'viur.scriptor'"
called = False

def print_warning():
    global called
    if not called:
        logger.warning(warning)
        called = True
