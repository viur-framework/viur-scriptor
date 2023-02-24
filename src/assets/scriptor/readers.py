
if 1:
	from .writer import Picker
	from js import console

	class FilePickerReader(Picker):
		TYPE_NAME = "showOpenFilePicker"

		async def on_startup(self):
			self._content = await (await self._file.getFile()).text()
			console.log(f"content_type:{type(self._content)}")

		def __init__(self, file_object: object) -> str:
			super().__init__()
			self._file = file_object[0]
			self._content: str = ""

		async def close(self):
			await self._file.close()

		@property
		def content(self) -> str:
			return self._content
		
		def readlines(self):
			return self._content.splitlines()
	
		def read(self):
			return self._content
		
		def __str__(self) -> str:
			return self._content
		
