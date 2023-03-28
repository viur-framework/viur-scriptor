<template>

	<sl-split-panel class="main-split" position-in-pixels="200">
		<div slot="start" class="split-start">



				<div class="header">
					<div class="logo">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 886.82 1024"><defs><radialGradient id="Unbenannter_Verlauf_10" cx="-195.94" cy="1024.05" fx="-195.94" fy="1024.05" r="1.03" gradientTransform="translate(-353259.2 68187.55) rotate(90) scale(345.39 -345.39)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fc3832"/><stop offset="1" stop-color="#d46764"/></radialGradient><radialGradient id="Unbenannter_Verlauf_2" cx="-195.96" cy="1024.07" fx="-195.96" fy="1024.07" r="1.03" gradientTransform="translate(118682.34 -339648.66) rotate(-150) scale(345.39 -345.39)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ea3a3a"/><stop offset="1" stop-color="#8f4c4a"/></radialGradient><radialGradient id="Unbenannter_Verlauf_3" cx="-195.96" cy="1024.04" fx="-195.96" fy="1024.04" r="1.03" gradientTransform="translate(235908.99 272981.98) rotate(-30) scale(345.39 -345.39)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#c21d1d"/><stop offset="1" stop-color="#662020"/></radialGradient></defs><g><path d="M443.4,0L0,256l34.11,19.69L443.4,39.38l409.3,236.31,34.11-19.69L443.4,0Z" fill="#d46764" fill-rule="evenodd"/><path d="M886.81,255.99l-34.11,19.69v472.61s-409.3,236.31-409.3,236.31v39.39s443.41-256,443.41-256" fill="#8f4c4a" fill-rule="evenodd"/><path d="M443.41,984.61L34.11,748.31V275.69S0,256,0,256V768s443.41,256,443.41,256" fill="#662020" fill-rule="evenodd"/><path d="M34.11,748.31l409.29-236.31,409.3,236.31-409.3,236.31L34.11,748.31Z" fill="url(#Unbenannter_Verlauf_10)" fill-rule="evenodd"/><path d="M443.4,512L34.11,748.31V275.69L443.4,39.38" fill="url(#Unbenannter_Verlauf_2)" fill-rule="evenodd"/><path d="M443.4,39.38l409.3,236.31v472.61l-409.3-236.31V39.38Z" fill="url(#Unbenannter_Verlauf_3)" fill-rule="evenodd"/></g><g><path d="M431.01,827.14h3.7V470.38h-22.23v-61.83h61.83v61.83h-22.23v356.65l-21.06,.23v-.11Z" fill="#572727" fill-rule="evenodd"/><path d="M404.51,274.07h77.78l84.86,199.78-73.53,157.78-20.97,140.1,.16,55.41h-20.73V470.38h22.23v-61.83h-61.83v61.83h22.23v356.76h-19.97l-.09-55.41-21.48-140.1-73.53-157.78,84.86-199.78Z" fill="#d8d8d8" fill-rule="evenodd"/><g><path d="M482.31,274.08l84.86,199.79-73.53,157.75-20.93,140.08,25.94-72.42,113.7-212.86-77.05-212.34h-52.98Z" fill="#fff" fill-rule="evenodd"/><path d="M404.51,274.08l-84.86,199.79,73.53,157.75,20.93,140.08-25.94-72.42-113.7-212.86,77.05-212.34h52.98Z" fill="#fff" fill-rule="evenodd"/></g></g></svg>
					</div>
					<h1 class="header">Script0r</h1>
					
				</div>
		

			<div class="search-wrap">
				<sl-input @input="searchText" size="small"></sl-input>
				<sl-button size="small">
					<sl-icon name="search"></sl-icon>
				</sl-button>
			</div>

			<sl-tab-group class="tab-group">
			  <sl-tab slot="nav" panel="files">
				  {{ t("tab.file.browser") }}

			  </sl-tab>
			  <sl-tab slot="nav" panel="data" >
				  {{ t("tab.database.fields") }}

			  </sl-tab>

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

		<sl-badge v-show="pythonStore.isExecuting" variant="success" class="is-running" pulse>{{  pythonStore.runningText }}</sl-badge>


		<sl-button v-show="!pythonStore.isExecuting" size="small" @click="saveScript" variant="white" >
			{{ t("safe") }}

		</sl-button>
		<sl-button v-show="!pythonStore.isExecuting" size="small" :v-show="canShare" @click="shareScript" variant="success" >
			{{ t("share") }}

		</sl-button>

		<sl-button v-show="!pythonStore.isExecuting" size="small" @click="runScript" variant="primary">
			{{ t("run") }}


		</sl-button>
		<sl-button v-show="pythonStore.isExecuting" size="small" @click="interruptCode" variant="primary">Cancel</sl-button>

		<sl-button size="small" @click="showGeneralLogs" variant="primary">
			{{ t("logs") }}
		</sl-button>
	</footer>

