<template>

	<header class="head">
		<h1 class="header">Script0r</h1>

		<sl-button v-if="executor" @click="saveScript" variant="success" >
			Save

			<sl-badge v-if="unsaved" pill pulse>1</sl-badge>
		</sl-button>
		<sl-button v-if="executor" @click="executor.executeScript" variant="primary" >Run</sl-button>
	</header>

	<sl-split-panel class="main-split">
		<div slot="start" class="split-start">

			<FileTree ref="tree" v-if="executor" :executor="executor" :on-select-item="clearLog" :manager="manager" :unsaved="unsaved"/>

		</div>
		<div v-show="manager.isOpen.value" slot="end" class="split-end">
			<sl-split-panel class="side-split" vertical>
				<div slot="start" class="split-top">
					<PythonExecutor :log="logStdout" :onerror="logError" :onrun="clearLog" ref="executor" :onChangeCode="onChangeCode" :manager="manager"/>
				</div>
				<div slot="end" class="split-bottom">
					<ul v-if="error.length <= 0" class="logging">
						<div v-for="entry in log">
							<div>
							<li class="alert-print">
								<sl-alert class="alert-print" :variant="entry.level" open>
									<sl-icon class="log-child" slot="icon" name="info-circle"></sl-icon>
									<div v-if="entry.json">
										<vue-json-pretty :data="entry.value" :deep="1" :showDoubleQuotes="false" :showIcon="true" :showLine="false" />
									</div>
									<div v-else>
										<pre class="alert-child log-child log-child-text">
										<code>
											{{ entry['value'] }}
										</code>
									</pre>
									</div>
								</sl-alert>

							</li>
							</div>
						</div>
					</ul>
					<div v-else class="logging">
						<sl-alert class="danger-print" variant="danger" open>
							<pre class="error-format">{{ error }}</pre>
						</sl-alert>
					</div>
				</div>
			</sl-split-panel>
		</div>
	</sl-split-panel>


</template>

<script lang="ts">

import {computed, ref, onBeforeMount} from 'vue';
import '@viur/viur-shoelace/dist/components/details-group/details-group.js';
import FileTree from "./FileTree.vue";
import PythonExecutor from "./PythonExecutor.vue";
import LoadingSpinner from "./common/LoadingSpinner.vue";
import {SlIcon} from "@viur/viur-shoelace";
import {SlButton} from "@viur/viur-shoelace";
import {usePythonStore} from "../PythonStore";
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';


export default {
  name: 'Home',
  components: {PythonExecutor, FileTree, LoadingSpinner, VueJsonPretty},
  setup() {
	const executor = ref();
    const log = ref([]);
	const error = ref("");
	const unsaved = ref<boolean>(false);
	const isLoading = ref<boolean>(false);
	const logStdout = function(value: string){
		log.value.push({
			type: "print",
			value: formatString(value),
			time: Date.now(),
			level: "neutral",
			json: isJsonString(value),
		})
	}

	const pythonStore = usePythonStore();

	const clearLog = function(){
		log.value = [];
		error.value = "";
	}

	  function isJsonString(str: string) {
		  try {
			  let obj = JSON.parse(str);
			  if (obj.constructor == Object)
				  return true;
			  else
				  return false;

		  } catch (e) {
			  return false;
		  }
		  return true;
	  }

	  function formatString(str: string) {
		if (isJsonString(str)) {
			let obj = JSON.parse(str);
			if (obj.constructor == Object)
				return obj;
		 }

		  return str;
	  }

	const logError = function(value: string){

		error.value = value;
	}

	function onChangeCode(value: boolean){
		unsaved.value = value;
	}

	let manager = {
		isOpen: ref<boolean>(false),

		showMirror: function () {
			manager.isOpen.value = true;
		},
		hideMirror: function () {
			manager.isOpen.value = false;
		},

		isOpenMirror: computed(function(){
			return manager.isOpen.value;
		}),

		save: function(){
			unsaved.value = false;
		},

		isUnsaved: function(){
			return unsaved.value;
		}

	}

	let tree = ref<FileTree>();

	function saveScript(){
		if (!unsaved.value)
			return;

		if (tree.value){
			tree.value.helper.saveCode(executor.value.getCode(), function(){
				unsaved.value = false;
			});
		}
	}

	  function getThemeByLevel(level: string) {

		  console.log("level", level);
		  switch (level)
		  {
			  case "debug": return "neutral";
			  case "error": return "danger";
			  case "warning": return "warning";
			  case "info": return "info";
		  }
		  return "";
	  }

	  pythonStore.py.pyLogging.listen((val) => {
		  console.log("pyloggign: ", val);


			  let entry = val[val.length - 1];
			  console.log(`Pushing Data:${entry.level} value ${entry.text} `)


			  log.value.push({
				  type: entry.level,
				  level: computed(()=>{
					  return getThemeByLevel(entry.level);
				  }),
				  value: formatString(entry.text),
				  time: Date.now(),
				  json: isJsonString(entry.text),
			  })

	  })




	  return {
      log,
	  logStdout,
		logError,
      executor,
      clearLog,
		error,
		unsaved,
		onChangeCode,
		manager,
		saveScript,
		tree,
		isJsonString,
		isLoading,
		  getThemeByLevel
    }
  }
}
</script>

<style scoped lang="less">

.head{
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 15px;
  z-index: 1;
  position: relative;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, .2);
  min-height: 73px;
  max-height: 73px;

  sl-button{
	margin-left: 10px;
  }
}

.header{
  margin: 0 auto 0 0;
  font-family: Miriam, serif;
  font-weight: 700;
}

.log-format {
  color: green;
}

.main-split{
  height: calc(100% - 73px);
}

.side-split{
  height: 100%;
}

.split-start{
  height: 100%;
  display: flex;
  flex-direction: column;
}

.split-end{
  height: 100%;
}

.split-top{
  height: 100%;
}

.split-bottom{
  height: 100%;
}

:deep(.cm-editor){
  height: 100%;
}
.logging {
  width: 100%;
  height: 100%;
  list-style-type: None;
  overflow: auto;
  padding: 20px;
  margin: 0;

  sl-alert{
	margin-bottom: 15px;

	&::part(message){
		padding: 0 15px 0 5px;
  	}

	&::part(icon){
		font-size: 1em;
	  	padding-left: 15px;
  	}
  }
}

div.cm-content {
  flex-grow: 0;
}
.cm-line {
  flex-grow: 0;
}

.error-format {
  margin-left: 10px;
  height: 80%;
  width:80%;
}

.danger-print {
  overflow: auto;
  width: 100%;
  height: 80%;
}

.log-child {
  display: inline-block;
  margin-right: 5px;
}

.log-child-text {
  margin-left: 5px;
  white-space: normal;
  word-break: break-word;

}

</style>
