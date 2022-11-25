from .viur import viur
from .network import Request



class BaseModule(object):
    def __init__(self, name: str):
        self._name = name

    @property
    def name(self) -> str:
        return self._name

    @name.setter
    def name(self, value: str):
        self._name = value


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
