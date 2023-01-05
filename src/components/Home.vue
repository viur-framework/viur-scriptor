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
				  <FileTree ref="tree" :tabGroup="tabGroup" :on-select-item="clearLog" :manager="manager" :unsaved="unsaved"/>
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
		<div slot="end" class="split-end">
			<sl-tab-group ref="tabGroup" class="tabs-closable">
				<sl-tab slot="nav" @sl-close="() => closeTab(key)" @click="() => selectTab(key)" closable="true" v-for="(tab,key) in tabStore.tabMap" :panel="key" :key="key">{{tab.name}}</sl-tab>

				<sl-tab-panel v-for="(tab,key) in tabStore.tabMap" :panel="key" :key="key" :name="key">

					<sl-split-panel class="side-split" vertical >
						<div slot="start" class="split-top">
							<CodeEditor :keyValue="'' + key"/>
						</div>
						<div slot="end" class="split-bottom">
							
							<virtual-list style="height: 360px; overflow-y: auto;"
							:data-key="'id'"
							:data-sources="log"
							:data-component="LogEntry"
							/>
	
						</div>
					</sl-split-panel>
				</sl-tab-panel>

			</sl-tab-group>


		</div>
	</sl-split-panel>

	<footer class="footer">

		<sl-button size="small" @click="saveScript" variant="white" >
			Save
		</sl-button>
		<sl-button size="small" @click="runScript" variant="primary">Run</sl-button>
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
import { useVirtualList } from '@vueuse/core'; 
import VirtualList from 'vue-virtual-scroll-list'
import LogEntry from './LogEntry.vue'

export default {
  name: 'Home',
  components: {CodeEditor, FileTree, LoadingSpinner, VueJsonPretty, ModuleDetails, VirtualList, LogEntry},
  setup() {
	const executor = ref();
    const log = ref([]);
	const error = ref("");
	const unsaved = ref<boolean>(false);
	const isLoading = ref<boolean>(false);
	const counter  = ref<number>(0); 
	const logStdout = function(value: string){
		log.value.push({
			id: counter.value++,
			type: "print",
			value: formatString(value),
			time: Date.now(),
			level: "neutral",
			json: isJsonString(value),
		})
	}

	const pythonStore = usePythonStore();
	const tabStore = useTabStore(); 

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


	onBeforeMount(async () => {
		await pythonStore.init(null, logError, clearLog);
	})

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
		if (!unsaved.value)
			return;

		if (tree.value){
			tree.value.helper.saveCode(executor.value.getCode(), function(){
				unsaved.value = false;
			});
		}
	}	
	
	function runScript(){
		if (tabStore.selectedTab) {
			let content = tabStore.tabMap[tabStore.selectedTab]; 
			pythonStore.runScript(content.code); 
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
					
				  id: counter.value++,
				  type: entry.level,
				  level: computed(()=>{
					  return getThemeByLevel(entry.level);
				  }),
				  value: formatString(entry.text),
				  time: Date.now(),
				  json: isJsonString(entry.text),
			  })

	  })

	  const filteredList = computed(() => log)

	  let {virtList, containerProps, wrapperProps} = useVirtualList(filteredList.value, {
		itemHeight: 30
	})




    const secondTab = ref<SlTabPanel>();

    onMounted(function(){
      watch(secondTab.value, function(value, oldValue, onCleanup){
        if (secondTab.value.active) {
          console.log("Switched to tab A!")
        }
      })
    })


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
		virtList,
		containerProps,
		wrapperProps,
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
		runScript,
		tree,
		isJsonString,
		isLoading,
		  getThemeByLevel,
      selectTab,
      modules,
      searchText,
	  tabStore,
	  closeTab,
	  tabGroup
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
