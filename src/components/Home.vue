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
			  <sl-tab slot="nav" panel="data" >Datenbank-Felder</sl-tab>

			  <sl-tab-panel name="files">
				  <FileTree ref="tree" :tabGroup="tabGroup" :manager="manager" :unsaved="unsaved"/>
			  </sl-tab-panel>
			  <sl-tab-panel name="data">

				<div class="data-detail-scroll">
					<div v-for="(module, index) in modules" :key="index">

						<div v-if="module.handler.startsWith('tree.node') || module.handler.startsWith('hierarchy') ">
							<ModuleDetails :name="module.name" group="node"></ModuleDetails>
						</div>
						<div v-else-if="module.handler.startsWith('tree')">
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
		<div slot="end" class="split-end">
			<sl-tab-group ref="tabGroup" class="tabs-closable">

				<sl-tab slot="nav" @sl-close="() => closeTab(key)" @click="() => selectTab(key)" closable="true" v-for="(tab,key) in tabStore.tabMap" :panel="key" :key="key">{{tab.name}}
				</sl-tab>

				<sl-tab-panel v-for="(tab,key) in tabStore.tabMap" :panel="key" :key="key" :name="key">

					<sl-split-panel class="side-split" vertical >
						<div slot="start" class="split-top">
							<CodeEditor :keyValue="'' + key"/>
						</div>
						<div slot="end" class="split-bottom">
							<CodeTab :keyValue="key"></CodeTab>
						</div>
					</sl-split-panel>
				</sl-tab-panel>

			</sl-tab-group>


		</div>
	</sl-split-panel>

	<footer class="footer">



		<sl-badge v-show="pythonStore.isExecuting" variant="success" pulse>{{  pythonStore.runningText }}</sl-badge>


		<sl-button v-show="!pythonStore.isExecuting" size="small" @click="saveScript" variant="white" >
			Save
		</sl-button>
		<sl-button v-show="!pythonStore.isExecuting" size="small" @click="runScript" variant="primary">
			Run

		</sl-button>
		<sl-button v-show="pythonStore.isExecuting" size="small" @click="interruptCode" variant="primary">Cancel</sl-button>
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
import {usePythonStore} from "../stores/PythonStore";
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import {Request} from "@viur/viur-vue-utils";
import ModuleDetails from "./ModuleDetails.vue";
import CodeEditor from "./CodeEditor.vue";
import { useTabStore } from '@/stores/TabStore';
import { clear } from 'console';
import LogEntry from './LogEntry.vue'
import CodeTab from './CodeTab.vue';



export default {
  name: 'Home',
  components: {CodeTab, CodeEditor, FileTree, LoadingSpinner, VueJsonPretty, ModuleDetails, LogEntry},
  setup() {
	const executor = ref();
	const log = ref([]);
	const logItems = ref([]);
	const error = ref("");
	const unsaved = ref<boolean>(false);
	const isLoading = ref<boolean>(false);
	const pythonStore = usePythonStore();
	const tabStore = useTabStore();


	const logError = function(value: string){
		error.value = value;
	}

	function onChangeCode(value: boolean){
		unsaved.value = value;
	}

	function closeTab(key: string) {
		tabStore.removeTab(key);
	}

	function selectTab(key: string) {
		tabStore.selectTab(key);
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
	let tabGroup = ref<tabGroup>();

	onMounted(() => {
		tabStore.tabGroup = tabGroup.value;
	});

	function saveScript(){
		//if (!unsaved.value)
		//	return;

		if (tree.value){
			if (tabStore.selectedTab in tabStore.tabMap) {
				tree.value.helper.saveCode(tabStore.selectedTab, tabStore.getTabCode(tabStore.selectedTab), function(){
					//unsaved.value = false;
				});
			}
		}
	}

	function runScript(){
		if (tabStore.selectedTab) {
			let content = tabStore.tabMap[tabStore.selectedTab];
			pythonStore.runScript(content.code);
		}
	}

	function interruptCode(){

		pythonStore.reloadPyodide();
	}


    let modules = ref([]);

    onBeforeMount(async function(){
      let answ = await Request.get(`/vi/config`);
      let data = await answ.json();
      for (let index in data.modules) {
        let moduleEntry = data.modules[index];

		console.log("index", index, "moduleEntry", moduleEntry)
			modules.value.push(
			  {
				name: index,
				handler: moduleEntry.handler
			  });



      }
    })

    function searchText(event: UIEvent){
      if (tree.value) {
        tree.value.tree.search(event.target.value);
      }
    }



	  return {
      log,
	logError,
      executor,
		error,
		unsaved,
		onChangeCode,
		manager,
		saveScript,
		runScript,
		tree,
		isLoading,
      selectTab,
      modules,
      searchText,
	  tabStore,
	  closeTab,
	  tabGroup,
	  logItems,
	  interruptCode,
	  pythonStore
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

.log-data-table {
  height: inherit;
  .vue3-easy-data-table__main {
	height: inherit;
  }

  /deep/ .vue3-easy-data-table__main {
	height: inherit;

  }
}

</style>
