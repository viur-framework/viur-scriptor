<template>

	<sl-split-panel class="main-split" position-in-pixels="200">
		<div slot="start" class="split-start">

			<h1 class="header">Script0r</h1>

			<div class="search-wrap">
				<sl-input @input="searchText" size="small"></sl-input>
				<sl-button size="small">
					<sl-icon name="search"></sl-icon>
				</sl-button>
			</div>

			<sl-tab-group class="tab-group">
			  <sl-tab slot="nav" panel="files">Datei-Browser</sl-tab>
			  <sl-tab slot="nav" panel="data" @click="selectTab">Datenbank-Felder</sl-tab>

			  <sl-tab-panel name="files">
				  <FileTree ref="tree" v-if="executor" :executor="executor" :on-select-item="clearLog" :manager="manager" :unsaved="unsaved"/>
			  </sl-tab-panel>
			  <sl-tab-panel name="data">

			  <div class="data-detail-scroll">
				  <div v-for="module in modules">

					<div v-if="module.handler.startsWith('tree')">
					  <ModuleDetails :name="module.name" group="node"></ModuleDetails>
					  <ModuleDetails :name="module.name" group="leaf"></ModuleDetails>

					</div>
					<div v-else>
					  <ModuleDetails :name="module.name"></ModuleDetails>

					</div>
				  </div>
			  </div>

			  </sl-tab-panel>
			</sl-tab-group>

		</div>
		<div v-show="manager.isOpen.value" slot="end" class="split-end">
			<sl-tab-group class="tabs-closable">
			  <sl-tab slot="nav" panel="tab-1" closable>Tab 1</sl-tab>
			  <sl-tab slot="nav" panel="tab-2" closable>Tab 2</sl-tab>
			  <sl-tab slot="nav" panel="tab-3" closable>Tab 3</sl-tab>

			  <sl-tab-panel name="tab-1">
				  <sl-split-panel class="side-split" vertical >
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
			  </sl-tab-panel>
			  <sl-tab-panel name="tab-2">This is the second closable tab panel.</sl-tab-panel>
			  <sl-tab-panel name="tab-3">This is the third closable tab panel.</sl-tab-panel>
			</sl-tab-group>


		</div>
	</sl-split-panel>

	<footer class="footer">

		<sl-button v-if="executor" size="small" @click="saveScript" variant="white" >
			Save

			<sl-badge v-if="unsaved" pill pulse>1</sl-badge>
		</sl-button>
		<sl-button v-if="executor" size="small" @click="executor.executeScript" variant="primary" >Run</sl-button>
	</footer>

</template>

<script lang="ts">

import {computed, ref, onBeforeMount, onMounted, watch} from 'vue';
import '@viur/viur-shoelace/dist/components/details-group/details-group.js';
import FileTree from "./FileTree.vue";
import PythonExecutor from "./PythonExecutor.vue";
import LoadingSpinner from "./common/LoadingSpinner.vue";
import {SlIcon, SlTabPanel} from "@viur/viur-shoelace";
import {SlButton} from "@viur/viur-shoelace";
import {usePythonStore} from "../PythonStore";
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import {Request} from "@viur/viur-vue-utils";
import ModuleDetails from "./ModuleDetails.vue";

export default {
  name: 'Home',
  components: {PythonExecutor, FileTree, LoadingSpinner, VueJsonPretty, ModuleDetails},
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


    const secondTab = ref<SlTabPanel>();

    onMounted(function(){
      watch(secondTab.value, function(value, oldValue, onCleanup){
        if (secondTab.value.active) {
          console.log("Switched to tab A!")
        }
      })
    })

    function selectTab(event: UIEvent) {
      if (event.target) {

        console.log("Hello!!")
        console.log("Element is active:", event.target.active, event.target)
      }
    }
    let modules = ref([]);

    onBeforeMount(async function(){
      let answ = await Request.get(`/vi/config`);
      let data = await answ.json();
      for (let index in data.modules) {
        let moduleEntry = data.modules[index];
        modules.value.push(
            {
              name: moduleEntry.name,
              handler: moduleEntry.handler
            }
        );

      }
    })

    function searchText(event: UIEvent){
      if (tree.value) {
        tree.value.tree.search(event.target.value);
      }
    }


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
		  getThemeByLevel,
      selectTab,
      modules,
      searchText
    }
  }
}
</script>


