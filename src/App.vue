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

	  let pythonStore = usePythonStore();
	  async function init() {
		  isLoading.value = true;

		  await pythonStore.loadPython();

		  isLoading.value = false;
	  }

	  onBeforeMount(async () => {
		x.open(
		{
			title:"Hello",
			text:"",
			type:"directory",
			acceptEvent:() => console.log("OK!"),
			cancelEvent: () => console.log("Cancel"),
			showInputText: false,
			buttonText: "Hello",
			showCancelButton: true,
	  	}
	  ); 

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
