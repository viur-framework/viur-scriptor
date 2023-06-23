<template>
	<Teleport to="head">
    	<title> {{ 'Scriptor v' + version }}</title>

	</Teleport>

	<template v-if="isLoggedIn && !isLoading">
		<DialogDrawer></DialogDrawer>
		<MessageDrawer/>
		<RouterView/>

		<div class="loading-spinner" v-show="globalStore.isLoading">
			<sl-spinner class="vld-overlay"></sl-spinner>
		</div>

  	</template>


</template>

<style lang="less">
@import "style/app.less";
</style>

<script lang="ts">
import Home from './components/Home.vue'
import {Request} from "@viur/viur-vue-utils";
import {ref, onBeforeMount, inject} from 'vue';
import {usePythonStore} from "./stores/PythonStore";
import {useMessageStore} from "./stores/message";
import LoadingSpinner from "./components/common/LoadingSpinner.vue";
import MessageDrawer from "./components/Messaging/MessageDrawer.vue";
import DialogDrawer from './components/Dialogs/DialogDrawer.vue';
import { useDialogStore } from './stores/dialogs';
import {useI18n} from "vue-i18n";
import {useGlobalStore} from "./stores/global";
export default {
  name: 'App',
  components: {
	  Home,
	  LoadingSpinner,
	  MessageDrawer,
	  DialogDrawer
  },

  setup(){

	  const checkLoginInterval = ref();
   	 const version =  __APP_VERSION__;
	  const globalStore = useGlobalStore();
	  let isLoggedIn = ref<boolean>(false);
	  let isLoading = ref<boolean>(true);
	  let messageStore = useMessageStore();
	  const global = inject("global")

	  const x = useDialogStore();

	  const {t} = useI18n();

	  let pythonStore = usePythonStore();
	  async function init() {
		  isLoading.value = true;

		  await pythonStore.loadPython();

		  isLoading.value = false;
	  }

	  async function checkLogin(allowInit = false) {
		try {
			  let resp = await Request.get("/vi/user/view/self");
			  let data = await resp.json();
			  isLoggedIn.value = true;
			  global.user = data.values;


			  if (allowInit)
			  	await init();

			  //messageStore.addMessage("debug", "Text-Nachricht", "Ich bin ein Text");

		  }
		  catch (error) {
			  isLoggedIn.value = false;
			  messageStore.addMessage("error", t("error.title.login"), t("error.text.login"));
		  }
	  }

	  onBeforeMount(async () => {
		  await checkLogin(true);
		  setInterval(async () => {
			await checkLogin();
		  }, 1000 * 60 * 5)
	  });

	  return {isLoggedIn, isLoading, globalStore, version}
  }
}
</script>

<style scoped>
.loading-spinner{
	z-index: 9999;
	position: fixed;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: rgba(255, 255, 255, .7);
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 1.8em;
}
</style>
