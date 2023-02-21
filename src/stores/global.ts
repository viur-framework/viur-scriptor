// @ts-nocheck
import {ref} from "vue";
import {defineStore} from "pinia";

export const useGlobalStore = defineStore("globalStore", () => {
	const isLoading = ref<Boolean>(false);

	function setLoading(state: Boolean) {
		isLoading.value = state;
	}

	function getLoadingState(): Boolean {
		return isLoading.value;
	}

	return {isLoading, setLoading, getLoadingState}
})
