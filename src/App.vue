<template>

	<template v-if="isLoggedIn && !isLoading">
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
import { python } from '@codemirror/lang-python';
import MessageDrawer from "./components/Messaging/MessageDrawer.vue"; 

export default {
  name: 'App',
  components: {
	  Home,
	  LoadingSpinner,
	  MessageDrawer
  },

  setup(){

	  let isLoggedIn = ref<boolean>(false);
	  let isLoading = ref<boolean>(true);
	  let messageStore = useMessageStore(); 
	  const global = inject("global")

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

			  messageStore.addMessage("debug", "Text-Nachricht", "Ich bin ein Text"); 
		  }
		  catch (error) {
			  isLoggedIn.value = false;
		  }
	  });

	  return {isLoggedIn, isLoading}
  }
}
</script>

<style scoped>

</style>
