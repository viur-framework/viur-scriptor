
if 1:
	from .writer import Picker
	from js import console

	class FilePickerReader(Picker):
		EVENT_NAME = "filePickerHandle"
		TYPE_NAME = "showOpenFilePicker"

		def __init__(self, file_object: object) -> str:
			super().__init__()
			self._file = file_object[0]
			self._content: str = ""

		async def close(self):
			await self._file.close()

		@property
		def content(self) -> str:
			return self._content
		
		async def for_each_line(self, function: callable):
			for line in self._content.splitlines():
				await function(line)
			#await function()

		async def __aenter__(self):
			self._content = await (await self._file.getFile()).text()
			console.log(f"content_type:{type(self._content)}")
			#print(self._content)
			#print(dir(self._file))
			#self._content = await self._file.getFile()

		async def __aexit__(self, *args):
			pass
			#await self.close()

		def __repr__(self) -> str:
			return repr(self._file_stream)

		def __str__(self) -> str:
			return str(self._file_stream)
		
