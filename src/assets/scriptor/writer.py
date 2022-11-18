from io import StringIO
from .utils import is_pyodide_context
if is_pyodide_context():
	from js import self as _self, Blob
	isPyodide = True


class Writer:
	DEFAULT_FILE_NAME = "export.txt"

	def __init__(self, line_feed="\n"):
		self._file: StringIO = StringIO()
		self._line_count: int = 0
		self._line_feed = line_feed

	@property
	def line_count(self):
		return self._line_count

	@line_count.setter
	def line_count(self, value: int):
		self._line_count = value

	@property
	def file(self) -> StringIO:
		return self._file

	@file.setter
	def file(self, data: StringIO):
		self._file = data

	@property
	def line_feed(self) -> str:
		return self._line_feed

	@line_feed.setter
	def line_feed(self, line_feed: str):
		self._line_feed = line_feed

	def write_line(self, line: str):
		self._file.write(line + self._line_feed)
		self._line_count += 1

	def write_lines(self, lines: list[str]):
		for line in lines:
			self.write_line(line)

	def download(self, name: str = ""):
		if not name:
			name = self.DEFAULT_FILE_NAME

		if is_pyodide_context():
			blob = Blob.new([str(self)], **{
				"type": "application/csv;charset=utf-8;"
			})

			_self.postMessage(type="download", blob=blob, filename=name)
		else:
			pass

	def __len__(self) -> int:
		return self._line_count

	def __str__(self) -> str:
		return self._file.getvalue()