<style scoped lang="less">

.footer{
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  background-color: @mainColor;
  padding: 10px;
  z-index: 1;
  position: relative;

  sl-button{
	margin-left: 10px;

	&::part(base){
	  font-size: .95em;
	  height: 32px;
	}
  }
}

.header{
  width: 100%;
  background-color: @mainColor;
  color: #fff;
  margin: 0 auto 0 0;
  font-weight: 700;
  z-index: 1;
  padding: 10px 15px 15px 15px;
}

.log-format {
  color: green;
}

.main-split{
  height: calc(100% - 50px);
  --min: 300px;
  --max: 500px;
}

.side-split{
  height: 100%;
  background-color: #fff;
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

.tab-group{
  height: 0;
  flex: 1;

  &::part(base){
	height: 100%;
	border: none;
  	background-color: #fff;
  }

  &::part(nav){
	background-color: @mainColor;
	border: none;
  }

  &::part(tabs){
	border: none;
  }

  &::part(body){
	height: 100%;
	border: none;
	overflow-y: hidden;
  }

  sl-tab {
	border: none;

	&::part(base) {
	  padding: 10px 15px;
	  color: #fff;
	  border: none;
	}

	&[aria-selected="true"]{
	  background-color: #fff;
	  &::part(base) {
		color: @mainColor !important;
	  }
	}
  }

  sl-tab-panel{
	height: 100%;

	&::part(base){
	  height: 100%;
	  padding: 0;
	}

	&[aria-hidden="true"]{
	  display: none;
	}
  }

  :deep(.fileTree){
	overflow-y: auto;
	height: calc(100% - 56px);
  }
}

.data{
  display: flex;
  flex-direction: column;
  padding: 15px;
}

.data-name{
  color: @mainColor;
  font-weight: bold;
  margin-bottom: 5px;
}

.data-type{
  margin-bottom: 10px;
  font-size: .9em;
}

.data-code{
  background-color: #f4f4f4;
  padding: 5px;
}

.data-detail{
  &::part(base){
	overflow: hidden;
  }
  &::part(header){
	padding: 15px;
	box-shadow: 0 0 10px 0 rgba(0, 0, 0, .25);
  }
  &::part(prefix){
	display: none;
  }
  &::part(content){
	padding: 0;
  }
}

.search-wrap{
  width: 100%;
  background-color: @mainColor;
  padding: 0 15px 15px 15px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;

  sl-button{
	&::part(base){
	  border-top-left-radius: 0;
	  border-bottom-left-radius: 0;
	  aspect-ratio: 1;
	}
  }

  sl-input{
	flex: 1;

	&::part(base){
	  border-top-right-radius: 0;
	  border-bottom-right-radius: 0;
	}
  }
}

.tabs-closable{
  --track-width: 0;

  height: 100%;

  &::part(base){
	height: 100%;
	background-color: var(--sl-color-neutral-100);
  }

  &::part(body){
	height: 100%;
	overflow-y: hidden;
  }

  sl-tab{

  &::part(base){
    display: flex;
    padding: 5px 12px;
  }

  &::part(close-button){
    opacity: .5;
    font-size: 1.2em;
    margin: 0 -6px 0 5px;
    transition: all ease .3s;
  }

  &:hover{
    &::part(close-button){
      opacity: 1;
    }

    &::part(base){
      color: @mainColor;
    }
  }

	&[aria-selected="true"]{
	  background-color: #fff;

	  &::part(base){
		color: @mainColor;
	  }
	}
  }

  sl-tab-panel{
	height: 100%;

	&::part(base){
	  height: 100%;
	  padding: 0;
	  background-color: transparent;
	}

	&[aria-hidden="true"]{
	  display: none;
	}
  }

}

.data-detail-scroll{
  height: 100%;
  overflow-y: auto;
}
</style>