</template>

<script lang="ts">



import {computed, ref, onBeforeMount, onMounted, watch} from 'vue';
import '@viur/viur-shoelace/dist/components/details-group/details-group.js';
import FileTree from "./FileExplorer/FileTree.vue";
import PythonExecutor from "./PythonExecutor.vue";
import LoadingSpinner from "./common/LoadingSpinner.vue";
import {usePythonStore} from "../stores/PythonStore";
import {useMessageStore} from "../stores/message";
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import {Request} from "@viur/viur-vue-utils";
import ModuleDetails from "./ModuleDetails.vue";
import CodeEditor from "./CodeEditor.vue";
import { useTabStore } from '@/stores/TabStore';
import { clear } from 'console';
import CodeTab from './CodeTab.vue';
import {useI18n} from "vue-i18n";
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';


export default {
  name: 'Home',
  components: {CodeTab, CodeEditor, FileTree, LoadingSpinner, VueJsonPretty, ModuleDetails},
  setup() {
	const executor = ref();
	const log = ref([]);
	const logItems = ref([]);
	const error = ref("");
	const unsaved = ref<boolean>(false);
	const isLoading = ref<boolean>(false);
	const pythonStore = usePythonStore();
	const messageStore = useMessageStore();
	const tabStore = useTabStore();
	const route = useRoute();



	const { t } = useI18n() // call `useI18n`, and spread `t` from  `useI18n` returning


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

	function shareScript(){
		if (!route.query.key) {
			console.error("Cant share without an opened tab!"); 	
			return;
		}

		let _url = window.location.origin+"/#"+"/runner/"+route.query.key; 

		console.log(import.meta.env.MODE)
		if (import.meta.env.MODE === "production")
			_url = window.location.origin+"/scriptor/index.html"+"#"+"/runner/"+route.query.key; 

		messageStore.addMessage("success", "The shared link got copied into the clipboard.", "")
		navigator.clipboard.writeText(_url);
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

	function showGeneralLogs() {
		messageStore.state.opened = !messageStore.state.opened;
	}


    let modules = ref([]);

    onBeforeMount(async function(){
      let answ = await Request.get(`/vi/config`);
      let data = await answ.json();
      for (let index in data.modules) {
        let moduleEntry = data.modules[index];

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
		shareScript,
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
	  showGeneralLogs,
	  pythonStore,
	  canShare: computed(function(){
		return route.query.key;
	  }),
		  t
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
  display: flex
}

.log-format {
  color: green;
}

.main-split {
  height: calc(100vh - 50px);
  --min: 300px;
  --max: 500px;

  &::part(panel){
	display: flex;
	flex-direction: column;
  }
}

.side-split{
  height: 100%;
  background-color: #fff;
}

.split-start{
  display: flex;
  flex-direction: column;
  height: 100%;
}

.split-end{
  display: flex;
  flex-direction: column;
  height: 100%;
}

.split-top{
  overflow-y: auto;
}

.split-bottom{
	overflow: hidden;
  
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
  display: flex;
  flex-direction: column;
  height: 1px;
  flex: 1;

  &::part(base){
	border: none;
  	background-color: #fff;
	display: flex;
	flex-direction: column;
	height: 1px;
	flex: 1;
  }

  &::part(nav){
	background-color: @mainColor;
	border: none;
  }

  &::part(tabs){
	border: none;
  }

  &::part(body){
	border: none;
	display: flex;
	flex-direction: column;
	height: 1px;
	flex: 1;
  }

  sl-tab {
	border: none;

	&::part(base) {
	  padding: 10px 15px;
	  color: #fff;
	  border: none;
	  overflow-y: hidden;
	}

	&[aria-selected="true"]{
	  background-color: #fff;
	  &::part(base) {
		color: @mainColor !important;
	  }
	}
  }

  sl-tab-panel{
	display: flex;
	flex-direction: column;
	height: 1px;
	flex: 1;

	&::part(base){
	  padding: 0;
	  display: flex;
	  flex-direction: column;
	  height: 1px;
	  flex: 1;
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
	overflow-y: auto;
  }
}

.is-running{
  &::part(base){
	font-size: 0.95em;
    height: 32px;
  }

}

.logo {
	width: 55px;
	height: 55px;
	background-color: transparent !important;
}


</style>
