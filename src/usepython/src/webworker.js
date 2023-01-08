
importScripts("https://cdn.jsdelivr.net/pyodide/v0.22.0/full/pyodide.js");

let isPyLoaded = false;


function stdout(msg) {
  self.postMessage({ type: "stdout", msg: msg, id: null })
}

function stderr(msg) {
  self.postMessage({ type: "stderr", msg: msg, id: null })
}

function installLog(id, stage, msg) {
  self.postMessage({
    type: "installlog", msg: {
      stage: stage,
      msg: msg
    }, id: id
  })
}

function err(id, msg) {
  self.postMessage({ type: "err", msg: msg, id: id })
}

function end(id, res) {
  self.postMessage({ type: "end", res: res ?? null, id: id })
}

let webworkerUtils = {
	showDirectoryPicker: null,
	showSaveFilePicker: null,
	directoryHandle: null,
	fileHandle: null,
	filePickerHandle: null,
	runningId: 0,
	res: {},
	events: {},
	registerEvent: async function(name, callback) {
		console.log("register func", name, callback)
		console.log("webworker utils:", callback)

		webworkerUtils.events[name] = callback;//callback.toJs({create_pyproxies: true});
		console.log("registerEvents:", webworkerUtils.events)
	}
}

async function loadPyodideAndPackages(id, pyoPackages, packages, initCode, transformCode) {
  installLog(id, 1, "Loading python runtime")
  self.pyodide = await loadPyodide({
    stdout: stdout,
    stderr: stderr,
  });
  pyoPackages.unshift("micropip");
  //installog(2, `Installing python packages ${packages.join(", ")}`);
  installLog(id, 2, `Creating python env`);
  await self.pyodide.loadPackage(pyoPackages);
  installLog(id, 3, `Installing python packages`);
  self.parray = packages;

  await pyodide.runPythonAsync(`
  import micropip
  from js import parray
  await micropip.install(parray.to_py())
  `);

  installLog(id, 4, `Initializing environment`);
  self.parray = undefined;
  const src = `from pyodide.code import eval_code_async
from pyodide.ffi import to_js
from js import console
import sys
async def pyeval(code, ns):
  names = []
  for name in sys.modules.keys():
  	if name.startswith("importable.") or name == "importable":
  		names.append(name)
  for name in names:
  	del sys.modules[name]
  if not "/" in sys.path:
  	sys.path.append("/")
  result = await eval_code_async(code, ns)
  ${transformCode}

  return to_js(result)`
  //console.log("SRC EXEC", src)
  await pyodide.runPythonAsync(src);
  if (initCode.length > 0) {
    await pyodide.runPythonAsync(initCode);
  }

  console.log("Loading JS Utils!")

  installLog(id, 5, "The python env is loaded")
  isPyLoaded = true;
}

function isStillRunning() {
	let state = false; 
	for (let key in webworkerUtils.events) {
		if (webworkerUtils.events[key])
			state = true;
	}
	return state;
}

async function runScript(python, id) {
  try {
    //console.log("Load imports")
    await self.pyodide.loadPackagesFromImports(python);
    //console.log("Run py async")
    //let results = await self.pyodide.runPythonAsync(python);
	  //pyodide.globals.clear();
	  //console.log(pyodide.globals);

	  //let results = pyodide.runPythonAsync(`exec(${python}, {})`)
	 // let results = await pyodide.runPythonAsync(python);

	  //pyodide.PyProxy.new
	      let empty_dict = await self.pyodide.runPythonAsync("{}");

		  //let abc = await window.showDirectoryPicker();
		  console.log("abc!!!");
    let results = await self.pyodide.globals.get("pyeval")(python, empty_dict)
	  empty_dict.destroy();
	 // pyodide.runPythonAsync(`pyeval(${python}, {})`);
	  //console.log("results", results);
    //console.log("End")
	//let isStillRunning =

	if (!isStillRunning())
    {
		webworkerUtils.runningId = 0;
		webworkerUtils.res = {};  
		end(id, results)
	}	
	else
	{
		webworkerUtils.runningId = id; 
		webworkerUtils.res = results; 

	}
	
	
  } catch (error) {
    console.log("PY RUN ERR", error)
    err(id, error.message)
  }
}

function flushMemory() {
  // destroy all user defined variables in the interpreter
  let dict = pyodide.pyimport("dict");
  pyodide.runPython("", dict());
}

