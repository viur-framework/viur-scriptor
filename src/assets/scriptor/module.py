from .viur import viur
from .network import Request
from .viur import viur
from js import console

import inspect

class BaseModule(object):
	def __init__(self, name: str):
		self._name = name
		self._routes = {}

	@property
	def name(self) -> str:
		return self._name

	@name.setter
	def name(self, value: str):
		self._name = value

	async def register_route(self, callback: callable, name: str = None):
		self._routes[name if name is not None else callback.__name__] = {"function": callback,"instance": None}

	async def register_routes(self, route: object):
		functions = inspect.getmembers(route.__class__, predicate=inspect.isfunction)
		for name, func in functions:
			console.log(f"Register route name {name}")

			if name.startswith("__"):
				continue
			console.log(f"Register route {name} -> {func}")
			async def wrap(*args, **kwargs):
				return await func(self._routes[name]["instance"], *args, **kwargs)

			self._routes[name] = {
				"function": wrap,
				"instance": route
			}

	def __getattr__(self, name: str):
		if ret := self._routes.get(name, None):
			return ret["function"]
		return self.__getattribute__(name)


	async def preview(self, params: dict = None, group: str = ""):
		return await viur.preview(module=self._name, params=params, group=group)

	async def structure(self, group: str = ""):
		return await viur.structure(module=self._name, group=group)

	async def view(self, key: str, group: str = "") -> dict:
		return await viur.view(module=self._name, key=key, group=group)

class SingletonModule(BaseModule):
	async def edit(self, params: dict = None, group: str = ""):
		return await viur.edit(module=self._name, params=params, group=group)

class ExtendedModule(BaseModule):
	async def edit(self, key: str, params: dict = None, group: str = ""):
		return await viur.edit(module=self._name, key=key, params=params, group=group)

	def list(self, params: dict = None, group: str = '') -> viur.list:
		return viur.list(module=self._name, params=params, group=group)

	async def add(self, params: dict = None, group: str = ""):
		return await viur.add(module=self._name, params=params, group=group)

	async def delete(self, key: str, params: dict = None, group: str = ""):
		return await viur.delete(module=self._name, key=key, params=params, group=group)


class ListModule(ExtendedModule):
	pass

class TreeModule(ExtendedModule):
	async def edit(self, group: str, key: str, params: dict = None):
		return await super().edit(group=group, key=key, params=params)

	def list(self, group: str, params: dict = None) -> viur.list:
		return super().list(group=group, params=params)

	async def add(self, group: str, params: dict = None):
		return await super().add(group=group, params=params)

	async def view(self, group: str, key: str) -> dict:
		return await super().view(group=group, key=key)

	async def preview(self, group: str, params: dict = None):
		return await super().preview(params=params, group=group)
	

	async def list_root_nodes(self):
		return await viur.request.get(f"/{self.name}/listRootNodes")

	async def delete(self, group: str, key: str, params: dict = None):
		return await super().delete(group=group, key=key, params=params)

	async def move(self, key: str, parentNode: str):
		return await viur.request.secure_post(f"/{self.name}/move", params={
			"key": key,
			"parentNode": parentNode
		})



def __getattr__(attr):
	modules_resolver = {
		"tree": TreeModule, 
		"list": ListModule,
		"singleton": SingletonModule
	}

	details = viur.modules.get(attr, None)
	if details:
		module_type = None
		for key, value in modules_resolver.items():
			if details["handler"].startswith(key):
				module_type = value
				break
		
		# If the module has a registered type
		if module_type:
			# Ensure one instance of the module
			if not ("type" in details):
				details["type"] = module_type

			if not ("instance" in details):
				details["instance"] = details["type"](attr)

			return details["instance"]

	return super(__import__(__name__).__class__).__getattr__(attr)