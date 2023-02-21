from .utils import is_pyodide_context

if is_pyodide_context():
	from js import self as _self

import json

class Logging():

	@staticmethod
	def format_text(*args, **kwargs):
		jsonify = False
		if any([isinstance(arg, (dict, list)) for arg in args]):
			jsonify = True

		text = ""
		if jsonify:
			try:
				text = json.dumps(args)
			except:
				text = ""

		if not text:
			delimiter = kwargs.get("sep", " ")
			text = f"{delimiter}".join([str(arg) for arg in args])

		return text

	@staticmethod
	def debug(*args, **kwargs):
		_self.postMessage(type="log", text=Logging.format_text(*args, **kwargs), level="debug")

	@staticmethod
	def info(*args, **kwargs):
		_self.postMessage(type="log", text=Logging.format_text(*args, **kwargs), level="info")

	@staticmethod
	def warning(*args, **kwargs):
		_self.postMessage(type="log", text=Logging.format_text(*args, **kwargs), level="warning")

	@staticmethod
	def error(*args, **kwargs):
		_self.postMessage(type="log", text=Logging.format_text(*args, **kwargs), level="error")
