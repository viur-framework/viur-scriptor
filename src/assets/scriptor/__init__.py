from .utils import get_json_object



from .network import Request
from .viur import viur
from .writer import Writer
from .csvwriter import CsvWriter
from .logger import Logging as logging

try:
	from js import console
except ModuleNotFoundError:
	pass


import json
import copy

def print(*args, **kwargs):
	console.log("my own print!")

	for arg in args:
		logging.info(arg)
