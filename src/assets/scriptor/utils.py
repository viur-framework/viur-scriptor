import sys


def is_pyodide_context():
	return sys.platform == 'emscripten' or "pyodide" in sys.modules

def get_json_object(text: str):
	try:
		return json.loads(text)
	except ValueError as e:
		return False
	return True