self.onmessage = async (event) => {
  const { id, python, ...context } = event.data;
	if (id === "_pyinstaller") {
		await loadPyodideAndPackages(id, context.pyoPackages, context.packages, context.initCode, context.transformCode);
		end(id)
	}
	else if (id === "_write")
	{
		if (context === undefined)
			return;

		console.log("Starting ! name", context.name, " path:", context.path, " python: ", python)


		let _path = context.path.substring(1);
		let _dirs = _path.split("/");
		let value = {};

		let _tmp_path = "/";
		for (let i in _dirs) {
			let _dir = _dirs[i];
			_tmp_path += _dir + "/";
			value = self.pyodide.FS.analyzePath(_tmp_path);
			_tmp_path.replaceAll("//", "/");

			console.log("Temp Path:", _tmp_path)
			if (!value.exists) {
				self.pyodide.FS.mkdir(_tmp_path);

			}
		}

		console.log("I'm here! Write!", context.name, python, "FileSystem:", self.pyodide.FS)
		value = self.pyodide.FS.analyzePath(context.path);
		if (!value.exists) {
			self.pyodide.FS.mkdir(context.path);
			console.log("I'm here2! Creating Path:", context.path)
		}

		let file_path = context.path+context.name;
		file_path.replaceAll("//", "/");
		console.log(`Path for writing! ${file_path}`)

		value = self.pyodide.FS.analyzePath(file_path);
		if (value.exists) {
			self.pyodide.FS.unlink(file_path);
			//self.pyodide.FS.ftruncate(file_path, 0);
			console.log(`[SEARCHING] Path exists: ${file_path}`)
		}

		self.pyodide.FS.writeFile(file_path, python, {encoding: "utf-8"})
		console.log("I'm here3! Write!", context.name, python)
		console.log("I'm here4! Write!", context.name, python)
		end(id);

	}
	else if (id === "_removeFile")
	{
		let value = self.pyodide.FS.analyzePath(context.path);
		if (!value.exists) {
			end(id);
			return;
		}

		let file_path = context.path+context.name;
		file_path.replaceAll("//", "/");

		value = self.pyodide.FS.analyzePath(file_path);
		if (value.exists) {
			self.pyodide.FS.unlink(file_path);
		}

		end(id);

	}
	else if (id === "_removeDir")
	{
		let value = self.pyodide.FS.analyzePath(context.path);
		if (value.exists) {
			self.pyodide.FS.rmdir(context.path);
		}
		end(id);
	}
	else if (id === "_renameFile") {
		let value = self.pyodide.FS.analyzePath(context.srcPath);
		if (!value.exists) {
			end(id);
			return;
		}

		let srcPath = context.srcPath+context.srcName;
		srcPath.replaceAll("//", "/");


		value = self.pyodide.FS.analyzePath(context.dstPath);
		if (!value.exists) {
			self.pyodide.FS.mkdir(context.dstPath);
		}

		let dstPath = context.dstPath + context.dstName;
		dstPath.replaceAll("//", "/");

		self.pyodide.FS.rename(srcPath, dstPath);

		end(id);
	}
	else if (id === "_renameDir") {
		let value = self.pyodide.FS.analyzePath(context.srcPath);
		if (!value.exists) {
			end(id);
			return;
		}

		self.pyodide.FS.rename(context.srcPath, context.dstPath);

		end(id);
	}
	else if (id === "_setDirectoryHandle") {
		console.log("_setDirectoryHandle", context.handle)
		//webworkerUtils.directoryHandle = context.handle;

		if (webworkerUtils.events.directoryHandle) {
			await webworkerUtils.events.directoryHandle(context.handle);
			webworkerUtils.events.directoryHandle = undefined;
		
			if (!isStillRunning()) {
				end(webworkerUtils.runningId, webworkerUtils.res); 
			}
		}
		
	}
	else if (id === "_setFileHandle") {
		console.log("_setFileHandle", context.handle, "fileHandle:", webworkerUtils.events.fileHandle)

		if (webworkerUtils.events.fileHandle) {
			console.log("FileHandle before!")

			await webworkerUtils.events.fileHandle(context.handle);

			console.log("FileHandle callign!")


			webworkerUtils.events.fileHandle = undefined;
			if (!isStillRunning()) {
				end(webworkerUtils.runningId, webworkerUtils.res); 
			}

		}
	}	
	else if (id === "_setOpenFilePickerHandle") 
	{
		console.log("_setOpenFilePickerHandle", context.handle, "fileHandle:", webworkerUtils.events.fileHandle)

		if (webworkerUtils.events.filePickerHandle) {
			console.log("filePickerHandle before!")

			await webworkerUtils.events.filePickerHandle(context.handle);

			console.log("filePickerHandle calling!")


			webworkerUtils.events.filePickerHandle = undefined;
			if (!isStillRunning()) {
				end(webworkerUtils.runningId, webworkerUtils.res); 
			}

		}


	}
  else if (id == "setInterruptBuffer")
  {
    self.pyodide.setInterruptBuffer(context.interruptBuffer);
	//end(id);
  }
  else if (id == "interrupt") {
	self.pyodide.checkInterrupt();
  }
  else if (id === "setFS") {
	self.pyodide.FS = context.fs;

  } 
  else  {

    // The worker copies the context in its own "memory" (an object mapping name to values)
    for (const key of Object.keys(context)) {
		//if (key === "showSaveFilePicker" || key === "showDirectoryPicker")
      	//	continue;
		self[key] = context[key];
    }
    if (!isPyLoaded) {
      //await loadPyodideAndPackages(id, []);
      throw new Error("Python is not loaded")
    }
	//flushMemory();
	  //flushMemory();

		console.log("Functions:", context.showSaveFilePicker, " other", context.showDirectoryPicker)


		await self.pyodide.registerJsModule("js_utils", webworkerUtils);

		
		await runScript(python, id)
  }

};
