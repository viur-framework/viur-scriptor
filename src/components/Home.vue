<template>

	<sl-split-panel class="main-split" position-in-pixels="200">
		<div slot="start" class="split-start">


				<div class="header">
					<div class="logo">
						<img src="@/assets/logo.svg">
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
				  {{ t("tab.api") }}

			  </sl-tab>

			  <sl-tab-panel name="files">
				  <FileTree ref="tree" :tabGroup="tabGroup" :manager="manager" :unsaved="unsaved"/>
			  </sl-tab-panel>
			  <sl-tab-panel name="data">

				<div class="data-detail-scroll">

					<sl-button class="data-btn"
									varian="default"
									size="medium"
									v-for="(module, index) in modules" :key="index"
									@click="() => openTabDocumentation(module.name)"
							>
								<sl-avatar :initials="module.name[0]" slot="prefix"  shape="rounded">

								</sl-avatar>
								{{ module.name }}
					</sl-button>
				</div>

			  </sl-tab-panel>
			</sl-tab-group>

		</div>
		<div slot="end" class="split-end">
			<sl-tab-group ref="tabGroup" class="tabs-closable">

				<sl-tab slot="nav" @sl-close="() => closeTab(key)" @click="() => selectTab(key)" closable="true" v-for="(tab,key) in tabStore.tabMap" :panel="key" :key="key">{{tab.name}}
				</sl-tab>

				<sl-tab-panel v-for="(tab,key) in tabStore.tabMap" :panel="key" :key="key" :name="key">
					<div class="side-split" v-if="tab.documentation" style="overflow-y: auto;" vertical>
						<Api :module-name="tab.key"></Api>
					</div>
					<sl-split-panel v-else class="side-split" vertical >
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
		<sl-button size="small"
				   variant="primary"
				   href="https://docs.scriptor.viur.dev/"
				   target="_blank"
					:title="t('docs')">
			{{ t('docs') }}
		</sl-button>

		<sl-button v-show="!pythonStore.isExecuting"
				   size="small" :v-show="canShare"
				   @click="shareScript"
				   :title="t('share')"
				   class="square-btn">
			<sl-icon name="share" library="bootstrap">
			</sl-icon>
		</sl-button>

		<div class="spacer"></div>

		<Settings ref="settingsRef" />

		<sl-button v-show="!pythonStore.isExecuting"
				   size="small"
				   @click="saveScript"
				   variant="white"
				   :title="t('safe')"
				   class="square-btn">
			<sl-icon name="save" library="bootstrap">
			</sl-icon>
		</sl-button>

		<sl-button size="small"
				   @click="showGeneralLogs"
				   variant="white"
				   :title="t('logs')"
				   class="square-btn">
			<sl-icon name="list-ul" library="bootstrap">
			</sl-icon>
		</sl-button>

		<sl-button v-show="!pythonStore.isExecuting"
				   size="small"
				   @click="runScript"
				   variant="success"
				   :title="t('run')">
			{{ t("run") }}
		</sl-button>

		<sl-button v-show="pythonStore.isExecuting" size="small" @click="interruptCode" variant="primary">{{ t('cancel')}}</sl-button>




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
import {Request} from "@viur/vue-utils";
import ModuleDetails from "./ModuleDetails.vue";
import CodeEditor from "./CodeEditor.vue";
import { useTabStore } from '@/stores/TabStore';
import { clear } from 'console';
import CodeTab from './CodeTab.vue';
import {useI18n} from "vue-i18n";
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import Api from './Api.vue';
import { useGlobalStore } from '../stores/global';
import {} from "@viur/vue-utils/utils/handlers"
import Settings from "./Settings.vue"

