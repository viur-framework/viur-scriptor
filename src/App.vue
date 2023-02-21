<template>

	<template v-if="isLoggedIn && !isLoading">
		<DialogDrawer></DialogDrawer>
		<MessageDrawer/>
		<Home></Home>
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
export default {
  name: 'App',
  components: {
	  Home,
	  LoadingSpinner,
	  MessageDrawer,
	  DialogDrawer
  },

  setup(){

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

	  onBeforeMount(async () => {
		  try {
			  let resp = await Request.get("/vi/user/view/self");
			  let data = await resp.json();
			  isLoggedIn.value = true;
			  global.user = data.values;

			  await init();

			  //messageStore.addMessage("debug", "Text-Nachricht", "Ich bin ein Text");
		  }
		  catch (error) {
			  isLoggedIn.value = false;
			  messageStore.addMessage("error", t("error.title.login"), t("error.text.login"));
		  }
	  });

	  return {isLoggedIn, isLoading}
  }
}
</script>

<style scoped>

</style>
