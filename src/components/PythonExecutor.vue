<template>
	<CodeMirrorThing :onchange="onchange" :onChangeCode="props.onChangeCode" ref="mirror"/>
  	<LoadingSpinner :show="isExecuting"></LoadingSpinner>
</template>

<script lang="ts">
import CodeMirrorThing from "./CodeMirrorWrapper.vue";
import LoadingSpinner from "./common/LoadingSpinner.vue";
import scripterFile from '../assets/scripter.py?raw';
import {onBeforeMount, onMounted, ref, watch} from "vue";
import { usePython } from "usepython";
import {Request} from "@viur/viur-vue-utils";

import {usePythonStore} from "../PythonStore";

export default {
	name: "PythonExecutor",
	components: {
		CodeMirrorThing,
		LoadingSpinner
	},
	props: {
		log: Function,
		onrun: Function,
		onerror: Function,
		onChangeCode: Function,
	},
	setup(props){
		const code = ref("");
		const pythonStore = usePythonStore();
		const isLoading = ref(true);
		const isExecuting = ref(false);
		const mirror = ref<CodeMirrorThing>();

		async function init() {
			pythonStore.py.log.listen((val) => {
				if (val.exception.length == 0)
				{
					for (let entry in val.stdOut) {
						props.log(val.stdOut[entry]);
					}
					console.log("LOG", val.stdOut);
					// val.stdErr is also available
				}
				else
				{
					console.log("Exception:", val.exception)
					if (isLoading.value)
						isLoading.value = false;

					if (isExecuting.value)
						isExecuting.value = false;

					props.onerror(val.exception);
				}
			});

			isLoading.value = false;
		}

		onBeforeMount( async function(){
			await init();
		})


		let executeScript = function (){
			isExecuting.value = true;

			try {
				props.onrun();
				pythonStore.py.run(code.value).then(() => {
					console.log("Abc")
					isExecuting.value = false;
				});
			}
			catch (err){
				isExecuting.value = false;
			}

		};

		let onchange = function(text){
			code.value = text;
		}

		function getCode(){
			if (code.value)
				return code.value.substring(0, code.value.length - 1);

			return code.value;
		}



		return {
			onchange,
			executeScript,
			isLoading,
			mirror,
			isExecuting,
			props,
			getCode
		}
	}
}
</script>

<style scoped>

</style>
