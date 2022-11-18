from urllib.parse import urlencode as _urlencode
from js import console, fetch, FormData
from pyodide.ffi import to_js
from config import BASE_URL

import json


class Request:
	def __init__(self, method, url, params=None, renderer: str = None):
		super().__init__()
		self.status = None
		self.result = None

		self.method = method.upper()

		assert self.method in ("POST", "GET")

		if not url.startswith("/"):
			url = "/" + url


		self._params = params

		if self.method == "GET" and params:
			url += "?" + _urlencode(params)
			self.send = None
		else:
			self.send = FormData.new()

			if params:
				for k, v in params.items():
					self.send.append(k, v)

		prefix = "/vi"
		if renderer:
			prefix = renderer

		self.url = self.build_url(prefix + url)
		console.log(self.url)

	@staticmethod
	def build_url(url):
		if url and not (url.startswith('http://') or url.startswith('https://') or url.startswith('//')):
			url = BASE_URL + url

		return url

	async def perform(self):
		if self.method == "GET":
			console.log("options:", self.build_options(self.method))
			response = await fetch(self.url, **self.build_options(self.method))
		else:
			response = await fetch(self.url, **self.build_options(self.method, self.send))
		_data = json.loads(await response.text())
		self.status = response.status
		self.result = _data

	@staticmethod
	def build_options(method: str, body = None, headers = None):
		options = {"method": method,
				   "credentials": 'include',
				   "headers": {
					   "Accept": "application/json, text/plain, */*",
				   }
		}

		if headers:
			options["headers"] = options["headers"] | headers

		if body:
			options["body"] = to_js(body)

		options["headers"] = to_js(options["headers"])

		return options

	@staticmethod
	async def get(*args, **kwargs):
		_request = Request("GET", *args, **kwargs)
		await _request.perform()
		return _request.result

	@staticmethod
	async def post(*args, **kwargs):
		_request = Request("GET", *args, **kwargs)
		await _request.perform()

		return _request.result
