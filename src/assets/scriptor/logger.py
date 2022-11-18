from js import self as _self
from .utils import get_json_object
import json

class Logging():

	@staticmethod
	def debug(text: str):
		if not isinstance(text, str):
			if isinstance(text, (dict, list)):
				try:
					text = json.dumps(text)
				except:
					text = str(text)
			else:
				text = str(text)


		_self.postMessage(type="log", text=text, level="debug")

	@staticmethod
	def info(text: str):
		if not isinstance(text, str):
			if isinstance(text, (dict, list)):
				try:
					text = json.dumps(text)
				except:
					text = str(text)
			else:
				text = str(text)

		_self.postMessage(type="log", text=text, level="info")

	@staticmethod
	def warning(text: str):
		if not isinstance(text, str):
			if isinstance(text, (dict, list)):
				try:
					text = json.dumps(text)
				except:
					text = str(text)
			else:
				text = str(text)

		_self.postMessage(type="log", text=text, level="warning")

	@staticmethod
	def error(text: str):
		if isinstance(text, dict):
			if isinstance(text, (dict, list)):
				try:
					text = json.dumps(text)
				except:
					text = str(text)
			else:
				text = str(text)

		_self.postMessage(type="log", text=text, level="error")
