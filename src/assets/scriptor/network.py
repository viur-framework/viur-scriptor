from urllib.parse import urlencode as _urlencode
from .utils import is_pyodide_context

if is_pyodide_context():
    from js import console, fetch, FormData
    from pyodide.ffi import to_js
    from config import BASE_URL

import json

class Request:
    def __init__(self, method: str, url: str, credentials: bool = False, headers: dict = None, data: dict = None) -> None:
        self._status = None
        self._result = None

        self._method = method.upper()
        self._data = None
        self._credentials = credentials

        if data:
            if method == "GET":
                url += "?" + _urlencode(data)
            else:
                if is_pyodide_context():
                    self._data = FormData.new()
                    for k, v in data.items():
                        self._data.append(k, v)

        self._headers = headers
        self._url = url
        self._response = None

    async def perform(self):
        options = {"method": self._method}

        if self._headers:
            options.update({"headers": to_js(self._headers)})
        
        if self._data:
            options.update({"body": to_js(self._data)})

        if self._credentials:
            options.update({"credentials": 'include'})

        self._response = await fetch(self._url, **options)
        self._status = self._response.status

    async def json(self):
        if not self._response:
            return None

        return json.loads(await self._response.text())

    async def text(self):
        return await self._response.text()

    async def blob(self):
        return await self._response.blob()

    @property
    def response(self):
        return self._response

    @staticmethod
    async def get(*args, **kwargs):
        _request = Request("GET", *args, **kwargs)
        await _request.perform()
        return _request


    @staticmethod
    async def post(*args, **kwargs):
        _request = Request("POST", *args, **kwargs)
        await _request.perform()

        return _request

    @staticmethod
    async def put(*args, **kwargs):
        _request = Request("PUT", *args, **kwargs)
        await _request.perform()

        return _request

    @staticmethod
    async def delete(*args, **kwargs):
        _request = Request("DELETE", *args, **kwargs)
        await _request.perform()

        return _request

    @staticmethod
    async def patch(*args, **kwargs):
        _request = Request("PATCH", *args, **kwargs)
        await _request.perform()

        return _request