export default {
  name: 'Home',
  components: {Settings, CodeTab, CodeEditor, FileTree, LoadingSpinner, VueJsonPretty, ModuleDetails, Api},
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
	const settingsRef = ref<Settings>();

	const showSetting = ref<boolean>(false);

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
					tabStore.tabMap[tabStore.selectedTab].needSave = false;
				});
			}
		}
	}
	tabStore.setSaveCallback(() => saveScript());


	function shareScript(){
		if (!route.query.key) {
			console.error("Cant share without an opened tab!");
			return;
		}

		// globalStore.modules

		let _url = window.location.origin+"/#"+"/runner/"+route.query.key;

		console.log(import.meta.env.MODE)
		if (import.meta.env.MODE === "production")
			_url = window.location.origin+"/scriptor/index.html"+"#"+"/runner/"+route.query.key;

		messageStore.addMessage("success", t('link.copy'), "")
		navigator.clipboard.writeText(_url);
	}

	function runScript(){
		if (tabStore.selectedTab) {
			let content = tabStore.tabMap[tabStore.selectedTab];
			pythonStore.runScript(content.code);
		}
	}

	function openTabDocumentation(module: string) {
		const docs = module + " (docs)";

		tabStore.addTab(module, docs, "", true);
	}

	function interruptCode(){

		pythonStore.reloadPyodide();
	}

	function showGeneralLogs() {
		messageStore.state.opened = !messageStore.state.opened;
	}

	function showSettings() {
		showSetting.value = !showSetting.value;
		console.log(settingsRef.value)
		if (showSetting.value)
			settingsRef.value.show()
		else
			settingsRef.value.hide()
	}


    let modules = ref([]);

	let globalStore = useGlobalStore();
    globalStore.setCancelAutoSaveEvent(tabStore.cancelSaveEvent)
    globalStore.setStartAutoSaveEvent(tabStore.startSaveEvent)

    onBeforeMount(async function(){
      let answ = await Request.get(`/vi/config`);
      let data = await answ.json();
      for (let index in data.modules) {
        let moduleEntry = data.modules[index];
		console.log("config:", moduleEntry,  " index:", index);

			modules.value.push(
			  {
				name: index,
				handler: moduleEntry.handler
			  });
      }
	  globalStore.modules.value = data["modules"];
	  console.log("globalStore.modules.value", globalStore.modules.value)

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
		  showSettings,
		  showSetting,
		  settingsRef,
	  canShare: computed(function(){
		return route.query.key;
	  }),

		  t,
		  openTabDocumentation
    }
  }
}
</script>


<style scoped lang="less">

.footer{
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-end;
  background-color: var(--sl-color-neutral-0);
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, .25);
  padding: 10px;
  z-index: 1;
  position: relative;

  sl-button{
	&:not(:first-child){
	  margin-left: 10px;
	}

	&::part(base){
	  font-size: .95em;
	  height: 32px;
	}
  }
}

.spacer{
  flex: 1;
}

.header{
  width: 100%;
  background-color: var(--sl-color-neutral-0);
  color: var(--sl-color-neutral-950);
  margin: 0 auto 0 0;
  font-weight: 700;
  z-index: 1;
  padding: 10px 15px 15px 15px;
  display: flex;
  align-items: center;
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
  overflow-y: auto;
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
  	background-color: var(--sl-color-neutral-0);
	display: flex;
	flex-direction: column;
	height: 1px;
	flex: 1;
  }

  &::part(nav){
	background-color: var(--sl-color-neutral-300);
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
	  color: var(--sl-color-neutral-600);
	  border: none;
	  overflow-y: hidden;
	}

	&[aria-selected="true"]{
	  background-color: var(--sl-color-neutral-0);

	  &::part(base) {
		color: var(--sl-color-neutral-900);
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
  background-color: var(--sl-color-neutral-0);
  border-bottom: 2px solid var(--sl-color-neutral-300);
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
  display: flex;
  flex-direction: column;
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

.data-btn{

  &:hover{
	&::part(base){
	  background-color: #f3f3f3;
	}
  }

  &::part(base){
	justify-content: flex-start;
	border: none;
	height: auto;
	line-height: 1;
	padding: 6px 7px;
	background-color: transparent;
	transition: all ease .3s;
  }

  &::part(label){
	display: flex;
	align-items: center;
  }

  sl-avatar{
	--size: 2em;

	&::part(base){
	  background-color: var(--sl-color-neutral-700);
	}
  }
}


.square-btn{
  &::part(base){
	aspect-ratio: 1;
  }

  &::part(label){
	padding: 0;
	display: flex;
	justify-content: center;
	align-items: center;
  }
}

</style>
