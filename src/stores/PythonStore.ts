import { ref } from 'vue'; 
import { defineStore } from 'pinia'
import { usePython} from "usepython";

export const usePythonStore = defineStore('python', () => {
	const py = usePython();


	const onLog = ref<Function>(null); 
	const onError = ref<Function>(null); 
	const onRun = ref<Function>(null); 

	const code = ref<string>(''); 

	function setCode(_code: string) {
		code.value = _code; 
	}

	function getCode() {
		if (code.value)
			return code.value.substring(0, code.value.length - 1);

		return code.value;
	}

	async function init(onLogCallback: Function, onErrorCallback: Function, onRunCallback: Function) {
		console.log("on init!")
		onLog.value = onLogCallback; 
		onError.value = onErrorCallback; 
		onRun.value = onRunCallback; 

		py.log.listen((val) => {
			if (val.exception.length == 0)
			{
				for (let entry in val.stdOut) {
					if (onLog.value)
						onLog.value(val.stdOut[entry]);
				}
				console.log("LOG", val.stdOut);
				// val.stdErr is also available
			}
			else
			{
				console.log("Exception:", val.exception)

				if (onError.value)
					onError.value(val.exception);
			}
		});

		//isLoading.value = false;
	}

	async function run(code: string) {
		await py.run(code);
	}

	let runScript = function (code: string){
		let extraCode = "from scriptor import print, init as __scriptor__init\nawait __scriptor__init()\n";
		if (code.includes("async def main():"))
			code += "\nawait main()"

		if (onRun.value) {
			console.log("On run event!!!"); 
			onRun.value();

		}

		py.run(extraCode + code).then(() => {});
	};


	return { py, run, setCode, getCode, init, runScript }
})
