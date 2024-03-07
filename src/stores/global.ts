// @ts-nocheck
import {ref} from "vue";
import {defineStore} from "pinia";
import { useI18n } from "vue-i18n";
import {c} from "@codemirror/next/legacy-modes/mode/clike";

interface NetworkError
{
	status: Number;
	error: String;
	title: String
}

export const useGlobalStore = defineStore("globalStore", () => {
	const isLoading = ref<Boolean>(false);
	const shouldAutoSave = ref<Boolean>(false);
	const shouldAutoscroll = ref<Boolean>(true);
	const autoSaveInterval = ref<Number>(60 * 10);
	const cancelAutoSaveEvent = ref<Function>();
	const startAutoSaveEvent = ref<Function>();
	const language = ref<String>("en");
	const i18n = useI18n();
	const error = ref<NetworkError>({
		status: 200,
		error: "",
		title: ""
	});

	function setLoading(state: Boolean) {
		isLoading.value = state;
	}

	function getLoadingState(): Boolean {
		return isLoading.value;
	}

	function setCancelAutoSaveEvent(f: Function) {
		cancelAutoSaveEvent.value = f;
	}
	function setStartAutoSaveEvent(f: Function) {
		startAutoSaveEvent.value = f;
	}

	function setLanguage(lang: String) {
		console.debug(lang)
		language.value = lang;
		localStorage.setItem("SCRIPTOR_LANGUAGE", language.value);
		i18n.locale.value = lang;
	}

	function setAutoSave(value: Boolean) {
		if (shouldAutoSave.value && !value) {
			if (cancelAutoSaveEvent.value) {
				cancelAutoSaveEvent.value();
			}
		}
		else if (!shouldAutoSave.value && value) {
			if (startAutoSaveEvent.value) {
				startAutoSaveEvent.value();
			}
		}
		shouldAutoSave.value = value;
		localStorage.setItem("SCRIPTOR_AUTO_SAVE", shouldAutoSave.value ? 1 : 0);
	}

	function setAutoscroll(value: Boolean) {
		shouldAutoscroll.value = value;
		localStorage.setItem("SCRIPTOR_AUTO_SCROLL", shouldAutoSave.value ? 1 : 0);
	}

	function setAutoSaveInterval(value: number) {
		console.log("Interval: ", value)
		autoSaveInterval.value = value;
		localStorage.setItem("SCRIPTOR_AUTO_SAVE_INTERVAL", autoSaveInterval.value);
	}

	function getAutoSaveInterval(): number {
		return autoSaveInterval.value
	}


	const modules = ref({});

	function load() {
		// auto saving
		try {
			let v = localStorage.getItem("SCRIPTOR_AUTO_SAVE");
			if (v) {

				shouldAutoSave.value = Number.parseInt(v) ? true : false
			}
		} catch (e) {
			console.log("failed to load parse scriptor auto save", e)
		}

		try {
			let v = localStorage.getItem("SCRIPTOR_AUTO_SCROLL");
			if (v) {
				shouldAutoscroll.value = Number.parseInt(v) ? true : false
			}
		} catch (e) {
			console.log("failed to load parse scriptor auto save", e)
		}

		try {
			let v = localStorage.getItem("SCRIPTOR_AUTO_SAVE_INTERVAL");
			if (v) {
				autoSaveInterval.value = Number.parseInt(v)
			}
		} catch (e) {
			console.log("failed to load parse scriptor auto save", e)
		}

		try {
			let v = localStorage.getItem("SCRIPTOR_LANGUAGE");
			if (v) {
				setLanguage(v);
			}
		} catch (e) {
			console.error("failed to load scriptor language", e)
		}
	}


	function getError() {
		return error.value.error;
	}

	function getErrorTitle() {
		return error.value.title;
	}

	function getErrorTitle() {
		return error.value.title;
	}

	function setErrorText(value: String)  {
		error.value.error = value;
	}
	function setErrorTitle(title: String) {
		error.value.title = title;
	}
	function setErrorStatus(status: Number) {
		error.value.status = status;
	}

	load()

	return {getError, getErrorTitle, setErrorText, setErrorTitle, setErrorStatus, isLoading, setLoading, getLoadingState, modules, shouldAutoSave, shouldAutoscroll, load, setAutoSave, setCancelAutoSaveEvent, setStartAutoSaveEvent, setLanguage, language, autoSaveInterval, setAutoSaveInterval, getAutoSaveInterval, setAutoscroll}
})
