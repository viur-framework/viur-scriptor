import worker from 'web-worker:./webworker.js';
import { pyLog, pyLogging, pyExecState, pyInstallLog, isPyExecuting, isPyReadyState, isPyReady } from "./store";

/** The main composable */
const usePython = () => {
  const _pyodideWorker = new worker();
  let _callback: (value: {
    results: any;
    error: any;
  } | PromiseLike<{
    results: any;
    error: any;
  }>) => void = (v) => null;

  function _dispatchEvent(id: string, data: Record<string, any>) {
    switch (data.type) {
      case "end":
        _callback({ results: data.res, error: null })
        _callback = (v) => null
        pyExecState.set(0);
        break;
      case "err":
        _callback = (v) => null
        pyExecState.set(0);
        pyLog.setKey("exception", data.msg)
        break;
      case "installlog":
        pyInstallLog.setKey("stage", data.msg.stage);
        pyInstallLog.setKey("msg", data.msg.msg);
        break;
      case "stderr":
        //console.log("STDERR:", data.msg)
        pyLog.get().stdErr.push(data.msg);
        pyLog.notify();
        break;
      case "stdout":
        //console.log("STDOUT:", data.msg)
		  pyLog.get().stdOut = [];
        pyLog.get().stdOut.push(data.msg);
        pyLog.notify();
        //pyLog.setKey("stdOut", [...pyLog.get().stdOut, data.msg])
        break;

	   case "download":
		   var url = window.URL.createObjectURL(data["blob"]);
		   var downloadLink = document.createElement("a");
		   downloadLink.href = url;
		   downloadLink.download = data["filename"];
		   document.body.appendChild(downloadLink);
		   downloadLink.click();
		   document.body.removeChild(downloadLink);
		break;
		case "log":
			pyLogging.get().push({
				text: data.text,
				level: data.level
			})
			pyLogging.notify();
			break;
      default:
        pyExecState.set(0);
        throw new Error(`Unknown event type ${data.type}`)
    }
  }

  _pyodideWorker.onmessage = (event) => {
    const { id, ...data } = event.data;
    //console.log("=> msg in:", id, ":", data);
    _dispatchEvent(id ?? "", data)
  };

  function _processTransformCode(code: string): string {
    if (code.startsWith('\n')) {
      code.replace('\n', '')
    }
    const li = code.split("\n");
    const buf = new Array<string>();
    li.forEach((el) => {
      buf.push('  ' + el)
    });
    return buf.join("\n")
  }

  /** Load the Python runtime */
  async function load(pyoPackages: Array<string> = [], packages: Array<string> = [], initCode = "", transformCode = ""): Promise<{ results: any, error: any }> {
    let res: { results: any; error: any };
    try {
      res = await run("", "_pyinstaller", {
        pyoPackages: pyoPackages,
        packages: packages,
        initCode: initCode,
        transformCode: _processTransformCode(transformCode)
      });
    } catch (e) {
      throw new Error(
        // @ts-ignore
        `Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`
      );
    }
    isPyReadyState.set(1);
    return res
  }

  /** Run a Python script
   * @param id the script id
   * @param script the Python code to run
   * @param context some context data to pass to the runtime
   */
  async function run(script: string, id?: string, context: Record<string, any> = {}): Promise<{ results: any, error: any }> {
    if (pyExecState.get() === 1) {
      throw new Error("Only one python script can run at the time")
    }
    pyExecState.set(1);
    // reset logger
    const _id = id ?? (+ new Date()).toString();
    pyLog.set({
      id: _id,
      stdOut: [],
      stdErr: [],
      exception: "",
		logging: [],
    });
    // exec
    return new Promise((onSuccess) => {
      _callback = onSuccess;
      _pyodideWorker.postMessage({
        id: _id,
        python: script,
        ...context,
      });
    });
  }

  async function write(path: string, name: string, python: string): Promise<{ results: any, error: any }> {
	  let context = {
		  name: name,
		  path: path,

	  }

    return new Promise((onSuccess) => {
      _callback = onSuccess;
      _pyodideWorker.postMessage({
        id: "_write",
        python: python,
        ...context,
      });
    });
  }

  async function removeFile(path: string, name: string): Promise<{ results: any, error: any }> {
	  let context = {
		  name: name,
		  path: path,

	  }

    return new Promise((onSuccess) => {
      _callback = onSuccess;
      _pyodideWorker.postMessage({
        id: "_removeFile",
        ...context,
      });
    });
  }

  async function removeDir(path: string,): Promise<{ results: any, error: any }> {
	  let context = {
		  path: path,

	  }

    return new Promise((onSuccess) => {
      _callback = onSuccess;
      _pyodideWorker.postMessage({
        id: "_removeDir",
        ...context,
      });
    });
  }

	async function renameFile(srcPath: string, srcName: string, dstPath: string, dstName: string): Promise<{ results: any, error: any }> {
		let context = {
			srcPath: srcPath,
			srcName: srcName,
			dstPath: dstPath,
			dstName: dstName,

		}

		return new Promise((onSuccess) => {
			_callback = onSuccess;
			_pyodideWorker.postMessage({
				id: "_renameFile",
				...context,
			});
		});
	}

	async function renameDir(srcPath: string, dstPath: string,): Promise<{ results: any, error: any }> {
		let context = {
			srcPath: srcPath,
			dstPath: dstPath,
		}

		return new Promise((onSuccess) => {
			_callback = onSuccess;
			_pyodideWorker.postMessage({
				id: "_renameDir",
				...context,
			});
		});
	}

  return {
    load,
    run,
    /** The install log store */
    installLog: pyInstallLog,
    /** The runtime log store */
    log: pyLog,
    /** The execution state atom */
    isExecuting: isPyExecuting,
    /** The ready state atom */
    isReady: isPyReady,
	  pyLogging: pyLogging,
	  write,
	  removeFile,
	  removeDir,
	  renameFile,
	  renameDir

  }
}

export { usePython }
