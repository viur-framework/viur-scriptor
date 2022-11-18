from .network import Request


class viur:

	@staticmethod
	async def view(*, url: str = "", module: str = "", key: str = "", params: dict = None, group: str = "", **kwargs):
		_url = url
		if not _url:
			assert module, "You need to set an url or use the module parameter."
			_url = f"{module}/view"
			if group:
				_url += f"/{group}"
			_url += f"/{key}"

		if not (ret := await Request.get(_url, params, **kwargs)):
			return ret

		return ret["values"]

	class list:
		"""
		Fetches a list from a VIUR module
		"""

		def __init__(self, *, url: str = "", module: str = "", params: dict = None, group: str = "",
					 renderer: str = ""):
			self._module = module
			self._params = params or {}
			if not url:
				assert module, "You need to set an url or use the module parameter."
				self._url = f"{module}/{self.__class__.__name__}"
				if group:
					self._url += f"/{group}"
			else:
				self._url = url

			self._renderer = renderer

			self.batch = []
			self.cursor = None
			self.fetched = False

		def __aiter__(self):
			self.cursor = None
			self.fetched = False
			return self

		async def __anext__(self):
			if self.batch:
				return self.batch.pop()

			if self.fetched and not self.cursor:
				raise StopAsyncIteration

			if self.cursor:
				self._params["cursor"] = self.cursor

			ret = await Request.get(self._url, self._params, renderer=self._renderer)
			self.fetched = True

			if not ret:
				raise StopAsyncIteration

			self.batch = ret["skellist"]
			self.cursor = ret["cursor"]

			if not self.batch:
				self.cursor = None

			return await self.__anext__()
