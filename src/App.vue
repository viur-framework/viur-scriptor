<template>

	<template v-if="isLoggedIn && !isLoading">
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
import LoadingSpinner from "./components/common/LoadingSpinner.vue";
import { python } from '@codemirror/lang-python';

export default {
  name: 'App',
  components: {
	  Home,
	  LoadingSpinner
  },

  setup(){

	  let isLoggedIn = ref<boolean>(false);
	  let isLoading = ref<boolean>(true);
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
