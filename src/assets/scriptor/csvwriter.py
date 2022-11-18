from .writer import Writer
from .utils import is_pyodide_context

if is_pyodide_context():
	from js import console

import csv
import json


class CsvWriter(Writer):
	"""
	Writer for CSV exports
	"""

	DEFAULT_FILE_NAME = "export.csv"

	def __init__(self, *args, delimiter=";", formatter: callable =None):
		super().__init__()
		self._file.write("\ufeff")  # excel needs this for right utf-8 decoding

		if args:
			self._writer = csv.DictWriter(
				self._file,
				fieldnames=args,
				extrasaction="ignore",
				delimiter=delimiter,
				dialect="excel",
				quoting=csv.QUOTE_ALL
			)
			self._writer.writeheader()
		else:
			self._writer = csv.writer(
				self._file,
				delimiter=delimiter,
				dialect="excel",
				quoting=csv.QUOTE_ALL
			)

		self._formatter: callable = formatter


	@property
	def writer(self):
		return self._writer

	@writer.setter
	def writer(self, writer: csv.DictWriter):
		self._writer = writer

	def fmt(self, value):
		if self._formatter:
			ret = self._formatter(value)
			if ret is not None:
				return ret

		if isinstance(value, list):
			ret = ", ".join([self.fmt(v) for v in value])
			if is_pyodide_context():
				console.log(ret)
			else:
				print(ret)
			return ret
		elif isinstance(value, dict):
			return json.dumps(value, sort_keys=True)

		return str(value)

	def write(self, values: object):
		if isinstance(values, dict):
			assert isinstance(self._writer, csv.DictWriter)
			self._writer.writerow({k: self.fmt(v) for k, v in values.items() if k in self._writer.fieldnames})
			self._line_count += 1
		elif isinstance(values, list):
			if isinstance(self._writer, csv.DictWriter):
				for row in values:
					self.write(row)
			else:
				self._writer.writerow([self.fmt(v) for v in values])
				self._line_count += 1
		else:
			raise NotImplementedError(f"Don't know what to do with {repr(values)}")
