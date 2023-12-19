import {useGlobalStore} from './global';
import {ref} from 'vue';
import {defineStore} from 'pinia'
import {usePython} from "usepython";
import {useTabStore} from './TabStore';


interface PyEvents {
    logCallback: Function,
    errorCallback: Function,
    runCallback: Function
}

export const usePythonStore = defineStore('python', () => {
    const tabStore = useTabStore();

    const py = usePython();


    py.log.listen((val) => {
        if (val.exception.length == 0) {
            for (let entry in val.stdOut) {
                if (scriptRunnerTab.value) {
                    let onLog = eventMap.value[scriptRunnerTab.value].logCallback;
                    if (onLog)
                        onLog(val.stdOut[entry]);
                }
            }
            console.log("LOG", val.stdOut);
            // val.stdErr is also available
        } else {
            console.log("Exception:", val.exception)


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
        console.log("on init!")
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

    let runScript = function (code: string) {
        let extraCode = "from scriptor import print, init as __scriptor__init\nawait __scriptor__init()\n";
        if (code.includes("async def main():"))
            code += "\nawait main()"

        if (py.isExecuting.get() === true)
            return;

        let tabName = tabStore.tabMap[tabStore.selectedTab].name;

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

        scriptRunnerTab.value = tabStore.selectedTab;
        isExecuting.value = true;

        if (scriptRunnerTab.value) {
            console.log(eventMap.value, scriptRunnerTab.value)
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

    async function loadPython() {
        isLoading.value = true;

        await py.load();

        let baseUrl: string = "";
        if (import.meta.env.VITE_API_URL)
            baseUrl = `${import.meta.env.VITE_API_URL}`;
        else
            baseUrl = `${window.location.origin}`;

        await py.run(`with open("config.py", "w") as f:\n\tf.write("BASE_URL='${baseUrl}'")`)

        const zipUrl = new URL('../assets/scriptor.zip', import.meta.url).href

        console.log("zipUrl:", zipUrl);

        // Loading scriptor library
        await py.run(`
		  from pyodide.http import pyfetch
		  response = await pyfetch("${zipUrl}")
		  await response.unpack_archive()
	   `)

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

        global.setLoading(false);

    }


    return {
        py,
        run,
        setCode,
        getCode,
        init,
        runScript,
        loadPython,
        reloadPyodide,
        isLoading,
        scriptRunnerTab,
        isExecuting,
        runningText
    }
})
