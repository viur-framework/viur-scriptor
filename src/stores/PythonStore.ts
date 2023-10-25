import { useGlobalStore } from './global';
import { ref } from 'vue';
import { defineStore } from 'pinia'
import { usePython} from "usepython";
import { useTabStore } from './TabStore';
import { useRoute } from 'vue-router';


interface PyEvents
{
	logCallback: Function,
	errorCallback: Function,
	runCallback: Function
}

export const usePythonStore = defineStore('python', () => {
	const tabStore = useTabStore();
	const global = useGlobalStore();
	const py = usePython();



	py.log.listen((val) => {
		if (val.exception.length == 0)
		{
			for (let entry in val.stdOut) {
				if (scriptRunnerTab.value) {
					let onLog = eventMap.value[scriptRunnerTab.value].logCallback;
					if (onLog)
						onLog(val.stdOut[entry]);
				}
			}
			// val.stdErr is also available
		}
		else
		{


			if (scriptRunnerTab.value) {
				let onError = eventMap.value[scriptRunnerTab.value].errorCallback;
				if (onError)
					onError(val.exception);
				scriptRunnerTab.value = "";
			}

			isExecuting.value = false;
		}
	});


	const isLoading = ref<boolean>(true);
	const isExecuting = ref<boolean>(false);
	const eventMap = ref<Record<string, PyEvents>>({});

	const runningText = ref<String>("");



	const code = ref<string>('');
	const scriptRunnerTab = ref<string>('');

	function setCode(_code: string) {
		code.value = _code;
	}

	function getCode() {
		if (code.value)
			return code.value.substring(0, code.value.length - 1);

		return code.value;
	}



	async function init(key: string, onLogCallback: Function, onErrorCallback: Function, onRunCallback: Function) {
		eventMap.value[key] = {
			logCallback: onLogCallback,
			errorCallback: onErrorCallback,
			runCallback: onRunCallback,
		}

		//isLoading.value = false;
	}

	async function run(code: string) {
		await py.run(code);
	}

	const timer = ref<NodeJS.Timer>();
	const defaultCode = "#### scriptor ####\nfrom scriptor import dialog\n\nasync def main():\n    await dialog.alert(\"Hello World\")";

	let runScript = function (code: string, name: string = undefined, key: string = undefined){
		let extraCode = "from scriptor import message\nmessage.called=False\nimport traceback\nfrom viur.scriptor import print,logging, init as __scriptor__init\nawait __scriptor__init()\n";
		if (code.includes("async def main():"))
			code += "\ntry:\tawait main()\nexcept:\n\tlogging.error(traceback.format_exc())"

		if (py.isExecuting.get() === true)
			return;

		py.sendLanguage(global.language)

		let tabName = "";

		if (name)
			tabName = name;
		else
			tabName = tabStore.tabMap[tabStore.selectedTab].name;

		runningText.value = "Running " + tabName + " ";

		if (timer.value)
			clearInterval(timer.value);

		timer.value = setInterval(() => {
			runningText.value += "..";

			let _count = runningText.value.split(".").length - 1 - 1;
			if (_count >= 30) {
				runningText.value = runningText.value.replace(".", ",");
				runningText.value = runningText.value.replaceAll(".", "");
				runningText.value = runningText.value.replace(",", ".");

			}
		}, 150)

		if (key)
			scriptRunnerTab.value = key;
		else
			scriptRunnerTab.value = tabStore.selectedTab;

		isExecuting.value = true;

		if (scriptRunnerTab.value) {
			let onRun = eventMap.value[scriptRunnerTab.value].runCallback;
			if (onRun)
				onRun();
		}

		py.pyLogging.set([]);
		py.pyDialogs.set([]);

		py.run(extraCode + code).then(() => {
			scriptRunnerTab.value = "";

			isExecuting.value = false;
		});
	};

	const route = useRoute();

	async function loadPython() {
		isLoading.value = true;
		const zipUrl2 = new URL("../assets/viur_scriptor_api-0.0.6-py3-none-any.whl", import.meta.url).href

		await py.load([zipUrl2]);

		let baseUrl: string = "";
		if (import.meta.env.VITE_API_URL)
			baseUrl = `${import.meta.env.VITE_API_URL}`;
		else
			baseUrl = `${window.location.origin}`;

		await py.run(`with open("config.py", "w") as f:\n\tf.write("BASE_URL='${baseUrl}'")`)

		const zipUrl = new URL('../assets/scriptor.zip', import.meta.url).href

		// Loading scriptor library
		await py.run(`
		  from pyodide.http import pyfetch
		  response = await pyfetch("${zipUrl}")
		  await response.unpack_archive()
	   `)



		let object = {};


		if (route.query["scriptor_params"]) {

			if (typeof route.query.scriptor_params === 'string')
			{
				try {
					let _string = route.query.scriptor_params.replace(/'/g, '"');;
					object = JSON.parse(_string)
				}
				catch(error) {
					console.error(error)
				}
			}
			else
			{
				object = route.query.scriptor_params;
			}
		}

	   await py.sendParams(object)
	   await py.sendLanguage(global.language);

	   isLoading.value = false;

	}

	async function reloadPyodide() {
		isExecuting.value = false;

		const global = useGlobalStore();

		global.setLoading(true);
		if (timer.value)
			clearInterval(timer.value);

		scriptRunnerTab.value = "";

		py.destroyAndCreateWorker();

		await loadPython();

		await py.restoreFS();
	   	await py.sendLanguage(global.language);

		global.setLoading(false);

	}


	return { py, run, setCode, getCode, init, runScript, loadPython, reloadPyodide, isLoading, scriptRunnerTab, isExecuting, runningText, defaultCode }
})
