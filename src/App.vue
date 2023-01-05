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

		  await pythonStore.py.load();

		  let baseUrl: string = "";
		  if (import.meta.env.VITE_API_URL)
			  baseUrl = `${import.meta.env.VITE_API_URL}`;
		  else
			  baseUrl = `${window.location.origin}`;

		  await pythonStore.py.run(`
				with open("config.py", "w") as f:
					f.write("BASE_URL='${baseUrl}'")
			`)

		  const zipUrl = new URL('./assets/scriptor.zip', import.meta.url).href

		  console.log("zipUrl:", zipUrl);

		  // Loading scriptor library
		  await pythonStore.py.run(`
			from pyodide.http import pyfetch
			response = await pyfetch("${zipUrl}")
			await response.unpack_archive()
		 `)

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
